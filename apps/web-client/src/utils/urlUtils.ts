/**
 * Regular expressions for sanitizing and validating URLs.
 */
// eslint-disable-next-line no-control-regex -- intentionally stripping control characters and whitespace
const CONTROL_AND_WHITESPACE_REGEX = /[\u0000-\u0020\u007F]+/g;
const HTTP_PROTOCOL_REGEX = /^https?:\/\//i;

export type QueryParamScalar = string | number | boolean;
export type QueryParamValue = QueryParamScalar | null | undefined;
export type QueryParams = Record<string, QueryParamValue | QueryParamValue[]>;

/**
 * Checks if a cleaned URL represents a safe relative path or anchor.
 * Explicitly disallows protocol-relative URLs (e.g., '//malicious.com') and backslash quirks.
 */
const isSafeRelativeUrl = (url: string): boolean => {
    if (url.startsWith('#')) {
        return true;
    }
    return url.startsWith('/') && !url.startsWith('//') && !url.startsWith('/\\');
};

/**
 * Checks if a cleaned URL represents a valid http or https absolute URL.
 */
const isSafeAbsoluteUrl = (url: string): boolean => HTTP_PROTOCOL_REGEX.test(url);

/**
 * Safely sanitizes a URL by enforcing a strict protocol whitelist (http, https, relative).
 * Strips whitespace and ASCII/Unicode control characters to prevent bypasses like 'java\tscript:'.
 */
export const sanitizeUrl = (rawUrl: string | null | undefined): string | null => {
    if (!rawUrl || typeof rawUrl !== 'string') {
        return null;
    }

    const cleaned = rawUrl.replace(CONTROL_AND_WHITESPACE_REGEX, '');

    if (isSafeRelativeUrl(cleaned) || isSafeAbsoluteUrl(cleaned)) {
        return cleaned;
    }

    // Everything else (javascript:, data:, vbscript:, protocol-relative, etc.) is rejected
    return null;
};

/**
 * Checks whether a given target URL is safe for redirects.
 */
export const isSafeRedirectUrl = (url: string | null | undefined): boolean => {
    return sanitizeUrl(url) !== null;
};

/**
 * Serializes an object of key-value pairs into a URL query string without a leading '?'.
 * Safely omits undefined and null values and handles array values by repeating keys.
 */
export const serializeQueryParams = (params: QueryParams): string => {
    const searchParams = new URLSearchParams();

    for (const [key, value] of Object.entries(params)) {
        if (value === null || value === undefined) {
            continue;
        }

        if (Array.isArray(value)) {
            for (const item of value) {
                if (item !== null && item !== undefined) {
                    searchParams.append(key, String(item));
                }
            }
            continue;
        }

        searchParams.append(key, String(value));
    }

    return searchParams.toString();
};