/**
 * 🧬 Stryker Orchestrator — Incremental Mutation Testing Pipeline
 *
 * Discovers all component <-> test pairs, partitions them into batches,
 * and runs Stryker sequentially with persistent state so execution can
 * be paused and resumed without losing progress.
 *
 * Usage:
 *   npx tsx scripts/stryker-orchestrator.ts                 # full run
 *   npx tsx scripts/stryker-orchestrator.ts --resume         # resume from last checkpoint
 *   npx tsx scripts/stryker-orchestrator.ts --status         # print current progress
 *   npx tsx scripts/stryker-orchestrator.ts --dry-run        # show plan without executing
 *   npx tsx scripts/stryker-orchestrator.ts --batch-size=3   # override batch size
 *   npx tsx scripts/stryker-orchestrator.ts --max-batches=2  # limit batches per session
 */

import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";

// ─── Types ──────────────────────────────────────────────────────────────────

interface ComponentEntry {
  name: string;
  source: string;
  testDir: string;
  status: "pending" | "in_progress" | "completed" | "failed" | "skipped";
  killed?: number;
  survived?: number;
  timeout?: number;
  noCoverage?: number;
  score?: number;
  error?: string;
  completedAt?: string;
}

interface PipelineState {
  version: 1;
  createdAt: string;
  updatedAt: string;
  batchSize: number;
  totalComponents: number;
  components: ComponentEntry[];
}

// ─── Constants ──────────────────────────────────────────────────────────────

const ROOT = resolve(import.meta.dirname, "..");
const COMPONENTS_DIR = join(ROOT, "src", "components");
const TESTS_DIR = join(ROOT, "src", "__tests__", "components");
const REPORTS_DIR = join(ROOT, "reports", "mutation");
const STATE_FILE = join(REPORTS_DIR, "pipeline-state.json");
const STRYKER_TMP = join(ROOT, ".stryker-tmp");

const DEFAULT_BATCH_SIZE = 2;
const DEFAULT_MAX_BATCHES = Infinity;

// ─── CLI Parsing ────────────────────────────────────────────────────────────

function parseArgs(): {
  resume: boolean;
  status: boolean;
  dryRun: boolean;
  batchSize: number;
  maxBatches: number;
} {
  const args = process.argv.slice(2);
  return {
    resume: args.includes("--resume"),
    status: args.includes("--status"),
    dryRun: args.includes("--dry-run"),
    batchSize: Number(args.find((a) => a.startsWith("--batch-size="))?.split("=")[1]) || DEFAULT_BATCH_SIZE,
    maxBatches: Number(args.find((a) => a.startsWith("--max-batches="))?.split("=")[1]) || DEFAULT_MAX_BATCHES,
  };
}

// ─── Discovery ──────────────────────────────────────────────────────────────

function discoverComponents(): ComponentEntry[] {
  const entries: ComponentEntry[] = [];

  if (!existsSync(COMPONENTS_DIR)) {
    console.error(`❌ Components directory not found: ${COMPONENTS_DIR}`);
    process.exit(1);
  }

  const groups = readdirSync(COMPONENTS_DIR).filter((d) =>
    statSync(join(COMPONENTS_DIR, d)).isDirectory()
  );

  for (const group of groups) {
    const groupDir = join(COMPONENTS_DIR, group);
    const testGroupDir = join(TESTS_DIR, group);

    // Check if this group has tests
    if (!existsSync(testGroupDir)) {
      console.warn(`⚠️  No test directory for group: ${group} — skipping`);
      continue;
    }

    // Find all .tsx/.ts source files (non-test, non-story)
    const sourceFiles = findFiles(groupDir, /\.(tsx?|ts)$/, /\.(test|spec|stories)\./);
    const testFiles = findFiles(testGroupDir, /\.test\.(tsx?|ts)$/);

    if (sourceFiles.length === 0 || testFiles.length === 0) {
      console.warn(`⚠️  No source/test pair for group: ${group} — skipping`);
      continue;
    }

    entries.push({
      name: group,
      source: `src/components/${group}/**/*.tsx`,
      testDir: `src/__tests__/components/${group}/**`,
      status: "pending",
    });
  }

  return entries.sort((a, b) => a.name.localeCompare(b.name));
}

function findFiles(dir: string, include: RegExp, exclude?: RegExp): string[] {
  const results: string[] = [];
  if (!existsSync(dir)) return results;

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findFiles(fullPath, include, exclude));
    } else if (include.test(entry.name) && (!exclude || !exclude.test(entry.name))) {
      results.push(fullPath);
    }
  }
  return results;
}

// ─── State Management ───────────────────────────────────────────────────────

function loadState(): PipelineState | null {
  if (!existsSync(STATE_FILE)) return null;
  try {
    return JSON.parse(readFileSync(STATE_FILE, "utf-8")) as PipelineState;
  } catch {
    console.warn("⚠️  Corrupted state file, starting fresh");
    return null;
  }
}

function saveState(state: PipelineState): void {
  mkdirSync(REPORTS_DIR, { recursive: true });
  state.updatedAt = new Date().toISOString();
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

function initState(components: ComponentEntry[], batchSize: number): PipelineState {
  return {
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    batchSize,
    totalComponents: components.length,
    components,
  };
}

// ─── Stryker Execution ──────────────────────────────────────────────────────

function runStrykerForComponent(entry: ComponentEntry): void {
  const tempConfig = join(ROOT, "stryker.batch.json");

  const config = {
    $schema: "./node_modules/@stryker-mutator/core/schema/stryker-schema.json",
    packageManager: "npm",
    reporters: ["html", "clear-text", "progress", "json"],
    testRunner: "vitest",
    coverageAnalysis: "perTest" as const,
    concurrency: 1,
    timeoutMS: 30000,
    timeoutFactor: 3,
    cleanTempDir: "always" as const,
    mutate: [entry.source, "!**/*.test.ts", "!**/*.test.tsx", "!**/__tests__/**", "!**/*.stories.tsx"],
    vitest: {
      configFile: "vitest.config.ts",
      related: true,
    },
    htmlReporter: {
      fileName: `reports/mutation/${entry.name}/index.html`,
    },
    jsonReporter: {
      fileName: `reports/mutation/${entry.name}/mutation.json`,
    },
  };

  writeFileSync(tempConfig, JSON.stringify(config, null, 2));

  try {
    execSync("npx stryker run stryker.batch.json", {
      cwd: ROOT,
      stdio: "inherit",
      timeout: 20 * 60 * 1000, // 20 min max per component
    });
  } finally {
    // Always clean up temp config and stryker sandbox
    try { rmSync(tempConfig, { force: true }); } catch { /* ignore */ }
    try { rmSync(STRYKER_TMP, { recursive: true, force: true }); } catch { /* ignore */ }
  }
}

function parseResults(entry: ComponentEntry): Partial<ComponentEntry> {
  const jsonPath = join(REPORTS_DIR, entry.name, "mutation.json");
  if (!existsSync(jsonPath)) return {};

  try {
    const report = JSON.parse(readFileSync(jsonPath, "utf-8"));
    const mutants = Object.values(report.files as Record<string, { mutants: { status: string }[] }>)
      .flatMap((f) => f.mutants);

    const killed = mutants.filter((m) => m.status === "Killed").length;
    const survived = mutants.filter((m) => m.status === "Survived").length;
    const timeout = mutants.filter((m) => m.status === "Timeout").length;
    const noCoverage = mutants.filter((m) => m.status === "NoCoverage").length;
    const total = mutants.length;

    return {
      killed,
      survived,
      timeout,
      noCoverage,
      score: total > 0 ? Math.round(((killed + timeout) / total) * 1000) / 10 : 0,
    };
  } catch {
    return {};
  }
}

// ─── Display ────────────────────────────────────────────────────────────────

function printStatus(state: PipelineState): void {
  const completed = state.components.filter((c) => c.status === "completed");
  const failed = state.components.filter((c) => c.status === "failed");
  const pending = state.components.filter((c) => c.status === "pending");
  const skipped = state.components.filter((c) => c.status === "skipped");

  console.log("\n╔══════════════════════════════════════════════════════╗");
  console.log("║     🧬 Stryker Mutation Pipeline — Status Report    ║");
  console.log("╠══════════════════════════════════════════════════════╣");
  console.log(`║  Total:     ${String(state.totalComponents).padStart(4)}                                   ║`);
  console.log(`║  Completed: ${String(completed.length).padStart(4)} ✅                                  ║`);
  console.log(`║  Failed:    ${String(failed.length).padStart(4)} ❌                                  ║`);
  console.log(`║  Pending:   ${String(pending.length).padStart(4)} ⏳                                  ║`);
  console.log(`║  Skipped:   ${String(skipped.length).padStart(4)} ⏭️                                   ║`);
  console.log("╚══════════════════════════════════════════════════════╝\n");

  if (completed.length > 0) {
    console.log("┌─ Completed ─────────────────────────────────────────┐");
    for (const c of completed) {
      const score = c.score != null ? `${c.score}%` : "N/A";
      console.log(`│  ${c.name.padEnd(20)} │ Score: ${score.padStart(6)} │ K:${String(c.killed ?? 0).padStart(3)} S:${String(c.survived ?? 0).padStart(3)} │`);
    }
    console.log("└──────────────────────────────────────────────────────┘");
  }

  if (failed.length > 0) {
    console.log("\n┌─ Failed ─────────────────────────────────────────────┐");
    for (const c of failed) {
      console.log(`│  ${c.name.padEnd(20)} │ ${(c.error ?? "Unknown error").slice(0, 30)} │`);
    }
    console.log("└──────────────────────────────────────────────────────┘");
  }

  // Global score
  const totalKilled = completed.reduce((s, c) => s + (c.killed ?? 0) + (c.timeout ?? 0), 0);
  const totalMutants = completed.reduce(
    (s, c) => s + (c.killed ?? 0) + (c.survived ?? 0) + (c.timeout ?? 0) + (c.noCoverage ?? 0),
    0
  );
  if (totalMutants > 0) {
    const globalScore = Math.round((totalKilled / totalMutants) * 1000) / 10;
    console.log(`\n🎯 Global Mutation Score: ${globalScore}% (${totalKilled}/${totalMutants})`);
  }
}

function printDryRun(state: PipelineState, batchSize: number): void {
  console.log("\n🔍 DRY RUN — Execution Plan:\n");

  const pending = state.components.filter((c) => c.status === "pending");
  const batches = Math.ceil(pending.length / batchSize);

  for (let i = 0; i < batches; i++) {
    const batch = pending.slice(i * batchSize, (i + 1) * batchSize);
    console.log(`  Batch ${i + 1}/${batches}:`);
    for (const c of batch) {
      console.log(`    • ${c.name} → ${c.source}`);
    }
  }

  console.log(`\n  Total: ${pending.length} components in ${batches} batches of ${batchSize}`);
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const opts = parseArgs();

  // Status mode
  if (opts.status) {
    const state = loadState();
    if (!state) {
      console.log("📭 No pipeline state found. Run without --status to start.");
      return;
    }
    printStatus(state);
    return;
  }

  // Discover or resume
  let state: PipelineState;
  if (opts.resume) {
    const existing = loadState();
    if (!existing) {
      console.log("📭 No previous state to resume. Starting fresh discovery...");
      const components = discoverComponents();
      state = initState(components, opts.batchSize);
    } else {
      state = existing;
      console.log(`♻️  Resuming pipeline from checkpoint (${state.components.filter((c) => c.status === "completed").length}/${state.totalComponents} done)`);
    }
  } else {
    const components = discoverComponents();
    state = initState(components, opts.batchSize);
  }

  saveState(state);

  // Dry run mode
  if (opts.dryRun) {
    printDryRun(state, opts.batchSize);
    return;
  }

  // Execute batches
  const pending = state.components.filter((c) => c.status === "pending" || c.status === "in_progress");

  if (pending.length === 0) {
    console.log("🎉 All components have been processed!");
    printStatus(state);
    return;
  }

  let batchesRun = 0;

  for (let i = 0; i < pending.length; i++) {
    if (batchesRun >= opts.maxBatches) {
      console.log(`\n⏸️  Reached max batches limit (${opts.maxBatches}). Use --resume to continue.`);
      break;
    }

    const entry = pending[i];
    const stateEntry = state.components.find((c) => c.name === entry.name)!;

    console.log(`\n${"═".repeat(60)}`);
    console.log(`🧬 [${i + 1}/${pending.length}] Mutating: ${entry.name}`);
    console.log(`${"═".repeat(60)}\n`);

    stateEntry.status = "in_progress";
    saveState(state);

    try {
      runStrykerForComponent(entry);
      const results = parseResults(entry);
      Object.assign(stateEntry, results, {
        status: "completed",
        completedAt: new Date().toISOString(),
      });
      console.log(`\n✅ ${entry.name}: Score ${stateEntry.score ?? "N/A"}% (K:${stateEntry.killed ?? 0} S:${stateEntry.survived ?? 0})`);
    } catch (err) {
      stateEntry.status = "failed";
      stateEntry.error = err instanceof Error ? err.message.slice(0, 200) : String(err);
      console.error(`\n❌ ${entry.name}: Failed — ${stateEntry.error}`);
    }

    saveState(state);

    // Count batch boundary
    if ((i + 1) % opts.batchSize === 0) {
      batchesRun++;
      console.log(`\n📦 Batch ${batchesRun} complete. Cleaning up...`);
      try { rmSync(STRYKER_TMP, { recursive: true, force: true }); } catch { /* ignore */ }
    }
  }

  // Final report
  console.log("\n\n");
  printStatus(state);
}

main().catch((err) => {
  console.error("💥 Pipeline crashed:", err);
  process.exit(1);
});
