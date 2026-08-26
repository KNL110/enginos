ALTER TABLE "auth_providers" DROP CONSTRAINT "auth_providers_user_provider_key";--> statement-breakpoint
ALTER TABLE "auth_providers" ADD CONSTRAINT "auth_providers_user_id_key" UNIQUE("user_id");