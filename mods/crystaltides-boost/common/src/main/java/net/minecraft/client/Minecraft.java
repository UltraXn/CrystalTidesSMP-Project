package net.minecraft.client;

import net.minecraft.client.gui.screens.Screen;
import net.minecraft.client.multiplayer.ClientLevel;
import net.minecraft.client.renderer.GameRenderer;

public class Minecraft {
    public Screen screen;
    public ClientLevel level;
    public GameRenderer gameRenderer;

    public static Minecraft getInstance() {
        return null;
    }

    public boolean isWindowActive() {
        return true;
    }

    public boolean isPaused() {
        return false;
    }

    public void run() {
        // Stub
    }
}
