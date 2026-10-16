#!/usr/bin/env node
/**
 * Sincroniza los binarios que launcher-lite embebe con include_bytes! (src-tauri/assets) y
 * sus SHA-256 fijados en assets/MANIFEST.md y en agent.rs.
 *
 *   node scripts/sync-launcher-assets.mjs           copia los jars de boost ya compilados y reconcilia hashes
 *   node scripts/sync-launcher-assets.mjs --build   compila antes boost (Gradle) y game-bridge (que copia su jar)
 *   node scripts/sync-launcher-assets.mjs --check   no escribe nada; exit 1 si algo está desincronizado
 *
 * Al cambiar un crystaltides-boost-*.jar, su hash anterior se añade a LEGACY_BOOST_JAR_SHA256
 * para que remove_crystaltides_boost siga reconociendo las copias ya desplegadas.
 * Los jars son reproducibles, así que recompilar sin cambios no produce diferencias.
 */
import { execSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const boostDir = path.join(root, 'mods', 'crystaltides-boost');
const liteTauri = path.join(root, 'apps', 'launcher-lite', 'src-tauri');
const assetsDir = path.join(liteTauri, 'assets');
const manifestPath = path.join(assetsDir, 'MANIFEST.md');
const agentRsPath = path.join(liteTauri, 'src', 'agent.rs');

const BOOST_JARS = [
  { asset: 'crystaltides-boost-fabric.jar', built: path.join(boostDir, 'fabric', 'build', 'libs', 'crystaltides-boost-fabric-1.21.1-1.0.0.jar') },
  { asset: 'crystaltides-boost-neoforge.jar', built: path.join(boostDir, 'neoforge', 'build', 'libs', 'crystaltides-boost-neoforge-1.21.1-1.0.0.jar') },
];

const args = new Set(process.argv.slice(2));
const checkOnly = args.has('--check');
const build = args.has('--build');
if (checkOnly && build) {
  fail('--check y --build son excluyentes');
}

function fail(message) {
  console.error(`✖ ${message}`);
  process.exit(1);
}

const sha256 = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const sameBytes = (a, b) => fs.existsSync(a) && fs.existsSync(b) && fs.readFileSync(a).equals(fs.readFileSync(b));

if (build) {
  // Ruta absoluta: con NoDefaultCurrentDirectoryInExePath, cmd no busca ejecutables en el cwd
  const gradlew = path.join(boostDir, process.platform === 'win32' ? 'gradlew.bat' : 'gradlew');
  console.log('▶ Compilando crystaltides-boost (Gradle)...');
  execSync(`"${gradlew}" build --console=plain`, { cwd: boostDir, stdio: 'inherit' });
  console.log('▶ Compilando game-bridge (copia game-bridge.jar a assets)...');
  execSync('pnpm --filter @crystaltides/game-bridge build', { cwd: root, stdio: 'inherit' });
}

const problems = [];
const changes = [];

// 1. Jars de boost: build/libs -> assets
for (const { asset, built } of BOOST_JARS) {
  const target = path.join(assetsDir, asset);
  if (!fs.existsSync(built)) {
    if (!checkOnly) fail(`No existe ${path.relative(root, built)}; ejecuta con --build o compila boost primero`);
    continue; // en --check sin build local solo se valida assets <-> hashes
  }
  if (sameBytes(built, target)) continue;
  if (checkOnly) {
    problems.push(`${asset} difiere del build en ${path.relative(root, built)}`);
  } else {
    fs.copyFileSync(built, target);
    changes.push(`copiado ${asset}`);
  }
}

// 2. Hashes: bytes de assets -> MANIFEST.md y agent.rs
let manifest = fs.readFileSync(manifestPath, 'utf8');
let agentRs = fs.readFileSync(agentRsPath, 'utf8');
const eol = agentRs.includes('\r\n') ? '\r\n' : '\n';

const rowRegex = /^\| `([^`]+)` \|.*\| `([0-9a-f]{64})` \|\s*$/gm;
const rows = [...manifest.matchAll(rowRegex)].map((m) => ({ file: m[1], hash: m[2] }));
if (rows.length === 0) fail('MANIFEST.md no tiene filas con checksum reconocibles');

const legacyBlock = /(const LEGACY_BOOST_JAR_SHA256: &\[&str\] = &\[)([\s\S]*?)(\r?\n\];)/;

for (const { file, hash: recorded } of rows) {
  const assetPath = path.join(assetsDir, file);
  if (!fs.existsSync(assetPath)) {
    problems.push(`MANIFEST.md lista ${file} pero no existe en assets/`);
    continue;
  }
  const actual = sha256(assetPath);
  if (actual === recorded) continue;

  if (checkOnly) {
    problems.push(`${file}: MANIFEST.md tiene ${recorded.slice(0, 12)}… pero el archivo es ${actual.slice(0, 12)}…`);
    continue;
  }

  const occurrences = agentRs.split(recorded).length - 1;
  if (occurrences !== 1) {
    fail(`agent.rs debería contener el hash de ${file} (${recorded.slice(0, 12)}…) exactamente una vez; tiene ${occurrences}`);
  }
  manifest = manifest.replace(`\`${recorded}\``, `\`${actual}\``);
  agentRs = agentRs.replace(recorded, actual);

  if (file.startsWith('crystaltides-boost-') && !agentRs.includes(`"${recorded}"`)) {
    const match = agentRs.match(legacyBlock);
    if (!match) fail('No se encontró LEGACY_BOOST_JAR_SHA256 en agent.rs');
    const date = new Date().toISOString().slice(0, 10);
    const entry = `${eol}    "${recorded}", // ${file} previo (sync ${date})`;
    agentRs = agentRs.replace(legacyBlock, `$1$2${entry}$3`);
  }
  changes.push(`${file}: ${recorded.slice(0, 12)}… -> ${actual.slice(0, 12)}…`);
}

if (checkOnly) {
  if (problems.length > 0) {
    problems.forEach((p) => console.error(`✖ ${p}`));
    console.error('Ejecuta: node scripts/sync-launcher-assets.mjs');
    process.exit(1);
  }
  console.log('✓ Assets embebidos, MANIFEST.md y agent.rs sincronizados');
  process.exit(0);
}

if (problems.length > 0) {
  problems.forEach((p) => console.error(`✖ ${p}`));
  process.exit(1);
}

if (changes.length === 0) {
  console.log('✓ Sin cambios: assets, MANIFEST.md y agent.rs ya estaban sincronizados');
} else {
  fs.writeFileSync(manifestPath, manifest);
  fs.writeFileSync(agentRsPath, agentRs);
  changes.forEach((c) => console.log(`✓ ${c}`));
  console.log('\nVerifica con: cargo test -p launcher-lite-tauri test_embedded_assets');
}
