import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError.js";
import { findPgDatabaseError, mapPostgresError } from "../utils/postgresError.js";
import { NODE_ENV } from "../constants.js";

interface ValidationLikeError extends Error {
    issues?: Array<{ path?: Array<string | number>; message: string }>;
    errors?: Array<{ path?: Array<string | number>; message: string }>;
}

// Duck-typed on purpose: no schema-validation library is installed yet.
// This recognizes the common shapes (Zod's `issues`, Joi/others' `errors`)
// so adding one later wires up without touching this file.
const isValidationError = (err: unknown): err is ValidationLikeError => {
    return err instanceof Error && (err.name === "ZodError" || err.name === "ValidationError");
};

const toValidationErrors = (err: ValidationLikeError): Array<{ field?: string; message: string }> => {
    const issues = err.issues ?? err.errors ?? [];
    return issues.map((issue) => ({
        field: Array.isArray(issue.path) ? issue.path.join(".") : undefined,
        message: issue.message,
    }));
};

const normalizeError = (err: unknown): { apiError: ApiError; original: unknown } => {
    if (err instanceof ApiError) {
        return { apiError: err, original: err };
    }

    const pgError = findPgDatabaseError(err);
    if (pgError) {
        const mapped = mapPostgresError(pgError);
        if (mapped) {
            return { apiError: mapped, original: err };
        }
        return {
            apiError: new ApiError(500, "Internal Server Error", [], false),
            original: err,
        };
    }

    if (isValidationError(err)) {
        return {
            apiError: new ApiError(400, "Validation failed", toValidationErrors(err), true),
            original: err,
        };
    }

    return {
        apiError: new ApiError(500, "Internal Server Error", [], false),
        original: err,
    };
};

const logError = (apiError: ApiError, original: unknown, req: Request): void => {
    const context = `${req.method} ${req.originalUrl}`;

    if (apiError.statusCode >= 500 || !apiError.isOperational) {
        const stack = original instanceof Error ? original.stack : String(original);
        console.error(`[5xx] ${context} -> ${apiError.statusCode}\n${stack}`);
        return;
    }

    console.warn(`[4xx] ${context} -> ${apiError.statusCode} ${apiError.message}`);
};

const errorHandler = (err: unknown, req: Request, res: Response, _next: NextFunction) => {
    const { apiError, original } = normalizeError(err);

    logError(apiError, original, req);

    const isProduction = NODE_ENV === "production";

    const body: Record<string, unknown> = {
        success: false,
        message: apiError.message,
        errors: apiError.errors.length > 0 ? apiError.errors : null,
        data: null,
    };

    if (!isProduction) {
        const debugSource = apiError.isOperational ? apiError : original;
        body.stack = debugSource instanceof Error ? debugSource.stack : undefined;
    }

    res.status(apiError.statusCode).json(body);
};

export default errorHandler;
