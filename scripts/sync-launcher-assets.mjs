#!/usr/bin/env node
/**
 * Sincroniza los binarios que launcher-lite embebe con include_bytes! (src-tauri/assets) y sus SHA-256,
 * fijados en assets/MANIFEST.md, en src/agent.rs y en src/boost_jars.rs.
 *
 *   node scripts/sync-launcher-assets.mjs                 copia los jars de boost compilados en local y reconcilia hashes
 *   node scripts/sync-launcher-assets.mjs --from-ci <id>  usa los jars de boost de esa ejecución en verde de ci-boost.yml
 *   node scripts/sync-launcher-assets.mjs --build         compila antes todos los nodos de boost (Gradle, largo) y game-bridge
 *   node scripts/sync-launcher-assets.mjs --check         no escribe nada; exit 1 si algo está desincronizado
 *                                                         (con --from-ci <id>, compara además con los jars de esa ejecución)
 *
 * Boost embebe un jar por grupo de versiones de Minecraft (nodo Stonecutter) y loader, en
 * assets/boost/crystaltides-boost-<loader>-<grupo>.jar. Los grupos y sus loaders salen de
 * mods/crystaltides-boost/settings.gradle.kts; las versiones de Minecraft de cada grupo (mod.mc_releases) y la
 * versión del mod, de stonecutter.properties.toml. Con eso se generan src/boost_jars.rs, la tabla con la que
 * deploy_boost_mod elige el jar de cada instancia, y las filas de boost de MANIFEST.md.
 *
 * Al sustituir o retirar un jar de boost, su hash anterior se añade a LEGACY_BOOST_JAR_SHA256 (agent.rs) para
 * que el launcher siga reconociendo y retirando las copias ya desplegadas. Los jars son reproducibles:
 * recompilar sin cambios no produce diferencias.
 *
 * LAUNCHER_LITE_DIR=<ruta> apunta a otra copia de launcher-lite (p. ej. un git worktree) en lugar del
 * submódulo apps/launcher-lite.
 */
import { execFileSync, execSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const boostDir = path.join(root, 'mods', 'crystaltides-boost');
const gameBridgeDir = path.join(root, 'apps', 'game-bridge');
const liteDir = process.env.LAUNCHER_LITE_DIR
  ? path.resolve(process.env.LAUNCHER_LITE_DIR)
  : path.join(root, 'apps', 'launcher-lite');
const liteTauri = path.join(liteDir, 'src-tauri');
const assetsDir = path.join(liteTauri, 'assets');
const manifestPath = path.join(assetsDir, 'MANIFEST.md');
const agentRsPath = path.join(liteTauri, 'src', 'agent.rs');
const boostJarsRsPath = path.join(liteTauri, 'src', 'boost_jars.rs');

const CI_WORKFLOW = 'CI | CrystalTides Boost Mod';
// Loaders con soporte en boost_jar_for (agent.rs); Quilt usa los jars de Fabric
const LOADER_LABEL = { fabric: 'Fabric/Quilt', neoforge: 'NeoForge' };
// Filas de la tabla de MANIFEST.md: | `archivo` | ... | `sha256` |
const ROW = /^\| `([^`]+)` \|.*\| `([0-9a-f]{64})` \|\s*$/;
// assets/boost/*.jar y los de cuando el launcher embebía un solo grupo (assets/crystaltides-boost-<loader>.jar)
const isBoostAsset = (file) => /^(boost\/)?crystaltides-boost-[^/]*\.jar$/.test(file);
const LEGACY_BLOCK = /(const LEGACY_BOOST_JAR_SHA256: &\[&str\] = &\[)([\s\S]*?)(\r?\n\];)/;

function fail(message) {
  console.error(`✖ ${message}`);
  process.exit(1);
}

const sha256 = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const sameBytes = (a, b) => fs.existsSync(a) && fs.existsSync(b) && fs.readFileSync(a).equals(fs.readFileSync(b));
const unixEol = (text) => text.replace(/\r\n/g, '\n');
const eolOf = (text) => (text.includes('\r\n') ? '\r\n' : '\n');
const readIfExists = (file) => (fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '');

function parseArgs(argv) {
  const options = { check: false, build: false, fromCi: undefined };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--check') options.check = true;
    else if (argv[i] === '--build') options.build = true;
    else if (argv[i] === '--from-ci') options.fromCi = argv[++i];
    else fail(`Argumento desconocido: ${argv[i]}`);
  }
  if (options.fromCi !== undefined && !/^\d+$/.test(options.fromCi)) {
    fail('--from-ci espera el id de una ejecución de ci-boost.yml (gh run list --workflow ci-boost.yml)');
  }
  if (options.build && (options.check || options.fromCi)) {
    fail('--build no se combina con --check ni con --from-ci');
  }
  return options;
}

// --- Nodos de boost: settings.gradle.kts y stonecutter.properties.toml ------------------------------

// Solo lo que este script lee del TOML: la sección raíz (header null) o una sección ["<grupo>"]
function tomlSection(toml, header) {
  const lines = unixEol(toml).split('\n');
  const start = header === null ? -1 : lines.findIndex((line) => line.trim() === header);
  if (header !== null && start < 0) fail(`stonecutter.properties.toml no tiene la sección ${header}`);
  const end = lines.findIndex((line, i) => i > start && line.trimStart().startsWith('['));
  return lines.slice(start + 1, end < 0 ? undefined : end).join('\n');
}

// Valores con un string o una lista de strings, que en TOML se escriben igual que en JSON
function tomlValue(section, key, where) {
  const match = section.match(new RegExp(`^${key.replaceAll('.', '\\.')}\\s*=\\s*([^#\\n]+)`, 'm'));
  if (!match) fail(`stonecutter.properties.toml no define ${key} en ${where}`);
  try {
    return JSON.parse(match[1].trim());
  } catch {
    return fail(`stonecutter.properties.toml: valor de ${key} en ${where} no reconocido (${match[1].trim()})`);
  }
}

// Grupos de versiones con sus loaders, de match("1.21.1", "fabric", "neoforge") en settings.gradle.kts
function readBoostLayout() {
  const settings = fs.readFileSync(path.join(boostDir, 'settings.gradle.kts'), 'utf8');
  const toml = fs.readFileSync(path.join(boostDir, 'stonecutter.properties.toml'), 'utf8');
  const version = tomlValue(tomlSection(toml, null), 'mod.version', 'la sección raíz');
  if (typeof version !== 'string') fail('mod.version de stonecutter.properties.toml tiene que ser un string');

  const nodes = [...settings.matchAll(/^\s*match\(\s*"([^"]+)"((?:\s*,\s*"[^"]+")+)\s*\)/gm)];
  if (nodes.length === 0) fail('settings.gradle.kts de crystaltides-boost no declara grupos con match(...)');
  const groups = nodes.map(([, group, loaders]) => {
    const where = `["${group}"]`;
    const mcReleases = tomlValue(tomlSection(toml, where), 'mod.mc_releases', where);
    if (!Array.isArray(mcReleases) || mcReleases.length === 0 || !mcReleases.every((mc) => typeof mc === 'string')) {
      fail(`mod.mc_releases de ${where} tiene que ser una lista de versiones de Minecraft`);
    }
    return { group, loaders: [...loaders.matchAll(/"([^"]+)"/g)].map((m) => m[1]), mcReleases };
  });
  return { version, groups };
}

// Sin la versión del mod en el nombre: una versión nueva sustituye a los mismos archivos
function boostJarSpecs({ version, groups }) {
  return groups.flatMap(({ group, loaders, mcReleases }) =>
    loaders.map((loader) => {
      if (!LOADER_LABEL[loader]) {
        fail(`Loader ${loader} sin soporte en el launcher: añádelo aquí y en boost_jar_for (agent.rs)`);
      }
      return {
        group,
        loader,
        mcReleases,
        file: `boost/crystaltides-boost-${loader}-${group}.jar`,
        builtName: `crystaltides-boost-${loader}-${group}-${version}.jar`,
      };
    }),
  );
}

// --- Origen de los jars de boost ------------------------------------------------------------------

// build/libs de cada nodo (versions/<grupo>-<loader>) en este checkout
function localSources(specs) {
  return new Map(
    specs.map((spec) => {
      const built = path.join(boostDir, 'versions', `${spec.group}-${spec.loader}`, 'build', 'libs', spec.builtName);
      return [spec.file, { path: built, label: path.relative(root, built) }];
    }),
  );
}

function githubRepo() {
  const url = execFileSync('git', ['-C', root, 'remote', 'get-url', 'origin'], { encoding: 'utf8' }).trim();
  const match = url.match(/github\.com[:/]([^/]+\/[^/]+?)(?:\.git)?$/);
  if (!match) fail(`El remoto origin (${url}) no es un repositorio de GitHub`);
  return match[1];
}

// De los fuentes del mod de este checkout salen los grupos, sus versiones de Minecraft y la versión del mod:
// los jars de la ejecución tienen que salir de los mismos. La documentación y los comprobadores del CI
// (tools/) no entran en los jars y pueden diferir
function requireSameModSources(sha) {
  const git = (...args) => execFileSync('git', ['-C', root, ...args], { stdio: 'ignore' });
  try {
    git('cat-file', '-e', `${sha}^{commit}`);
  } catch {
    fail(`El commit ${sha.slice(0, 8)} de la ejecución no está en este checkout (git fetch)`);
  }
  const notInJars = [':(exclude)mods/crystaltides-boost/*.md', ':(exclude)mods/crystaltides-boost/tools'];
  try {
    git('diff', '--quiet', sha, '--', 'mods/crystaltides-boost', ...notInJars);
  } catch {
    fail(`mods/crystaltides-boost difiere entre este checkout y el commit ${sha.slice(0, 8)} de la ejecución`);
  }
}

function listFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? listFiles(full) : [full];
  });
}

// Artifacts de una ejecución en verde de ci-boost.yml, descargados en un directorio nuevo que se borra al salir
function ciSources(runId, specs) {
  const repo = githubRepo();
  const gh = (...args) => execFileSync('gh', [...args, '--repo', repo], { encoding: 'utf8' });
  const run = JSON.parse(gh('run', 'view', runId, '--json', 'workflowName,conclusion,headSha,headBranch,url'));
  if (run.workflowName !== CI_WORKFLOW) {
    fail(`La ejecución ${runId} es de "${run.workflowName}", no de "${CI_WORKFLOW}"`);
  }
  if (run.conclusion !== 'success') {
    fail(`La ejecución ${runId} no está en verde (${run.conclusion || 'en curso'}): solo se embeben jars de un CI en verde`);
  }
  requireSameModSources(run.headSha);

  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ct-boost-ci-'));
  process.on('exit', () => fs.rmSync(dir, { recursive: true, force: true }));
  console.log(`▶ Descargando los jars de ${run.url} (${run.headBranch} @ ${run.headSha.slice(0, 8)})...`);
  gh('run', 'download', runId, '--pattern', 'crystaltides-boost-*', '--dir', dir);

  const byName = Map.groupBy(listFiles(dir), (file) => path.basename(file));
  return new Map(
    specs.map((spec) => {
      const copies = byName.get(spec.builtName) ?? [];
      if (copies.length !== 1) {
        fail(`La ejecución ${runId} tiene ${copies.length} copias de ${spec.builtName}; se esperaba una`);
      }
      return [spec.file, { path: copies[0], label: `la ejecución ${runId} del CI` }];
    }),
  );
}

function buildLocally(specs) {
  // Ruta absoluta: con NoDefaultCurrentDirectoryInExePath, cmd no busca ejecutables en el cwd
  const gradlew = path.join(boostDir, process.platform === 'win32' ? 'gradlew.bat' : 'gradlew');
  const tasks = specs.map((spec) => `:${spec.group}-${spec.loader}:build`);
  // Los nodos de NeoForge decompilan Minecraft uno a uno (neoforge-mutex), con varios GB de heap cada uno
  console.log(`▶ Compilando los ${tasks.length} nodos de crystaltides-boost (Gradle)...`);
  execSync(`"${gradlew}" ${tasks.join(' ')} --console=plain`, { cwd: boostDir, stdio: 'inherit' });
  console.log('▶ Compilando game-bridge...');
  // build:java y copia propia: el script "build" del paquete copia a una ruta fija del submódulo
  // y no respetaría LAUNCHER_LITE_DIR
  execSync('pnpm --filter @crystaltides/game-bridge run build:java', { cwd: root, stdio: 'inherit' });
  const agentJar = path.join(gameBridgeDir, 'java-agent', 'target', 'game-bridge-1.0-SNAPSHOT.jar');
  if (!fs.existsSync(agentJar)) fail(`No se generó ${path.relative(root, agentJar)}`);
  fs.copyFileSync(agentJar, path.join(assetsDir, 'game-bridge.jar'));
}

// --- Estado final de assets/, MANIFEST.md, agent.rs y boost_jars.rs ---------------------------------

// Jars de boost en assets/ que no son de ningún nodo: los de un grupo retirado y los de un solo grupo
// (assets/crystaltides-boost-fabric.jar y -neoforge.jar)
function staleBoostAssets(specs) {
  const expected = new Set(specs.map((spec) => spec.file));
  const boostAssetsDir = path.join(assetsDir, 'boost');
  const inBoostDir = fs.existsSync(boostAssetsDir) ? fs.readdirSync(boostAssetsDir).map((name) => `boost/${name}`) : [];
  return [...inBoostDir, ...fs.readdirSync(assetsDir)].filter((file) => isBoostAsset(file) && !expected.has(file));
}

// Qué copiar o retirar en assets/ y el hash final de cada jar. En --check sin jars compilados el hash es el
// del asset actual: solo se comprueba que MANIFEST.md y boost_jars.rs estén al día con él
function planBoostJars(specs, sources) {
  const plan = { copies: [], removals: [], replaced: [], missing: [], hashes: new Map() };
  for (const spec of specs) {
    const target = path.join(assetsDir, spec.file);
    const source = sources.get(spec.file);
    const built = fs.existsSync(source.path);
    if (built && !sameBytes(source.path, target)) {
      plan.copies.push({ ...source, file: spec.file, target });
      if (fs.existsSync(target)) plan.replaced.push({ file: spec.file, hash: sha256(target) });
    }
    const final = built ? source.path : target;
    if (fs.existsSync(final)) plan.hashes.set(spec.file, sha256(final));
    else plan.missing.push(spec.file);
  }
  for (const file of staleBoostAssets(specs)) {
    plan.removals.push(file);
    plan.replaced.push({ file, hash: sha256(path.join(assetsDir, file)) });
  }
  return plan;
}

function boostJarsRs(specs, hashes, version) {
  const entries = specs.flatMap((spec) => [
    '    BoostJar {',
    `        loader: "${spec.loader}",`,
    `        mc_releases: &[${spec.mcReleases.map((mc) => `"${mc}"`).join(', ')}],`,
    `        file_name: "${path.posix.basename(spec.file)}",`,
    `        sha256: "${hashes.get(spec.file)}",`,
    `        bytes: include_bytes!("../assets/${spec.file}"),`,
    '    },',
  ]);
  return [
    '// @generated por scripts/sync-launcher-assets.mjs (monorepo CrystalTides) a partir de',
    '// mods/crystaltides-boost y de assets/boost: no editar a mano.',
    '',
    '//! Jars de CrystalTides Boost embebidos: uno por grupo de versiones de Minecraft (nodo Stonecutter)',
    '//! y loader. Quilt usa los de Fabric.',
    '',
    '/// Versión de CrystalTides Boost de los jars embebidos.',
    `pub const BOOST_VERSION: &str = "${version}";`,
    '',
    '/// Jar de CrystalTides Boost para un grupo de versiones de Minecraft y un loader.',
    'pub struct BoostJar {',
    '    /// "fabric" o "neoforge".',
    "    pub loader: &'static str,",
    '    /// Versiones exactas de Minecraft que cubre (mod.mc_releases).',
    "    pub mc_releases: &'static [&'static str],",
    '    /// Nombre del archivo en assets/boost: crystaltides-boost-<loader>-<grupo>.jar, donde el grupo',
    '    /// es la última versión de Minecraft que cubre.',
    "    pub file_name: &'static str,",
    '    /// SHA-256 de `bytes`, también fijado en assets/MANIFEST.md.',
    "    pub sha256: &'static str,",
    "    pub bytes: &'static [u8],",
    '}',
    '',
    'pub const BOOST_JARS: &[BoostJar] = &[',
    ...entries,
    '];',
    '',
  ].join('\n');
}

function boostManifestRows(specs, hashes, version) {
  return specs.map(
    (spec) =>
      `| \`${spec.file}\` | ${LOADER_LABEL[spec.loader]} · Minecraft ${spec.mcReleases.join(', ')} | ` +
      `CrystalTides Boost ${version} | \`${hashes.get(spec.file)}\` |`,
  );
}

// Las filas de boost van al principio de la tabla, en el orden de settings.gradle.kts
function withBoostRows(manifest, rows) {
  const lines = unixEol(manifest)
    .split('\n')
    .filter((line) => !isBoostAsset(line.match(ROW)?.[1] ?? ''));
  const separator = lines.findIndex((line) => /^\|\s*:?-{3,}/.test(line));
  if (separator < 0) fail('MANIFEST.md no tiene la tabla de binarios');
  lines.splice(separator + 1, 0, ...rows);
  return lines.join(eolOf(manifest));
}

// game-bridge.jar y ct-agent.dll: su hash está en MANIFEST.md y, una vez, en las aserciones de agent.rs
function reconcileOtherHashes(manifest, agentRs, check) {
  const result = { manifest, agentRs, problems: [], changes: [] };
  const rows = unixEol(manifest).split('\n').map((line) => line.match(ROW)).filter(Boolean);
  for (const [, file, recorded] of rows.filter(([, file]) => !isBoostAsset(file))) {
    const assetPath = path.join(assetsDir, file);
    if (!fs.existsSync(assetPath)) {
      result.problems.push(`MANIFEST.md lista ${file} pero no existe en assets/`);
      continue;
    }
    const actual = sha256(assetPath);
    if (actual === recorded) continue;
    if (check) {
      result.problems.push(`${file}: MANIFEST.md tiene ${recorded.slice(0, 12)}… pero el archivo es ${actual.slice(0, 12)}…`);
      continue;
    }
    const occurrences = result.agentRs.split(recorded).length - 1;
    if (occurrences !== 1) {
      fail(`agent.rs debería contener el hash de ${file} (${recorded.slice(0, 12)}…) exactamente una vez; tiene ${occurrences}`);
    }
    result.manifest = result.manifest.replace(`\`${recorded}\``, `\`${actual}\``);
    result.agentRs = result.agentRs.replace(recorded, actual);
    result.changes.push(`${file}: ${recorded.slice(0, 12)}… -> ${actual.slice(0, 12)}…`);
  }
  return result;
}

function withLegacyHashes(agentRs, replaced, embedded) {
  const date = new Date().toISOString().slice(0, 10);
  let result = agentRs;
  for (const { file, hash } of replaced) {
    if (embedded.has(hash) || result.includes(`"${hash}"`)) continue;
    if (!LEGACY_BLOCK.test(result)) fail('No se encontró LEGACY_BOOST_JAR_SHA256 en agent.rs');
    result = result.replace(
      LEGACY_BLOCK,
      (_, open, body, close) => `${open}${body}${eolOf(agentRs)}    "${hash}", // ${file} previo (sync ${date})${close}`,
    );
  }
  return result;
}

// Contenido final de los archivos de texto; solo se listan los que cambian
function nextTextFiles(specs, plan, version, agentRs, check) {
  const manifest = fs.readFileSync(manifestPath, 'utf8');
  const generated = readIfExists(boostJarsRsPath);
  const complete = plan.missing.length === 0;
  const withBoost = complete ? withBoostRows(manifest, boostManifestRows(specs, plan.hashes, version)) : manifest;
  const others = reconcileOtherHashes(withBoost, agentRs, check);
  const files = [
    { path: manifestPath, label: 'assets/MANIFEST.md', before: manifest, after: others.manifest },
    {
      path: agentRsPath,
      label: 'src/agent.rs',
      before: agentRs,
      after: withLegacyHashes(others.agentRs, plan.replaced, new Set(plan.hashes.values())),
    },
    {
      path: boostJarsRsPath,
      label: 'src/boost_jars.rs',
      before: generated,
      after: complete ? boostJarsRs(specs, plan.hashes, version) : generated,
    },
  ];
  return {
    problems: others.problems,
    changes: others.changes,
    files: files.filter((file) => unixEol(file.before) !== unixEol(file.after)),
  };
}

function reportCheck(plan, next) {
  const problems = [
    ...plan.missing.map((file) => `falta assets/${file}`),
    ...plan.copies.map((copy) => `assets/${copy.file} difiere de ${copy.label}`),
    ...plan.removals.map((file) => `assets/${file} no es de ningún nodo de boost`),
    ...next.problems,
    ...next.files.map((file) => `${file.label} no está al día`),
  ];
  if (problems.length > 0) {
    problems.forEach((problem) => console.error(`✖ ${problem}`));
    console.error('Ejecuta: node scripts/sync-launcher-assets.mjs [--from-ci <id>]');
    process.exit(1);
  }
  console.log('✓ Assets embebidos, MANIFEST.md, agent.rs y boost_jars.rs sincronizados');
}

function apply(plan, next) {
  if (next.problems.length > 0) {
    next.problems.forEach((problem) => console.error(`✖ ${problem}`));
    process.exit(1);
  }
  const changes = [...next.changes];
  for (const copy of plan.copies) {
    fs.mkdirSync(path.dirname(copy.target), { recursive: true });
    fs.copyFileSync(copy.path, copy.target);
    changes.push(`copiado assets/${copy.file} (${copy.label})`);
  }
  for (const file of plan.removals) {
    fs.rmSync(path.join(assetsDir, file));
    changes.push(`retirado assets/${file}`);
  }
  for (const file of next.files) {
    // Conserva los finales de línea del archivo (CRLF con core.autocrlf en Windows)
    fs.writeFileSync(file.path, file.before ? file.after.replace(/\r?\n/g, eolOf(file.before)) : file.after);
    changes.push(`actualizado ${file.label}`);
  }
  if (changes.length === 0) {
    console.log('✓ Sin cambios: assets, MANIFEST.md, agent.rs y boost_jars.rs ya estaban sincronizados');
    return;
  }
  changes.forEach((change) => console.log(`✓ ${change}`));
  console.log('\nVerifica con: cargo test --manifest-path src-tauri/Cargo.toml agent::tests');
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const layout = readBoostLayout();
  const specs = boostJarSpecs(layout);
  const agentRs = fs.readFileSync(agentRsPath, 'utf8');
  if (!agentRs.includes('BOOST_JARS')) {
    fail('agent.rs no usa src/boost_jars.rs: esta copia de launcher-lite es anterior al despliegue por versión de Minecraft');
  }

  if (options.build) buildLocally(specs);
  const sources = options.fromCi ? ciSources(options.fromCi, specs) : localSources(specs);
  const notBuilt = [...sources.values()].filter((source) => !fs.existsSync(source.path));
  if (!options.check && notBuilt.length > 0) {
    fail(`Faltan ${notBuilt.length} jars de boost compilados (p. ej. ${notBuilt[0].label}): usa --from-ci <id> o --build`);
  }

  const plan = planBoostJars(specs, sources);
  const next = nextTextFiles(specs, plan, layout.version, agentRs, options.check);
  if (options.check) reportCheck(plan, next);
  else apply(plan, next);
}

main();
