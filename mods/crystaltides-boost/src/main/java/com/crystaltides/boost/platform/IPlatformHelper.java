package com.crystaltides.boost.platform;

import java.nio.file.Path;

/**
 * Cross-platform abstraction layer for CrystalTides Boost.
 *
 * Implemented per loader (Fabric, NeoForge); {@link Services} holds the one this jar was built for.
 */
public interface IPlatformHelper {

    /**
     * Gets the current loader name ("Fabric", "NeoForge", "Forge").
     */
    String getPlatformName();

    /**
     * Checks if a specific mod ID is present and loaded in the active runtime.
     * Useful for detecting Sodium, Embeddium, Iris, or Oculus without hard dependencies.
     *
     * Must also work at pre-launch, from the mixin config plugin, before any Minecraft class is
     * loaded (on NeoForge that means before ModList exists).
     */
    boolean isModLoaded(String modId);

    /**
     * Returns true if running in a development workspace / IDE.
     */
    boolean isDevelopmentEnvironment();

    /**
     * Returns the root game directory (e.g. .minecraft or instance directory).
     */
    Path getGameDirectory();

    /**
     * Returns the configuration directory (e.g. .minecraft/config).
     */
    Path getConfigDirectory();
}
