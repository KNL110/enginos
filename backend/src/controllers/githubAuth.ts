import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import {GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, GITHUB_CALLBACK_URL} from "../constants.js"
import db from "../db/db.js";
import { users } from "../db/schema/users.js";

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

    const { access_token: accessToken, scope } = tokenData;

    const userResponse = await fetch("https://api.github.com/user", {
        headers: {
            "Authorization": `Bearer ${accessToken}`,
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
            githubUsername: githubUser.login,
            githubAccessToken: accessToken,
            githubTokenScope: scope ?? "",
        })
        .onConflictDoUpdate({
            target: users.githubId,
            set: {
                githubUsername: githubUser.login,
                avatarUrl: githubUser.avatar_url,
                githubAccessToken: accessToken,
                githubTokenScope: scope ?? "",
                updatedAt: new Date(),
            },
        })
        .returning();

    return res.json(
        new ApiResponse(200, user, "Github OAuth successful")
    );
});