# syntax=docker/dockerfile:1.7
# Multi-stage frontend: Vite build → unprivileged nginx.

# Stage 1: Pruner - minimal workspace slice for @crystaltides/client (same as web-server)
FROM node:24-alpine AS pruner
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY . .
RUN npx turbo prune --scope=@crystaltides/client --docker

# Stage 2: Dependencies and Vite build
FROM node:24-alpine AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat \
  && corepack enable && corepack prepare pnpm@10.29.3 --activate

# First install only dependencies needed for this scope (layer cached).
# pnpm-lock.yaml records every platform variant, so the musl bindings
# (Tailwind Oxide, Rollup) resolve without manual installs.
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=pruner /app/.npmrc ./.npmrc
RUN pnpm install --frozen-lockfile

ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_API_URL
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
    VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY \
    VITE_API_URL=$VITE_API_URL
COPY --from=pruner /app/out/full/ .
RUN pnpm turbo run build --filter=@crystaltides/client...

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
