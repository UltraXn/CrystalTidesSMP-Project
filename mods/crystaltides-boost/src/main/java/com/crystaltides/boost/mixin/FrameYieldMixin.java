package com.crystaltides.boost.mixin;

import com.llamalad7.mixinextras.injector.v2.WrapWithCondition;
import net.minecraft.client.Minecraft;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;

/**
 * FrameYieldMixin - Skips the Thread.yield() at the end of every frame (skipFrameYield=true).
 * Target: the Thread.yield() call in Minecraft.runTick(boolean), after the buffer swap and FPS limiter.
 *
 * On Windows HotSpot implements Thread.yield with SwitchToThread, which hands the rest of the render
 * thread's time slice to any thread ready on that core, lower-priority background workers included;
 * the render thread then waits to be rescheduled before it can start the next frame. The loading-screen
 * yield in Minecraft#doWorldLoad is left alone.
 * require = 0: if another mod rewrote this call, the optimization is skipped instead of failing startup.
 */
@Mixin(value = Minecraft.class, priority = 1050)
public abstract class FrameYieldMixin {

    @WrapWithCondition(method = "runTick", at = @At(value = "INVOKE", target = "Ljava/lang/Thread;yield()V", remap = false), require = 0)
    private boolean crystaltides$skipFrameYield() {
        return false;
    }
}
