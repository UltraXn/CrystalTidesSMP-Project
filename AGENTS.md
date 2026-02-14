# AGENTS.md - CrystalTides SMP

> **Context**: High-Performance Minecraft SMP ecosystem (Java/Rust/Web Monorepo).

## Dev environment tips

- **Orchestration**: This is a Turborepo. Use `npm run dev` to start all web/js services.
- **Filtering**: To focus on one app, use `npm run dev --filter=web-client` or `--filter=web-server`.
- **Java/Spigot**: The plugin lives in `plugins/crystalcore`. Build it with `mvn clean package` (Requires Java 21).
- **Rust/JNI**: The Game Agent native core is in `apps/game-bridge/native-core`. Build with `cargo build --release`.
- **Database**: We use MySQL for the server and Supabase (Postgres) for the Web. Pterodactyl controls the server process.
- **Discord Bot**: Runs on Bun. Start with `bun run dev` in `apps/discord-bot` if running standalone.

## Testing instructions

- **Web/JS**: Run `npm run lint` and `npm run typecheck` to verify TypeScript integrity across the monorepo.
- **Java**: Run `mvn test` in `plugins/crystalcore` to run Spigot unit tests.
- **Rust**: Run `cargo test` in `apps/game-bridge/native-core`.
- **Integration**: Validate `universal_links` logic (Discord <-> Minecraft) before merging auth changes.

## PR instructions

- **Title format**: `[<component>] <Description>` (e.g., `[web-client] Fix navbar responsiveness`).
- **Checklist**:
  - [ ] `npm run build` passes for web apps.
  - [ ] `mvn clean package` builds a valid JAR for `crystalcore`.
  - [ ] No secrets (API Keys, Webhooks) in `.env` or committed code.
- **Architecture**: Ensure new web features use the Internal Bot API (Port 3002) for presence checks, avoiding rate limits.
