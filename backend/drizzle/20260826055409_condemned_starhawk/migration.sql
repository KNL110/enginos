CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"username" varchar(255) NOT NULL CONSTRAINT "users_username_key" UNIQUE,
	"avatar_url" varchar(500),
	"github_id" bigint NOT NULL CONSTRAINT "users_github_id_key" UNIQUE,
	"github_username" varchar(255) NOT NULL CONSTRAINT "users_github_username_key" UNIQUE,
	"github_access_token" text NOT NULL,
	"github_token_scope" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
