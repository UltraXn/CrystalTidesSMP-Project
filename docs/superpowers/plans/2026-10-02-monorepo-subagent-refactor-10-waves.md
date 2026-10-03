# Monorepo Autonomous Subagent Refactor Plan (10 Waves × 5 Subagents)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate SonarQube cognitive complexity ($\le 15$), duplicate string literals ($\ge 3$ occurrences), nested ternary operators, and unsafe `any` types across 50 critical files in the CrystalTides monorepo using an autonomous swarm of 5 parallel subagents per wave across 10 waves.

**Architecture:** Decompose the monorepo into 10 isolated waves of 5 independent target files each. Each subagent operates on a single file with zero cross-file dependencies or shared lock content, assisted by explicit MCP boundaries (`graphify`, `sequential-thinking`, `context7`, `sonarqube:show_rule`). After every wave completes, the orchestrator executes automated typechecking (`tsc --noEmit`) and linting (`oxlint`) to gate forward progress.

**Tech Stack:** TypeScript 5.8, Node.js 22/24, Express 4.21, React 19, Vite, oxlint, pnpm workspaces, Antigravity Subagent MCP (Cascade).

**Spec:** SonarQube Clean Code Quality Standard (`S3776` Cognitive Complexity $\le 15$, `S1192`/`sonarjs/no-duplicate-string`, `S3358` No Nested Conditionals, `@typescript-eslint/no-explicit-any`, Zero Route Contract / Breaking API Regressions).

---

## Global Constraints

- **Strict MCP Tool Governance & Protocols:**
  - **Allowed Subagent MCPs:**
    - `graphify` (`query_graph`, `get_node`, `graph_impact`): AST dependency & impact analysis prior to modifying shared functions.
    - `sequential-thinking` (`sequentialthinking`): Control flow decomposition and stepwise complexity reduction planning.
    - `sonarqube`: Inteligencia de calidad de código mediante `call_mcp_tool(ServerName="sonarqube")`:
      - `show_rule`: Inspección detallada de reglas Clean Code (`javascript:S3776`, `typescript:S3358`, `sonarjs/no-duplicate-string`) con ejemplos conformes y no conformes.
      - `search_sonar_issues_in_projects`: Búsqueda de issues y code smells abiertos en componentes asignados.
      - `get_duplications`: Detección precisa de fragmentos duplicados.
      - `get_component_measures`: Métricas de complejidad cognitiva y densidad de duplicación.
    - `context7` (`resolve-library-id` & `query-docs`): Official library documentation and type signatures.
      > **Protocol de Uso Obligatorio para `context7`:**
      >
      > 1. `context7` es un servidor MCP cargado de forma perezosa (_lazy_), invocable exclusivamente mediante `call_mcp_tool`.
      > 2. **Paso 1 (Resolución de ID):** Ejecutar `resolve-library-id` con `libraryName` (ej. `"express"`, `"zod"`, `"react"`, `"date-fns"`) y `query` descriptivo. Retorna el identificador canónico (ej. `"/expressjs/express"`).
      > 3. **Paso 2 (Consulta de Documentación):** Ejecutar `query-docs` con el `libraryId` obtenido y el `query` específico de la API o interfaz TypeScript deseada. Retorna snippets oficiales y contratos de tipos actualizados.
      > 4. **Cuándo usar:** Al consultar firmas de middleware, tipos de handlers (`Request`, `Response`, `NextFunction`), métodos de esquemas Zod o hooks de React 19 para evitar tipos ficticios o desactualizados.
      > 5. **Cuándo NO usar:** Jamás utilizar `context7` para consultar archivos internos del proyecto (usar `view_file` o `grep_search`), ni para lógica de negocio genérica.
  - **Prohibited Subagent MCPs (Bloqueados por Guardrails):**
    - `antigravity-sub-agent`: Anti-recursión estricta (ningún subagente puede instanciar subagentes anidados).
    - `discord-*` y `orion-bridge`: Aislamiento total de canales de chat, hardware local y servidores remotos.
    - `github` / herramientas de commit: Prohibido commitear o manipular ramas en subagentes (el orquestador valida la wave y realiza el commit atómico).
    - `puppeteer` y `chrome-devtools`: Prohibido instanciar navegadores headless para evitar consumo excesivo de memoria RAM.
    - `supabase` o conectores DB directos: Prohibidas mutaciones o consultas a bases de datos de producción.
- **Motor Oficial de Búsqueda Rápida de Código (`tgrep` & `git grep`):**
  - **`tgrep` (Trigram-Indexed Grep):** Motor oficial de alta velocidad dentro de CrystalTides. Los subagentes deben anteponer siempre `--` antes del patrón:
    - Búsqueda literal de cadenas y símbolos: `tgrep -F -- "<literal>" .`
    - Búsqueda regex de funciones o patrones: `tgrep -- "<patron_regex>" .`
    - Filtro por lenguaje TypeScript: `tgrep -t ts -- "<patron>" .`
  - **`git grep`:** Para búsquedas rápidas con contexto de líneas: `git grep -nI "<patron>"`.
  - **Herramienta Nativa:** `grep_search` cuando se requiera JSON estructurado.
  - Prohibido terminantemente ejecutar escaneos masivos ciegos (`dir /s` en `C:\Users\nacho` o PowerShell `Get-ChildItem -Recurse`).

- **Linters, Static Analysis y Gobernanza React-Doctor:**
  - **`oxlint` (Linter Ultrarrápido):** Auditoría principal de código estático. Se ejecuta con `pnpm exec oxlint <directorio>` (ej. `pnpm exec oxlint apps/web-server` o `pnpm exec oxlint apps/web-client`).
  - **`oxlint-plugin-react-doctor`:** En componentes y vistas de `apps/web-client`, valida automáticamente la higiene React:
    - `react-doctor/rules-of-hooks`: Detección estricta de orden y dependencias de hooks (`useEffect`, `useCallback`, `useMemo`).
    - `react-doctor/iframe-missing-sandbox`: Exige atributo `sandbox` en cualquier `<iframe>`.
    - Prohibición de custom hooks para funciones puras (si no usan `useState`/`useEffect`, extraer como helper puro en `utils/`).
  - **Compilador TypeScript (`tsc --noEmit`):**
    - Servidor: `pnpm --filter @crystaltides/server exec tsc --noEmit`
    - Cliente: `pnpm --filter @crystaltides/client exec tsc --noEmit`
  - **Métricas SonarQube / SonarLint Obligatorias:**
    - Complejidad Cognitiva $\le 15$ (`sonarjs/cognitive-complexity` / `S3776`).
    - Cero cadenas duplicadas $\ge 3$ ocurrencias (`sonarjs/no-duplicate-string` / `S1192`).
    - Cero ternarios anidados (`typescript:S3358` / `sonarjs/no-nested-conditional`).
    - Cero tipos `any` descontrolados (`@typescript-eslint/no-explicit-any`).

- **Concurrency Cap:** Exactamente 5 subagentes en paralelo por wave. Tope estricto de 8 tareas en el Language Server.
- **Scope Isolation:** Estrictamente 1 archivo por subagente. Los subagentes tienen prohibido alterar archivos fuera de su ruta asignada.
- **Contract Invariance:** Cero alteraciones en contratos de rutas HTTP, códigos de estado, claves de payloads JSON o interfaces de props.
- **Quality Gates:** Toda wave requiere `pnpm --filter <app> exec tsc --noEmit` y `pnpm exec oxlint <app>` con 0 errores antes de habilitar la siguiente ola.

---

## Review Focus

1. **API Contract Drift:** Subagent alters response object keys (e.g. changing `{ success: true, data }` to `{ ok: true }`) causing frontend deserialization errors.
2. **Missing Async Error Handling:** Helper extraction forgets `try/catch` or omits `next(error)` in Express routes, hanging HTTP connections on unhandled promise rejections.
3. **React State Stale Closures:** Subagent extracts custom hooks or helper callbacks in React views without proper dependency arrays, causing stale state in form submissions.
4. **Duplicate Constant Collisions:** Extracted constant dictionaries (e.g. `ERRORS`, `HTTP_STATUS`) conflicting with global declarations or shared package exports.
5. **Loss of Strict Typing on DB Rows:** Replacing Supabase/Prisma query return types with loose interfaces that silently drop nullable fields or type narrowing.

---

## Wave Decomposition Overview

| Wave        | Domain                                    | Concurrency | Target Files                                                                                                        |
| :---------- | :---------------------------------------- | :---------- | :------------------------------------------------------------------------------------------------------------------ |
| **Wave 1**  | Backend Controllers Core A                | 5 subagents | `ticketController.ts`, `userController.ts`, `forumController.ts`, `twoFactorController.ts`, `aiController.ts`       |
| **Wave 2**  | Backend Controllers Core B                | 5 subagents | `settingsController.ts`, `ruleController.ts`, `locationController.ts`, `pollController.ts`, `eventController.ts`    |
| **Wave 3**  | Backend Controllers Core C                | 5 subagents | `gachaController.ts`, `webhookController.ts`, `discordController.ts`, `authController.ts`, `ragController.ts`       |
| **Wave 4**  | Backend Services Core A                   | 5 subagents | `forumService.ts`, `pollService.ts`, `ragService.ts`, `newspaperService.ts`, `userService.ts`                       |
| **Wave 5**  | Backend Services Core B & Middleware      | 5 subagents | `playerStatsService.ts`, `gachaService.ts`, `llmFallbackPipeline.ts`, `authMiddleware.ts`, `rateLimitMiddleware.ts` |
| **Wave 6**  | Frontend Pages Core A (Mega-Views)        | 5 subagents | `Account.tsx`, `Rules.tsx`, `Suggestions.tsx`, `Newspaper.tsx`, `LauncherPage.tsx`                                  |
| **Wave 7**  | Frontend Pages Core B (Community)         | 5 subagents | `Support.tsx`, `PublicProfile.tsx`, `Contests.tsx`, `CreateThread.tsx`, `AdminPanel.tsx`                            |
| **Wave 8**  | Frontend Pages Core C (Content)           | 5 subagents | `Blog.tsx`, `AboutRedesign.tsx`, `Stories.tsx`, `Forum.tsx`, `PolicyPage.tsx`                                       |
| **Wave 9**  | Frontend Pages Core D (Auth & Moderation) | 5 subagents | `Register.tsx`, `Login.tsx`, `TicketDetail.tsx`, `ForumCategory.tsx`, `Donors.tsx`                                  |
| **Wave 10** | Harness & Monorepo Verification           | Main Agent  | `dispatch.js` guardrails, `wave-runner.js`, monorepo full compile & fast lint                                       |

---

### Task 1: Wave 1 — Backend Controllers Core A

**Files:**

- Target 1: `apps/web-server/controllers/ticketController.ts` (8.5 KB)
- Target 2: `apps/web-server/controllers/userController.ts` (7.6 KB)
- Target 3: `apps/web-server/controllers/forumController.ts` (6.5 KB)
- Target 4: `apps/web-server/controllers/twoFactorController.ts` (6.0 KB)
- Target 5: `apps/web-server/controllers/aiController.ts` (5.6 KB)

**Interfaces:**

- Consumes: Express `Request`, `Response`, `NextFunction`, `@crystaltides/shared` types, local services.
- Produces: Cleaned controller handlers with complexity $\le 15$, extracted `TICKET_ERRORS`, `USER_ERRORS`, `FORUM_CONSTANTS`, zero duplicate literals, zero `any`.

- [x] **Step 1: Dispatch Wave 1 swarm (5 parallel subagents)**
      Execute wave dispatcher targeting the 5 controllers with single-file scope and allowed MCPs.
- [x] **Step 2: Await completion of all 5 subagents**
      Poll completion loops and confirm exit status 0 for all tasks.
- [x] **Step 3: Run backend typecheck verification**
      Run: `pnpm --filter @crystaltides/server exec tsc --noEmit`
      Expected: Exit code 0 (zero type errors).
- [x] **Step 4: Run backend linter verification**
      Run: `pnpm exec oxlint apps/web-server/controllers`
      Expected: 0 warnings, 0 errors.
- [x] **Step 5: Checkpoint commit**
  ```bash
  git add apps/web-server/controllers/ticketController.ts apps/web-server/controllers/userController.ts apps/web-server/controllers/forumController.ts apps/web-server/controllers/twoFactorController.ts apps/web-server/controllers/aiController.ts
  git commit -m "refactor(server): clean code wave 1 controllers (complexity <= 15, zero duplicate strings)"
  ```

---

### Task 2: Wave 2 — Backend Controllers Core B

**Files:**

- Target 1: `apps/web-server/controllers/settingsController.ts` (5.6 KB)
- Target 2: `apps/web-server/controllers/ruleController.ts` (5.2 KB)
- Target 3: `apps/web-server/controllers/locationController.ts` (4.5 KB)
- Target 4: `apps/web-server/controllers/pollController.ts` (4.3 KB)
- Target 5: `apps/web-server/controllers/eventController.ts` (4.3 KB)

**Interfaces:**

- Consumes: Express handlers, database clients, validation schemas.
- Produces: Refactored route functions, flattened nested conditionals into early returns, lookup dictionaries for setting keys and event types.

- [x] **Step 1: Dispatch Wave 2 swarm (5 parallel subagents)**
      Dispatch 5 subagents with exact file paths and SonarQube cognitive complexity constraints.
- [x] **Step 2: Await completion of all 5 subagents**
      Verify all 5 subagents finish with code changes saved.
- [x] **Step 3: Run backend typecheck verification**
      Run: `pnpm --filter @crystaltides/server exec tsc --noEmit`
      Expected: Exit code 0.
- [x] **Step 4: Run backend linter verification**
      Run: `pnpm exec oxlint apps/web-server/controllers`
      Expected: 0 warnings, 0 errors.
- [x] **Step 5: Checkpoint commit**
  ```bash
  git add apps/web-server/controllers/settingsController.ts apps/web-server/controllers/ruleController.ts apps/web-server/controllers/locationController.ts apps/web-server/controllers/pollController.ts apps/web-server/controllers/eventController.ts
  git commit -m "refactor(server): clean code wave 2 controllers (complexity <= 15, early returns)"
  ```

---

### Task 3: Wave 3 — Backend Controllers Core C

**Files:**

- Target 1: `apps/web-server/controllers/gachaController.ts` (4.3 KB)
- Target 2: `apps/web-server/controllers/webhookController.ts` (4.0 KB)
- Target 3: `apps/web-server/controllers/discordController.ts` (3.9 KB)
- Target 4: `apps/web-server/controllers/authController.ts` (3.5 KB)
- Target 5: `apps/web-server/controllers/ragController.ts` (3.4 KB)

**Interfaces:**

- Consumes: Stripe/Tebex webhooks, Discord OAuth2 tokens, LLM retrieval pipelines.
- Produces: Constant webhook event maps, typed webhook payload interfaces, zero nested ternaries.

- [x] **Step 1: Dispatch Wave 3 swarm (5 parallel subagents)**
      Dispatch 5 subagents targeting integration controllers.
- [x] **Step 2: Await completion of all 5 subagents**
      Validate no broken Discord or webhook event routing signatures.
- [x] **Step 3: Run backend typecheck verification**
      Run: `pnpm --filter @crystaltides/server exec tsc --noEmit`
      Expected: Exit code 0.
- [x] **Step 4: Run backend linter verification**
      Run: `pnpm exec oxlint apps/web-server/controllers`
      Expected: 0 warnings, 0 errors.
- [x] **Step 5: Checkpoint commit**
  ```bash
  git add apps/web-server/controllers/gachaController.ts apps/web-server/controllers/webhookController.ts apps/web-server/controllers/discordController.ts apps/web-server/controllers/authController.ts apps/web-server/controllers/ragController.ts
  git commit -m "refactor(server): clean code wave 3 controllers (zero any types, webhook type guards)"
  ```

---

### Task 4: Wave 4 — Backend Services Core A (Heavy Business Logic)

**Files:**

- Target 1: `apps/web-server/services/forumService.ts` (15.5 KB)
- Target 2: `apps/web-server/services/pollService.ts` (11.8 KB)
- Target 3: `apps/web-server/services/ragService.ts` (10.0 KB)
- Target 4: `apps/web-server/services/newspaperService.ts` (9.4 KB)
- Target 5: `apps/web-server/services/userService.ts` (7.9 KB)

**Interfaces:**

- Consumes: Supabase database client, vector embeddings, transaction helpers.
- Produces: Decomposed aggregation pipelines, typed query filters, complexity $\le 15$ across complex thread pagination and vote tallying.

- [x] **Step 1: Dispatch Wave 4 swarm (5 parallel subagents)**
      Dispatch 5 subagents with instructions to decompose large service methods into pure helper functions.
- [x] **Step 2: Await completion of all 5 subagents**
      Ensure database query shapes and return contracts remain 100% identical.
- [x] **Step 3: Run backend typecheck verification**
      Run: `pnpm --filter @crystaltides/server exec tsc --noEmit`
      Expected: Exit code 0.
- [x] **Step 4: Run backend linter verification**
      Run: `pnpm exec oxlint apps/web-server/services`
      Expected: 0 warnings, 0 errors.
- [x] **Step 5: Checkpoint commit**
  ```bash
  git add apps/web-server/services/forumService.ts apps/web-server/services/pollService.ts apps/web-server/services/ragService.ts apps/web-server/services/newspaperService.ts apps/web-server/services/userService.ts
  git commit -m "refactor(server): clean code wave 4 services (decompose aggregation pipelines, complexity <= 15)"
  ```

---

### Task 5: Wave 5 — Backend Services Core B & Critical Middleware

**Files:**

- Target 1: `apps/web-server/services/playerStatsService.ts` (7.7 KB)
- Target 2: `apps/web-server/services/gachaService.ts` (7.6 KB)
- Target 3: `apps/web-server/services/llmFallbackPipeline.ts` (6.4 KB)
- Target 4: `apps/web-server/middleware/authMiddleware.ts` (5.7 KB)
- Target 5: `apps/web-server/middleware/rateLimitMiddleware.ts` (2.8 KB)

**Interfaces:**

- Consumes: JWT verification, IP headers, rate limit memory maps, multi-provider LLM failover.
- Produces: Clean middleware pipelines, constant auth error codes, pure fallback selection functions.

- [x] **Step 1: Dispatch Wave 5 swarm (5 parallel subagents)**
      Dispatch 5 subagents targeting critical services and security middlewares.
- [x] **Step 2: Await completion of all 5 subagents**
      Validate that JWT extraction and rate-limit headers remain strictly compliant.
- [x] **Step 3: Run backend typecheck verification**
      Run: `pnpm --filter @crystaltides/server exec tsc --noEmit`
      Expected: Exit code 0.
- [x] **Step 4: Run backend linter verification**
      Run: `pnpm exec oxlint apps/web-server`
      Expected: 0 warnings, 0 errors across entire web-server app.
- [x] **Step 5: Checkpoint commit**
  ```bash
  git add apps/web-server/services/playerStatsService.ts apps/web-server/services/gachaService.ts apps/web-server/services/llmFallbackPipeline.ts apps/web-server/middleware/authMiddleware.ts apps/web-server/middleware/rateLimitMiddleware.ts
  git commit -m "refactor(server): clean code wave 5 services & middleware (complexity <= 15)"
  ```

---

### Task 6: Wave 6 — Frontend Pages Core A (Mega-View Monoliths)

**Files:**

- Target 1: `apps/web-client/src/pages/Account.tsx` (88.0 KB)
- Target 2: `apps/web-client/src/pages/Rules.tsx` (43.5 KB)
- Target 3: `apps/web-client/src/pages/Suggestions.tsx` (28.9 KB)
- Target 4: `apps/web-client/src/pages/Newspaper.tsx` (25.2 KB)
- Target 5: `apps/web-client/src/pages/LauncherPage.tsx` (24.7 KB)

**Interfaces:**

- Consumes: React hooks (`useState`, `useCallback`, `useMemo`), TanStack Query, Tailwind CSS classes.
- Produces: Extracted local sub-components or feature helpers (e.g. `AccountTabContent`, `RuleCategoryList`), zero nested ternaries in JSX, zero `any` event types.

- [x] **Step 1: Dispatch Wave 6 swarm (5 parallel subagents)**
      Dispatch subagents with React Modern Tooling rules (pure functions in same file or sub-components, no unprompted design changes, strictly preserve DOM markup and styling).
- [x] **Step 2: Await completion of all 5 subagents**
      Ensure JSX structure and visual layout classes are preserved verbatim.
- [x] **Step 3: Run frontend typecheck verification**
      Run: `pnpm --filter @crystaltides/client exec tsc --noEmit`
      Expected: Exit code 0.
- [x] **Step 4: Run frontend linter verification**
      Run: `pnpm exec oxlint apps/web-client/src/pages`
      Expected: 0 warnings, 0 errors.
- [x] **Step 5: Checkpoint commit**
  ```bash
  git add apps/web-client/src/pages/Account.tsx apps/web-client/src/pages/Rules.tsx apps/web-client/src/pages/Suggestions.tsx apps/web-client/src/pages/Newspaper.tsx apps/web-client/src/pages/LauncherPage.tsx
  git commit -m "refactor(client): clean code wave 6 mega-views (complexity <= 15, subcomponents)"
  ```

---

### Task 7: Wave 7 — Frontend Pages Core B (Interactive Community)

**Files:**

- Target 1: `apps/web-client/src/pages/Support.tsx` (22.7 KB)
- Target 2: `apps/web-client/src/pages/PublicProfile.tsx` (22.1 KB)
- Target 3: `apps/web-client/src/pages/Contests.tsx` (21.7 KB)
- Target 4: `apps/web-client/src/pages/CreateThread.tsx` (20.6 KB)
- Target 5: `apps/web-client/src/pages/AdminPanel.tsx` (19.4 KB)

**Interfaces:**

- Consumes: Forum APIs, Ticket mutations, User Profile context.
- Produces: Deduplicated form handlers, typed input payloads, constant status badges.

- [x] **Step 1: Dispatch Wave 7 swarm (5 parallel subagents)**
      Dispatch subagents targeting interactive forms and thread management views.
- [x] **Step 2: Await completion of all 5 subagents**
      Verify all form submissions and mutation callbacks retain exact signatures.
- [x] **Step 3: Run frontend typecheck verification**
      Run: `pnpm --filter @crystaltides/client exec tsc --noEmit`
      Expected: Exit code 0.
- [x] **Step 4: Run frontend linter verification**
      Run: `pnpm exec oxlint apps/web-client/src/pages`
      Expected: 0 warnings, 0 errors.
- [x] **Step 5: Checkpoint commit**
  ```bash
  git add apps/web-client/src/pages/Support.tsx apps/web-client/src/pages/PublicProfile.tsx apps/web-client/src/pages/Contests.tsx apps/web-client/src/pages/CreateThread.tsx apps/web-client/src/pages/AdminPanel.tsx
  git commit -m "refactor(client): clean code wave 7 community pages (complexity <= 15, subcomponents)"
  ```

---

### Task 8: Wave 8 — Frontend Pages Core C (Content & Navigation Views)

**Files:**

- Target 1: `apps/web-client/src/pages/Blog.tsx` (16.5 KB)
- Target 2: `apps/web-client/src/pages/AboutRedesign.tsx` (16.2 KB)
- Target 3: `apps/web-client/src/pages/Stories.tsx` (15.8 KB)
- Target 4: `apps/web-client/src/pages/Forum.tsx` (14.7 KB)
- Target 5: `apps/web-client/src/pages/PolicyPage.tsx` (14.7 KB)

**Interfaces:**

- Consumes: Markdown renderer, pagination state, modal dialogs.
- Produces: Constant category tag maps, decomposed card grids, zero duplicate literals.

- [x] **Step 1: Dispatch Wave 8 swarm (5 parallel subagents)**
      Dispatch 5 subagents for content/editorial page refactoring.
- [x] **Step 2: Await completion of all 5 subagents**
      Verify content layout and reading experiences remain intact.
- [x] **Step 3: Run frontend typecheck verification**
      Run: `pnpm --filter @crystaltides/client exec tsc --noEmit`
      Expected: Exit code 0.
- [x] **Step 4: Run frontend linter verification**
      Run: `pnpm exec oxlint apps/web-client/src/pages`
      Expected: 0 warnings, 0 errors.
- [x] **Step 5: Checkpoint commit**
  ```bash
  git add apps/web-client/src/pages/Blog.tsx apps/web-client/src/pages/AboutRedesign.tsx apps/web-client/src/pages/Stories.tsx apps/web-client/src/pages/Forum.tsx apps/web-client/src/pages/PolicyPage.tsx
  git commit -m "refactor(client): clean code wave 8 content pages (complexity <= 15, subcomponents)"
  ```

---

### Task 9: Wave 9 — Frontend Pages Core D (Auth & Account Flows)

**Files:**

- Target 1: `apps/web-client/src/pages/Register.tsx` (14.8 KB)
- Target 2: `apps/web-client/src/pages/Login.tsx` (11.7 KB)
- Target 3: `apps/web-client/src/pages/TicketDetail.tsx` (11.3 KB)
- Target 4: `apps/web-client/src/pages/ForumCategory.tsx` (11.1 KB)
- Target 5: `apps/web-client/src/pages/Donors.tsx` (10.4 KB)

**Interfaces:**

- Consumes: Auth context, session tokens, Tebex donor tier lists.
- Produces: Clean validation feedback helpers, typed auth state, zero nested ternaries.

- [x] **Step 1: Dispatch Wave 9 swarm (5 parallel subagents)**
      Dispatch 5 subagents targeting login/registration and ticket detail flows.
- [x] **Step 2: Await completion of all 5 subagents**
      Validate zero regressions in authentication redirects or token storage.
- [x] **Step 3: Run frontend typecheck verification**
      Run: `pnpm --filter @crystaltides/client exec tsc --noEmit`
      Expected: Exit code 0.
- [x] **Step 4: Run frontend linter verification**
      Run: `pnpm exec oxlint apps/web-client/src/pages`
      Expected: 0 warnings, 0 errors.
- [x] **Step 5: Checkpoint commit**
  ```bash
  git add apps/web-client/src/pages/Register.tsx apps/web-client/src/pages/Login.tsx apps/web-client/src/pages/TicketDetail.tsx apps/web-client/src/pages/ForumCategory.tsx apps/web-client/src/pages/Donors.tsx
  git commit -m "refactor(client): clean code wave 9 auth & account (complexity <= 15, subcomponents)"
  ```

---

### Task 10: Wave 10 — Swarm Guardrails, Wave Runner & Monorepo Quality Gate

**Files:**

- Modify: `C:/Users/nacho/.gemini/antigravity-sub-agent-mcp/dispatch.js`
- Create: `C:/Users/nacho/.gemini/antigravity-sub-agent-mcp/wave-runner.js`
- Test: Full monorepo verification commands

**Interfaces:**

- Produces:

  ```javascript
  // wave-runner.js
  export async function executeWave(waveIndex, tasks, options);
  export async function verifyWaveHealth(appName);
  ```

- [x] **Step 1: Harden MCP Guardrails in `dispatch.js`**
      Add explicit Allowed MCPs (`graphify`, `sequential-thinking`, `context7`, `sonarqube`) and Prohibited MCPs (`antigravity-sub-agent`, `discord-*`, `orion-bridge`, `github`, `puppeteer`) to `SYSTEM_PROMPT` in `dispatch.js`.
- [x] **Step 2: Create automated `wave-runner.js`**
      Build batch orchestration script to run 5 subagents in parallel with auto-poll, logging, and automatic `tsc` / `oxlint` execution.
- [x] **Step 3: Run full monorepo typecheck**
      Run: `pnpm --filter @crystaltides/server exec tsc --noEmit && pnpm --filter @crystaltides/client exec tsc --noEmit && pnpm --filter @crystaltides/shared exec tsc --noEmit`
      Expected: Exit code 0 across all 3 monorepo packages.
- [x] **Step 4: Run monorepo fast linter**
      Run: `pnpm run lint:fast`
      Expected: 0 errors across the entire codebase.
- [x] **Step 5: Run monorepo test suites**
      Run: `pnpm run test`
      Expected: All unit tests pass green.
- [x] **Step 6: Final milestone commit**
  ```bash
  git commit -am "chore(infra): complete 10 waves of autonomous subagent refactor across 50 files"
  ```
