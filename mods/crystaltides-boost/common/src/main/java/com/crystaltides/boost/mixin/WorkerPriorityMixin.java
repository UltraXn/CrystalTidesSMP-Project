package com.crystaltides.boost.mixin;

import com.crystaltides.boost.CrystalTidesBoostCommon;
import net.minecraft.Util;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfoReturnable;

import java.util.concurrent.ForkJoinPool;
import java.util.concurrent.ForkJoinWorkerThread;

/**
 * WorkerPriorityMixin - Demotes background chunk generation and meshing worker threads.
 *
 * In vanilla Minecraft, background worker threads run at default priority (NORM_PRIORITY = 5).
 * Under heavy chunk loading or travel, they saturate all CPU cores and preempt the OpenGL
 * Render thread, causing frame pacing stutter and 1% low FPS dips.
 *
 * This mixin configures worker threads to run at priority 3 (NORM_PRIORITY - 2), guaranteeing
 * that the Render Thread always gets CPU time slices without waiting.
 */
@SuppressWarnings({"java:S100", "PMD.UnusedPrivateMethod", "PMD.UnusedFormalParameter", "PMD.AbstractClassWithoutAbstractMethod", "PMD.MissingStaticMethodInNonInstantiatableClass", "PMD.GuardLogStatement"})
@Mixin(Util.class)
public abstract class WorkerPriorityMixin {

    private WorkerPriorityMixin() {
        // Utility mixin class
    }

    @Inject(
        method = "createWorker(Ljava/lang/String;Ljava/util/concurrent/ForkJoinPool;)Ljava/util/concurrent/ForkJoinWorkerThread;",
        at = @At("RETURN")
    )
    private static void crystaltides$adjustWorkerPriority(
        String name,
        ForkJoinPool pool,
        CallbackInfoReturnable<ForkJoinWorkerThread> cir
    ) {
        ForkJoinWorkerThread thread = cir.getReturnValue();
        if (thread != null) {
            try {
                // Lower priority to prevent chunk building from starving OpenGL Render Thread
                thread.setPriority(Thread.NORM_PRIORITY - 2);
            } catch (SecurityException ignored) {
                CrystalTidesBoostCommon.LOGGER.debug("Could not adjust worker thread priority: {}", ignored.getMessage());
            }
        }
    }
}
