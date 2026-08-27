import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

export const NODE_ENV: string = process.env.NODE_ENV || "development";
export const DATABASE_URL : string | undefined = process.env.DATABASE_URL;

export const PORT = process.env.PORT || 4000;
export const CORS_ORIGIN: string | undefined = process.env.CORS_ORIGIN;
export const FRONTEND_URL: string | undefined = process.env.FRONTEND_URL;

export const GITHUB_CLIENT_ID: string | undefined = process.env.GITHUB_CLIENT_ID;
export const GITHUB_CLIENT_SECRET: string | undefined = process.env.GITHUB_CLIENT_SECRET;
export const GITHUB_CALLBACK_URL: string | undefined = process.env.GITHUB_CALLBACK_URL;

export const REFRESH_TOKEN_EXPIRY: string | undefined = process.env.REFRESH_TOKEN_EXPIRY;
export const REFRESH_TOKEN_SECRET: string | undefined = process.env.REFRESH_TOKEN_SECRET;
export const ACCESS_TOKEN_EXPIRY: string | undefined = process.env.ACCESS_TOKEN_EXPIRY;
export const ACCESS_TOKEN_SECRET: string | undefined = process.env.ACCESS_TOKEN_SECRET;

export const CLOUDINARY_API_KEY: string | undefined = process.env.CLOUDINARY_API_KEY;
export const CLOUDINARY_API_SECRET: string | undefined = process.env.CLOUDINARY_API_SECRET;
export const CLOUDINARY_CLOUD_NAME: string | undefined = process.env.CLOUDINARY_CLOUD_NAME;
