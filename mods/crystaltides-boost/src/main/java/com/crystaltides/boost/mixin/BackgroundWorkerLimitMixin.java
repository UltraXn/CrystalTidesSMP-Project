package com.crystaltides.boost.mixin;

import com.crystaltides.boost.client.BackgroundWorkers;
import com.llamalad7.mixinextras.injector.ModifyReturnValue;
//? if <1.21.11 {
import net.minecraft.Util;
//?} else {
/*import net.minecraft.util.Util;
*///?}
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;

/**
 * BackgroundWorkerLimitMixin - Caps the background worker pool through Util.getMaxThreads(), the hook
 * vanilla already provides for the max.bg.threads system property.
 * Target: Util.getMaxThreads(), called once while Util's static executors are created.
 *
 * Util#makeExecutor sizes the pool as a clamp of the processor count to getMaxThreads() (through
 * Util#maxAllowedExecutorThreads since 1.21.4), so lowering the returned maximum shrinks the pool
 * without touching the executor's lambdas, whose synthetic names are not stable across builds. Util
 * moved to net.minecraft.util in 1.21.11. See BackgroundWorkers for the sizing and why it helps.
 */
@Mixin(value = Util.class, priority = 1050)
public abstract class BackgroundWorkerLimitMixin {

    @ModifyReturnValue(method = "getMaxThreads", at = @At("RETURN"))
    private static int crystaltides$limitBackgroundWorkers(int original) {
        return BackgroundWorkers.maxThreads(original);
    }
}
