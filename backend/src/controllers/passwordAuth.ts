import bcrypt from "bcrypt";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { findPgDatabaseError } from "../utils/postgresError.js";
import db from "../db/db.js";
import { users } from "../db/schema/users.js";
import { authProviders } from "../db/schema/authProviders.js";
import { sanitizeUser, issueSession } from "../services/auth.service.js";

const PASSWORD_SALT_ROUNDS = 10;
const MAX_USERNAME_ATTEMPTS = 5;
const SELF_PROVIDER = "self";

const signupSchema = z.object({
    email: z.string().trim().toLowerCase().pipe(z.email()),
    password: z.string().min(8).max(72),
});

const loginSchema = z.object({
    email: z.string().trim().toLowerCase().pipe(z.email()),
    password: z.string().min(1),
});

const settingsSchema = z
    .object({
        username: z.string().trim().min(1).max(255).optional(),
        password: z.string().min(8).max(72).optional(),
    })
    .refine((body) => body.username !== undefined || body.password !== undefined, {
        message: "Nothing to update",
    });

const deriveUsername = (email: string): string => {
    const base = email.split("@")[0]!.replace(/[^a-zA-Z0-9_.-]/g, "");
    return base || "user";
};

const withRandomSuffix = (base: string): string => `${base}${Math.floor(1000 + Math.random() * 9000)}`;

const fetchAuthProvider = (userId: string) =>
    db
        .select({ provider: authProviders.provider })
        .from(authProviders)
        .where(eq(authProviders.userId, userId))
        .then(([row]) => row);

export const signupWithPassword = asyncHandler(async (req, res) => {
    const { email, password } = signupSchema.parse(req.body);

    const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email));
    if (existing) {
        throw new ApiError(409, "An account with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, PASSWORD_SALT_ROUNDS);
    let username = deriveUsername(email);

    let newUser: typeof users.$inferSelect | undefined;
    for (let attempt = 0; attempt <= MAX_USERNAME_ATTEMPTS; attempt++) {
        try {
            newUser = await db.transaction(async (tx) => {
                const [inserted] = await tx
                    .insert(users)
                    .values({ email, password: hashedPassword, username })
                    .returning();
                await tx.insert(authProviders).values({ userId: inserted!.id, provider: SELF_PROVIDER });
                return inserted;
            });
            break;
        } catch (err) {
            const pgError = findPgDatabaseError(err);
            const isUsernameCollision = pgError?.code === "23505" && pgError.constraint === "users_username_key";
            if (isUsernameCollision && attempt < MAX_USERNAME_ATTEMPTS) {
                username = withRandomSuffix(deriveUsername(email));
                continue;
            }
            throw err;
        }
    }

    const authProvider = await fetchAuthProvider(newUser!.id);
    await issueSession(res, newUser!.id);

    return res.json(
        new ApiResponse(201, sanitizeUser(newUser!, authProvider), "Account created")
    );
});

export const loginWithPassword = asyncHandler(async (req, res) => {
    const { email, password } = loginSchema.parse(req.body);

    const [user] = await db.select().from(users).where(eq(users.email, email));
    if (!user) {
        throw new ApiError(401, "Invalid email or password");
    }
    if (!user.password) {
        throw new ApiError(401, "A github account with this email already exist, please set the password for that account");
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
        throw new ApiError(401, "Invalid email or password");
    }

    const authProvider = await fetchAuthProvider(user.id);
    await issueSession(res, user.id);

    return res.json(
        new ApiResponse(200, sanitizeUser(user, authProvider), "Logged in successfully")
    );
});

export const updateSettings = asyncHandler(async (req, res) => {
    const { username, password } = settingsSchema.parse(req.body);

    const updates: Partial<typeof users.$inferInsert> = {};
    if (username) updates.username = username;
    if (password) updates.password = await bcrypt.hash(password, PASSWORD_SALT_ROUNDS);

    let updated: typeof users.$inferSelect | undefined;
    try {
        [updated] = await db.update(users).set(updates).where(eq(users.id, req.user!.id)).returning();
    } catch (err) {
        const pgError = findPgDatabaseError(err);
        if (pgError?.code === "23505" && pgError.constraint === "users_username_key") {
            throw new ApiError(409, "That username is already taken");
        }
        throw err;
    }

    const authProvider = await fetchAuthProvider(updated!.id);

    return res.json(
        new ApiResponse(200, sanitizeUser(updated!, authProvider), "Settings updated")
    );
});
