const CDN_URL = (import.meta.env.VITE_CDN_URL || '').replace(/\/$/, '');

const MODEL_ALIASES: Record<string, string> = {
    '/models/forgotten_wither.json': '/models/toro_wither.gltf',
    'models/forgotten_wither.json': '/models/toro_wither.gltf',
    '/models/forgotten_wither_terror.json': '/models/toro_wither_terror.gltf',
    'models/forgotten_wither_terror.json': '/models/toro_wither_terror.gltf',
    '/models/wither.gltf': '/models/toro_wither.gltf',
    'models/wither.gltf': '/models/toro_wither.gltf',
    '/models/platypus.gltf': '/models/critters/leaf_insect.gltf',
    '/models/hedgehog.gltf': '/models/critters/leaf_insect.gltf',
};

/**
 * Resolves a 3D model, geometry, or texture asset URL.
 * Normalizes backslashes to forward slashes.
 * Automatically resolves to local public folder or CDN.
 */
export function resolveAssetUrl(rawPath?: string | null): string {
    if (!rawPath) return '';
    let normalized = rawPath.replace(/\\/g, '/').trim();
    if (MODEL_ALIASES[normalized]) {
        normalized = MODEL_ALIASES[normalized];
    }
    if (normalized.startsWith('http://') || normalized.startsWith('https://') || normalized.startsWith('data:') || normalized.startsWith('blob:')) {
        return normalized;
    }
    const cleanPath = normalized.startsWith('/') ? normalized : `/${normalized}`;
    
    // In local dev or when CDN_URL is not set, load directly from local public/
    if (import.meta.env.DEV || !CDN_URL || (typeof window !== 'undefined' && window.location.hostname === 'localhost')) {
        return cleanPath;
    }

    return `${CDN_URL}${cleanPath}`;
}
