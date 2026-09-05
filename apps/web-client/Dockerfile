# syntax=docker/dockerfile:1.7
# Multi-stage frontend: Vite build → unprivileged nginx.

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
# Lockfile generated on Windows only pins win32 optional deps;
# install the Alpine/musl Oxide binding explicitly for Vite/Tailwind.
RUN npm ci \
  && npm install --no-save @tailwindcss/oxide-linux-x64-musl@4.2.2

FROM deps AS builder
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_API_URL
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
    VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY \
    VITE_API_URL=$VITE_API_URL
COPY . .
RUN npx turbo run build --filter=@crystaltides/client...

FROM nginxinc/nginx-unprivileged:1.27-alpine AS runner
USER root
RUN apk add --no-cache curl
USER 101

COPY --from=builder /app/apps/web-client/dist /usr/share/nginx/html
COPY deploy/nginx/nginx.conf /etc/nginx/conf.d/default.conf

ENV PORT=8080
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -fsS "http://127.0.0.1:8080/healthz" || exit 1

CMD ["nginx", "-g", "daemon off;"]
