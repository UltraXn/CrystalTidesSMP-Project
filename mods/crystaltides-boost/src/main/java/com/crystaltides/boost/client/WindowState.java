package com.crystaltides.boost.client;

import net.minecraft.client.Minecraft;

/**
 * Window state reads shared by the render-thread hooks: plain field reads, no JNI, no allocation.
 */
public final class WindowState {

    private WindowState() {
    }

    /**
     * True while the game window is minimized. Minecraft keeps its own iconified flag since 1.21.2
     * (Window#isIconified); 1.21.1 has none, so WindowStateTracker installs a GLFW callback once.
     */
    public static boolean isMinimized(Minecraft minecraft) {
        //? if <1.21.2 {
        WindowStateTracker.ensureInstalled(minecraft.getWindow().getWindow());
        return WindowStateTracker.isIconified();
        //?} else {
        /*return minecraft.getWindow().isIconified();
        *///?}
    }

    /** True while an overlay (resource reload screen) is shown; 26.2 moved overlays from Minecraft to Gui. */
    public static boolean isLoading(Minecraft minecraft) {
        //? if <26.2 {
        return minecraft.getOverlay() != null;
        //?} else {
        /*return minecraft.gui.overlay() != null;
        *///?}
    }
}
