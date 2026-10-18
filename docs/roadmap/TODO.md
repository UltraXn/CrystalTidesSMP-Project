# 🗺️ CrystalTides SMP - Admin & Web Master Plan

Este documento centraliza el roadmap completo del proyecto, organizando las tareas `Por Hacer`, `En Progreso` y los módulos ya `Completados` contrastados con la realidad del monorepo en **Octubre 2026**.

---

## 🟢 Completado (Módulos Listos y Verificados)

### ✅ Gestión y Staff

- [x] **Staff Hub**: Kanban Board y Notas Adhesivas.
- [x] **Gestión de Contenido**: Noticias, Eventos, Encuestas (CRUDs).
- [x] **Staff Cards Manager**: Constructor de cartas de presentación.
- [x] **Semáforo de Reclutamiento**: Widget de estado.
- [x] **Calendario Kanban**: Vista de calendario interactiva con gestión de duraciones.
- [x] **Google Calendar Sync**: Visualización de eventos externos en el Staff Hub.
- [x] **Notion Integration**: Sincronización de tareas desde espacios de trabajo de Notion.
- [x] **Premium UI/UX**: Rediseño completo con Glassmorphism y animaciones fluidas.
- [x] **Sincronización de Estado Dual**: Visualización en tiempo real de estado Minecraft y Discord (Staff Cards).

### ✅ Web Pública

- [x] **Página `/staff`**: Visualización del equipo.
- [x] **Perfil Público**: Skin 3D y Medallas.
- [x] **Buscador Global**: Command Palette (`Ctrl + K`).
- [x] **KilluCoin Gacha**: Minijuego con backend seguro y entrega asíncrona (MySQL), animado con timelines de GSAP.

### ✅ Funcionalidades Core

- [x] **Foros**: Categorías, Markdown, Comentarios.
- [x] **Encuestas**: Votaciones integradas.
- [x] **Notificaciones**: Centro de avisos en navbar.
- [x] **Seguridad**: Roles centralizados, Middleware de Auth, Docker Scout.
- [x] **Integraciones**: Webhooks de Discord y Minecraft, Consola Segura (Pterodactyl).
- [x] **Internacionalización**: Panel Admin Bilingüe (ES/EN).

### 🔒 Seguridad de Consola y Bridge (Completado)

- [x] **Confirmación Destructiva y 2FA en Consola Web**: Implementado en `bridgeRoutes.ts` (`POST /api/bridge/queue` exige `require2FA`, `adminCommandLimiter` y validación Zod).
- [x] **Whitelist Estricta de Comandos (`commandPolicy.ts` / `authorizeCommand`)**:
  - Roles Owner: acceso irrestricto.
  - Cuentas de Servicio (Discord Bot): restringidas únicamente a relay de chat (`tellraw @a <json>`).
  - Roles Admin/Moderador: limitados exclusivamente a comandos seguros (`ADMIN_COMMANDS`), denegando cualquier comando que otorgue permisos, items o ejecute comandos anidados (`execute`, `sudo`, `op`).
  - Sanitización de caracteres de control (bloqueo estricto de códigos ASCII < 0x20 y 0x7F).
- [x] **Auditoría de Comandos**: Registro inmutable de ejecuciones e intentos rechazados en `system_logs`.
- [x] **Hardening de CrystalBridge (`plugins/crystalcore` - Octubre 2026)**:
  - Autenticación WebSocket mediante cabecera `Bearer` y comparación timing-safe (`MessageDigest.isEqual` en UTF-8).
  - Reclamo atómico anti-duplicación de comandos en base de datos (`UPDATE web_pending_commands SET executed = TRUE, executed_at = CURRENT_TIMESTAMP WHERE id = ? AND executed = FALSE`).
  - Bloqueo fail-fast en `WebSocketModule` que cancela el inicio del servidor si se detectan credenciales por defecto (`changeme`).
  - Control de concurrencia con `AtomicBoolean isProcessingQueue`.

---

## 🚧 En Progreso y Pendientes (Roadmap Realista)

### 🚨 Prioridad: Infraestructura y Docker (Hardened Octubre 2026)

- [x] **Rate Limiting**: Protección Anti-Spam en rutas críticas (`authLimiter`, `adminCommandLimiter`).
- [x] **Cabeceras de Seguridad**: Helmet.js con CSP y directivas estrictas.
- [x] **Anti-Fuzzing en Edge Proxy (Caddyfile)**: Snippet `(anti_fuzzing)` bloqueando con `404 Not Found` accesos a dotfiles y extensiones sensibles (`.env`, `.bak`, `.sql`, `.db`, `.key`, `.log`).
- [x] **Healthchecks de Producción**: Pruebas HTTP nativas en Caddy (`wget --spider http://127.0.0.1:2019/config/`) y sockets TCP (`nc -z`).
- [x] **Resiliencia de Contenedores**: `stop_grace_period` configurado (60s MariaDB, 30s servicios auxiliares) y montajes de configuración en modo solo lectura (`:ro`).
- [x] **Vault en Modo Productivo**: Despliegue con backend persistente sin flags volátiles (`-dev`).
- [x] **Dominio Personalizado**: Configuración de `crystaltidessmp.net` (Web) y subdominios (`panel`, `node`, `bot`).
- [x] **CORS Production-Ready**: Allowlist explícita sin wildcards con credenciales.

### 🚨 Alta Prioridad: Calidad de Código & Esquemas Zod

- [x] **Centralización de Esquemas Zod en `@crystaltides/shared`**:
  - _Estado:_ ✅ **COMPLETADO (18 de Octubre, 2026)**.
  - [x] Validación en backend implementada con esquemas Zod en todas las rutas de escritura (31/31 rutas cubiertas).
  - [x] Eliminados los 4 esquemas locales duplicados en `apps/web-client/src/schemas/` (`news.ts`, `suggestion.ts`, `ticket.ts`, `user.ts`) consumiendo `@crystaltides/shared`.
  - [x] Removidos los 26 archivos barrel intermediarios en `apps/web-server/schemas/` importando directamente desde `@crystaltides/shared`.
  - [x] Corregido `packages/shared/src/schemas/news.ts` preservando `image`, `image_url`, `status`, `title_en`, `content_en`, `author_id`, `username`, `user_id` en creación y actualización, con test de integración y preservación `news_data_preservation.test.ts`.
  - [x] Test de regresión estática en `security_audit.test.ts` verificando la inexistencia de directorios locales de esquemas en cliente y servidor.
- [x] **Telemetría y Changelog Dinámico en Launcher News Feed**:
  - _Estado:_ ✅ **COMPLETADO (18 de Octubre, 2026)**.
  - [x] Reemplazar datos estáticos hardcodeados en `newsController.ts:getLauncherNewsFeed` (`online: true, latencyMs: 18, version: "0.1.0-alpha"`) por telemetría real del servidor y tabla de versiones.
    > [!NOTE]
    > `apps/launcher-lite` y su endpoint backend `getLauncherNewsFeed` están plenamente **activos y vigentes**.
    > **NO TOCAR:** La landing page del Launcher en la web (`apps/web-client/src/pages/Launcher.tsx` y componentes UI de la landing web del launcher), la cual está congelada ya que será **rediseñada por completo**.
- [x] **Higiene de Dependencias y Monorepo (pnpm)**:
  - _Estado:_ ✅ **COMPLETADO (18 de Octubre, 2026)**.
  - [x] Eliminar `@vitejs/plugin-react` (Babel) del `package.json` raíz en favor del compilador SWC (`@vitejs/plugin-react-swc`).
  - [x] Desacoplar paquetes de runtime declarados erróneamente en `dependencies` de la raíz (`@hello-pangea/dnd`, `express`, `gsap`, etc.) a sus workspaces correspondientes.
  - [x] Limpiar `apps/web-client/package.json` moviendo `husky` y `@tauri-apps/api` fuera de `dependencies` de producción.
  - [x] Corregir `apps/web-client/e2e.config.ts` reemplazando `npm run dev` por `pnpm dev`.
  - [x] **Consolidar Dependencias E2E en `apps/web-client`:** Resolver el bloat y duplicidad entre Cypress + Cucumber (`cypress: ^15.19.0`) y Playwright (`playwright: ^1.57.0` duplicado con `@playwright/test: ^1.63.0`), eliminando el paquete redundante de Playwright y definiendo el runner oficial del monorepo.

### ⚙️ Configuración del Sitio (Fase 1)

- [x] **Broadcast & Hero Manager**: Gestores de alertas y banner.
- [x] **Hero Banner Carousel (`HeroBackgroundCarousel.tsx`)**: Embla Carousel con lazy-loading y fallback local (3/3 tests Vitest pasando).
- [x] **Gestor de Donadores**: Carrusel dinámico.
- [x] **Reglas Interactivas (Editor)**: Página `/rules` dinámica con gestión desde el panel.
- [x] **Editor de Políticas**: `/privacy` y `/tos`.

### 👤 Perfiles y Social (Fase 6)

- [x] **Perfiles Avanzados**: Estadísticas reales y personalización (Bio/Redes).
- [x] **Premium Social UI**: Banner personalizable, posado dinámico en skin 3D y sistema de reputación.
- [x] **Muro de Comentarios**: Mensajes en perfiles.
- [ ] **Marcos de Perfil (Avatar Frames)**: Cosméticos circulares para el avatar del usuario.
- [x] **Selector de Avatar**: Opción para elegir entre Avatar Web (Discord) o Skin de Minecraft.
- [x] **Wiki / Gamepedia**: Sección de guías.

### 🎨 UX/UI y Diseño

- [x] **Stack de Animaciones Coherente**:
  - **Framer Motion v12**: Animaciones declarativas de componentes, layout transitions y modales.
  - **GSAP v3.15**: Timelines imperativos de alta precisión en Gacha (`gachaGameUtils.ts`), efectos de partículas (`Hero/Particles.tsx`), navegación móvil (`MobileBottomNav.tsx`) y vistas interactivas (`NotFound.tsx`, `Suggestions.tsx`).
- [ ] **Verificación de Dispositivos**: Revisar diseño responsivo en Tablet y Móvil (Web y Admin). (Fixed Navbar mobile name & Support buttons).

### 🔗 Integración Profunda (Fase 8)

- [x] **Sincronización de Rangos**: MC <-> Discord.
- [x] **Requisito de Cuenta Vinculada**: Para tickets y gacha (`ACCOUNT_NOT_LINKED` en `gachaService.ts`).
- [x] **Integración Economía Real**: Vault bidireccional (`node-vault` en backend & `VaultAPI` en `CrystalCore`).

### 🏗️ Mantenimiento Profesional (Fase 7)

- [x] **Configuración Unificada**: ESLint/Prettier compartido y tipos compartidos en `@crystaltides/shared`.
- [x] **Turborepo**: Estructura de monorepo unificada (`apps/`, `plugins/`, `packages/`).
- [x] **Unificación de Proyectos**: Web, Launcher y Plugin CrystalCore integrados en el mismo workspace.
- [ ] **Discord Bot (Premium)**:
  - 📄 Ver roadmap detallado en [`TODO_DISCORD_BOT.md`](./TODO_DISCORD_BOT.md)
  - [x] Infraestructura base y Docker.
  - [x] **Asignación de Roles**: Sincronización Web -> Discord.
- [ ] **CrystalMap 3D (Motor WebGPU / WebGL2 a 20 TPS)**: Alternativa de alto rendimiento para sustitución de mapas lentos convencionales.
- [ ] **Tope Dinámico para "Mercader"**: Ajustar el 100% del Playstyle Radar basado en la economía total del servidor (Inflación-aware).

---

## 🚀 Notas de Mantenimiento y Estándares de Producción

- [x] **Higiene de Dependencias**: Monitoreo con `pnpm audit`, catálogo centralizado de versiones (`pnpm.catalog`) y overrides de parches de seguridad en `pnpm-workspace.yaml`.
- [x] **Monitoreo de Imágenes Base**: Uso de `node:24-alpine` (multi-stage con usuario no privilegiado `USER 10001`), `mariadb:10.11`, `redis:7-alpine` y `caddy:2-alpine`.
- [x] **Prevención de Fugas de Información**: Controladores de `apps/web-server` sanitizados ante errores 500 (cero exposición de error.message, stack traces o SQL bajo cualquier entorno) y eliminación de logs de `req.body`.
- [x] **Migración a React Router v7**: Adopción de `createBrowserRouter` y nuevo contrato de enrutamiento.
- [x] **Unificación de Íconos**: Estandarización en `lucide-react` eliminando sobrecostes de paquetes legacy.
- [x] **Soporte Nativo HTML Head**: Uso de capacidades nativas de React 19 (`<title>`, `<meta>`) y hook `useSEO.ts`.
- [x] **Adopción de Oxlint (Oxc)**: Integrado en pre-commit (`lint-staged`) y scripts de Turborepo para análisis estático ultrarrápido.

---

## 🧪 Futuro: Stack Tecnológico & "Wow" Features (2026)

### Frontend & UX

- [x] **TanStack Query**: Data-fetching, caché reactivo e invalidación en Admin Panel.
- [x] **Zustand**: Gestión de estado transversal sin prop-drilling (v5.0.x).
- [x] **Live Dashboard**: Supabase Realtime para eventos del servidor.
- [ ] **Live Activity Feed ("El Pulso")**: Stream en tiempo real de logros, eventos y donaciones en la web.
- [ ] **Deep Linking `crystaltides://`**: Lanzamiento 1-click desde el navegador directo a la sesión de juego.

### Cliente & Motor Nativo (Crystal Agent)

- [ ] 🚀 **Crystal Agent Nativo (Rust + OpenGL/Vulkan)**: Agente inyectado en JVM (`-javaagent`) con overlay nativo Dear ImGui a cero coste de Garbage Collector.
- [ ] **Crystal Crash Pipeline**: Captura y diagnóstico inteligente de crashes de la JVM en el Launcher de Tauri v2.

### DevOps, Pruebas & Calidad (E2E / BDD)

- [x] **Husky + Commitlint**: Validación convencional de commits.
- [/] **Pruebas E2E y BDD en Web-Client**: Suites funcionales con Cypress + Cucumber y tests Playwright, pero con deuda técnica abierta por duplicación de dependencias ('playwright' vs '@playwright/test') y doble framework (pendiente consolidación de runner).
- [ ] **Renovate Bot**: Automatización de PRs de dependencias.
- [ ] **Sentry / OpenTelemetry**: Observabilidad centralizada y métricas de rendimiento.

---

> Última actualización: 18 de Octubre, 2026 — Sincronizado tras auditoría profunda de código fuente.
