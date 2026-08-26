CREATE TABLE "auth_providers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"provider" varchar(50) NOT NULL,
	"provider_account_id" varchar(255),
	"access_token" text,
	"token_scope" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "auth_providers_user_provider_key" UNIQUE("user_id","provider"),
	CONSTRAINT "auth_providers_provider_account_key" UNIQUE("provider","provider_account_id")
);
--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "avatar_url" TO "avatar";--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_github_id_key";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "password" text;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "github_id";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "github_access_token";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "github_token_scope";--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_email_key" UNIQUE("email");--> statement-breakpoint
ALTER TABLE "auth_providers" ADD CONSTRAINT "auth_providers_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;