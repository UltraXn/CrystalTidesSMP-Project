package com.crystaltides.boost.mixin;

import com.crystaltides.boost.client.BackgroundEco;
import com.crystaltides.boost.client.WindowStateTracker;
import com.llamalad7.mixinextras.injector.ModifyReturnValue;
import com.mojang.blaze3d.platform.Window;
import net.minecraft.client.Minecraft;
import net.minecraft.client.gui.screens.Overlay;
import org.spongepowered.asm.mixin.Final;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.Shadow;
import org.spongepowered.asm.mixin.injection.At;

/**
 * BackgroundEcoMixin - Caps the frame rate while the window is minimized or unfocused.
 * Target: Minecraft.getFramerateLimit(), read once per frame by runTick right after the buffer swap.
 *
 * Focus comes from Minecraft#windowActive (kept by GLFW's focus callback) and the minimized state
 * from WindowStateTracker (GLFW's iconify callback): no JNI query per frame. The returned value
 * never exceeds the original one and is left untouched while an overlay (resource reload) shows.
 * Priority 1050 applies this modifier after default-priority ones, so the cap is the final word.
 */
@Mixin(value = Minecraft.class, priority = 1050)
public abstract class BackgroundEcoMixin {

    @Shadow
    @Final
    private Window window;

    @Shadow
    private Overlay overlay;

    @Shadow
    private boolean windowActive;

    @ModifyReturnValue(method = "getFramerateLimit", at = @At("RETURN"))
    private int crystaltides$backgroundFramerateLimit(int original) {
        WindowStateTracker.ensureInstalled(this.window.getWindow());
        return BackgroundEco.limit(
            original,
            this.overlay != null,
            WindowStateTracker.isIconified(),
            this.windowActive,
            BackgroundEco.Settings.MINIMIZED_LIMIT,
            BackgroundEco.Settings.UNFOCUSED_LIMIT
        );
    }
}
