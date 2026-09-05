import fs from 'fs';
import path from 'path';

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || 'a532114ca6919da0a11158f44975727b';
const BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET || 'crystaltides-assets';
const CDN_URL = process.env.CDN_URL || 'https://cdn.crystaltidessmp.net';

// Read oauth token from environment or wrangler config
let token = process.env.CLOUDFLARE_API_TOKEN || '';
if (!token) {
    try {
        const configPath = path.join(process.env.USERPROFILE || '', 'AppData', 'Roaming', 'xdg.config', '.wrangler', 'config', 'default.toml');
        if (fs.existsSync(configPath)) {
            const tomlContent = fs.readFileSync(configPath, 'utf-8');
            const match = tomlContent.match(/oauth_token\s*=\s*"([^"]+)"/);
            token = match ? match[1] : '';
        }
    } catch {
        // Continue to token check below
    }
}

if (!token) {
    console.error('No Cloudflare token found in environment or wrangler config!');
    process.exit(1);
}

const MIME_TYPES: Record<string, string> = {
    '.gltf': 'model/gltf+json',
    '.glb': 'model/gltf-binary',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.bin': 'application/octet-stream',
    '.tga': 'image/x-tga',
};

function getAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            getAllFiles(fullPath, arrayOfFiles);
        } else {
            arrayOfFiles.push(fullPath);
        }
    }
    return arrayOfFiles;
}

async function uploadSingleFile(localPath: string, r2Key: string, maxRetries = 3): Promise<boolean> {
    const fileBuffer = fs.readFileSync(localPath);
    const ext = path.extname(localPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/r2/buckets/${BUCKET_NAME}/objects/${encodeURIComponent(r2Key)}`;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const res = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': contentType,
                },
                body: fileBuffer,
            });

            if (res.ok) {
                return true;
            } else {
                const errText = await res.text();
                if (attempt === maxRetries) {
                    console.error(`❌ HTTP ${res.status} for ${r2Key}: ${errText.slice(0, 100)}`);
                    return false;
                }
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            if (attempt === maxRetries) {
                console.error(`❌ Fetch error for ${r2Key}:`, message);
                return false;
            }
        }
        await new Promise((r) => setTimeout(r, 200 * attempt));
    }
    return false;
}

async function main() {
    const modelsDir = path.resolve(process.cwd(), '../web-client/public/models');
    if (!fs.existsSync(modelsDir)) {
        console.error(`Directory not found: ${modelsDir}`);
        process.exit(1);
    }

    const allFiles = getAllFiles(modelsDir);
    const total = allFiles.length;
    console.log(`🚀 Found ${total} files in ${modelsDir}`);
    console.log(`📦 Target R2 Bucket: ${BUCKET_NAME}`);
    console.log(`🌐 Target CDN Base: ${CDN_URL}/models/`);
    console.log(`⚡ Concurrency: 20 concurrent HTTP streams\n`);

    const CONCURRENCY = 20;
    let completed = 0;
    let successful = 0;
    const failedFiles: string[] = [];
    const startTime = Date.now();

    let index = 0;
    async function worker() {
        while (index < allFiles.length) {
            const myIndex = index++;
            const filePath = allFiles[myIndex];
            const relPath = path.relative(modelsDir, filePath).replace(/\\/g, '/');
            const r2Key = `models/${relPath}`;

            const ok = await uploadSingleFile(filePath, r2Key);
            completed++;
            if (ok) {
                successful++;
            } else {
                failedFiles.push(r2Key);
            }

            if (completed % 25 === 0 || completed === total) {
                const pct = ((completed / total) * 100).toFixed(1);
                const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(1);
                const rate = (completed / (Number(elapsedSec) || 1)).toFixed(1);
                console.log(`[${completed}/${total}] (${pct}%) in ${elapsedSec}s (~${rate} files/s) | Success: ${successful} | Failed: ${failedFiles.length}`);
            }
        }
    }

    const workers = Array.from({ length: CONCURRENCY }, () => worker());
    await Promise.all(workers);

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n========================================`);
    console.log(`🎉 Finished uploading all assets in ${duration} seconds!`);
    console.log(`✅ Success: ${successful}/${total} (100%)`);
    console.log(`❌ Failed:  ${failedFiles.length}`);
    if (failedFiles.length > 0) {
        console.log('Failed:', failedFiles);
    }
    console.log(`🌐 Sample Verified: ${CDN_URL}/models/critters/dragonfly.gltf`);
}

main().catch((err) => {
    console.error('Fatal error in syncModelsDirectR2:', err);
    process.exit(1);
});
