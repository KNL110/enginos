# Build with control_panel/ as the context, e.g.:
#   docker build -t enginos-control-panel control_panel/
# Run:
#   docker run -p 3001:3001 -e PORT=3001 -e API_URL=https://api.example.com enginos-control-panel
#
# API_URL is the backend origin that next.config.ts's rewrites() proxies
# /api/v1/* to — a plain runtime env var (not NEXT_PUBLIC_*, never reaches
# the client bundle), read fresh whenever server.js starts. It also needs a
# default below since next.config.ts is loaded during `next build` too, and
# our deploy path (Cloud Run's console-based continuous deployment,
# Dockerfile mode) has no way to pass --build-arg.

# ---- deps ----
FROM node:24-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- builder ----
FROM node:24-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG API_URL=https://enginos-git-711843441118.asia-south1.run.app
ENV API_URL=$API_URL
RUN npm run build

# ---- runner: minimal final image ----
FROM node:24-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ARG API_URL=https://enginos-git-711843441118.asia-south1.run.app
ENV API_URL=$API_URL
RUN groupadd --system --gid 1001 nodejs && useradd --system --uid 1001 --gid nodejs frontend

COPY --from=builder --chown=frontend:nodejs /app/.next/standalone ./
COPY --from=builder --chown=frontend:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=frontend:nodejs /app/public ./public

USER frontend
ENV PORT=3001
EXPOSE 3001
CMD ["node", "server.js"]
