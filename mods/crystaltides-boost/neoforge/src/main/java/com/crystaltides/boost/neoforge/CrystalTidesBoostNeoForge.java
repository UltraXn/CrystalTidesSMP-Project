package com.crystaltides.boost.neoforge;

import com.crystaltides.boost.CrystalTidesBoostCommon;
import net.neoforged.fml.common.Mod;

/**
 * NeoForge Mod Entrypoint for CrystalTides Boost.
 */
@Mod(CrystalTidesBoostCommon.MOD_ID)
public class CrystalTidesBoostNeoForge {

    public CrystalTidesBoostNeoForge() {
        // Runs on NeoForge client/server startup
        CrystalTidesBoostCommon.init();
    }
}
