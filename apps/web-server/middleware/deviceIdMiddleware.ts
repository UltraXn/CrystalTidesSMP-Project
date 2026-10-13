import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

/**
 * Middleware ensuring a unique signed HttpOnly device cookie (`device_id`) exists.
 * Used for precise per-device Rate Limiting so multiple players sharing an IP/VPN aren't blocked together.
 */
export const ensureDeviceId = (req: Request, res: Response, next: NextFunction) => {
  try {
    let deviceId =
      (req.signedCookies?.['device_id'] as string | undefined) ??
      (req.cookies?.['device_id'] as string | undefined);
    if (!deviceId) {
      deviceId = crypto.randomUUID();
      res.cookie('device_id', deviceId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year persistence
        signed: true,
      });
    }
    req.deviceId = deviceId;
  } catch (err) {
    console.error('Error in ensureDeviceId middleware:', err);
  }
  next();
};
