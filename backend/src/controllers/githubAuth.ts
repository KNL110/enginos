import bcrypt from "bcrypt";
import type { Response } from "express";
import { eq } from "drizzle-orm";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import {GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, GITHUB_CALLBACK_URL, FRONTEND_URL} from "../constants.js"
import db from "../db/db.js";
import { users } from "../db/schema/users.js";
import type { SafeUser } from "../types/express.js";
import {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
    accessTokenCookieOptions,
    refreshTokenCookieOptions,
    clearCookieOptions,
} from "../utils/token.js";

const REFRESH_TOKEN_SALT_ROUNDS = 10;

const sanitizeUser = (user: typeof users.$inferSelect): SafeUser => ({
    id: user.id,
    username: user.username,
    avatarUrl: user.avatarUrl,
});

const issueSession = async (res: Response, userId: string) => {
    const accessToken = generateAccessToken(userId);
    const refreshToken = generateRefreshToken(userId);
    const hashedRefreshToken = await bcrypt.hash(refreshToken, REFRESH_TOKEN_SALT_ROUNDS);

    await db.update(users).set({ refreshToken: hashedRefreshToken }).where(eq(users.id, userId));

    res.cookie("accessToken", accessToken, accessTokenCookieOptions);
    res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions);
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
    githubUrl.searchParams.set("scope", "read:user");

    res.redirect(githubUrl.toString());
})

export const githubCallback = asyncHandler(async (req, res) => {
    const { code } = req.query;

    if (!code || typeof code !== "string") {
        throw new ApiError(400, "Github Authorization code is missing");
    }

    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
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
        throw new ApiError(502, "Failed to reach Github while exchanging authorization code");
    }

    const tokenData = (await tokenResponse.json()) as GithubTokenResponse;

    // GitHub responds 200 OK even on failure, with an `error` field instead of a status code.
    if (tokenData.error || !tokenData.access_token) {
        throw new ApiError(
            400,
            tokenData.error_description || "Failed to retrieve access token from Github"
        );
    }

    const { access_token: githubAccessToken, scope } = tokenData;

    const userResponse = await fetch("https://api.github.com/user", {
        headers: {
            "Authorization": `Bearer ${githubAccessToken}`,
            "Accept": "application/vnd.github+json",
            "User-Agent": "PortfolioSite-App",
        },
    });

    if (!userResponse.ok) {
        throw new ApiError(502, "Failed to fetch Github user profile");
    }

    const githubUser = (await userResponse.json()) as GithubUserResponse;

    if (!githubUser?.id || !githubUser?.login) {
        throw new ApiError(502, "Github user profile response was malformed");
    }

    const [user] = await db
        .insert(users)
        .values({
            username: githubUser.login,
            avatarUrl: githubUser.avatar_url,
            githubId: githubUser.id,
            githubAccessToken: githubAccessToken,
            githubTokenScope: scope ?? "",
        })
        .onConflictDoUpdate({
            target: users.githubId,
            set: {
                username: githubUser.login,
                avatarUrl: githubUser.avatar_url,
                githubAccessToken: githubAccessToken,
                githubTokenScope: scope ?? "",
                updatedAt: new Date(),
            },
        })
        .returning();

    await issueSession(res, user!.id);

    return res.redirect(FRONTEND_URL!);
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
        throw new ApiError(401, "Refresh token is invalid");
    }

    const isValid = await bcrypt.compare(incomingRefreshToken, user.refreshToken);

    if (!isValid) {
        res.clearCookie("accessToken", clearCookieOptions);
        res.clearCookie("refreshToken", clearCookieOptions);
        throw new ApiError(401, "Refresh token is invalid");
    }

    await issueSession(res, user.id);

    return res.json(
        new ApiResponse(200, sanitizeUser(user), "Session refreshed")
    );
});

export const logoutUser = asyncHandler(async (req, res) => {
    await db.update(users).set({ refreshToken: null }).where(eq(users.id, req.user!.id));

    res.clearCookie("accessToken", clearCookieOptions);
    res.clearCookie("refreshToken", clearCookieOptions);

    return res.json(
        new ApiResponse(200, null, "Logged out successfully")
    );
});

export const getCurrentUser = asyncHandler(async (req, res) => {
    return res.json(
        new ApiResponse(200, req.user, "Current user fetched successfully")
    );
});