# CrystalTides Global TODO

> **Auditoría de Realidad del Monorepo — Octubre 2026**  
> Este documento refleja el estado técnico **real, comprobado y sin sesgos** del código en el monorepo (`apps/`, `packages/`, `plugins/`, `deploy/`). Sustituye afirmaciones desactualizadas o completadas en falso.

---

## 🚨 Deuda Técnica Crítica & Tareas P0 (Prioridad Inmediata)

### [x] [P0 - CRÍTICA] Centralización y Saneamiento de Esquemas Zod en `@crystaltides/shared`

- **Estado:** ✅ **COMPLETADO (18 de Octubre, 2026)**.
- **Auditoría Técnica y Resolución:**
  1. **Preservación Integral de Datos en `news.ts`:** `packages/shared/src/schemas/news.ts` actualizado con soporte completo para `image`, `image_url`, `status`, `title_en`, `content_en`, `author_id`, `username`, `user_id`. Exportación simétrica de esquemas planos para formularios (`newsFormSchema`, `NewsFormValues`) y wrappers para Express (`createNewsSchema`, `updateNewsSchema`).
  2. **Eliminación de Esquemas Duplicados en Cliente:** Los 4 esquemas locales en `apps/web-client/src/schemas/` (`news.ts`, `suggestion.ts`, `ticket.ts`, `user.ts`) fueron eliminados. Todos los componentes y formularios (`useNewsForm`, `SuggestionForm`, `TicketForm`, `ProfileSettings`, `Login`, `Register`, etc.) consumen `@crystaltides/shared`.
  3. **Eliminación de Barrels en Servidor:** Los 26 archivos barrel intermediarios en `apps/web-server/schemas/` fueron eliminados. Todas las rutas, controladores y tests de `apps/web-server` consumen directamente `@crystaltides/shared`.
  4. **Blindaje con Tests y Verificación:**
     - Suite `apps/web-server/__tests__/news_data_preservation.test.ts` con pruebas unitarias e integración E2E sobre Express middleware validando la preservación intacta del payload.
     - Test de regresión estática en `apps/web-server/__tests__/security_audit.test.ts` garantizando que no se reintroduzcan directorios de esquemas locales.
     - Build de `@crystaltides/shared`, typecheck de cliente (`tsc --noEmit`), linter de servidor (`oxlint .` 0 errores / 0 advertencias), y tests de `NewsForm.test.tsx` (6/6) y suite de servidor (42/42) verificados exitosos.

---

### [x] [P0 - CRÍTICA] Telemetría y Changelog Dinámico en Launcher News Feed (`newsController.ts`)

- **Estado:** ✅ **COMPLETADO (18 de Octubre, 2026)**
  > [!NOTE]
  > `apps/launcher-lite` y su endpoint backend `getLauncherNewsFeed` están plenamente **activos y vigentes**.
  > **NO TOCAR:** La landing page del Launcher en la web (`apps/web-client/src/pages/Launcher.tsx` y componentes UI de la landing web del launcher), la cual está congelada ya que será **rediseñada por completo**.
- **Diagnóstico del Código:**
  - El endpoint `GET /api/news/launcher-feed` (`newsController.ts:464-555`) devuelve valores simulados ("fake") hardcodeados:
    ```ts
    latestChangelog: {
      version: "0.1.0-alpha",
      buildDate: "2026.8",
      bullets: [ ... ],
      actionUrl: "https://crystaltidessmp.net/changelog"
    },
    serverStatus: {
      online: true,
      motd: "CrystalTides SMP • Temporada Abisal",
      networkRegion: "US-East",
      latencyMs: 18
    }
    ```
- **Acciones Requeridas:**
  - [x] Conectar `serverStatus` con el servicio real de ping/query Minecraft (`minecraftService.ts` o healthcheck del proxy FRP/Paper).
  - [x] Conectar `latestChangelog` con la tabla de versiones/changelogs en base de datos en lugar de retornar constantes estáticas.

---

### [x] [P0 - ALTA] Higiene de Dependencias del Monorepo & Workspaces (pnpm)

- **Estado:** ✅ **COMPLETADO (18 de Octubre, 2026)**
- **Diagnóstico del Código:**
  1. **Compilador Vite Prohibido:** La raíz (`package.json`) contiene `"@vitejs/plugin-react": "^5.1.2"` (Babel), violando la directiva de arquitectura que exige `@vitejs/plugin-react-swc`.
  2. **Contaminación en Raíz:** `package.json` raíz declara en `dependencies` paquetes de runtime que corresponden a apps individuales (`@hello-pangea/dnd`, `@supabase/supabase-js`, `express`, `discord.js`, `gsap`, etc.).
  3. **Dependencias Mal Ubicadas en Web-Client:** `apps/web-client/package.json` incluye `husky` y `@tauri-apps/api` en `dependencies` de producción en lugar de `devDependencies` o el workspace de launcher.
  4. **Desalineación de Workspaces:** `package.json` raíz declara `"workspaces": ["apps/*", "packages/*"]` mientras que `pnpm-workspace.yaml` enumera rutas específicas (`apps/web-client`, `apps/web-server`, `apps/launcher-lite`).
  5. **Configuración E2E Obsoleta:** `apps/web-client/e2e.config.ts` invoca `command: "npm run dev"` en lugar del estándar `pnpm dev`.
  6. **Duplicidad y Bloat de Frameworks E2E (`apps/web-client`):** Coexistencia desordenada de Cypress + Cucumber (`cypress: ^15.19.0`, `@badeball/cypress-cucumber-preprocessor`) con dos paquetes concurrentes de Playwright (`playwright: ^1.57.0` y `@playwright/test: ^1.63.0`), inflando `node_modules` y fragmentando los scripts de prueba (`test:e2e` vs `test:cypress`).
- **Acciones Requeridas:**
  - [x] Purgar dependencias de producción de la raíz y moverlas al workspace que realmente las ejecuta.
  - [x] Remover `@vitejs/plugin-react` de la raíz y verificar que todo el monorepo use exclusivamente `@vitejs/plugin-react-swc`.
  - [x] Mover `husky` a `devDependencies` en la raíz y limpiar dependencias no utilizadas en `web-client`.
  - [x] Alinear definiciones de workspace entre `package.json` y `pnpm-workspace.yaml`.
  - [x] Actualizar `e2e.config.ts` a `pnpm run dev`.
  - [x] Consolidar dependencias E2E en `apps/web-client`: eliminar el paquete duplicado `playwright` (mantener únicamente `@playwright/test`), definir el runner oficial del monorepo y podar dependencias duplicadas.

---

## 🎯 Roadmap Priorizado de Funcionalidades (P1 - P4)

### [ ] [P1 - Alta] Deep Linking `crystaltides://` (1-Click Web-to-Game Launch)

- Integrar `tauri-plugin-deep-link` en el Launcher de Tauri v2 (`crystaltides://join?server=mc.crystaltidessmp.net&profile=default`).
- Botón "Jugar Ahora" en `web-client` que invoca el esquema URI para abrir el launcher, verificar sesión/modpack e iniciar Minecraft directo al servidor.

### [ ] [P1 - Alta] Crystal Crash Pipeline en Launcher & Backend

- Detección automática en Tauri Rust de códigos de salida anormales de la JVM y volcado de `.minecraft/crash-reports/*.txt`.
- Endpoint de ingesta sanitizada en `web-server` / webhook de alertas Discord, con UI amigable en el Launcher que explica el motivo del crash y ofrece soluciones automáticas.

### [ ] [P1 - Alta] Frontend WebGL Three.js, Lazy Viewports & Cache Local de Assets R2

- `Lazy3DContainer` con `IntersectionObserver` para prevenir el límite de contextos `CONTEXT_LOST_WEBGL`.
- Cache local persistente (`CacheStorage` / IndexedDB) para geometrías `.geo.json` y texturas `.png` de Cloudflare R2.

### [ ] [P2 - Media-Alta] Fine-Tuning de NPCs con IA & Lore Persona (In-Game Interaction)

- Preparación de dataset JSONL estructurado con la historia, personalidad y tono de CrystalTides SMP.
- Integración de Citizens / Typewriter con backend de inferencia (Local Llama/Ollama o Cloudflare Workers AI) para diálogos in-character persistentes y memorias de interacción con jugadores.

### [ ] [P2 - Media-Alta] CrystalMap 3D (Motor Nativo WebGPU / WebGL2 a 20 TPS)

- Componente React Three Fiber híbrido WebGPU + WebGL2 para renderizado 3D en tiempo real de chunks de Minecraft en el navegador.
- Streaming binario por WebSockets a 20 TPS para posiciones de jugadores y mobs con skins 3D, sustituyendo la dependencia pesada de BlueMap/Dynmap.

### [ ] [P3 - Media] Telemetría & Observabilidad con Prometheus / OpenTelemetry + Grafana

- Exporter de métricas en Java (TPS, MSPT, chunks cargados, conteo de entidades por mundo, heap memory, player count) y métricas de latencia de `web-server`.
- Dashboard unificado en Grafana para diagnóstico y auditoría en vivo del servidor.

### [ ] [P3 - Media] Benchmark Dinámico de Inflación para Mercader (`PlaystyleRadarFinal.tsx`)

- El componente frontend ya soporta `top1MercaderScore` (con fallback de 500 = 100k KC).
- Tarea backend: calcular periódicamente en `web-server` el benchmark del Top 1 de KilluCoins / inflación y enviarlo en el payload de estadísticas de usuario.

### [ ] [P4 - Evaluación] Crystal Agent Nativo en Rust (`-javaagent` + OpenGL ImGui Overlay)

- Inyección en JVM mediante `-javaagent` para engancharse al loop de render LWJGL/OpenGL.
- Renderizado nativo FFI con Dear ImGui para HUDs y overlays sin impacto en el Garbage Collector de Java.

---

## 🛡️ Verificaciones de Seguridad y Hardening Recientes (Octubre 2026)

- [x] **Hardening de Seguridad en `CrystalBridge` (`plugins/crystalcore`):**
  - Autenticación `Bearer` obligatoria y normalizada en WebSocket con comparación de bytes segura (`MessageDigest.isEqual` con `StandardCharsets.UTF_8`).
  - Reclamo atómico anti-duplicación de comandos en base de datos:
    `UPDATE web_pending_commands SET executed = TRUE, executed_at = CURRENT_TIMESTAMP WHERE id = ? AND executed = FALSE`
  - Prevención de concurrencia mediante `AtomicBoolean isProcessingQueue`.
  - Bloqueo fail-fast en `WebSocketModule` que cancela el inicio del servidor si se detectan contraseñas por defecto (`changeme`, `change_me_to_something_secure`).
- [x] **Hardening de Infraestructura Docker & Edge Proxy (`compose.yml`, `Caddyfile`):**
  - Anti-fuzzing en Caddy mediante snippet `(anti_fuzzing)` que descarta con `404 Not Found` solicitudes hacia dotfiles (`/.(?!well-known/)`) y extensiones sensibles (`*.env*`, `*.bak`, `*.sql`, `*.db`, `*.key`, `*.pem`, `*.log`).
  - Healthchecks HTTP reales (`wget --spider http://127.0.0.1:2019/config/` en Caddy) y pruebas de socket TCP (`nc -z`).
  - Asignación de `stop_grace_period` estricto (60s MariaDB, 30s frps, vault, bot, caddy, redis).
  - Montajes de configuración montados en modo de solo lectura (`:ro`).
  - Despliegue de HashiCorp Vault con configuración de producción y almacenamiento persistente (sin flag `-dev`).
  - Eliminación de imágenes flotantes `:latest` parametrizando con fallback (`crystaltides-bot:${BOT_IMAGE_TAG:-1.0.0}`).
- [x] **Mitigación de Fugas de Información en `apps/web-server`:**
  - Estandarización de manejo de errores en controladores (`newsController`, `eventController`, `logController`, `minecraftController`, `noteController`, `settingsController`, `taskController`). CERO exposición de `error.message`, stack traces o detalles internos de SQL en respuestas HTTP 500 bajo ningún valor de `NODE_ENV` (ni siquiera en `development`). Los errores se registran únicamente en el log interno del servidor y el cliente recibe siempre un mensaje genérico seguro.
  - Eliminación de logging de cuerpos de solicitud (`req.body`) en consola (`eventController`).
  - Eliminación de pistas de esquema interno en errores 500 (`staff_tasks` en `taskController`).
  - Blindaje verificado mediante pruebas automáticas en `apps/web-server/__tests__/security_audit.test.ts`.
- [x] **Consola de Comandos Web con 2FA y Política de Comandos Estricta (`bridgeRoutes.ts`):**
  - Exigencia de `require2FA` en `POST /api/bridge/queue`.
  - Validación con esquema Zod (`queueCommandSchema`).
  - Autorización basada en roles (`commandPolicy.ts` / `authorizeCommand`): los roles Owner poseen acceso completo; cuentas de servicio se restringen a chat relay (`tellraw @a <json>`); otros roles administrativos se limitan exclusivamente a comandos seguros de moderación/comunicación (`ADMIN_COMMANDS`), bloqueando además caracteres de control.
- [x] **Hero Banner Carousel (`HeroBackgroundCarousel.tsx`):**
  - Suite Vitest validada (3/3 tests pasando), soporte Embla Carousel con fallback local y lazy loading.
- [x] **Tailwind v4 Unificado:**
  - Alineado a Tailwind v4.1.x en cliente y monorepo.
- [x] **Motor de Animaciones Híbrido Validado:**
  - GSAP v3.15 mantenido intencionalmente para timelines complejos (Gacha, Hero, MobileBottomNav, etc.) conviviendo ordenadamente con Framer Motion.
- [x] **SEO Avanzado & Metadatos React 19:**
  - Soporte nativo de etiquetas de cabecera con hook `useSEO.ts`, OpenGraph, Twitter Cards, Sitemap.xml, robots.txt y LLMs.txt.
- [x] **TanStack Query en Admin Panel:**
  - Migración completa de carga de datos, invalidación y caché en el panel de administración.

---

_Última sincronización de arquitectura: Octubre 2026_
