import { describe, it, expect } from 'vitest';
import { detectImageType, BUCKET_RULES } from '../services/imageUploadService.js';

describe('Image Upload Service — Magic Byte & Bucket Validation (C1)', () => {

    describe('Magic Byte Detection (detectImageType)', () => {
        it('should correctly detect PNG magic bytes', () => {
            const pngHeader = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00]);
            const result = detectImageType(pngHeader);
            expect(result).toEqual({ extension: 'png', contentType: 'image/png' });
        });

        it('should correctly detect JPEG magic bytes', () => {
            const jpegHeader = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46]);
            const result = detectImageType(jpegHeader);
            expect(result).toEqual({ extension: 'jpg', contentType: 'image/jpeg' });
        });

        it('should correctly detect GIF magic bytes', () => {
            const gifHeader = Buffer.from([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]);
            const result = detectImageType(gifHeader);
            expect(result).toEqual({ extension: 'gif', contentType: 'image/gif' });
        });

        it('should correctly detect WebP magic bytes', () => {
            const webpHeader = Buffer.from([
                0x52, 0x49, 0x46, 0x46, // "RIFF"
                0x00, 0x00, 0x00, 0x00, // size
                0x57, 0x45, 0x42, 0x50  // "WEBP"
            ]);
            const result = detectImageType(webpHeader);
            expect(result).toEqual({ extension: 'webp', contentType: 'image/webp' });
        });

        it('should reject non-image payloads (HTML/SVG/EXE disguised as image)', () => {
            const htmlPayload = Buffer.from('<html><script>alert(1)</script></html>');
            expect(detectImageType(htmlPayload)).toBeNull();

            const svgPayload = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>');
            expect(detectImageType(svgPayload)).toBeNull();

            const exePayload = Buffer.from([0x4d, 0x5a, 0x90, 0x00]); // MZ header
            expect(detectImageType(exePayload)).toBeNull();
        });
    });

    describe('Bucket Rules & Authorization', () => {
        it('should allow valid buckets (forum-uploads, avatars, content, admin-assets, medals)', () => {
            expect(BUCKET_RULES['forum-uploads']).toBeDefined();
            expect(BUCKET_RULES['avatars']).toBeDefined();
            expect(BUCKET_RULES['content']).toBeDefined();
            expect(BUCKET_RULES['admin-assets']).toBeDefined();
            expect(BUCKET_RULES['medals']).toBeDefined();
        });

        it('should reject unwhitelisted buckets', () => {
            expect(BUCKET_RULES['malicious-bucket']).toBeUndefined();
            expect(BUCKET_RULES['public-root']).toBeUndefined();
        });

        it('should restrict staff buckets to staff roles', () => {
            expect(BUCKET_RULES['admin-assets'].allowedRoles).toContain('admin');
            expect(BUCKET_RULES['admin-assets'].allowedRoles).not.toContain('user');
        });
    });
});
