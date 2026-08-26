import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

export const DB_NAME: string | undefined = process.env.DB_NAME;
export const DB_URI = `${process.env.DB_URL}/${DB_NAME}`;
export const DB_USERNAME: string | undefined = process.env.DB_USERNAME;
export const DB_PASSWORD: string | undefined = process.env.DB_PASSWORD;
export const DATABASE_URL : string | undefined = process.env.DATABASE_URL;

export const PORT = process.env.PORT || 4000;
export const CORS_ORIGIN: string | undefined = process.env.CORS_ORIGIN;

export const REFRESH_TOKEN_EXPIRY: string | undefined = process.env.REFRESH_TOKEN_EXPIRY;
export const REFRESH_TOKEN_SECRET: string | undefined = process.env.REFRESH_TOKEN_SECRET;
export const ACCESS_TOKEN_EXPIRY: string | undefined = process.env.ACCESS_TOKEN_EXPIRY;
export const ACCESS_TOKEN_SECRET: string | undefined = process.env.ACCESS_TOKEN_SECRET;

export const CLOUDINARY_API_KEY: string | undefined = process.env.CLOUDINARY_API_KEY;
export const CLOUDINARY_API_SECRET: string | undefined = process.env.CLOUDINARY_API_SECRET;
export const CLOUDINARY_CLOUD_NAME: string | undefined = process.env.CLOUDINARY_CLOUD_NAME;
