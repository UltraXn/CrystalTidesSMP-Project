import { resolveAssetUrl } from './assetUtils';

export const ASSET_CACHE_NAME = 'crystaltides-r2-assets-v1';

const CACHEABLE_EXTENSIONS_REGEX = /\.(?:gltf|glb|geo\.json|png|webp)(?:$|\?)/i;
const GLTF_JSON_REGEX = /\.gltf(?:$|\?)/i;

// In-memory session cache mapping asset URL -> local object URL (used for self-contained formats like .glb, .png, etc.)
const memoryBlobCache = new Map<string, string>();

function isCacheStorageAvailable(): boolean {
  return (
    typeof window !== 'undefined' && 'caches' in window && typeof window.caches?.open === 'function'
  );
}

function isCacheableAsset(url: string): boolean {
  if (!url || url.startsWith('blob:') || url.startsWith('data:')) {
    return false;
  }
  return CACHEABLE_EXTENSIONS_REGEX.test(url);
}

/**
 * Resolves a 3D model, geometry, or texture URL, caching it persistently in CacheStorage
 * and reusing local blob: URLs across renders for binary/self-contained formats.
 *
 * NOTE: For `.gltf` files (JSON referencing external .bin/textures via relative paths),
 * we pre-warm CacheStorage via fetch/put but return the original `resolvedUrl`.
 * This preserves the base path for THREE.LoaderUtils.extractUrlBase and avoids 404s
 * on relative resource loads from `blob:` origins.
 */
export async function resolveCachedAssetUrl(rawPath?: string | null): Promise<string> {
  const resolvedUrl = resolveAssetUrl(rawPath);
  if (!resolvedUrl) {
    return '';
  }

  if (!isCacheStorageAvailable() || !isCacheableAsset(resolvedUrl)) {
    return resolvedUrl;
  }

  const isGltfJson = GLTF_JSON_REGEX.test(resolvedUrl);

  // For non-gltf assets, check in-memory session cache
  if (!isGltfJson) {
    const inMemoryBlobUrl = memoryBlobCache.get(resolvedUrl);
    if (inMemoryBlobUrl) {
      return inMemoryBlobUrl;
    }
  }

  try {
    const cache = await window.caches.open(ASSET_CACHE_NAME);
    const cachedResponse = await cache.match(resolvedUrl);

    if (cachedResponse) {
      if (isGltfJson) {
        // Return original URL so GLTFLoader can resolve relative .bin / textures
        return resolvedUrl;
      }
      const blob = await cachedResponse.blob();
      const objectUrl = URL.createObjectURL(blob);
      memoryBlobCache.set(resolvedUrl, objectUrl);
      return objectUrl;
    }

    const networkResponse = await fetch(resolvedUrl);
    if (!networkResponse.ok) {
      return resolvedUrl;
    }

    try {
      await cache.put(resolvedUrl, networkResponse.clone());
    } catch (putError) {
      console.warn('Failed to write asset to CacheStorage:', putError);
    }

    if (isGltfJson) {
      return resolvedUrl;
    }

    const blob = await networkResponse.blob();
    const objectUrl = URL.createObjectURL(blob);
    memoryBlobCache.set(resolvedUrl, objectUrl);
    return objectUrl;
  } catch (error) {
    console.warn('Asset cache fetch failed, falling back to original URL:', error);
    return resolvedUrl;
  }
}

/**
 * Clears the in-memory object URL cache and revokes all created URLs.
 * Primarily used in test teardown or low-memory triggers.
 */
export function clearMemoryAssetCache(): void {
  for (const blobUrl of memoryBlobCache.values()) {
    try {
      URL.revokeObjectURL(blobUrl);
    } catch {
      // Ignore cleanup error
    }
  }
  memoryBlobCache.clear();
}
