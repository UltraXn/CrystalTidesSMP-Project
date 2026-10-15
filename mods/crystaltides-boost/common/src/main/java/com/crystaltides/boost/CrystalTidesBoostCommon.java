package com.crystaltides.boost;

import com.crystaltides.boost.config.BoostConfig;
import com.crystaltides.boost.platform.Services;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.concurrent.atomic.AtomicBoolean;

/**
 * CrystalTides Boost - Common Core
 */
public final class CrystalTidesBoostCommon {

    public static final String MOD_ID = "crystaltides-boost";
    public static final String MOD_NAME = "CrystalTides Boost";
    public static final Logger LOGGER = LoggerFactory.getLogger(MOD_ID);

    private static final AtomicBoolean INITIALIZED = new AtomicBoolean(false);

    private CrystalTidesBoostCommon() {
    }

    public static void init() {
        if (!INITIALIZED.compareAndSet(false, true)) {
            return;
        }

        String platformName = Services.PLATFORM.getPlatformName();
        LOGGER.info("[{}] Initialized on {}", MOD_NAME, platformName);

        BoostConfig config = BoostConfig.getInstance();
        LOGGER.info("[{}] Active optimizations -> ThreadQoS: {}, AnimatedTextureCulling: {}",
            MOD_NAME,
            config.isThreadQosEnabled() ? "ENABLED" : "DISABLED",
            config.isAnimatedTextureCullingEnabled() ? "ENABLED" : "DISABLED"
        );
    }
}
