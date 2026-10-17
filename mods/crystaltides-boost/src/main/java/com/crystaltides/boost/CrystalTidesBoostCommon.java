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

        // Which mixins are active (and why the others are not) is decided and logged by BoostMixinPlugin
        BoostConfig config = BoostConfig.getInstance();
        LOGGER.info("[{}] Initialized on {} (background eco: {}, thread QoS: {})",
            MOD_NAME,
            Services.PLATFORM.getPlatformName(),
            config.isBackgroundEcoEnabled() ? "enabled" : "disabled",
            config.isThreadQosEnabled() ? "enabled" : "disabled"
        );
    }
}
