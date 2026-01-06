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
FROM node:22-alpine

WORKDIR /app

# En modo monorepo, a veces es más seguro copiar lo que ya se instaló en builder 
# o hacer un prune. Para simplificar y asegurar que funciona:
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/apps/web-server/package*.json ./apps/web-server/
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/web-server/dist ./dist
# Credentials for Google Calendar
# Credentials for Google Calendar handled via ENV vars now

# Copy .env file generated during build
COPY --from=builder /app/apps/web-server/.env ./.env

EXPOSE 3001

CMD ["node", "dist/index.js"]
