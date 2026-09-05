/**
 * ModelLoaderService
 *
 * Provides transparent asset resolution for 3D models (.glb, .gltf, textures).
 * Automatically resolves either from local /models/ (in dev) or from an external
 * Edge CDN / Cloudflare R2 bucket when VITE_MODELS_CDN_URL is configured.
 */

const CDN_BASE_URL = (import.meta.env.VITE_MODELS_CDN_URL || "").replace(
  /\/$/,
  "",
);

export interface ModelUrlOptions {
  versionHash?: string;
}

export class ModelLoaderService {
  /**
   * Resolves the full URL to a 3D asset relative to models/
   * @param relativePath - e.g. "bosses/umvuthi.gltf" or "drake.glb"
   */
  public static getAssetUrl(
    relativePath: string,
    options?: ModelUrlOptions,
  ): string {
    const cleanPath = relativePath.replace(/^\/+/, "");

    let resolvedUrl: string;
    if (CDN_BASE_URL) {
      resolvedUrl = `${CDN_BASE_URL}/${cleanPath}`;
    } else {
      resolvedUrl = `/models/${cleanPath}`;
    }

    if (options?.versionHash) {
      resolvedUrl += `?v=${options.versionHash.slice(0, 8)}`;
    }

    return resolvedUrl;
  }

  /**
   * Check whether assets are served from external CDN or local bundle
   */
  public static isCdnActive(): boolean {
    return Boolean(CDN_BASE_URL);
  }

  /**
   * Get the active CDN base URL (if any)
   */
  public static getCdnBaseUrl(): string {
    return CDN_BASE_URL || "/models";
  }
}

export default ModelLoaderService;
