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
        return ServiceLoader.load(clazz)
            .findFirst()
            .orElseThrow(() -> new NullPointerException(
                "[CrystalTides Boost] Could not find implementation for " + clazz.getName() +
                ". Verify META-INF/services registration."
            ));
    }
}
