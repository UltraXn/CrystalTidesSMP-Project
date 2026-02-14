import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';


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

    const key = file.originalname; // Mantener nombre original para mods (o usar UUID si prefieres unicidad)
    
    // Si queremos evitar colisiones podríamos usar: 
    // const fileExtension = path.extname(file.originalname);
    // const key = `${path.basename(file.originalname, fileExtension)}-${randomUUID().split('-')[0]}${fileExtension}`;

    const command = new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        // ACL: 'public-read' // R2 buckets are usually private/public via domain, ACL not needed for R2
    });

    try {
        await s3Client.send(command);
        // Retornar la URL pública
        return `${PUBLIC_URL_BASE}/${key}`; // Ajustar si R2_PUBLIC_URL termina en /
    } catch (error) {
        console.error("R2 Upload Error:", error);
        throw new Error("Failed to upload file to R2.");
    }
};
