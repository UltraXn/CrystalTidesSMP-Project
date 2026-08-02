import { Request, Response } from 'express';
import { uploadFile } from '../services/r2Service.js';

export const uploadMod = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded." });
        }

        // Magic-byte validation (defense in depth): a .jar is a ZIP archive and
        // MUST start with a PK signature. The multer fileFilter only checks the
        // client-declared mimetype/extension, which is spoofable.
        const b = req.file.buffer;
        const isZip =
            b.length > 4 &&
            b[0] === 0x50 && // 'P'
            b[1] === 0x4b && // 'K'
            ((b[2] === 0x03 && b[3] === 0x04) || // standard archive
             (b[2] === 0x05 && b[3] === 0x06) || // empty archive
             (b[2] === 0x07 && b[3] === 0x08));  // spanned archive

        if (!isZip) {
            return res.status(400).json({ message: "Invalid file content. The uploaded file is not a valid .jar archive." });
        }

        const publicUrl = await uploadFile(req.file);

        res.json({ 
            message: "Mod uploaded successfully!", 
            url: publicUrl,
            fileName: req.file.originalname
        });
    } catch (error) {
        console.error("Upload Error:", error);
        res.status(500).json({ message: "Internal server error during upload." });
    }
};
