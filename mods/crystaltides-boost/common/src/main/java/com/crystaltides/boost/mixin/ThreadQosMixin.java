package com.crystaltides.boost.mixin;

import com.crystaltides.boost.CrystalTidesBoostCommon;
import net.minecraft.client.Minecraft;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;

/**
 * ThreadQosMixin - Intelligent thread scheduling for Minecraft client.
 * Elevates the OpenGL / Iris render thread to MAX_PRIORITY (10) for minimum jitter.
 */
@Mixin(Minecraft.class)
public abstract class ThreadQosMixin {

    @Inject(method = "run", at = @At("HEAD"))
    private void crystaltides$boostRenderThreadPriority(CallbackInfo ci) {
        Thread renderThread = Thread.currentThread();
        try {
            renderThread.setPriority(Thread.MAX_PRIORITY);
            CrystalTidesBoostCommon.LOGGER.info(
                "[ThreadQoS] Elevated Render Thread ('{}') to MAX_PRIORITY ({})",
                renderThread.getName(),
                Thread.MAX_PRIORITY
            );
        } catch (SecurityException | IllegalArgumentException e) {
            CrystalTidesBoostCommon.LOGGER.warn(
                "[ThreadQoS] Unable to set thread priority for Render Thread: {}",
                e.getMessage()
            );
        }
    }
}
