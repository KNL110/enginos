import { pgTable, uuid, varchar, text, unique } from "drizzle-orm/pg-core"
import { timestamps } from "./columns.helper.js";

export const users = pgTable("users", {
	id: uuid().defaultRandom().primaryKey(),
	username: varchar({ length: 255 }).notNull(),
	avatarUrl: varchar("avatar", { length: 500 }),
	email: varchar({ length: 255 }),
	password: text(),
	refreshToken: text("refresh_token"),
	...timestamps
}, (table) => [
	unique("users_username_key").on(table.username),
	unique("users_email_key").on(table.email),
]);
