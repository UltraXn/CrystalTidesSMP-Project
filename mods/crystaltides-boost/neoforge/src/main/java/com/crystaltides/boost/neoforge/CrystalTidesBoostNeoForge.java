package com.crystaltides.boost.neoforge;

import com.crystaltides.boost.CrystalTidesBoostCommon;
import net.neoforged.fml.common.Mod;

/**
 * NeoForge Mod Entrypoint for CrystalTides Boost.
 */
@Mod(CrystalTidesBoostNeoForge.MOD_ID)
public class CrystalTidesBoostNeoForge {

    public static final String MOD_ID = "crystaltides_boost";

    public CrystalTidesBoostNeoForge() {
        // Runs on NeoForge client/server startup
        CrystalTidesBoostCommon.init();
    }
}
