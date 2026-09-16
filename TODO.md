# CrystalTides Global TODO

## Próximas Tareas (Short-term) & Roadmap de Mejoras Priorizadas

### 🎯 Tareas Críticas y Roadmap Priorizado

- [x] **[P0 - CRÍTICA / MUY IMPORTANTE] Centralización de Esquemas Zod, Tipos & Contratos en `packages/shared`**:
  - Unificar y eliminar la duplicación de esquemas Zod entre `apps/web-server/schemas` (25 archivos) y `apps/web-client/src/schemas` (`ticket.ts`, `user.ts`, `news.ts`, `suggestion.ts`).
  - Exportar contratos de API tipados de extremo a extremo compartidos para `web-client`, `web-server`, `game-bridge` y `discord-bot`.
- [ ] **[P1 - Alta] Deep Linking `crystaltides://` (1-Click Web-to-Game Launch)**:
  - Integrar `tauri-plugin-deep-link` en el Launcher de Tauri v2 (`crystaltides://join?server=mc.crystaltidessmp.net&profile=default`).
  - Botón "Jugar Ahora" en `web-client` que invoca el esquema URI para abrir el launcher, verificar sesión/modpack e iniciar Minecraft directo al servidor.
- [ ] **[P1 - Alta] Crystal Crash Pipeline en Launcher & Backend**:
  - Detección automática en Tauri Rust de códigos de salida anormales de la JVM y volcado de `.minecraft/crash-reports/*.txt`.
  - Endpoint de ingesta sanitizada en `web-server` / webhook de alertas Discord, con UI amigable en el Launcher que explica el motivo del crash y ofrece solución automática.
- [ ] **[P1 - Alta] Frontend WebGL Three.js, Lazy Viewports & Cache Local de Assets R2**:
  - `Lazy3DContainer` con `IntersectionObserver` para prevenir límite de contextos `CONTEXT_LOST_WEBGL`.
  - Cache local persistente (`CacheStorage` / IndexedDB) para geometrías `.geo.json` y texturas `.png` de Cloudflare R2.
- [ ] **[P2 - Media-Alta] Fine-Tuning de NPCs con IA & Lore Persona (In-Game Interaction)**:
  - Preparación de dataset JSONL estructurado con la historia, personalidad y tono de CrystalTides SMP.
  - Integración de Citizens / Typewriter con backend de inferencia (Local Llama/Ollama o Cloudflare Workers AI) para diálogos in-character persistentes y memorias de interacción con jugadores.
- [ ] **[P2 - Media-Alta] CrystalMap 3D (Motor Nativo WebGPU / WebGL2 a 20 TPS)**:
  - Componente React Three Fiber híbrido WebGPU + WebGL2 para renderizado 3D en tiempo real de chunks de Minecraft en el navegador.
  - Streaming binario por WebSockets a 20 TPS para posiciones de jugadores y mobs con skins 3D, sustituyendo la dependencia pesada de BlueMap/Dynmap.
- [ ] **[P3 - Media] Telemetría & Observabilidad con Prometheus / OpenTelemetry + Grafana**:
  - Exporter de métricas en Java (TPS, MSPT, chunks cargados, conteo de entidades por mundo, heap memory, player count) y métricas de latencia de `web-server`.
  - Dashboard unificado en Grafana para diagnóstico y auditoría en vivo del servidor.
- [ ] **[P3 - Media] Benchmark Dinámico de Inflación para Mercader (`PlaystyleRadarFinal.tsx`)**:
  - El componente frontend ya soporta `top1MercaderScore` (con fallback de 500 = 100k KC).
  - Tarea backend: calcular periódicamente en `web-server` el benchmark del Top 1 de KilluCoins / inflación y enviarlo en el payload de estadísticas de usuario.
- [ ] **[P4 - Evaluación] Crystal Agent Nativo en Rust (`-javaagent` + OpenGL ImGui Overlay)**:
  - Inyección en JVM mediante `-javaagent` para engancharse al loop de render LWJGL/OpenGL.
  - Renderizado nativo FFI con Dear ImGui para HUDs y overlays sin impacto en el Garbage Collector de Java.
- [ ] **[P4 - En espera] Confirmación 2FA destructiva en Consola Web**:
  - Código TOTP o aprobación de seguridad para comandos críticos (`/stop`, `/op`, `/ban`, etc.) desde el panel web.

## Estado de Auditoría & Verificaciones Recientes

- [x] **Hero Banner Carousel (`HeroBackgroundCarousel.tsx`)**: Verificado al 100%. Suite Vitest pasando (3/3 tests en verde), soporte Embla Carousel con fallback local y lazy loading de imágenes.
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

---

_Este archivo se mantiene sincronizado según la Regla 6 del proyecto._
_Autodocumentación en Obsidian activa a través de Git hook_
