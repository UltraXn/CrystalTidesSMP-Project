import type { NextFunction, Request, Response } from 'express';

/** Browser origins allowed to call the API (also the CORS allowlist). */
export const ALLOWED_ORIGINS = [
  'https://crystaltides.net',
  'https://api.crystaltides.net',
  'https://crystaltidessmp.net',
  'https://api.crystaltidessmp.net',
  'http://localhost:3000', // Local development
  'http://localhost:5173', // Vite default
];

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * CSRF defence based on Fetch Metadata (OWASP): a browser request that writes
 * (POST/PUT/PATCH/DELETE) from a site outside the allowlist is refused.
 *
 * CORS alone does not stop these requests: it only hides the response, the
 * side effect still happens. Server-to-server callers (Ko-Fi, the Discord bot,
 * the Minecraft plugin) send neither Sec-Fetch-Site nor Origin and pass.
 */
export function rejectCrossSiteWrites(allowedOrigins: readonly string[] = ALLOWED_ORIGINS) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (SAFE_METHODS.has(req.method)) return next();

    const origin = req.headers.origin;
    const originAllowed = typeof origin === 'string' && allowedOrigins.includes(origin);
    const fetchSite = req.headers['sec-fetch-site'];

    const crossSiteBrowser = fetchSite === 'cross-site' && !originAllowed;
    const foreignOrigin = typeof origin === 'string' && origin !== 'null' && !originAllowed;
    const opaqueOrigin = origin === 'null'; // sandboxed iframes, file:// pages

    if (crossSiteBrowser || foreignOrigin || opaqueOrigin) {
      res.status(403).json({ error: 'Cross-site request blocked' });
      return;
    }
    next();
  };
}
