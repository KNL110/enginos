import { eq } from "drizzle-orm";
import db from "../db/db.js";
import { users } from "../db/schema/users.js";
import { authProviders } from "../db/schema/authProviders.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { verifyAccessToken } from "../utils/token.js";

const authenticate = asyncHandler(async (req, _res, next) => {
    const token = req.cookies?.accessToken;

    if (!token) {
        throw new ApiError(401, "Authentication required");
    }

    const { id } = verifyAccessToken(token);

    const [row] = await db
        .select({
            id: users.id,
            username: users.username,
            avatarUrl: users.avatarUrl,
            email: users.email,
            hasPassword: users.password,
            provider: authProviders.provider,
        })
        .from(users)
        .leftJoin(authProviders, eq(authProviders.userId, users.id))
        .where(eq(users.id, id));

    if (!row) {
        throw new ApiError(401, "User does not exists");
    }

    req.user = {
        id: row.id,
        username: row.username,
        avatarUrl: row.avatarUrl,
        email: row.email,
        hasPassword: row.hasPassword !== null,
        githubConnected: row.provider === "github",
    };
    next();
});

export default authenticate;
