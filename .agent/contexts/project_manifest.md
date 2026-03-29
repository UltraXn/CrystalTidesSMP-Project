# Project Global Context

## Vision
Crystaltides is a premium Minecraft SMP experience that bridges the gap between in-game play and web-based community management. The goal is to provide players with state-of-the-art tools for interaction, economy, and social engagement.

## Architectural Blueprint

### Runtime & Topology
- **Hybrid Core**: Running `youer-1.21.1` (NeoForge + Paper API stack). 
- **Distributed Infrastructure**: 
  - **Web Stack (GCP)**: Cloud Run for Web/Bot/API (High availability).
  - **Game Stack (Bare Metal)**: Ryzen 3700X, 64GB RAM. Local MariaDB/Redis for <1ms latency.
  - **Ground Truth**: `C:\Users\nacho\Desktop\Servidor Testeo (maqueta)` is the operational blueprint.

### Gacha Economy (Kill-to-Earn)
- **Money Sink**: The Gacha is designed to curb inflation. "Never award more value than the bet."
- **Recompensas Reales**: Only physical items, XP, and coins (KC) are allowed. No abstract ranks, keys, or tags.
- **KC Origin**: Kill-to-Earn (mob kills) synchronized via `CrystalCore` to Supabase/MariaDB.

### Apps & Modules
- **`apps/web-client`**: React 19 + GSAP. Consumes `VITE_API_URL` (GCP).
- **`apps/web-server`**: Express 5. Bridge between GCP and Bare Metal DB.
- **`apps/launcher`**: Flutter + Rust. Premium entry point.
- **`plugins/crystalcore`**: Core game logic and economy sync.

## Development Culture
- **ADR Driven**: Decisions like CPU Affinity (ADR-001) and Service Encapsulation (ADR-002) guide optimization.
- **Security**: Strict validation, pinned SHAs, and RBAC-controlled admin tickets.
- **Visuals**: Modern Glassmorphism and micro-animations are mandatory.
