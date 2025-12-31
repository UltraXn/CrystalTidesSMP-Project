# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Instalar turbo globalmente para usarlo en el build
RUN npm install -g turbo

# Copiar archivos de definición de workspaces
COPY package*.json ./
COPY apps/web-client/package*.json ./apps/web-client/
COPY apps/web-server/package*.json ./apps/web-server/
COPY packages/shared/package*.json ./packages/shared/
COPY packages/eslint-config/package*.json ./packages/eslint-config/
COPY apps/discord-bot/package*.json ./apps/discord-bot/

# Instalar dependencias usando el lockfile de la raíz
RUN npm install

# Copiar el resto del código
COPY . .

# Argumentos de construcción para Vite
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_API_URL

# Establecer variables de entorno para el proceso de build
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV VITE_API_URL=$VITE_API_URL

# Verificar presencia de variables (los logs de build lo mostrarán)
RUN echo "Checking build variables..." && \
    if [ -z "$VITE_SUPABASE_URL" ]; then echo "WARNING: VITE_SUPABASE_URL is empty"; else echo "VITE_SUPABASE_URL is set"; fi && \
    if [ -z "$VITE_SUPABASE_ANON_KEY" ]; then echo "WARNING: VITE_SUPABASE_ANON_KEY is empty"; else echo "VITE_SUPABASE_ANON_KEY is set"; fi

# Construir solo el cliente usando Turbo
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN turbo run build --filter=@crystaltides/client...

# Stage 2: Serve with Nginx
FROM nginx:alpine

COPY --from=builder /app/apps/web-client/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
