import { pgTable, uuid, varchar, text, unique } from "drizzle-orm/pg-core"
import { timestamps } from "./columns.helper.js";
import { users } from "./users.js";

// One row per user (not one per provider) — this tracks the account's current
// live identity, not history. `provider` starts "self" (email/password) or
// "github" depending on how the account was created, and flips in place to
// "github" the moment GitHub gets connected, regardless of which came first.
// `providerAccountId` is that provider's own id for the user (e.g. GitHub's
// numeric user id as a string) — null for "self", which has no external id.
export const authProviders = pgTable("auth_providers", {
	id: uuid().defaultRandom().primaryKey(),
	userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
	provider: varchar({ length: 50 }).notNull(),
	providerAccountId: varchar("provider_account_id", { length: 255 }),
	accessToken: text("access_token"),
	tokenScope: text("token_scope"),
	...timestamps
}, (table) => [
	unique("auth_providers_user_id_key").on(table.userId),
	unique("auth_providers_provider_account_key").on(table.provider, table.providerAccountId),
]);
