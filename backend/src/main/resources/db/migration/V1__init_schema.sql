CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS hstore;

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(255) NOT NULL UNIQUE,
    avatar_url VARCHAR(500),
    github_id BIGINT NOT NULL UNIQUE,
    github_username VARCHAR(255) NOT NULL UNIQUE,
    github_access_token TEXT NOT NULL,
    github_token_scope TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
