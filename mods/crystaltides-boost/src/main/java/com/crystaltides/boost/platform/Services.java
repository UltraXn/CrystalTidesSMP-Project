package com.crystaltides.boost.platform;

/**
 * Platform helper of the loader this jar was built for. Every jar targets a single loader, so the
 * implementation is chosen at build time (Stonecutter) instead of through ServiceLoader; that also
 * keeps it independent of the thread context class loader when the mixin config plugin needs it.
 */
public final class Services {

    public static final IPlatformHelper PLATFORM =
        //? if fabric {
        new com.crystaltides.boost.fabric.platform.FabricPlatformHelper();
        //?} else {
        /*new com.crystaltides.boost.neoforge.platform.NeoForgePlatformHelper();
        *///?}

    private Services() {
    }
}
