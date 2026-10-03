# syntax=docker/dockerfile:1.7
# Multi-stage: build inside the image, ship a slim alpine runtime.

# Stage 1: Pruner - Generate minimal workspace slice for @crystaltides/server
FROM node:24-alpine AS pruner
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY . .
RUN npx turbo prune --scope=@crystaltides/server --docker

# Stage 2: Dependencies and Build
FROM node:24-alpine AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat \
  && corepack enable && corepack prepare pnpm@10.29.3 --activate

# First install only dependencies needed for this scope (layer cached)
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=pruner /app/.npmrc ./.npmrc
RUN pnpm install --frozen-lockfile

# Copy full pruned source and build
COPY --from=pruner /app/out/full/ .
ENV NODE_OPTIONS=--max-old-space-size=8192
RUN pnpm turbo run build --filter=@crystaltides/server...
RUN pnpm prune --prod

FROM node:24-alpine AS runner
WORKDIR /app
RUN apk add --no-cache libc6-compat curl \
  && addgroup -S app && adduser -S app -G app

ENV NODE_ENV=production
ENV PORT=3001

COPY --from=builder --chown=app:app /app/node_modules ./node_modules
COPY --from=builder --chown=app:app /app/package.json ./package.json
COPY --from=builder --chown=app:app /app/apps/web-server/dist ./apps/web-server/dist
COPY --from=builder --chown=app:app /app/apps/web-server/package.json ./apps/web-server/package.json
COPY --from=builder --chown=app:app /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder --chown=app:app /app/packages/shared/package.json ./packages/shared/package.json

USER app
EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=25s --retries=3 \
  CMD curl -fsS "http://127.0.0.1:${PORT}/api/system/health" || exit 1

CMD ["node", "apps/web-server/dist/index.js"]
