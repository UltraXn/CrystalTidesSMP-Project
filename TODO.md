# CrystalTides Global TODO

## Próximas Tareas (Short-term)

- [x] Migración de `web-client` a **Tailwind CSS 4**.

- [x] Creación de diagramas de arquitectura detallados para el flujo de datos Rust-Java.

## Deuda Técnica

- [x] **Tailwind Mismatch**: El `package.json` del cliente y raíz ya usan v4 (confirmado v4.1.18).
- [x] **Bridge Polling**: Implementado WebSocket en `web-server` y `plugins/crystalcore` para eventos realtime.
- [x] **Java Plugin Safety**: Solucionado el bloqueo del Main Thread en `reloadProfile` (Async wrapper).
- [x] **Auth Vulnerability**: Aplicado `authLimiter` a rutas de login/register.
- [x] **Predictable Secrets**: Reforzado `ADMIN_JWT_SECRET` con generación aleatoria de respaldo.
- [ ] **Secrets Exposure**: Limpieza de archivos `.env` y `.json` en el historial de Git (Pendiente ejecución de `git-filter-repo`).
- [x] **Validation Debt**: Implementar validación de esquemas Zod en controladores de `web-server` (✅ Completado 100% - Enero 10, 2026).
- [x] **TanStack Query Migration**: Migración completa del Admin Panel (✅ Completado 100% - Enero 10, 2026).
- [x] **Documentation Structure**: Reorganización de `docs/` con estructura modular (✅ Completado - Enero 10, 2026).
- [x] **MCP Toolbox Configuration**: Fix de `tools.yaml` para soporte SQL dinámico (✅ Completado - Enero 10, 2026).

## Ideas & Backlog

- [ ] **Sistema Automatizado de Reporte de Crashes (Crystal Crash Pipeline)**:
  - [ ] **Launcher**: Detección automática de crasheos y envío de logs (Watchdog).
  - [ ] **Web Server**: Endpoint para ingesta de logs y creación automática de tickets.
  - [ ] **Análisis**: Parsing automático de excepciones comunes (OOM, Mod Conflicts).
  - [ ] **Analytics**: Implementación de DuckDB para análisis estadístico de fallos.

---

_Este archivo se mantiene sincronizado según la Regla 6 del proyecto._
