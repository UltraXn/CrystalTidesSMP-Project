# CrystalTides Global TODO

## Próximas Tareas (Short-term)

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
  - [ ] **Análisis**: Parsing automático de excepciones comunes (OOM, Mod Conflicts).
  - [ ] **Analytics**: Implementación de DuckDB para análisis estadístico de fallos.

---
_Este archivo se mantiene sincronizado según la Regla 6 del proyecto._
_Autodocumentación en Obsidian activa a través de Git hook_
