/**
 * Safely sanitizes a URL by enforcing a strict protocol whitelist (http, https, relative).
 * Strips whitespace and ASCII/Unicode control characters to prevent bypasses like 'java\tscript:'.
 */
export const sanitizeUrl = (rawUrl: string | null | undefined): string | null => {
    if (!rawUrl || typeof rawUrl !== 'string') return null;
    // Strip control chars and ALL whitespace (tabs/newlines defeat prefix checks)
    // eslint-disable-next-line no-control-regex -- intentionally stripping control chars
    const cleaned = rawUrl.replace(/[\u0000-\u0020\u007F]+/g, '');
    // Allow relative paths and anchors
    if (cleaned.startsWith('/') || cleaned.startsWith('#')) return cleaned;
    // Allow only http/https absolute URLs
    if (/^https?:\/\//i.test(cleaned)) return cleaned;
    // Everything else (javascript:, data:, vbscript:, protocol-relative, ...) is rejected
    return null;
};
