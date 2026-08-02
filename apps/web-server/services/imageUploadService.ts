import supabase from '../config/supabaseClient.js';
import crypto from 'crypto';

/**
 * Secure image upload pipeline (fixes C1: arbitrary file upload to Storage).
 *
 * Trust model:
 *  - The client-declared mimetype and filename are NEVER trusted.
 *  - The real type is detected from magic bytes; the extension and the
 *    Content-Type stored in Supabase are derived from that detection.
 *  - Filenames are server-generated (no user-controlled path segments).
 *  - Buckets must be reconfigured (see migration restrict_image_uploads_storage.sql)
 *    so that only the service role (this backend) can write to them.
 */

export interface DetectedImage {
    extension: string;
    contentType: string;
}

const startsWith = (b: Buffer, bytes: number[], offset = 0): boolean =>
    b.length >= offset + bytes.length && bytes.every((byte, i) => b[offset + i] === byte);

/**
 * Detects the real image type from magic bytes.
 * Returns null when the buffer is not a supported image.
 */
export const detectImageType = (b: Buffer): DetectedImage | null => {
    // PNG: 89 50 4E 47 0D 0A 1A 0A
    if (startsWith(b, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
        return { extension: 'png', contentType: 'image/png' };
    }
    // JPEG: FF D8 FF
    if (startsWith(b, [0xff, 0xd8, 0xff])) {
        return { extension: 'jpg', contentType: 'image/jpeg' };
    }
    // GIF: 47 49 46 38 ("GIF8")
    if (startsWith(b, [0x47, 0x49, 0x46, 0x38])) {
        return { extension: 'gif', contentType: 'image/gif' };
    }
    // WebP: "RIFF" .... "WEBP"
    if (startsWith(b, [0x52, 0x49, 0x46, 0x46]) && startsWith(b, [0x57, 0x45, 0x42, 0x50], 8)) {
        return { extension: 'webp', contentType: 'image/webp' };
    }
    // AVIF: .... "ftyp" + brand avif/avis
    if (startsWith(b, [0x66, 0x74, 0x79, 0x70], 4) &&
        (startsWith(b, [0x61, 0x76, 0x69, 0x66], 8) || startsWith(b, [0x61, 0x76, 0x69, 0x73], 8))) {
        return { extension: 'avif', contentType: 'image/avif' };
    }
    // GLB (Binary glTF): 67 54 46 32 ("gTF2")
    if (startsWith(b, [0x67, 0x54, 0x46, 0x32])) {
        return { extension: 'glb', contentType: 'model/gltf-binary' };
    }
    // GLTF / JSON: starts with '{' (0x7B)
    if (b.length > 0 && b[0] === 0x7b) {
        return { extension: 'gltf', contentType: 'model/gltf+json' };
    }
    return null;
};

interface BucketRule {
    maxBytes: number;
    /** Roles allowed to upload. Undefined = any authenticated user. */
    allowedRoles?: string[];
}

/**
 * Per-bucket policy. Buckets NOT listed here are rejected outright.
 * - forum-uploads / avatars: any authenticated user (forum posts, avatars)
 * - content / admin-assets: staff-only (site content managed from the admin panel)
 */
const STAFF_UPLOAD_ROLES = ['admin', 'neroferno', 'killu', 'killuwu', 'developer', 'owner', 'staff', 'moderator', 'mod', 'helper'];

export const BUCKET_RULES: Record<string, BucketRule> = {
    'forum-uploads': { maxBytes: 5 * 1024 * 1024 },
    'avatars': { maxBytes: 2 * 1024 * 1024 },
    'content': { maxBytes: 10 * 1024 * 1024, allowedRoles: STAFF_UPLOAD_ROLES },
    'admin-assets': { maxBytes: 15 * 1024 * 1024, allowedRoles: STAFF_UPLOAD_ROLES },
    'medals': { maxBytes: 2 * 1024 * 1024, allowedRoles: STAFF_UPLOAD_ROLES },
};

export class UploadValidationError extends Error {
    statusCode: number;
    constructor(message: string, statusCode = 400) {
        super(message);
        this.statusCode = statusCode;
    }
}

interface UploadImageParams {
    buffer: Buffer;
    bucket: string;
    userId: string;
    userRole: string;
    folder?: string;
}

export const uploadImage = async ({ buffer, bucket, userId, userRole, folder }: UploadImageParams): Promise<{ url: string; key: string }> => {
    // 1. Bucket whitelist + role check
    const rule = BUCKET_RULES[bucket];
    if (!rule) {
        throw new UploadValidationError('Bucket not allowed');
    }
    if (rule.allowedRoles && !rule.allowedRoles.includes((userRole || '').toLowerCase())) {
        throw new UploadValidationError('Insufficient permissions for this bucket', 403);
    }

    // 2. Size limit (per bucket)
    if (buffer.length === 0) {
        throw new UploadValidationError('Empty file');
    }
    if (buffer.length > rule.maxBytes) {
        throw new UploadValidationError(`File too large. Max ${Math.round(rule.maxBytes / 1024 / 1024)}MB for this bucket`);
    }

    // 3. Magic-byte detection — the ONLY trusted type signal
    const detected = detectImageType(buffer);
    if (!detected) {
        throw new UploadValidationError('Invalid file content. Only real image files (PNG, JPEG, GIF, WebP, AVIF) are allowed');
    }

    // 4. Server-generated key. Avatars are namespaced per user.
    //    Folder is optional and sanitized to safe path segments only.
    const safeFolder = folder && /^[a-z0-9][a-z0-9/_-]{0,48}$/i.test(folder) && !folder.includes('..')
        ? folder.replace(/^\/+|\/+$/g, '') + '/'
        : '';
    const prefix = bucket === 'avatars' ? `${userId}/` : safeFolder;
    const key = `${prefix}${Date.now()}_${crypto.randomBytes(6).toString('hex')}.${detected.extension}`;

    // 5. Upload with the service role (bypasses RLS — clients can't write directly)
    const { error } = await supabase.storage
        .from(bucket)
        .upload(key, buffer, {
            contentType: detected.contentType,
            cacheControl: '3600',
            upsert: false,
        });

    if (error) {
        console.error('Storage upload error:', error);
        throw new Error('Failed to store image');
    }

    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(key);
    return { url: publicUrl, key };
};
