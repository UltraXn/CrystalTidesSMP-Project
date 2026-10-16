package com.crystaltides.boost.fabric;

//? if fabric {
import com.crystaltides.boost.CrystalTidesBoostCommon;
import net.fabricmc.api.ClientModInitializer;

// Fabric client entrypoint for CrystalTides Boost
public class CrystalTidesBoostFabric implements ClientModInitializer {

    @Override
    public void onInitializeClient() {
        CrystalTidesBoostCommon.init();
    }
}
//?}
