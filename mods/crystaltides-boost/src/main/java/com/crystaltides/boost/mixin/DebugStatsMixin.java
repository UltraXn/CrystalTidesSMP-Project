package com.crystaltides.boost.mixin;

import com.crystaltides.boost.CrystalTidesBoostCommon;
import net.minecraft.client.Minecraft;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.Unique;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;

/**
 * DebugStatsMixin - Benchmark diagnostics: logs FPS and rendered chunk sections once per second.
 * Only applied with -Dcrystaltides.boost.debugStats=true (see MixinSelection), never in normal play.
 * Lets a benchmark tell a real FPS gain from one obtained by rendering less terrain.
 */
@Mixin(value = Minecraft.class, priority = 1050)
public abstract class DebugStatsMixin {

    @Unique
    private int crystaltides$statsTicks;

    @Inject(method = "tick", at = @At("TAIL"))
    private void crystaltides$logRenderStats(CallbackInfo ci) {
        if (++this.crystaltides$statsTicks < 20) {
            return;
        }
        this.crystaltides$statsTicks = 0;
        Minecraft minecraft = (Minecraft) (Object) this;
        if (minecraft.level != null) {
            //? if <26.2 {
            int sections = minecraft.levelRenderer.countRenderedSections();
            //?} else {
            /*int sections = minecraft.levelExtractor.countRenderedSections();
            *///?}
            CrystalTidesBoostCommon.LOGGER.info("[BenchStats] fps={} renderedSections={}", minecraft.getFps(), sections);
        }
    }
}
