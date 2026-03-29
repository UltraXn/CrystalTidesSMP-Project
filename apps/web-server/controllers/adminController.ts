import { Request, Response } from 'express';
import { uploadFile } from '../services/r2Service.js';

export const uploadMod = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded." });
        }

        // File Type Validation (Defense in Depth - handled by middleware)

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
