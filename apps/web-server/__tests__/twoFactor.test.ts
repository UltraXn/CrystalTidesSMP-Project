import { describe, it, expect } from 'vitest';
import speakeasy from 'speakeasy';
import * as twoFactorService from '../services/twoFactorService.js';

describe('Two-Factor Authentication Service', () => {
    it('should generate a secret with appropriate otpauth_url and base32 secret', () => {
        const email = 'test@crystaltides.com';
        const secret = twoFactorService.generateSecret(email);
        
        expect(secret).toHaveProperty('otpauth_url');
        expect(secret).toHaveProperty('base32');
        expect(secret.base32).toBeTypeOf('string');
        expect(secret.otpauth_url).toContain('CrystalTides');
        expect(secret.otpauth_url).toContain('image=');
    });

    it('should generate a base64 data URL for QR Code', async () => {
        const email = 'test@crystaltides.com';
        const secret = twoFactorService.generateSecret(email);
        const qrCode = await twoFactorService.generateQRCode(secret.otpauth_url!);
        
        expect(qrCode).toBeTypeOf('string');
        expect(qrCode.startsWith('data:image/png;base64,')).toBe(true);
    });

    it('should verify a valid TOTP token and reject invalid ones', () => {
        const email = 'test@crystaltides.com';
        const secret = twoFactorService.generateSecret(email);
        
        // Generate a valid token using speakeasy
        const validToken = speakeasy.totp({
            secret: secret.base32,
            encoding: 'base32'
        });
        
        const isVerified = twoFactorService.verifyToken(validToken, secret.base32);
        expect(isVerified).toBe(true);
        
        const isInvalidVerified = twoFactorService.verifyToken('123456', secret.base32);
        expect(isInvalidVerified).toBe(false);
    });

    it('should sign and verify admin JWT tokens', () => {
        const userId = 'user-123-uuid';
        const role = 'admin';
        
        const adminToken = twoFactorService.signAdminToken(userId, role);
        expect(adminToken).toBeTypeOf('string');
        
        const payload = twoFactorService.verifyAdminToken(adminToken);
        expect(payload).not.toBeNull();
        expect(payload!.sub).toBe(userId);
        expect(payload!.role).toBe(role);
        expect(payload!.verified).toBe(true);
        
        const invalidPayload = twoFactorService.verifyAdminToken('invalid-jwt-token-string');
        expect(invalidPayload).toBeNull();
    });
});
