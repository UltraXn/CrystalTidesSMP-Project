import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import path from 'path';


const R2_ENDPOINT = process.env.R2_ENDPOINT || '';
const R2_ACCESS_KEY = process.env.R2_ACCESS_KEY || '';
const R2_SECRET_KEY = process.env.R2_SECRET_KEY || '';
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'crystaltides-mods';
const PUBLIC_URL_BASE = process.env.R2_PUBLIC_URL || 'https://mods.crystaltidessmp.net';

const s3Client = new S3Client({
    region: 'auto',
    endpoint: R2_ENDPOINT,
    credentials: {
        accessKeyId: R2_ACCESS_KEY,
        secretAccessKey: R2_SECRET_KEY,
    },
});

export const uploadFile = async (file: Express.Multer.File): Promise<string> => {
    if (!R2_ENDPOINT || !R2_ACCESS_KEY || !R2_SECRET_KEY) {
        throw new Error("R2 Credentials missing in server environment.");
    }

    const fileExtension = path.extname(file.originalname).toLowerCase();
    const baseName = path.basename(file.originalname, fileExtension)
        .replace(/[^a-z0-9]/gi, '_')
        .toLowerCase();
    
    // Uniqueness: Append short timestamp (base36)
    const shortHash = Date.now().toString(36);
    const key = `${baseName}-${shortHash}${fileExtension}`;

    const command = new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
    });

    try {
        await s3Client.send(command);
        const cleanBaseUrl = PUBLIC_URL_BASE.endsWith('/') ? PUBLIC_URL_BASE.slice(0, -1) : PUBLIC_URL_BASE;
        return `${cleanBaseUrl}/${key}`;
    } catch (error) {
        console.error("R2 Upload Error:", error);
        throw new Error("Failed to upload file to R2.");
    }
};
