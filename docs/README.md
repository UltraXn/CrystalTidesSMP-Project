# CrystalTides Documentation

Indice operativo de la documentacion disponible en el repo.

## Getting started

- [SETUP.md](./getting-started/SETUP.md)
- [DEPLOYMENT.md](./getting-started/DEPLOYMENT.md)

## Architecture

- [OVERVIEW.md](./architecture/OVERVIEW.md)
- [CRYSTAL_BRIDGE.md](./architecture/CRYSTAL_BRIDGE.md)
- [RUST_JAVA_BRIDGE.md](./architecture/RUST_JAVA_BRIDGE.md)
- [SUPABASE_INTEGRATION.md](./architecture/SUPABASE_INTEGRATION.md)

## Components

- [WEB_CLIENT.md](./components/WEB_CLIENT.md)
- [LAUNCHER.md](./components/LAUNCHER.md)
- [GAME_AGENT.md](./components/GAME_AGENT.md)
- [DISCORD_BOT.md](./components/DISCORD_BOT.md)

## Features

- [FORUM_SYSTEM.md](./features/FORUM_SYSTEM.md)
- [GACHA_SYSTEM.md](./features/GACHA_SYSTEM.md)
- [GOOGLE_INTEGRATION.md](./features/GOOGLE_INTEGRATION.md)
- [STAFF_HUB.md](./features/STAFF_HUB.md)
- [USER_PROFILES.md](./features/USER_PROFILES.md)

## Operations

- [CI_CD.md](./operations/CI_CD.md)
- [CODE_QUALITY.md](./operations/CODE_QUALITY.md)
- [MONITORING.md](./operations/MONITORING.md)
- [SECURITY.md](./operations/SECURITY.md)
- [TROUBLESHOOTING.md](./operations/TROUBLESHOOTING.md)

## API

- [API_REFERENCE.md](./api/API_REFERENCE.md)

## Nota

La arquitectura objetivo actual es:

- `web-client`, `web-server` y `discord-bot` en GCP
- `Minecraft`, `CrystalCore`, `MariaDB/MySQL` y `Redis` en bare metal
- `Supabase` como capa web de identidad y contenido

Si una nota contradice ese modelo, tomar como referencia principal el plan de migracion y la documentacion de arquitectura revisada en marzo de 2026.
