package com.crystaltides.boost.platform;

import java.util.ServiceLoader;

/**
 * Service locator for cross-platform helper implementations.
 * Uses Java standard ServiceLoader (no third-party dependencies required).
 */
public final class Services {

    public static final IPlatformHelper PLATFORM = load(IPlatformHelper.class);

    private Services() {
    }

    public static <T> T load(Class<T> clazz) {
        // Explicit loader: the mixin config plugin runs before mod construction, when the thread
        // context class loader is not guaranteed to be the one that defined this mod's classes.
        return ServiceLoader.load(clazz, Services.class.getClassLoader())
            .findFirst()
            .orElseThrow(() -> new NullPointerException(
                "[CrystalTides Boost] Could not find implementation for " + clazz.getName() +
                ". Verify META-INF/services registration."
            ));
    }
}
