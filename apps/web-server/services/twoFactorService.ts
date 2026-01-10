import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import jwt from 'jsonwebtoken';
import supabase from '../config/supabaseClient.js';

import crypto from 'crypto';

const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || crypto.randomBytes(64).toString('hex');

export const generateSecret = (email: string) => {
    const secret = speakeasy.generateSecret({
        name: `CrystalTides (${email})`,
        issuer: 'CrystalTides'
    });
    // Authy/authenticator logo support (non-standard but widely supported)
    // Ideally this should be an absolute URL to the hosted logo
    const logoUrl = process.env.TWO_FACTOR_LOGO_URL || 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/master-ball.png';
    const otpauth_url = secret.otpauth_url 
        ? `${secret.otpauth_url}&image=${encodeURIComponent(logoUrl)}` 
        : secret.otpauth_url;

    return {
        otpauth_url,
        base32: secret.base32
    };
};

export const generateQRCode = async (otpauth_url: string) => {
    return await QRCode.toDataURL(otpauth_url, {
        errorCorrectionLevel: 'H',
        margin: 1,
        width: 300,
        color: {
            dark: '#000000',
            light: '#ffffff'
        }
    });
};

export const verifyToken = (token: string, secret: string) => {
    return speakeasy.totp.verify({
        secret: secret,
        encoding: 'base32',
        token: token,
        window: 1 // Allow 30s drift (1 step before/after)
    });
};

export const updateUser2FARecord = async (userId: string, secret: string | null, enabled: boolean) => {
    // We store the secret in app_metadata so users can't see/edit it easily from client
    const { data: { user }, error } = await supabase.auth.admin.updateUserById(
        userId,
        {
            app_metadata: {
                two_factor_enabled: enabled,
                two_factor_secret: secret
            }
        }
    );
    
    if (error) throw error;
    return user;
};

export const signAdminToken = (userId: string, role: string) => {
    return jwt.sign(
        { sub: userId, role, verified: true },
        ADMIN_JWT_SECRET,
        { expiresIn: '1h' }
    );
};

export const verifyAdminToken = (token: string) => {
    try {
        return jwt.verify(token, ADMIN_JWT_SECRET) as { sub: string, role: string, verified: boolean };
    } catch {
        return null;
    }
};
