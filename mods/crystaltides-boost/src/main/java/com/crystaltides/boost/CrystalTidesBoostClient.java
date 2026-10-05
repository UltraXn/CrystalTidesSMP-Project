package com.crystaltides.boost;

import net.fabricmc.api.ClientModInitializer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * CrystalTides Boost - Client Mod Initializer
 *
 * Implements low-level runtime optimizations for PC hardware (Intel, AMD, NVIDIA):
 * - ThreadQoS: Prioritizes Render Thread (MAX_PRIORITY) over background worker/IO threads
 * - SaveSkip: CRC32C hash-based chunk deduplication to skip redundant disk writes during autosaves
 * - LazyNarrator: Eliminates 2-4 second splash screen hang by deferring native TTS loading
 *
 * 100% compatible with Sodium and Iris Shaders.
 */
public class CrystalTidesBoostClient implements ClientModInitializer {
    public static final String MOD_ID = "crystaltides-boost";
    public static final Logger LOGGER = LoggerFactory.getLogger(MOD_ID);

    @Override
    public void onInitializeClient() {
        LOGGER.info("[CrystalTides Boost] Initializing high-performance PC optimization pipeline.");
        LOGGER.info("[CrystalTides Boost] Layer 2 in-JVM optimizations active (ThreadQoS, SaveSkip, LazyNarrator).");
        
        // Log CPU and memory context
        Runtime runtime = Runtime.getRuntime();
        int availableProcessors = runtime.availableProcessors();
        long maxMemoryMb = runtime.maxMemory() / (1024 * 1024);
        LOGGER.info("[CrystalTides Boost] JVM Environment: {} CPU cores available, {} MB allocated heap.", availableProcessors, maxMemoryMb);
    }
}
