# CrystalTides Global TODO

## Próximas Tareas (Short-term) & Roadmap de Mejoras Priorizadas

### 🎯 5 Mejoras de Alto Impacto (Especificaciones en Obsidian `Management/Improvements/`)
- [ ] **[P1 - Alta] Frontend WebGL Three.js, Lazy Viewports & Cache Local de Assets R2**:
  - `Lazy3DContainer` con `IntersectionObserver` para prevenir límite de contextos `CONTEXT_LOST_WEBGL`.
  - Cache local persistente (`CacheStorage` / IndexedDB) para geometrías `.geo.json` y texturas `.png` de Cloudflare R2.
- [ ] **[P2 - Alta] Centralización de Esquemas Zod, Tipos & Contratos en `packages/shared`**:
  - Centralizar contratos de API, schemas Zod y tipos TypeScript compartidos para `web-client`, `web-server`, `game-bridge` y `discord-bot`.
- [ ] **[P3 - Media-Alta] Capa de Caché LRU para RAG Vectorial & Colas de Tareas Persistentes**:
  - Caché LRU en memoria para consultas semánticas y embeddings en `ragService.ts`.
  - Migración de crons en memoria (`setInterval`) a sistema de background jobs con PostgreSQL `SKIP LOCKED`.
- [ ] **[P4 - Media] Buffer Offline con Reintento Exponencial & Protocolo Binario en Game Bridge**:
  - Cola FIFO en memoria en `apps/game-bridge` para retener eventos durante reinicios de servidor de Minecraft.
  - Serialización binaria MessagePack para telemetría de alta frecuencia (`telemetry:tps`, `boss:damage_tick`).
- [ ] **[P5 - Media-Baja] Trazabilidad con Correlation ID (`x-request-id`) & Healthcheck Profundo**:
  - Inyección de `x-request-id` en todas las capas y alertas de error en Discord.
  - Endpoint `/api/system/deep-health` con verificación activa de latencia a Supabase, R2 y WebSocket.

- [x] Migración de `web-client` a **Tailwind CSS 4**.
- [x] Creación de diagramas de arquitectura detallados para el flujo de datos Rust-Java.

## Deuda Técnica & Calidad

- [x] **Tailwind Mismatch**: El `package.json` del cliente y raíz ya usan v4 (confirmado v4.1.18).
- [x] **Bridge Polling**: Implementado WebSocket en `web-server` y `plugins/crystalcore` para eventos realtime.
- [x] **Java Plugin Safety**: Solucionado el bloqueo del Main Thread en `reloadProfile` (Async wrapper).
- [x] **Auth Vulnerability**: Aplicado `authLimiter` a rutas de login/register.
- [x] **Predictable Secrets**: Reforzado `ADMIN_JWT_SECRET` con generación aleatoria de respaldo.
- [x] **Secrets Exposure**: Auditoría de historial de Git (limpio de secretos hardcodeados), exclusión de `.opencode/`.
- [x] **Validation Debt 100%**: Esquemas Zod estrictos en **todas las 31 rutas** del backend + regla obligatoria para el agente.
- [x] **Cypress + Cucumber BDD**: Pruebas de navegador E2E automatizadas en español (`apps/web-client`).
- [x] **SEO Avanzado & Metadatos**: OpenGraph, Twitter Cards, Sitemap.xml, robots.txt, LLMs.txt y Hook `useSEO.ts` nativo React 19.
- [x] **TanStack Query Migration**: Migración completa del Admin Panel.
- [x] **Documentation Structure**: Reorganización de `docs/` con estructura modular.
- [x] **Fix Consola & Headers**: CSP (Supabase WSS), Permissions-Policy (VR), GSAP Targets y Three.js Duplicates.
- [x] **MCP Toolbox Configuration**: Fix de `tools.yaml` para soporte SQL dinámico.

## Ideas & Backlog

- [ ] **Sistema Automatizado de Reporte de Crashes (Crystal Crash Pipeline)**:
  - [ ] **Launcher**: Detección automática de crasheos y envío de logs (Watchdog).
  - [ ] **Web Server**: Endpoint para ingesta de logs y creación automática de tickets.
  - [ ] **Analytics**: Implementación de DuckDB para análisis estadístico de fallos.
- [ ] **Fine-Tuning de Modelos de IA (NPCs & Lore Persona)**:
  - [ ] **Dataset JSONL**: Preparación de dataset estructurado con personalidad y tono in-character para NPCs de Minecraft (Citizens/Typewriter).
  - [ ] **Entrenamiento (LoRA / Vertex AI)**: Evaluación de Fine-Tuning (vía Google Vertex AI o LoRA local) para comportamiento e interacción in-character sin desvíos de rol.
- [ ] **Desarrollo del Motor de Mapa 3D Nativo (`CrystalMap 3D`)** *(Futuro Lejano)*:
  - [ ] *Estado actual*: Operando temporalmente con **BlueMap 5.16 (3D)** en el servidor y web.
  - [ ] *Especificación congelada*: Componente React Three Fiber con soporte híbrido WebGPU + WebGL2, streaming binario por WebSockets a 20 TPS para jugadores y mobs con skins 3D, cache local IndexedDB con Delta Sync de bloques y estética Vanilla Minecraft Fiel. (Ver ADR en Obsidian `30 - Permanent/10 - Architecture/Decisión Arquitectura - Engine 3D CrystalMap.md`).

---
_Este archivo se mantiene sincronizado según la Regla 6 del proyecto._
_Autodocumentación en Obsidian activa a través de Git hook_
