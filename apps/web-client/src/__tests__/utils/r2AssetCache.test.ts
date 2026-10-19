import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  resolveCachedAssetUrl,
  clearMemoryAssetCache,
  ASSET_CACHE_NAME,
} from '@/utils/r2AssetCache';

describe('r2AssetCache', () => {
  const originalCaches = window.caches;
  const originalFetch = window.fetch;
  const originalCreateObjectURL = URL.createObjectURL;
  const originalRevokeObjectURL = URL.revokeObjectURL;

  let mockCache: {
    match: ReturnType<typeof vi.fn>;
    put: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    clearMemoryAssetCache();
    vi.clearAllMocks();

    mockCache = {
      match: vi.fn(),
      put: vi.fn(),
    };

    Object.defineProperty(window, 'caches', {
      value: {
        open: vi.fn().mockResolvedValue(mockCache),
      },
      writable: true,
      configurable: true,
    });

    let objectUrlCounter = 0;
    URL.createObjectURL = vi.fn(
      (_blob: Blob) => `blob:http://localhost/object-${++objectUrlCounter}`,
    );
    URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    clearMemoryAssetCache();
    Object.defineProperty(window, 'caches', {
      value: originalCaches,
      writable: true,
      configurable: true,
    });
    window.fetch = originalFetch;
    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;
  });

  it('returns empty string when rawPath is empty or null', async () => {
    expect(await resolveCachedAssetUrl(null)).toBe('');
    expect(await resolveCachedAssetUrl(undefined)).toBe('');
    expect(await resolveCachedAssetUrl('')).toBe('');
  });

  it('bypasses caching for blob: and data: URLs', async () => {
    const blobUrl = 'blob:http://localhost/existing-uuid';
    const dataUrl = 'data:image/png;base64,iVBORw0KGgo=';

    expect(await resolveCachedAssetUrl(blobUrl)).toBe(blobUrl);
    expect(await resolveCachedAssetUrl(dataUrl)).toBe(dataUrl);
    expect(window.caches.open).not.toHaveBeenCalled();
  });

  it('bypasses caching for non-3D / non-texture extensions', async () => {
    const audioUrl = '/sounds/music.mp3';
    const result = await resolveCachedAssetUrl(audioUrl);

    expect(result).toBe('/sounds/music.mp3');
    expect(window.caches.open).not.toHaveBeenCalled();
  });

  it('bypasses caching when window.caches is not available', async () => {
    Object.defineProperty(window, 'caches', {
      value: undefined,
      writable: true,
      configurable: true,
    });

    const result = await resolveCachedAssetUrl('/models/boss.glb');
    expect(result).toBe('/models/boss.glb');
  });

  it('returns cached blob URL when binary asset is matched in CacheStorage', async () => {
    const mockBlob = new Blob(['mock-gltf-binary'], { type: 'model/gltf-binary' });
    const mockResponse = {
      blob: vi.fn().mockResolvedValue(mockBlob),
    };
    mockCache.match.mockResolvedValue(mockResponse);

    const result1 = await resolveCachedAssetUrl('/models/boss.glb');

    expect(window.caches.open).toHaveBeenCalledWith(ASSET_CACHE_NAME);
    expect(mockCache.match).toHaveBeenCalledWith('/models/boss.glb');
    expect(result1).toMatch(/^blob:http:\/\/localhost\/object-/);

    // Second call should hit the memory session cache directly
    const result2 = await resolveCachedAssetUrl('/models/boss.glb');
    expect(result2).toBe(result1);
    expect(mockCache.match).toHaveBeenCalledTimes(1);
  });

  it('returns resolvedUrl for matched .gltf files to preserve relative base path', async () => {
    const mockBlob = new Blob(['{"asset":{"version":"2.0"}}'], { type: 'application/json' });
    const mockResponse = {
      blob: vi.fn().mockResolvedValue(mockBlob),
    };
    mockCache.match.mockResolvedValue(mockResponse);

    const result = await resolveCachedAssetUrl('/models/wither.gltf');

    expect(mockCache.match).toHaveBeenCalledWith('/models/toro_wither.gltf');
    // Must return the resolvedUrl so GLTFLoader can resolve relative textures/.bin
    expect(result).toBe('/models/toro_wither.gltf');
  });

  it('pre-warms cache and returns resolvedUrl for .gltf on cache miss', async () => {
    mockCache.match.mockResolvedValue(null);
    const mockBlob = new Blob(['{"asset":{"version":"2.0"}}'], { type: 'application/json' });
    const mockCloneResponse = { clone: vi.fn() };
    const mockResponse = {
      ok: true,
      clone: vi.fn().mockReturnValue(mockCloneResponse),
      blob: vi.fn().mockResolvedValue(mockBlob),
    };
    window.fetch = vi.fn().mockResolvedValue(mockResponse);

    const result = await resolveCachedAssetUrl('/models/wither.gltf');

    expect(window.fetch).toHaveBeenCalledWith('/models/toro_wither.gltf');
    expect(mockCache.put).toHaveBeenCalledWith('/models/toro_wither.gltf', mockCloneResponse);
    expect(result).toBe('/models/toro_wither.gltf');
  });

  it('fetches from network and puts in CacheStorage when cache miss occurs for .glb', async () => {
    mockCache.match.mockResolvedValue(null);
    const mockBlob = new Blob(['network-gltf-binary'], { type: 'model/gltf-binary' });
    const mockCloneResponse = { clone: vi.fn() };
    const mockResponse = {
      ok: true,
      clone: vi.fn().mockReturnValue(mockCloneResponse),
      blob: vi.fn().mockResolvedValue(mockBlob),
    };
    window.fetch = vi.fn().mockResolvedValue(mockResponse);

    const result = await resolveCachedAssetUrl('/models/entity.glb');

    expect(window.fetch).toHaveBeenCalledWith('/models/entity.glb');
    expect(mockCache.put).toHaveBeenCalledWith('/models/entity.glb', mockCloneResponse);
    expect(result).toMatch(/^blob:http:\/\/localhost\/object-/);
  });

  it('falls back to resolved URL if network fetch fails with non-ok status', async () => {
    mockCache.match.mockResolvedValue(null);
    window.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
    });

    const result = await resolveCachedAssetUrl('/models/missing.glb');
    expect(result).toBe('/models/missing.glb');
    expect(mockCache.put).not.toHaveBeenCalled();
  });

  it('falls back to resolved URL if network fetch throws a CORS or network error', async () => {
    mockCache.match.mockResolvedValue(null);
    window.fetch = vi.fn().mockRejectedValue(new Error('CORS request failed'));

    const result = await resolveCachedAssetUrl('/models/error.glb');
    expect(result).toBe('/models/error.glb');
  });

  it('clearMemoryAssetCache revokes all cached blob URLs and empties memory cache', async () => {
    const mockBlob = new Blob(['model'], { type: 'model/gltf-binary' });
    mockCache.match.mockResolvedValue({
      blob: vi.fn().mockResolvedValue(mockBlob),
    });

    const url1 = await resolveCachedAssetUrl('/models/model1.glb');
    const url2 = await resolveCachedAssetUrl('/models/model2.glb');

    expect(url1).toBeDefined();
    expect(url2).toBeDefined();

    clearMemoryAssetCache();

    expect(URL.revokeObjectURL).toHaveBeenCalledWith(url1);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith(url2);

    await resolveCachedAssetUrl('/models/model1.glb');
    expect(mockCache.match).toHaveBeenCalledTimes(3);
  });
});
