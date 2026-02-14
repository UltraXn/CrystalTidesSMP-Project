---
name: bun-runtime
description: Bun runtime management, scripting, package management, and server deployment.
---
# Bun Skill

Use Bun as the fastest JavaScript/TypeScript runtime. Package management, bundling, testing, and servers.

## Core Principles
- **Bun is drop-in Node.js replacement** + faster.
- Native **TypeScript**, **JSX**, **fetch**, **WebSocket** support.
- **Zero-config** bundling/testing/watch.

## Modular Behaviors
- **Project Setup**: `bun init -y`. `bun add <pkg>` replaces `npm`. `bun install` once.
- **Scripts**: `bun run dev` (auto watch/restart). `bun build` for production.
- **Package Management**: `bun add -d typescript @types/node`. Lockfile is `bun.lockb`.
- **Servers**: `Bun.serve({ port: 3000, fetch(req) { ... } })`. Native WebSocket support.
- **Testing**: `bun test` (native vitest). `--watch` for dev.
- **TypeScript**: No `tsconfig.json` needed. Native `.tsx` support.
- **Database**: `bun:sqlite` for local dev. Migrate with `drizzle-kit`.
- **Deployment**: `bun build --target=bun ./index.ts --outfile=app.js`. Docker: `FROM oven/bun`.
