# Build with control_panel/ as the context, e.g.:
#   docker build --build-arg NEXT_PUBLIC_API_URL=https://api.example.com \
#     -t enginos-control-panel control_panel/
# Run:
#   docker run -p 3001:3001 -e PORT=3001 enginos-control-panel
#
# NEXT_PUBLIC_API_URL is a build-time value (Next.js inlines NEXT_PUBLIC_*
# vars into the client bundle at build time), so it's a --build-arg, not
# something you can just set at `docker run` time.

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
# Defaulted to the backend's Cloud Run URL because our deploy path (Cloud
# Run's console-based continuous deployment from GitHub, Dockerfile mode)
# has no way to pass --build-arg. Override with --build-arg for local/manual
# builds against a different backend.
ARG NEXT_PUBLIC_API_URL=https://enginos-git-711843441118.asia-south1.run.app
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm run build

# ---- runner: minimal final image ----
FROM node:24-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN groupadd --system --gid 1001 nodejs && useradd --system --uid 1001 --gid nodejs frontend

COPY --from=builder --chown=frontend:nodejs /app/.next/standalone ./
COPY --from=builder --chown=frontend:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=frontend:nodejs /app/public ./public

USER frontend
ENV PORT=3001
EXPOSE 3001
CMD ["node", "server.js"]
