package com.crystaltides.boost.mixin;

import com.crystaltides.boost.CrystalTidesBoostCommon;
import com.crystaltides.boost.client.ThreadQos;
import net.minecraft.client.Minecraft;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;

/**
 * ThreadQosMixin - Raises the render thread (the main loop, "Render thread") to MAX_PRIORITY (10).
 * Target: Minecraft.run(), once, before the main loop starts.
 *
 * Minecraft#run already does this itself, but only on machines with more than 4 cores; on 4 cores
 * or fewer this mixin is what applies it. That trades some CPU time of the singleplayer integrated
 * server for steadier frame pacing, which is the right call for a multiplayer client.
 */
@Mixin(value = Minecraft.class, priority = 950)
public abstract class ThreadQosMixin {

    @Inject(method = "run", at = @At("HEAD"))
    private void crystaltides$boostRenderThreadPriority(CallbackInfo ci) {
        int cores = Runtime.getRuntime().availableProcessors();
        if (cores <= 4) {
            CrystalTidesBoostCommon.LOGGER.info(
                "[ThreadQoS] {} logical cores: vanilla keeps the render thread at normal priority here, forcing MAX_PRIORITY (threadQos=true)",
                cores
            );
        }
        ThreadQos.applyToCurrent("Render thread", Thread.MAX_PRIORITY);
    }
}
