package com.crystaltides.boost.mixin;

import com.crystaltides.boost.bridge.AgentBridge;
import net.minecraft.client.Minecraft;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.ModifyVariable;

/**
 * FrameTelemetryMixin - Reports each frame start to the launcher agent (FPS / p99 frametime).
 * Target: Minecraft.runTick(boolean), called exactly once per main-loop iteration.
 *
 * The agent measures the interval between consecutive frame starts, i.e. the whole frame period:
 * scheduled tasks and client ticks, GameRenderer.render (including Iris shadow and deferred passes),
 * the blit, Window.updateDisplay (glfwSwapBuffers), the FPS limiter sleep, Thread.yield and Sodium's
 * GPU fence wait (injected at the HEAD of runTick), each of them exactly once.
 *
 * Only applied when the agent is present (see BoostMixinPlugin).
 */
@Mixin(value = Minecraft.class, priority = 950)
public abstract class FrameTelemetryMixin {

    /**
     * Observes runTick's argument at HEAD and returns it unchanged: unlike @Inject this needs no
     * CallbackInfo, so the per-frame hook allocates nothing.
     */
    @ModifyVariable(method = "runTick", at = @At("HEAD"), argsOnly = true)
    private boolean crystaltides$recordFrameStart(boolean renderLevel) {
        AgentBridge.onFrameStart(System.nanoTime());
        return renderLevel;
    }
}
