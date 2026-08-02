# syntax=docker/dockerfile:1.7
# Multi-stage: build inside the image, ship a slim alpine runtime.

FROM node:24-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat \
  && npm install -g npm@11.6.4
COPY package.json package-lock.json turbo.json ./
COPY apps/web-server/package.json ./apps/web-server/
COPY apps/web-client/package.json ./apps/web-client/
COPY apps/discord-bot/package.json ./apps/discord-bot/
COPY apps/game-bridge/package.json ./apps/game-bridge/
COPY packages/shared/package.json ./packages/shared/
COPY packages/eslint-config/package.json ./packages/eslint-config/
RUN npm ci

FROM deps AS builder
ENV NODE_OPTIONS=--max-old-space-size=8192
COPY . .
RUN npx turbo run build --filter=@crystaltides/server...
RUN npm prune --omit=dev

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
