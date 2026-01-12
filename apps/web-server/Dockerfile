# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Instalar turbo globalmente
RUN npm install -g turbo

# Copiar archivos de definición de workspaces
COPY package*.json ./
COPY apps/web-client/package*.json ./apps/web-client/
COPY apps/web-server/package*.json ./apps/web-server/
COPY packages/shared/package*.json ./packages/shared/
COPY packages/eslint-config/package*.json ./packages/eslint-config/
COPY apps/discord-bot/package*.json ./apps/discord-bot/

# Instalar todas las dependencias (necesario para el build de turbo)
RUN npm install

# Copiar el resto del código
COPY . .

# Construir solo el servidor usando Turbo
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN turbo run build --filter=@crystaltides/server...

# Stage 2: Production
# ... (Keep Builder stage as is)
# Start of Runner Stage
FROM node:22-alpine

WORKDIR /app

# Optimize: Copy only production dependencies
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/apps/web-server/package*.json ./apps/web-server/

# Copy only node_modules cleaned for production
# We need to replicate the prune structure or just copy the pruned version.
# Since builder has all, let's do a prune step in a middle stage or here.
# Easier method: Install only prod deps here or copy and prune.
# Let's use a "pruner" stage to be cleaner.
# Actually, since we use workspaces, 'npm prune' in root might be tricky without full context.
# Let's try: Copy node_modules from builder, then prune.
COPY --from=builder /app/node_modules ./node_modules
# Prune dev dependencies to save space
RUN npm prune --production

COPY --from=builder /app/apps/web-server/dist ./dist

# Security: Run as non-root user
# 'node' user exists in alpine image
RUN chown -R node:node /app
USER node

EXPOSE 3001

CMD ["node", "dist/index.js"]
