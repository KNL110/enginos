import type { DatabaseError } from "pg";
import { ApiError } from "./ApiError.js";

const SQLSTATE_PATTERN = /^[0-9A-Z]{5}$/;

const isPgDatabaseError = (err: unknown): err is DatabaseError => {
    if (!(err instanceof Error)) return false;
    const code = (err as { code?: unknown }).code;
    return typeof code === "string" && SQLSTATE_PATTERN.test(code);
};

const PG_ERROR_MAP: Record<string, { statusCode: number; message: string }> = {
    "23505": { statusCode: 409, message: "A record with the same value already exists" },
    "23503": { statusCode: 409, message: "This action references a related record that does not exist" },
    "23502": { statusCode: 400, message: "A required field is missing" },
    "23514": { statusCode: 400, message: "The provided data violates a required constraint" },
    "22P02": { statusCode: 400, message: "One or more fields contain an invalid value" },
    "22001": { statusCode: 400, message: "One or more fields exceed the maximum allowed length" },
};

/**
 * Maps a known PostgreSQL SQLSTATE code to a safe, client-facing ApiError.
 * Returns null for SQLSTATE codes we don't explicitly recognize, so callers
 * can fall back to generic unexpected-error handling instead of guessing.
 */
const mapPostgresError = (err: DatabaseError): ApiError | null => {
    const known = err.code ? PG_ERROR_MAP[err.code] : undefined;
    if (!known) return null;

    const apiError = new ApiError(known.statusCode, known.message, [], true);
    apiError.cause = err;
    return apiError;
};

/**
 * Drizzle wraps every driver error in a DrizzleQueryError, preserving the
 * original `pg` DatabaseError on `.cause` (see drizzle-orm/errors.js). Check
 * the error itself first, then one level of `.cause`, rather than assuming
 * a single "DrizzleError" type covers every database failure.
 */
const findPgDatabaseError = (err: unknown): DatabaseError | null => {
    if (isPgDatabaseError(err)) return err;

    const cause = err instanceof Error ? (err as { cause?: unknown }).cause : undefined;
    if (isPgDatabaseError(cause)) return cause;

    return null;
};

export { isPgDatabaseError, mapPostgresError, findPgDatabaseError };
