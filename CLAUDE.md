# 🌊 CLAUDE.md — CrystalTides Monorepo Architecture & Rules

## ⚡ 1. Comandos de Búsqueda y Navegación
- **Búsqueda Oficial de Código:** Usar EXCLUSIVAMENTE `tgrep` con prefijo `--`:
  ```bash
  tgrep -- "regex_pattern" .
  tgrep -F -- "SimboloOClase" .
  tgrep -t ts -- "interface " .
  tgrep -t rust -- "pub struct " .
  tgrep -t java -- "implements " .
  ```

## 🛠️ 2. Stack Tecnológico y Comandos Clave
- **Gestor de Paquetes:** `pnpm` estricto en todo el monorepo (`packageManager: pnpm@10.29.3`; no usar npm ni yarn).
- **Web Client (`apps/web-client`, `@crystaltides/client`):** React 19 + Vite.
  - Dev: `pnpm --filter @crystaltides/client dev` · Tests: `... test` · Lint: `... lint`
- **Web Server (`apps/web-server`, `@crystaltides/server`):** Express 5 + Supabase.
  - Dev: `pnpm --filter @crystaltides/server dev` · Tests: `... test` · Lint: `... lint`
  - Tests y typecheck necesitan `@crystaltides/shared` compilado: `pnpm --filter @crystaltides/shared build`.
- **Launcher Lite (`apps/launcher-lite`, submódulo en el workspace):**
  - Dev: `pnpm --filter @crystaltides/launcher-lite dev:tauri` · Build: `... build:tauri`

## 🚫 3. Reglas Estrictas de Código y Seguridad (Guardrails)
1. **TypeScript Estricto:** Prohibido el uso de `any`. Definir contratos e interfaces explícitas.
2. **React Tooling:** Siempre usar `@vitejs/plugin-react-swc` (SWC, nunca Babel).
3. **Complejidad Cognitiva:** Mantener complejidad $\le 15$. Extraer sub-funciones puras o feature hooks si una función crece.
4. **Seguridad y Secretos:** Cero tokens, contraseñas o private keys en código o logs. Validar siempre entradas en backend. Los secretos del backend viven en Vault (`docs/operations/web-server-secrets.md`).
5. **Higiene Git:** Prohibido commitear directo a `main`/`master` o hacer cambios destructivos sin confirmación. En los submódulos, igual: rama propia y PR en su repo.

## 📁 4. Mapa del Repositorio
Código propio del monorepo:
- `apps/web-client/`: Web pública y panel de administración.
- `apps/web-server/`: API (Cloud Run). Despliegue en `.github/workflows/deploy.yml`.
- `packages/`: `shared` (schemas Zod comunes) y `eslint-config`.
- `database/`: Migraciones SQL de Supabase.
- `deploy/`: Infraestructura (GCP, nginx, Oracle Cloud, política de Vault).
- `docs/`: Arquitectura y operaciones.

Submódulos (cada uno con su repo, CI y ramas propias):
- `apps/launcher-lite/`: Cliente de escritorio Tauri v2 (React 19 + Rust).
- `apps/launcher/`: Launcher anterior.
- `apps/discord-bot/`: Bot de Discord (se despliega desde su repo).
- `apps/game-bridge/`: Agente / puente nativo Rust/Node.js.
- `plugins/crystalcore/`: Plugin Paper (Java). Incluye el cliente del Web Bridge.
- `mods/crystaltides-boost/`: Mod Fabric de optimización.

## 🧠 5. Directrices de Comportamiento e Ingeniería (Andrej Karpathy)
- **1. Pensar antes de programar:** No asumir. No ocultar confusión. Exponer trade-offs explícitamente antes de implementar. Si hay ambigüedad o un camino más simple, cuestionar constructivamente.
- **2. Simplicidad primero:** Código mínimo indispensable que resuelve el problema exacto. Cero features especulativas, cero abstracciones prematuras para código de un solo uso.
- **3. Modificaciones quirúrgicas:** Tocar solo lo estrictamente necesario. Respetar el estilo circundante sin "mejorar" código adyacente ni refactorizar lo que no esté roto. Cada línea cambiada debe trazarse al requerimiento.
- **4. Ejecución orientada a objetivos comprobables:** Convertir requerimientos en criterios verificables (TDD). Definir el paso y la verificación concreta antes de dar por cerrada una tarea.

