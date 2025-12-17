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

    async function processDirectory(directory) {
        const entries = fs.readdirSync(directory, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(directory, entry.name);

            if (entry.isDirectory()) {
                await processDirectory(fullPath);
            } else if (entry.isFile() && entry.name.match(/\.(png|jpg|jpeg)$/i)) {
                
                const stats = fs.statSync(fullPath);
                
                // Solo optimizar si pesa más de 300KB
                if (stats.size < 300 * 1024) {
                    console.log(`⏩ Saltando ${entry.name} (Ya es ligero: ${(stats.size / 1024).toFixed(2)} KB)`);
                    continue;
                }

                const fileNameWithoutExt = path.parse(entry.name).name;
                const outputPath = path.join(directory, `${fileNameWithoutExt}.webp`);

                // Check if webp already exists and is smaller/recent? 
                // For now, let's just generate it if it overrides or is new.
                
                console.log(`🔨 Optimizando ${entry.name} (${(stats.size / 1024 / 1024).toFixed(2)} MB)...`);

                try {
                    await sharp(fullPath)
                        .resize(MAX_WIDTH, null, { 
                            withoutEnlargement: true
                        })
                        .webp({ quality: QUALITY })
                        .toFile(outputPath);

                    const newStats = fs.statSync(outputPath);
                    const savings = ((stats.size - newStats.size) / 1024 / 1024).toFixed(2);

                    console.log(`✅ Generado ${fileNameWithoutExt}.webp (${(newStats.size / 1024).toFixed(2)} KB) - Ahorro: ${savings} MB`);

                } catch (err) {
                    console.error(`❌ Error con ${entry.name}:`, err.message);
                }
            }
        }
    }

    await processDirectory(PUBLIC_DIR);

    console.log('✨ Optimización completada.');
}

optimizeImages();
