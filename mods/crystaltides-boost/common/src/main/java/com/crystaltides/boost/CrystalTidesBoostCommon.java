package com.crystaltides.boost;

import com.crystaltides.boost.platform.Services;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * CrystalTides Boost - Common Core
 *
 * Agnóstic initialization executed across all mod loaders (Fabric, NeoForge, Forge).
 * Provides low-level PC client optimizations:
 * - ThreadQoS: Elevates Render Thread to MAX_PRIORITY, demotes background chunk workers
 * - SaveSkip: CRC32C chunk autosave deduplication to eliminate micro-stutter
 * - LazyNarrator: Eliminates splash screen freeze by deferring TTS binaries
 * - AnimatedTextureCulling: Skips ticking off-screen animated textures
 * - ChestOcclusion: Skips dynamic block entity rendering for obstructed chests
 */
public final class CrystalTidesBoostCommon {

    public static final String MOD_ID = "crystaltides-boost";
    public static final String MOD_NAME = "CrystalTides Boost";
    public static final Logger LOGGER = LoggerFactory.getLogger(MOD_ID);

    private static boolean initialized = false;

    private CrystalTidesBoostCommon() {
    }

    public static synchronized void init() {
        if (initialized) {
            return;
        }
        initialized = true;

        String platformName = Services.PLATFORM.getPlatformName();
        LOGGER.info("[{}] Initializing high-performance Multiloader optimization engine on {}", MOD_NAME, platformName);

        // Hardware context logging
        Runtime runtime = Runtime.getRuntime();
        int cores = runtime.availableProcessors();
        long maxHeapMb = runtime.maxMemory() / (1024 * 1024);
        LOGGER.info("[{}] CPU Topology: {} cores detected. Heap limit: {} MB.", MOD_NAME, cores, maxHeapMb);

        // Ecosystem compatibility inspection
        boolean hasSodium = Services.PLATFORM.isModLoaded("sodium") || Services.PLATFORM.isModLoaded("embeddium");
        boolean hasIris = Services.PLATFORM.isModLoaded("iris") || Services.PLATFORM.isModLoaded("oculus");

        if (hasSodium) {
            LOGGER.info("[{}] Modern pipeline detected (Sodium/Embeddium). Cooperating with chunk meshing pipeline.", MOD_NAME);
        }
        if (hasIris) {
            LOGGER.info("[{}] Shaders pipeline detected (Iris/Oculus). Optimizing frame presentation pacing.", MOD_NAME);
        }
    }
}
