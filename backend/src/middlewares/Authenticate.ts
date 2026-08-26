import { eq } from "drizzle-orm";
import db from "../db/db.js";
import { users } from "../db/schema/users.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { verifyAccessToken } from "../utils/token.js";

const authenticate = asyncHandler(async (req, _res, next) => {
    const token = req.cookies?.accessToken;

    if (!token) {
        throw new ApiError(401, "Authentication required");
    }

    const { id } = verifyAccessToken(token);

    const [user] = await db
        .select({
            id: users.id,
            username: users.username,
            avatarUrl: users.avatarUrl,
            githubUsername: users.githubUsername,
        })
        .from(users)
        .where(eq(users.id, id));

    if (!user) {
        throw new ApiError(401, "User does not exists");
    }

    req.user = user;
    next();
});

export default authenticate;
