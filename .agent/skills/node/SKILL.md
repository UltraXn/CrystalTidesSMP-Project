---
name: nodejs-backend
description: Node.js backend patterns for scalable APIs, microservices, and enterprise applications.
---
# Node.js (Backend Patterns) Skill

Enterprise Node.js backends using Express/Fastify, TypeScript, and architectural patterns.

## Core Principles
- **TypeScript everywhere**. Fastify > Express (perf).
- **Clean Architecture**: Controllers → Services → Repositories → Entities.
- **12-Factor App**: Config from env, logging, health checks.

## Modular Behaviors
- **Project Setup**: `npm init -y && npm i -D typescript @types/node tsx`. `npm i fastify`.
- **API Structure**: `/src/routes`, `/src/services`, `/src/repositories`, `/src/entities`.
- **Dependency Injection**: `awilix` or `tsyringe`. Singletons for DB/connections.
- **Validation**: Zod schemas. `z.object({ name: z.string().min(1) })`.
- **Auth**: JWT with `jsonwebtoken`. Refresh tokens. Role-based with guards.
- **Database**: Prisma or Drizzle ORM. Connection pooling. Transactions for business logic.
- **Error Handling**: Global handler. HTTP status + structured error payload.
- **Testing**: `vitest` + `msw`. 80% coverage. Integration tests against test DB.
- **Monitoring**: `pino` logger. Prometheus metrics. Health endpoints `/health`, `/ready`.
