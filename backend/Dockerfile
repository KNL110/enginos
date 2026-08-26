# Build with backend/ as the context, e.g.:
#   docker build -t enginos-backend backend/
# Run with your real env vars (DATABASE_URL, GITHUB_CLIENT_ID, ACCESS_TOKEN_SECRET, etc.):
#   docker run -p 8080:8080 -e PORT=8080 -e DATABASE_URL=... -e ... enginos-backend
# (constants.ts falls back to 4000 if PORT is unset, but your .env uses 8080 —
# whatever you pass as PORT at `docker run` is what it actually listens on;
# EXPOSE below is just documentation, not enforcement. Don't use `--env-file`
# with a quoted .env — Docker's own env-file parsing doesn't strip quotes the
# way `dotenv` does, so KEY="value" comes through as the literal string
# including the quote characters. Pass vars with -e, or use an unquoted file.)
#
# node:24-slim (Debian, glibc) rather than an Alpine base — bcrypt compiles a
# native addon, and Alpine's musl libc is a common source of native-module
# breakage that's not worth chasing down in a production image.

# ---- deps: production dependencies only, kept for the final image ----
FROM node:24-slim AS deps
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ---- builder: full dependencies + compile TypeScript ----
FROM node:24-slim AS builder
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json tsconfig.json ./
RUN npm ci
COPY src ./src
RUN npm run build

# ---- runner: minimal final image ----
FROM node:24-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN groupadd --system --gid 1001 nodejs && useradd --system --uid 1001 --gid nodejs backend

COPY --from=deps --chown=backend:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=backend:nodejs /app/dist ./dist
COPY --chown=backend:nodejs package.json ./

# Migrations aren't run from this image — drizzle-kit is a devDependency and
# drizzle.config.ts reads from src/, neither of which ship here. Run
# `npm run db:migrate` locally/in CI, or against the builder stage, instead.

USER backend
EXPOSE 8080
CMD ["node", "dist/index.js"]
