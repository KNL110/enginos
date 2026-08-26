import { defineRelations } from "drizzle-orm";
import { users } from "./users.js";
import { authProviders } from "./authProviders.js";

export const relations = defineRelations({ users, authProviders }, (r) => ({
	users: {
		authProviders: r.many.authProviders(),
	},
	authProviders: {
		user: r.one.users({
			from: r.authProviders.userId,
			to: r.users.id,
		}),
	},
}))
