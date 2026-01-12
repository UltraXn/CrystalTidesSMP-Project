# Crystaltides Roadmap & Tasks

## 📦 Infraestructura y Mantenimiento (Logros 10 Enero)

- [x] **Reorganización Masiva de Documentación**:
  - [x] Estructuración de carpeta `docs/` (architecture, components, operations, etc.).
  - [x] Script de automatización `reorganize-docs.ps1` creado y ejecutado.
  - [x] Creación de `README.md` maestro de documentación.
- [x] **Infraestructura IA (MCP)**:
  - [x] Fix crítico en `tools.yaml` (Soporte SQL Dinámico con `templateParameters`).
  - [x] Documentación de arquitectura: `Arquitectura MCP de Agente IA.md`.
- [x] **Gestión de Conocimiento (Obsidian)**:
  - [x] Extracción de Snippets clave (Rust JNI, React Query, Zod).
  - [x] Creación de Backlog de Conceptos (Game Director, TOON Integration).

## 🚀 Migración a TanStack Query (Admin Panel)

- [x] Migrar `UsersManager.tsx` a TanStack Query.
- [x] Migrar `AdminNews.tsx` a TanStack Query.
- [x] Migrar `WikiManager.tsx` a TanStack Query.
- [x] Migrar `DonationsManager.tsx` a TanStack Query.
- [x] Migrar `GamificationManager.tsx` a TanStack Query.
- [x] Migrar `EventsManager.tsx` a TanStack Query.
- [x] Migrar `DonorsManager.tsx` a TanStack Query.
- [x] Migrar `StaffCardsManager.tsx` a TanStack Query.
- [x] Refinar tipos en `useAdminData.ts` (Payloads y Retornos).
- [x] Resolver errores de tipos y `any` en `SuggestionsManager.tsx`, `TicketsManager.tsx`, `GamificationManager.tsx`, `PollsManager.tsx` y `AuditLog.tsx`.
- [x] Documentar API en Swagger/OpenAPI (Wiki, Polls, Donations, Tickets, Suggestions, Events).
- [x] Migrar `DashboardOverview.tsx` a TanStack Query.
- [x] Migrar `SiteConfig.tsx` a TanStack Query.
- [x] Implementar validación Zod en TODAS las rutas restantes (Discord, Gacha, Logs, Settings).

## 🛡️ Seguridad y Validación

- [x] Implementar middleware de validación Zod.
- [x] Asegurar rutas de administración con `checkRole`.
- [x] Validar esquemas de Tickets y Sugerencias.
- [x] Validar esquemas de Noticias y Wiki.
- [x] Validar esquemas de Donaciones, Eventos y Logs.
- [x] Validar esquemas de Discord y Gacha.

## 📄 Documentación API

- [x] Configurar Swagger UI en `/api/docs`.
- [x] Documentar rutas de Usuarios y Perfiles.
- [x] Documentar rutas de Noticias y Wiki.
- [x] Documentar rutas de Tickets y Sugerencias.
- [x] Documentar rutas de Eventos y Donaciones.
- [x] Documentar rutas de Encuestas (Polls).

## 🛠️ Deuda Técnica y Futuro (Pendiente)

- [x] **Auditoría de Secretos**: Verificado con `rg` que no hay secretos activos expuestos en archivos trackeados (10 Enero).
- [ ] **Infraestructura**: Integrar sistema de analítica y reporte de crasheos (DuckDB).
- [x] **Docker Optimization**: Aplicar prácticas "Lightweight" (Non-root user, Prune dev deps) en todos los Dockerfiles (10 Enero).
- [ ] **Discord**: Bridge Chat bidireccional y logs avanzados.

## 🎮 Launcher Development

- [x] **Supabase Integration**:
  - [x] Añadir dependencias `supabase_flutter` y `flutter_dotenv`.
  - [x] Implementar `AuthService.loginSupabase`.
  - [x] Crear UI de Login con Email/Password en `LoginPage`.
  - [x] Configurar carga de variables de entorno desde `.env`.
  - [x] Pasar credenciales de Account a `LaunchService`.
- [ ] **Game Bridge Integration**:
  - [x] Verificar funcionamiento del flag `enableBridge` (Verified via `test/bridge_test.dart`).
  - [x] Testear lanzamiento con `game-bridge/test-env` (Verified paths in `test/path_resolution_test.dart`).
- [x] **3D Skin Manager**:
  - [x] Implementar visor WebGL (MineRender) en WebView.
  - [x] Crear controles de capas y animaciones.
  - [x] Integrar con el servicio de perfiles.

## 🛠️ Deuda Técnica y Futuro (Pendiente)

- [ ] Implementar Error Boundaries para el panel.
- [ ] Limpiar componentes UI de lógica de negocio (mover a hooks).
- [x] **Mantenimiento UI**: Resolver advertencias de compatibilidad CSS (`background-clip`).
