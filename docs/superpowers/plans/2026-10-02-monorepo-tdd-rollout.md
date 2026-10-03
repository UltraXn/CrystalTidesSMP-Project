# Monorepo TDD Rollout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish end-to-end test coverage and domain hardening across the CrystalTides monorepo using strict Red-Green-Refactor Test-Driven Development.

**Architecture:** Decompose mission-critical server, client, and shared logic into pure, testable units. Each domain module is developed strictly test-first (RED), implemented minimally (GREEN), and cleaned up (REFACTOR) with zero regressions across the monorepo build, oxlint, and Vitest test suites.

**Tech Stack:** TypeScript 5.8, Vitest 4.1, Node 22/24, pnpm workspaces, Turborepo, Zod.

**Spec:** High-reliability standards for Minecraft server integrations, web security (OWASP Top 10, CWE-601, CWE-79), and deterministic gaming mechanics (Gacha pity and rate limits).

## Global Constraints

- **The Iron Law:** NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST.
- **Package Manager:** Strictly `pnpm`, never `npm` or `yarn`.
- **Linter & Compilations:** All changes must pass `pnpm run lint:fast` (`oxlint`) with 0 errors and `tsc` build with exit code 0.
- **Purity:** Pure functions and deterministic business logic belong in `packages/shared` whenever shared across apps.
- **Fast Execution:** All unit tests must execute in memory without requiring live databases or remote external network calls.

## Review Focus

1. **Invalid Minecraft Identifiers:** Case-insensitive nickname validation (3-16 chars, `^[a-zA-Z0-9_]+$`) and UUIDs without hyphens causing database corruptions.
2. **Rate Limit Overflow / Race Conditions:** Millisecond timestamp drift or concurrent counter increments exceeding burst thresholds.
3. **XSS & Protocol Hijacking:** User-generated Markdown containing `javascript:`, base64 `data:`, or malformed HTML entities bypassing filters.
4. **Gacha Negative Credits & Probability Drift:** Edge cases where rolls occur with 0 or negative credits, or pity counters fail to increment on non-legendary pulls.
5. **Ping Response Packet Corruption:** Malformed Minecraft Server List Ping (SLP) JSON payload crashing status workers.

---

### Task 1: Minecraft Nickname & UUID Validator (`packages/shared`)

**Files:**
- Create: `packages/shared/src/minecraft.ts`
- Modify: `packages/shared/src/index.ts`
- Test: `apps/web-client/src/__tests__/utils/minecraft.test.ts`

**Interfaces:**
- Produces:
  ```typescript
  export function isValidMinecraftNick(nick: unknown): boolean;
  export function normalizeMinecraftUuid(uuid: unknown): string | null;
  export function formatMinecraftAvatarUrl(uuidOrNick: string, size?: number): string;
  ```

- [ ] **Step 1: Write the failing test**
  Write tests in `apps/web-client/src/__tests__/utils/minecraft.test.ts` asserting nickname constraints (3-16 characters, alphanumeric + underscores, rejects spaces/symbols), UUID format conversion (both 32-char unhyphenated and 36-char canonical to lowercase UUID), and avatar URL generation.

- [ ] **Step 2: Run test to verify it fails**
  Run: `pnpm --filter @crystaltides/client exec vitest run src/__tests__/utils/minecraft.test.ts`
  Expected: FAIL with `TypeError: isValidMinecraftNick is not a function`.

- [ ] **Step 3: Implement minimal code in `packages/shared/src/minecraft.ts`**
  Implement regex matching `^[a-zA-Z0-9_]{3,16}$` and UUID normalization `^([0-9a-f]{8})([0-9a-f]{4})([0-9a-f]{4})([0-9a-f]{4})([0-9a-f]{12})$`. Export from `packages/shared/src/index.ts` and build `@crystaltides/shared`.

- [ ] **Step 4: Run test to verify it passes**
  Run: `pnpm --filter @crystaltides/client exec vitest run src/__tests__/utils/minecraft.test.ts`
  Expected: PASS (all tests green).

- [ ] **Step 5: Commit**
  ```bash
  git add packages/shared/src/minecraft.ts packages/shared/src/index.ts apps/web-client/src/__tests__/utils/minecraft.test.ts
  git commit -m "feat(shared): add minecraft nick and uuid validator with TDD"
  ```

---

### Task 2: Sliding-Window Rate Limiter (`apps/web-server`)

**Files:**
- Create: `apps/web-server/utils/rateLimiter.ts`
- Test: `apps/web-server/__tests__/utils/rateLimiter.test.ts`

**Interfaces:**
- Produces:
  ```typescript
  export interface RateLimiterOptions {
    windowMs: number;
    maxRequests: number;
  }
  export interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    resetTimeMs: number;
  }
  export class MemoryRateLimiter {
    constructor(options: RateLimiterOptions);
    check(key: string, nowMs?: number): RateLimitResult;
    reset(key: string): void;
  }
  ```

- [ ] **Step 1: Write the failing test**
  Write tests in `apps/web-server/__tests__/utils/rateLimiter.test.ts` covering burst requests within window, blocking on excess requests, window expiry / refill, and independent tracking per IP/key.

- [ ] **Step 2: Run test to verify it fails**
  Run: `pnpm --filter @crystaltides/server exec vitest run __tests__/utils/rateLimiter.test.ts`
  Expected: FAIL with `TypeError: MemoryRateLimiter is not a constructor`.

- [ ] **Step 3: Implement minimal code in `apps/web-server/utils/rateLimiter.ts`**
  Store timestamps array in a `Map<string, number[]>`. Filter out timestamps older than `now - windowMs`, append current timestamp, compare against `maxRequests`.

- [ ] **Step 4: Run test to verify it passes**
  Run: `pnpm --filter @crystaltides/server exec vitest run __tests__/utils/rateLimiter.test.ts`
  Expected: PASS (all tests green).

- [ ] **Step 5: Commit**
  ```bash
  git add apps/web-server/utils/rateLimiter.ts apps/web-server/__tests__/utils/rateLimiter.test.ts
  git commit -m "feat(server): add sliding-window memory rate limiter with TDD"
  ```

---

### Task 3: Content Sanitizer & Safe Link Shield (`packages/shared`)

**Files:**
- Create: `packages/shared/src/sanitizer.ts`
- Modify: `packages/shared/src/index.ts`
- Test: `apps/web-client/src/__tests__/utils/sanitizer.test.ts`

**Interfaces:**
- Produces:
  ```typescript
  export function sanitizeUserMarkdown(input: string): string;
  export function sanitizeExternalUrl(url: unknown): string | null;
  ```

- [ ] **Step 1: Write the failing test**
  Write tests in `apps/web-client/src/__tests__/utils/sanitizer.test.ts` verifying that `javascript:`, `vbscript:`, `data:text/html`, `<script>`, and dangerous inline event handlers (`onerror=`, `onload=`) are stripped, while legitimate Markdown syntax and HTTPS links are preserved.

- [ ] **Step 2: Run test to verify it fails**
  Run: `pnpm --filter @crystaltides/client exec vitest run src/__tests__/utils/sanitizer.test.ts`
  Expected: FAIL with `TypeError: sanitizeUserMarkdown is not a function`.

- [ ] **Step 3: Implement minimal code in `packages/shared/src/sanitizer.ts`**
  Implement safe protocol whitelist (`https:`, `http:`, `mailto:`, relative paths `/`) and HTML entity stripping for dangerous elements. Re-export in `packages/shared/src/index.ts`.

- [ ] **Step 4: Run test to verify it passes**
  Run: `pnpm --filter @crystaltides/client exec vitest run src/__tests__/utils/sanitizer.test.ts`
  Expected: PASS (all tests green).

- [ ] **Step 5: Commit**
  ```bash
  git add packages/shared/src/sanitizer.ts packages/shared/src/index.ts apps/web-client/src/__tests__/utils/sanitizer.test.ts
  git commit -m "feat(shared): add content and link security sanitizer with TDD"
  ```

---

### Task 4: Gacha Pity & Roll Calculation Engine (`packages/shared`)

**Files:**
- Create: `packages/shared/src/gachaEngine.ts`
- Modify: `packages/shared/src/index.ts`
- Test: `apps/web-server/__tests__/gachaEngine.test.ts`

**Interfaces:**
- Produces:
  ```typescript
  export interface GachaItem {
    id: string;
    tier: 'common' | 'rare' | 'epic' | 'legendary';
    weight: number;
  }
  export interface RollResult {
    item: GachaItem;
    pityCount: number;
    triggeredPity: boolean;
  }
  export function calculateGachaRoll(
    items: GachaItem[],
    currentPity: number,
    pityThreshold: number,
    randomSeed?: number,
  ): RollResult;
  ```

- [ ] **Step 1: Write the failing test**
  Write tests in `apps/web-server/__tests__/gachaEngine.test.ts` verifying weighted random selection, pity trigger when `currentPity >= pityThreshold`, pity reset to 0 upon legendary pull, and deterministic test outcomes with injected `randomSeed`.

- [ ] **Step 2: Run test to verify it fails**
  Run: `pnpm --filter @crystaltides/server exec vitest run __tests__/gachaEngine.test.ts`
  Expected: FAIL with `TypeError: calculateGachaRoll is not a function`.

- [ ] **Step 3: Implement minimal code in `packages/shared/src/gachaEngine.ts`**
  Implement the deterministic weighted selection and pity progression logic. Re-export in `packages/shared/src/index.ts` and compile.

- [ ] **Step 4: Run test to verify it passes**
  Run: `pnpm --filter @crystaltides/server exec vitest run __tests__/gachaEngine.test.ts`
  Expected: PASS (all tests green).

- [ ] **Step 5: Commit**
  ```bash
  git add packages/shared/src/gachaEngine.ts packages/shared/src/index.ts apps/web-server/__tests__/gachaEngine.test.ts
  git commit -m "feat(shared): add deterministic gacha pity calculation engine with TDD"
  ```

---

### Task 5: Monorepo Final Verification Suite

- [ ] **Step 1: Verify all package builds**
  Run: `pnpm --filter @crystaltides/shared run build && pnpm --filter @crystaltides/server run build && pnpm --filter @crystaltides/client run build`
  Expected: All builds exit code 0.

- [ ] **Step 2: Verify monorepo linter**
  Run: `pnpm run lint:fast`
  Expected: 0 errors across monorepo.

- [ ] **Step 3: Run monorepo test suite**
  Run: `pnpm run test`
  Expected: All test suites across apps and packages pass without errors.
