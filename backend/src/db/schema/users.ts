import { pgTable, integer, uuid, varchar, bigint, text, timestamp, boolean, index, primaryKey, unique } from "drizzle-orm/pg-core"
import { timestamps } from "./columns.helper.js";


export const users = pgTable("users", {
	id: uuid().defaultRandom().primaryKey(),
	username: varchar({ length: 255 }).notNull(),
	avatarUrl: varchar("avatar_url", { length: 500 }),
	githubId: bigint("github_id", { mode: 'number' }).notNull(),
	githubUsername: varchar("github_username", { length: 255 }).notNull(),
	githubAccessToken: text("github_access_token").notNull(),
	githubTokenScope: text("github_token_scope").notNull(),
	refreshToken: text("refresh_token"),
	...timestamps
}, (table) => [
	unique("users_github_id_key").on(table.githubId),
	unique("users_github_username_key").on(table.githubUsername),
	unique("users_username_key").on(table.username)
]);
