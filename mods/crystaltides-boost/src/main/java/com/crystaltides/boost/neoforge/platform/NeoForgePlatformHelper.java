package com.crystaltides.boost.neoforge.platform;

//? if neoforge {
/*import com.crystaltides.boost.platform.IPlatformHelper;
import net.neoforged.fml.ModList;
import net.neoforged.fml.loading.FMLPaths;
import net.neoforged.fml.loading.LoadingModList;

import java.nio.file.Path;

// NeoForge implementation of IPlatformHelper
public class NeoForgePlatformHelper implements IPlatformHelper {

    @Override
    public String getPlatformName() {
        return "NeoForge";
    }

    @Override
    public boolean isModLoaded(String modId) {
        ModList modList = ModList.get();
        if (modList != null) {
            return modList.isLoaded(modId);
        }
        // Mixin config plugins run before ModList exists; the loading mod list is already built then
        LoadingModList loadingModList = FmlAccess.loadingModList();
        return loadingModList != null && loadingModList.getModFileById(modId) != null;
    }

    @Override
    public boolean isDevelopmentEnvironment() {
        return !FmlAccess.isProduction();
    }

    @Override
    public Path getGameDirectory() {
        return FMLPaths.GAMEDIR.get();
    }

    @Override
    public Path getConfigDirectory() {
        return FMLPaths.CONFIGDIR.get();
    }
}
*///?}
