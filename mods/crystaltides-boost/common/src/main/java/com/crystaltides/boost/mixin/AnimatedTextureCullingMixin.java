package com.crystaltides.boost.mixin;

import net.minecraft.client.Minecraft;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.Unique;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;

/**
 * AnimatedTextureCullingMixin - Intelligent GPU upload culling for animated sprites.
 *
 * Vanilla Minecraft ticks and re-uploads animated textures (water, lava, fire, portals,
 * respawn anchors, clocks, compasses) to the GPU via glTexSubImage2D on every tick,
 * even when the window is minimized, paused, or during redundant render passes.
 *
 * This mixin saves significant PCIe bus bandwidth and VRAM write cycles:
 * 1. Background freeze: Freezes uploads when the window is inactive/alt-tabbed.
 * 2. Pause screen culling: Skips texture re-uploads while game is paused.
 * 3. Pass deduplication: Ensures each sprite uploads at most once per game tick.
 */
@SuppressWarnings({"java:S100", "java:S116", "PMD.UnusedPrivateMethod", "PMD.AbstractClassWithoutAbstractMethod"})
@Mixin(targets = "net.minecraft.client.renderer.texture.TextureAtlasSprite$Ticker")
public abstract class AnimatedTextureCullingMixin {

    @Unique
    private long crystaltides$lastActiveTick = -1L;

    @Inject(method = "tickAndUpload", at = @At("HEAD"), cancellable = true)
    private void crystaltides$onTickAndUpload(CallbackInfo ci) {
        Minecraft mc = Minecraft.getInstance();
        if (mc == null) {
            return;
        }

        // 1. Freeze texture uploads to GPU when window is alt-tabbed or minimized
        if (!mc.isWindowActive()) {
            ci.cancel();
            return;
        }

        // 2. Freeze texture uploads while the game is paused or in pause screen
        if (mc.isPaused() || (mc.screen != null && mc.screen.isPauseScreen())) {
            ci.cancel();
            return;
        }

        // 3. Prevent duplicate GPU re-uploads within the same game tick across multiple render passes
        if (mc.level != null) {
            long currentTick = mc.level.getGameTime();
            if (this.crystaltides$lastActiveTick == currentTick && currentTick >= 0L) {
                ci.cancel();
                return;
            }
            this.crystaltides$lastActiveTick = currentTick;
        }
    }
}
