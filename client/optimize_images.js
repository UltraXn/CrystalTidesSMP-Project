import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.join(__dirname, 'public');
const MAX_WIDTH = 1920; // Full HD es suficiente
const QUALITY = 80; // Buena calidad, buen peso

async function optimizeImages() {
    console.log('🚀 Iniciando optimización de imágenes...');

    if (!fs.existsSync(PUBLIC_DIR)) {
        console.error('❌ Directorio public/ no encontrado.');
        return;
    }

    const files = fs.readdirSync(PUBLIC_DIR);

    for (const file of files) {
        if (!file.match(/\.(png|jpg|jpeg)$/i)) continue;

        const inputPath = path.join(PUBLIC_DIR, file);
        const stats = fs.statSync(inputPath);

        // Solo optimizar si pesa más de 300KB
        if (stats.size < 300 * 1024) {
            console.log(`⏩ Saltando ${file} (Ya es ligero: ${(stats.size / 1024).toFixed(2)} KB)`);
            continue;
        }

        const fileNameWithoutExt = path.parse(file).name;
        const outputPath = path.join(PUBLIC_DIR, `${fileNameWithoutExt}.webp`);

        console.log(`🔨 Optimizando ${file} (${(stats.size / 1024 / 1024).toFixed(2)} MB)...`);

        try {
            await sharp(inputPath)
                .resize(MAX_WIDTH, null, { // Resize width to 1920, maintain aspect ratio
                    withoutEnlargement: true
                })
                .webp({ quality: QUALITY })
                .toFile(outputPath);

            const newStats = fs.statSync(outputPath);
            const savings = ((stats.size - newStats.size) / 1024 / 1024).toFixed(2);

            console.log(`✅ Generado ${fileNameWithoutExt}.webp (${(newStats.size / 1024).toFixed(2)} KB) - Ahorro: ${savings} MB`);

        } catch (err) {
            console.error(`❌ Error con ${file}:`, err.message);
        }
    }

    console.log('✨ Optimización completada.');
}

optimizeImages();
