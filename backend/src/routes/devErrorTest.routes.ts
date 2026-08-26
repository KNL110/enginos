import { Router } from "express";
import { sql, eq } from "drizzle-orm";
import db from "../db/db.js";
import { users } from "../db/schema/users.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";

/**
 * Dev-only diagnostic routes that exercise every branch of the central
 * error handler against the real `pg` driver. Mounted only when
 * NODE_ENV !== "production" (see app.ts). Not part of the public API.
 */
const router = Router();

router.get(
    "/ok",
    asyncHandler(async (_req, res) => {
        res.json(new ApiResponse(200, { pong: true }));
    })
);

router.get(
    "/api-error/:code",
    asyncHandler(async (req) => {
        const code = Number(req.params.code);
        const messages: Record<number, string> = {
            400: "Invalid request",
            401: "Unauthorized",
            403: "Forbidden",
            404: "User not found",
            409: "Resource already exists",
        };

        const message = messages[code];
        if (!message) {
            throw new ApiError(400, "Unsupported test code. Use one of 400, 401, 403, 404, 409.");
        }

        throw new ApiError(code, message);
    })
);

router.get(
    "/unknown",
    asyncHandler(async () => {
        throw new Error("Something exploded unexpectedly");
    })
);

router.get(
    "/validation",
    asyncHandler(async () => {
        const err = new Error("Validation failed") as Error & {
            issues: Array<{ path: string[]; message: string }>;
        };
        err.name = "ZodError";
        err.issues = [{ path: ["email"], message: "Invalid email" }];
        throw err;
    })
);

router.get(
    "/pg/invalid-text",
    asyncHandler(async () => {
        await db.execute(sql`SELECT 'abc'::integer`);
    })
);

router.get(
    "/pg/not-null",
    asyncHandler(async () => {
        await db.execute(sql`INSERT INTO users (username) VALUES (${`__na_${Date.now()}`})`);
    })
);

router.get(
    "/pg/unique",
    asyncHandler(async () => {
        const username = `__dup_${Date.now()}`;

        await db.insert(users).values({
            username,
            githubId: Date.now(),
            githubUsername: `${username}_1`,
            githubAccessToken: "test-token",
            githubTokenScope: "repo",
        });

        try {
            await db.insert(users).values({
                username,
                githubId: Date.now() + 1,
                githubUsername: `${username}_2`,
                githubAccessToken: "test-token",
                githubTokenScope: "repo",
            });
        } finally {
            await db.delete(users).where(eq(users.username, username));
        }
    })
);

router.get(
    "/pg/foreign-key",
    asyncHandler(async () => {
        await db.transaction(async (tx) => {
            await tx.execute(
                sql`CREATE TEMP TABLE IF NOT EXISTS error_test_parent (id int PRIMARY KEY) ON COMMIT DROP`
            );
            await tx.execute(
                sql`CREATE TEMP TABLE IF NOT EXISTS error_test_child (id int PRIMARY KEY, parent_id int REFERENCES error_test_parent(id)) ON COMMIT DROP`
            );
            await tx.execute(sql`INSERT INTO error_test_child (id, parent_id) VALUES (1, 999)`);
        });
    })
);

router.get(
    "/pg/check",
    asyncHandler(async () => {
        await db.transaction(async (tx) => {
            await tx.execute(
                sql`CREATE TEMP TABLE IF NOT EXISTS error_test_check (age int CHECK (age >= 0)) ON COMMIT DROP`
            );
            await tx.execute(sql`INSERT INTO error_test_check (age) VALUES (-1)`);
        });
    })
);

router.get(
    "/pg/truncation",
    asyncHandler(async () => {
        await db.transaction(async (tx) => {
            await tx.execute(
                sql`CREATE TEMP TABLE IF NOT EXISTS error_test_trunc (name varchar(3)) ON COMMIT DROP`
            );
            await tx.execute(sql`INSERT INTO error_test_trunc (name) VALUES ('abcdef')`);
        });
    })
);

export default router;
