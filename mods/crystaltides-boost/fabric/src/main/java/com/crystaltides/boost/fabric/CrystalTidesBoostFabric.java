package com.crystaltides.boost.fabric;

import com.crystaltides.boost.CrystalTidesBoostCommon;
import net.fabricmc.api.ClientModInitializer;

/**
 * Fabric Client Mod Initializer for CrystalTides Boost.
 */
public class CrystalTidesBoostFabric implements ClientModInitializer {

    @Override
    public void onInitializeClient() {
        CrystalTidesBoostCommon.init();
    }
}
