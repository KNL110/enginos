import bcrypt from "bcrypt";
import type { Response } from "express";
import { eq } from "drizzle-orm";
import db from "../db/db.js";
import { users } from "../db/schema/users.js";
import { authProviders } from "../db/schema/authProviders.js";
import type { SafeUser } from "../types/express.js";
import {
    generateAccessToken,
    generateRefreshToken,
    accessTokenCookieOptions,
    refreshTokenCookieOptions,
    sessionHintCookieOptions,
} from "../utils/token.js";

const REFRESH_TOKEN_SALT_ROUNDS = 10;

// authProvider is optional purely for callers that haven't fetched it (it
// can't ever actually be missing for a real user — every user gets a row at
// signup/first-login) — treat "missing" the same as "no provider connected".
export const sanitizeUser = (
    user: typeof users.$inferSelect,
    authProvider?: Pick<typeof authProviders.$inferSelect, "provider"> | null
): SafeUser => ({
    id: user.id,
    username: user.username,
    avatarUrl: user.avatarUrl,
    email: user.email,
    hasPassword: user.password !== null,
    githubConnected: authProvider?.provider === "github",
});

export const issueSession = async (res: Response, userId: string) => {
    const accessToken = generateAccessToken(userId);
    const refreshToken = generateRefreshToken(userId);
    const hashedRefreshToken = await bcrypt.hash(refreshToken, REFRESH_TOKEN_SALT_ROUNDS);

    await db.update(users).set({ refreshToken: hashedRefreshToken }).where(eq(users.id, userId));

    res.cookie("accessToken", accessToken, accessTokenCookieOptions);
    res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions);
    res.cookie("hasSession", "1", sessionHintCookieOptions);
};
