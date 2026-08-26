import bcrypt from "bcrypt";
import type { Request, Response } from "express";
import { and, eq, ne } from "drizzle-orm";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import {GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, GITHUB_CALLBACK_URL, FRONTEND_URL} from "../constants.js"
import db from "../db/db.js";
import { users } from "../db/schema/users.js";
import { authProviders } from "../db/schema/authProviders.js";
import { sanitizeUser, issueSession } from "../services/auth.service.js";
import {
    verifyRefreshToken,
    verifyAccessToken,
    clearCookieOptions,
} from "../utils/token.js";
import { fetchWithRetry } from "../utils/fetchWithRetry.js";

const GITHUB_PROVIDER = "github";

// githubCallback is a browser-redirect target (GitHub navigates the user's
// browser straight to it) — a thrown ApiError would render as raw JSON
// instead of returning the user to the app, so every failure path there
// redirects back to the frontend with a short, stable error code instead.
const redirectWithError = (res: Response, code: string) => {
    const url = new URL("/login", FRONTEND_URL!);
    url.searchParams.set("error", code);
    return res.redirect(url.toString());
};

interface GithubTokenResponse {
    access_token?: string;
    scope?: string;
    token_type?: string;
    error?: string;
    error_description?: string;
}

interface GithubUserResponse {
    id: number;
    login: string;
    avatar_url: string;
    email: string | null;
}

interface GithubEmailResponse {
    email: string;
    primary: boolean;
    verified: boolean;
}

if (!GITHUB_CLIENT_ID) {
    throw new Error("GITHUB_CLIENT_ID is not set");
}
if (!GITHUB_CLIENT_SECRET) {
    throw new Error("GITHUB_CLIENT_SECRET is not set");
}
if (!GITHUB_CALLBACK_URL) {
    throw new Error("GITHUB_CALLBACK_URL is not set");
}
if (!FRONTEND_URL) {
    throw new Error("FRONTEND_URL is not set");
}

export const githubAuthorize = asyncHandler(async (req, res) => {
    const githubUrl = new URL("https://github.com/login/oauth/authorize");

    githubUrl.searchParams.set("client_id", GITHUB_CLIENT_ID!);
    githubUrl.searchParams.set("redirect_uri", GITHUB_CALLBACK_URL!);
    githubUrl.searchParams.set("scope", "read:user user:email repo");

    res.redirect(githubUrl.toString());
})

// GitHub only puts `email` on the /user profile if the user has a public
// email set. `user:email` scope lets us ask /user/emails for the actual
// verified primary address instead — this is best-effort, a login shouldn't
// fail just because we couldn't determine an email.
const fetchPrimaryEmail = async (githubAccessToken: string): Promise<string | null> => {
    try {
        const response = await fetchWithRetry("https://api.github.com/user/emails", {
            headers: {
                "Authorization": `Bearer ${githubAccessToken}`,
                "Accept": "application/vnd.github+json",
                "User-Agent": "ENGINOS",
            },
        });
        if (!response.ok) return null;
        const emails = (await response.json()) as GithubEmailResponse[];
        const primary = emails.find((e) => e.primary && e.verified);
        return primary?.email ?? null;
    } catch {
        return null;
    }
};

// Not a real session check (that's `authenticate`) — just "does this browser
// already look logged in," to decide login-vs-link mode below. An invalid or
// missing cookie just falls back to login mode, it doesn't fail the request.
const getSessionUserId = (req: Request): string | null => {
    const existingAccessToken = req.cookies?.accessToken;
    if (!existingAccessToken) return null;
    try {
        return verifyAccessToken(existingAccessToken).id;
    } catch {
        return null;
    }
};

type TokenExchangeResult =
    | { ok: true; accessToken: string; scope: string }
    | { ok: false; code: string };

const exchangeCodeForToken = async (code: string): Promise<TokenExchangeResult> => {
    const tokenResponse = await fetchWithRetry("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            client_id: GITHUB_CLIENT_ID,
            client_secret: GITHUB_CLIENT_SECRET,
            code,
            redirect_uri: GITHUB_CALLBACK_URL,
        }),
    });

    if (!tokenResponse.ok) {
        return { ok: false, code: "github_unreachable" };
    }

    const tokenData = (await tokenResponse.json()) as GithubTokenResponse;

    // GitHub responds 200 OK even on failure, with an `error` field instead of a status code.
    if (tokenData.error || !tokenData.access_token) {
        return { ok: false, code: tokenData.error || "oauth_failed" };
    }

    return { ok: true, accessToken: tokenData.access_token, scope: tokenData.scope ?? "" };
};

type ProfileFetchResult =
    | { ok: true; user: GithubUserResponse }
    | { ok: false; code: string };

const fetchGithubProfile = async (githubAccessToken: string): Promise<ProfileFetchResult> => {
    const userResponse = await fetchWithRetry("https://api.github.com/user", {
        headers: {
            "Authorization": `Bearer ${githubAccessToken}`,
            "Accept": "application/vnd.github+json",
            "User-Agent": "ENGINOS",
        },
    });

    if (!userResponse.ok) {
        return { ok: false, code: "profile_unreachable" };
    }

    const githubUser = (await userResponse.json()) as GithubUserResponse;

    if (!githubUser?.id || !githubUser?.login) {
        return { ok: false, code: "profile_invalid" };
    }

    return { ok: true, user: githubUser };
};

interface GithubIdentity {
    providerAccountId: string;
    githubUser: GithubUserResponse;
    accessToken: string;
    scope: string;
    githubEmail: string | null;
}

// Attaches a GitHub identity to an already-logged-in user's single
// auth_providers row, flipping provider "self" -> "github" in place (or just
// refreshing the tokens if it was already "github"). Returns false instead of
// linking if that GitHub account is already claimed by a *different* user.
const linkGithubToUser = async (userId: string, identity: GithubIdentity): Promise<boolean> => {
    const { providerAccountId, githubUser, accessToken, scope, githubEmail } = identity;

    const conflict = await db
        .select({ id: authProviders.id })
        .from(authProviders)
        .where(
            and(
                eq(authProviders.provider, GITHUB_PROVIDER),
                eq(authProviders.providerAccountId, providerAccountId),
                ne(authProviders.userId, userId)
            )
        );

    if (conflict.length > 0) return false;

    await db.transaction(async (tx) => {
        const [currentUser] = await tx.select({ email: users.email }).from(users).where(eq(users.id, userId));

        // Only attach the email if this user doesn't already have one (never
        // clobber an email they typed in) AND no *other* account already
        // owns it — same "don't auto-merge accounts by email" rule as
        // findOrCreateGithubUser, checked explicitly instead of letting the
        // users_email_key constraint throw and fail the whole link.
        let emailToSet: string | null = null;
        if (githubEmail && !currentUser?.email) {
            const [existingEmailOwner] = await tx
                .select({ id: users.id })
                .from(users)
                .where(eq(users.email, githubEmail));
            if (!existingEmailOwner || existingEmailOwner.id === userId) {
                emailToSet = githubEmail;
            }
        }

        await tx
            .update(users)
            .set({
                username: githubUser.login,
                avatarUrl: githubUser.avatar_url,
                ...(emailToSet ? { email: emailToSet } : {}),
            })
            .where(eq(users.id, userId));

        await tx
            .update(authProviders)
            .set({
                provider: GITHUB_PROVIDER,
                providerAccountId,
                accessToken,
                tokenScope: scope,
                updatedAt: new Date(),
            })
            .where(eq(authProviders.userId, userId));
    });

    return true;
};

// Login/signup path (no existing session): find the user this GitHub account
// already belongs to, or create a fresh one.
const findOrCreateGithubUser = async (identity: GithubIdentity) => {
    const { providerAccountId, githubUser, accessToken, scope, githubEmail } = identity;

    return db.transaction(async (tx) => {
        const [existingProvider] = await tx
            .select()
            .from(authProviders)
            .where(
                and(
                    eq(authProviders.provider, GITHUB_PROVIDER),
                    eq(authProviders.providerAccountId, providerAccountId)
                )
            );

        let userId: string;

        if (existingProvider) {
            userId = existingProvider.userId;
            await tx
                .update(users)
                .set({ username: githubUser.login, avatarUrl: githubUser.avatar_url })
                .where(eq(users.id, userId));
            await tx
                .update(authProviders)
                .set({ accessToken, tokenScope: scope, updatedAt: new Date() })
                .where(eq(authProviders.id, existingProvider.id));
        } else {
            // If this email is already taken by a different account, we
            // deliberately don't attach it here — auto-merging accounts
            // by an unverified email match is a security footgun, not
            // something to "fix" reflexively. The new user just ends up
            // with no email on file.
            let emailForNewUser = githubEmail;
            if (emailForNewUser) {
                const [existingEmailOwner] = await tx
                    .select({ id: users.id })
                    .from(users)
                    .where(eq(users.email, emailForNewUser));
                if (existingEmailOwner) emailForNewUser = null;
            }

            const [newUser] = await tx
                .insert(users)
                .values({
                    username: githubUser.login,
                    avatarUrl: githubUser.avatar_url,
                    email: emailForNewUser,
                })
                .returning();
            userId = newUser!.id;
            await tx.insert(authProviders).values({
                userId,
                provider: GITHUB_PROVIDER,
                providerAccountId,
                accessToken,
                tokenScope: scope,
            });
        }

        const [freshUser] = await tx.select().from(users).where(eq(users.id, userId));
        return freshUser!;
    });
};

export const githubCallback = asyncHandler(async (req, res) => {
    const { code } = req.query;

    if (!code || typeof code !== "string") {
        return redirectWithError(res, "missing_code");
    }

    // If the browser already carries a valid session, this is a "connect
    // GitHub to my existing account" request, not a login/signup — the
    // frontend's "Connect GitHub" button hits this same route.
    const linkingUserId = getSessionUserId(req);

    try {
        const tokenResult = await exchangeCodeForToken(code);
        if (!tokenResult.ok) {
            return redirectWithError(res, tokenResult.code);
        }

        const profileResult = await fetchGithubProfile(tokenResult.accessToken);
        if (!profileResult.ok) {
            return redirectWithError(res, profileResult.code);
        }

        const githubUser = profileResult.user;
        const rawEmail = githubUser.email ?? (await fetchPrimaryEmail(tokenResult.accessToken));
        const identity: GithubIdentity = {
            providerAccountId: String(githubUser.id),
            githubUser,
            accessToken: tokenResult.accessToken,
            scope: tokenResult.scope,
            // normalized the same way signup/login emails are, so the
            // dedup checks below actually catch case-different duplicates
            githubEmail: rawEmail?.trim().toLowerCase() ?? null,
        };

        if (linkingUserId) {
            const linked = await linkGithubToUser(linkingUserId, identity);
            if (!linked) {
                return redirectWithError(res, "github_already_linked");
            }
            return res.redirect(
                new URL("/dashboard/settings?github=connected", FRONTEND_URL!).toString()
            );
        }

        const user = await findOrCreateGithubUser(identity);
        await issueSession(res, user.id);

        return res.redirect(new URL("/dashboard", FRONTEND_URL!).toString());
    } catch (error) {
        console.error("[github-callback] unexpected failure", error);
        return redirectWithError(res, "oauth_failed");
    }
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Refresh token is missing");
    }

    const { id } = verifyRefreshToken(incomingRefreshToken);

    const [user] = await db.select().from(users).where(eq(users.id, id));

    if (!user?.refreshToken) {
        res.clearCookie("accessToken", clearCookieOptions);
        res.clearCookie("refreshToken", clearCookieOptions);
        res.clearCookie("hasSession", clearCookieOptions);
        throw new ApiError(401, "Refresh token is invalid");
    }

    const isValid = await bcrypt.compare(incomingRefreshToken, user.refreshToken);

    if (!isValid) {
        res.clearCookie("accessToken", clearCookieOptions);
        res.clearCookie("refreshToken", clearCookieOptions);
        res.clearCookie("hasSession", clearCookieOptions);
        throw new ApiError(401, "Refresh token is invalid");
    }

    await issueSession(res, user.id);

    const [authProvider] = await db
        .select({ provider: authProviders.provider })
        .from(authProviders)
        .where(eq(authProviders.userId, user.id));

    return res.json(
        new ApiResponse(200, sanitizeUser(user, authProvider), "Session refreshed")
    );
});

export const logoutUser = asyncHandler(async (req, res) => {
    await db.update(users).set({ refreshToken: null }).where(eq(users.id, req.user!.id));

    res.clearCookie("accessToken", clearCookieOptions);
    res.clearCookie("refreshToken", clearCookieOptions);
    res.clearCookie("hasSession", clearCookieOptions);

    return res.json(
        new ApiResponse(200, null, "Logged out successfully")
    );
});

export const getCurrentUser = asyncHandler(async (req, res) => {
    return res.json(
        new ApiResponse(200, req.user, "Current user fetched successfully")
    );
});
