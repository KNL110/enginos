import jwt from "jsonwebtoken";
import type { CookieOptions } from "express";
import { ApiError } from "./ApiError.js";
import {
    ACCESS_TOKEN_SECRET,
    ACCESS_TOKEN_EXPIRY,
    REFRESH_TOKEN_SECRET,
    REFRESH_TOKEN_EXPIRY,
    NODE_ENV,
} from "../constants.js";

if (!ACCESS_TOKEN_SECRET) {
    throw new Error("ACCESS_TOKEN_SECRET is not set");
}
if (!ACCESS_TOKEN_EXPIRY) {
    throw new Error("ACCESS_TOKEN_EXPIRY is not set");
}
if (!REFRESH_TOKEN_SECRET) {
    throw new Error("REFRESH_TOKEN_SECRET is not set");
}
if (!REFRESH_TOKEN_EXPIRY) {
    throw new Error("REFRESH_TOKEN_EXPIRY is not set");
}


const ACCESS_SECRET: string = ACCESS_TOKEN_SECRET;
const REFRESH_SECRET: string = REFRESH_TOKEN_SECRET;

interface TokenPayload {
    id: string;
}

// Parses "1d" / "10d" / "12h" / "30m" / "45s" style durations (as used by
// ACCESS_TOKEN_EXPIRY / REFRESH_TOKEN_EXPIRY) into seconds, so the same
// value can drive both jwt.sign's `expiresIn` and a cookie's `maxAge`
// without reaching into jsonwebtoken's internal `ms` dependency.
const UNIT_TO_SECONDS: Record<string, number> = {
    s: 1,
    m: 60,
    h: 60 * 60,
    d: 60 * 60 * 24,
};

export const parseDurationToSeconds = (value: string): number => {
    const match = /^(\d+)([smhd])$/.exec(value.trim());
    if (!match) {
        throw new Error(`Invalid duration format: "${value}"`);
    }
    const [, amount, unit] = match;
    return Number(amount) * UNIT_TO_SECONDS[unit!]!;
};

const ACCESS_TOKEN_EXPIRY_SECONDS = parseDurationToSeconds(ACCESS_TOKEN_EXPIRY);
const REFRESH_TOKEN_EXPIRY_SECONDS = parseDurationToSeconds(REFRESH_TOKEN_EXPIRY);

export const generateAccessToken = (userId: string): string => {
    return jwt.sign(
        { 
            id: userId 
        } satisfies TokenPayload, 
        ACCESS_SECRET, 
        {
            expiresIn: ACCESS_TOKEN_EXPIRY_SECONDS,
        }
    );
};

export const generateRefreshToken = (userId: string): string => {
    return jwt.sign(
        { 
            id: userId 
        } satisfies TokenPayload, 
        REFRESH_SECRET, 
        {
            expiresIn: REFRESH_TOKEN_EXPIRY_SECONDS,
        }
    );
};

export const verifyAccessToken = (token: string): TokenPayload => {
    try {
        return jwt.verify(token, ACCESS_SECRET) as TokenPayload;
    } catch {
        throw new ApiError(401, "Invalid or expired access token");
    }
};

export const verifyRefreshToken = (token: string): TokenPayload => {
    try {
        return jwt.verify(token, REFRESH_SECRET) as TokenPayload;
    } catch {
        throw new ApiError(401, "Invalid or expired refresh token");
    }
};

const baseCookieOptions: CookieOptions = {
    httpOnly: true,
    secure: NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
};

export const accessTokenCookieOptions: CookieOptions = {
    ...baseCookieOptions,
    maxAge: ACCESS_TOKEN_EXPIRY_SECONDS * 1000,
};

export const refreshTokenCookieOptions: CookieOptions = {
    ...baseCookieOptions,
    maxAge: REFRESH_TOKEN_EXPIRY_SECONDS * 1000,
};

export const clearCookieOptions: CookieOptions = baseCookieOptions;

// Deliberately NOT httpOnly: this cookie carries no secret, it just lets the
// frontend know "a session might exist" without reading an httpOnly token.
// Same lifetime as the access token, since that's what actually determines
// whether a /me call would succeed right now.
export const sessionHintCookieOptions: CookieOptions = {
    secure: NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ACCESS_TOKEN_EXPIRY_SECONDS * 1000,
};
