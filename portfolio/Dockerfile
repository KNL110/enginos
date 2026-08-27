# Build with portfolio/ as the context, e.g.:
#   docker build --build-arg NEXT_PUBLIC_API_URL=https://api.example.com \
#     -t enginos-portfolio portfolio/
# Run:
#   docker run -p 3000:3000 -e PORT=3000 enginos-portfolio
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
ARG NEXT_PUBLIC_API_URL
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
ENV PORT=3000
EXPOSE 3000
CMD ["node", "server.js"]
