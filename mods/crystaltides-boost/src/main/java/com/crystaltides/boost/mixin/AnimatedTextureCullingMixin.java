package com.crystaltides.boost.mixin;

import com.crystaltides.boost.client.WindowState;
import com.llamalad7.mixinextras.injector.v2.WrapWithCondition;
import net.minecraft.client.Minecraft;
import net.minecraft.client.renderer.texture.TextureManager;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;

/**
 * AnimatedTextureCullingMixin - Skips animated texture uploads (glTexSubImage2D) while minimized.
 * Target: the TextureManager.tick() call, its only caller: Minecraft.tick() (20 TPS) up to 1.21.10 and
 * Minecraft.runTick() since 1.21.11.
 *
 * Minecraft keeps rendering while minimized, so without this the animated sprites in view keep being
 * uploaded. Skipping the whole TextureManager tick freezes every animation coherently: vanilla
 * tickers, Sodium's per-sprite activity flags and frame counters (SpriteContentsTickerMixin), and Iris
 * PBR atlases (ticked from the TAIL of TextureAtlas.cycleAnimationFrames) all stay on the frame they
 * last uploaded, so nothing goes out of sync and animations resume on restore. Vanilla freezes them
 * the same way when the tick rate is frozen.
 *
 * Only minimization counts, not focus loss: an unfocused window may still be on screen.
 * require = 0: if another mod rewrote this call, the optimization is skipped instead of failing startup.
 */
@Mixin(value = Minecraft.class, priority = 1050)
public abstract class AnimatedTextureCullingMixin {

    @WrapWithCondition(
        //? if <1.21.11 {
        method = "tick",
        //?} else {
        /*method = "runTick",
        *///?}
        at = @At(value = "INVOKE", target = "Lnet/minecraft/client/renderer/texture/TextureManager;tick()V"),
        require = 0
    )
    private boolean crystaltides$tickAnimatedTextures(TextureManager textureManager) {
        return !WindowState.isMinimized((Minecraft) (Object) this);
    }
}
