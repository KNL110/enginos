import { pgTable, uuid, varchar, text, boolean, bigint, timestamp, unique } from "drizzle-orm/pg-core"
import { timestamps } from "./columns.helper.js";
import { users } from "./users.js";

// One row per (user, GitHub repo) synced from GitHub — the same repo can
// validly belong to two different DevPilot users (collaborators), so
// uniqueness is per-user, not global.
export const repos = pgTable("repos", {
	id: uuid().defaultRandom().primaryKey(),
	userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
	githubRepoId: bigint("github_repo_id", { mode: "number" }).notNull(),
	owner: varchar({ length: 255 }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	fullName: varchar("full_name", { length: 500 }).notNull(),
	description: text(),
	private: boolean().notNull(),
	// GitHub's repo-listing endpoint only gives one "primary" language, so
	// this is populated from the separate per-repo /languages endpoint
	// instead — ordered by bytes of code, most-used first.
	languages: text("languages").array(),
	defaultBranch: varchar("default_branch", { length: 255 }),
	htmlUrl: text("html_url").notNull(),
	githubUpdatedAt: timestamp("github_updated_at", { withTimezone: true }),
	...timestamps
}, (table) => [
	unique("repos_user_github_repo_key").on(table.userId, table.githubRepoId),
]);
