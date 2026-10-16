package com.crystaltides.boost.mixin;

import com.crystaltides.boost.client.BackgroundEco;
import com.crystaltides.boost.client.WindowState;
import com.llamalad7.mixinextras.injector.ModifyReturnValue;
import net.minecraft.client.Minecraft;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;

/**
 * BackgroundEcoMixin - Caps the frame rate while the window is minimized or unfocused.
 * Target: up to 1.21.1 Minecraft.getFramerateLimit(), read once per frame by runTick. 1.21.2 moved the
 * limit into FramerateLimitTracker.getFramerateLimit(), which also applies vanilla's own inactivity
 * limits; this caps whatever that returns.
 *
 * Focus, minimized and loading states are field reads (see WindowState): no JNI query per frame. The
 * returned value never exceeds the original one and is left untouched while an overlay (resource
 * reload) shows. Priority 1050 applies this modifier after default-priority ones, so the cap is the
 * final word.
 */
//? if <1.21.2 {
@Mixin(value = Minecraft.class, priority = 1050)
//?} else {
/*@Mixin(value = com.mojang.blaze3d.platform.FramerateLimitTracker.class, priority = 1050)
*///?}
public abstract class BackgroundEcoMixin {

    @ModifyReturnValue(method = "getFramerateLimit", at = @At("RETURN"))
    private int crystaltides$backgroundFramerateLimit(int original) {
        Minecraft minecraft = Minecraft.getInstance();
        return BackgroundEco.limit(
            original,
            WindowState.isLoading(minecraft),
            WindowState.isMinimized(minecraft),
            minecraft.isWindowActive(),
            BackgroundEco.Settings.MINIMIZED_LIMIT,
            BackgroundEco.Settings.UNFOCUSED_LIMIT
        );
    }
}
