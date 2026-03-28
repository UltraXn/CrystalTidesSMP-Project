/**
 * utility to safely extract a single string from Express 5's req.query or req.params
 * which can now be string | string[] | undefined | ParsedQs
 */
export function ensureString(val: unknown, fallback: string = ''): string {
    if (typeof val === 'string') return val;
    if (Array.isArray(val) && val.length > 0) return String(val[0]);
    if (val === undefined || val === null) return fallback;
    return String(val);
}
