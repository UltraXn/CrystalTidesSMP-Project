package com.crystaltides.boost.mixin;

import com.crystaltides.boost.client.BackgroundWorkers;
import com.llamalad7.mixinextras.injector.ModifyReturnValue;
import net.minecraft.Util;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;

/**
 * BackgroundWorkerLimitMixin - Caps the background worker pool through Util.getMaxThreads(), the hook
 * vanilla already provides for the max.bg.threads system property.
 * Target: Util.getMaxThreads(), called once while Util's static executors are created.
 *
 * Util#makeExecutor computes clamp(availableProcessors - 1, 1, getMaxThreads()), so lowering the
 * returned maximum shrinks the pool without touching the executor's lambdas, whose synthetic names are
 * not stable across builds. See BackgroundWorkers for the sizing and why it helps.
 */
@Mixin(value = Util.class, priority = 1050)
public abstract class BackgroundWorkerLimitMixin {

    @ModifyReturnValue(method = "getMaxThreads", at = @At("RETURN"))
    private static int crystaltides$limitBackgroundWorkers(int original) {
        return BackgroundWorkers.maxThreads(original);
    }
}
