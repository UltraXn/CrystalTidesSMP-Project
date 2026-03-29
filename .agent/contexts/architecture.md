# Project Architecture & Context

## Overview
Crystaltides is a Minecraft SMP (Survival MultiPlayer) project featuring a custom web-based ecosystem for player management, analytics, and community engagement.

## Technical Stack
- **Monorepo**: Managed with Turborepo and npm workspaces.
- **Web Client (`apps/web-client`)**: 
  - React 19 + TypeScript 5
  - Vite for build tooling
  - GSAP for high-end animations (e.g., Gacha module)
  - Internationalization with `i18next`
- **Web Server (`apps/web-server`)**: 
  - Node.js + Express 5
  - Supabase (PostgreSQL + Auth + Storage)
  - Standardized error handling and strict input validation.
- **Discord Bot (`apps/discord-bot`)**: 
  - Inteface between Minecraft server and Discord community.
- **Minecraft Infrastructure**:
  - Custom plugins (`plugins/crystalcore`)
  - Dynmap integration via secure reverse proxy.
- **Launcher (`apps/launcher`)**:
  - Flutter (Dart) + Rust bootstrapper for a premium player experience.

## Deployment
- Hosted on **Google Cloud Run**.
- Automated CI/CD via GitHub Actions (`deploy.yml`).
- Infrastructure follows security-first principles (pinned SHAs, strict CSP).

## Key Modules
- **Gacha**: Interactive reward system with GSAP animations.
- **Admin Tickets**: Secure support system with strict staff authorization.
- **Live Map**: Secure integration of Minecraft Dynmap.
