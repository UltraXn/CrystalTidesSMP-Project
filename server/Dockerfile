# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist
# If you have any other files needed at runtime (like .env or config files), 
# they should be handled via volumes or COPY here if they are static.
# Note: .env is usually passed via docker-compose env_file or volumes.

EXPOSE 3001

CMD ["node", "dist/index.js"]
