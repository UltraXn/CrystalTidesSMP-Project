# Ultra-lightweight runtime image
# Assumes npm install + npm run build done on host
FROM node:22-alpine

RUN apk add --no-cache libc6-compat=1.2.5-r8

WORKDIR /app

ENV NODE_ENV=production
EXPOSE 3001

# Copy only production dependencies (pre-installed and pruned on host)
COPY --chown=node:node node_modules ./node_modules

# Copy built application
COPY --chown=node:node apps/web-server/dist ./apps/web-server/dist
COPY --chown=node:node packages/shared/dist ./packages/shared/dist

USER node

CMD ["node", "apps/web-server/dist/index.js"]
