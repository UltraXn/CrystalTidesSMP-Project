package com.crystaltides.boost.neoforge.platform;

//? if neoforge && <1.21.9 {
/*import net.neoforged.fml.loading.FMLLoader;
import net.neoforged.fml.loading.LoadingModList;

// FMLLoader up to FML 9 (NeoForge 21.8): static accessors
final class FmlAccess {

    private FmlAccess() {
    }

    static LoadingModList loadingModList() {
        return FMLLoader.getLoadingModList();
    }

    static boolean isProduction() {
        return FMLLoader.isProduction();
    }
}
*///?}
//? if neoforge && >=1.21.9 {
/*import net.neoforged.fml.loading.FMLLoader;
import net.neoforged.fml.loading.LoadingModList;

// FML 10 (NeoForge 21.9) turned FMLLoader into an instance, reached through FMLLoader.getCurrent()
final class FmlAccess {

    private FmlAccess() {
    }

    static LoadingModList loadingModList() {
        FMLLoader loader = FMLLoader.getCurrentOrNull();
        return loader == null ? null : loader.getLoadingModList();
    }

    static boolean isProduction() {
        return FMLLoader.getCurrent().isProduction();
    }
}
*///?}
