import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MODELS_DIR = path.resolve(__dirname, "../public/models");
const OUTPUT_FILE = path.resolve(
  __dirname,
  "../src/config/models-manifest.json",
);

interface ModelAssetMeta {
  id: string;
  relativePath: string;
  sizeBytes: number;
  sha256: string;
  extension: string;
  category: string;
}

interface ModelsManifest {
  version: string;
  generatedAt: string;
  totalAssets: number;
  totalSizeBytes: number;
  assets: Record<string, ModelAssetMeta>;
}

function calculateSha256(filePath: string): string {
  const fileBuffer = fs.readFileSync(filePath);
  return crypto.createHash("sha256").update(fileBuffer).digest("hex");
}

function scanDirectory(dir: string, baseDir: string): ModelAssetMeta[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const results: ModelAssetMeta[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...scanDirectory(fullPath, baseDir));
    } else if (entry.isFile()) {
      const relPath = path.relative(baseDir, fullPath).replace(/\\/g, "/");
      const ext = path.extname(entry.name).toLowerCase();
      const parts = relPath.split("/");
      const category = parts.length > 1 ? parts[0] : "root";
      const id = relPath
        .replace(/\.[^/.]+$/, "")
        .replace(/[^a-zA-Z0-9_-]/g, "_");

      const stats = fs.statSync(fullPath);
      results.push({
        id,
        relativePath: relPath,
        sizeBytes: stats.size,
        sha256: calculateSha256(fullPath),
        extension: ext,
        category,
      });
    }
  }

  return results;
}

export function generateManifest(): void {
  if (!fs.existsSync(MODELS_DIR)) {
    console.warn(`[models-manifest] Directory not found: ${MODELS_DIR}`);
    return;
  }

  const assetsList = scanDirectory(MODELS_DIR, MODELS_DIR);
  const assetsMap: Record<string, ModelAssetMeta> = {};
  let totalSize = 0;

  for (const asset of assetsList) {
    assetsMap[asset.relativePath] = asset;
    totalSize += asset.sizeBytes;
  }

  const manifest: ModelsManifest = {
    version: "1.0.0",
    generatedAt: new Date().toISOString(),
    totalAssets: assetsList.length,
    totalSizeBytes: totalSize,
    assets: assetsMap,
  };

  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(manifest, null, 2), "utf-8");
  console.log(
    `[models-manifest] Generated ${assetsList.length} assets (${(totalSize / 1024 / 1024).toFixed(2)} MB) -> ${OUTPUT_FILE}`,
  );
}

generateManifest();
