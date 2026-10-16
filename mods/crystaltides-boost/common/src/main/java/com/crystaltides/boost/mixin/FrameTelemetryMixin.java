package com.crystaltides.boost.mixin;

import com.crystaltides.boost.bridge.AgentBridge;
import net.minecraft.client.Minecraft;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;

/**
 * FrameTelemetryMixin - Reports each frame start to the launcher agent (FPS / p99 frametime).
 * Target: Minecraft.runTick(boolean), invoked once per main-loop iteration (one frame).
 * Only applied when the agent is present (see BoostMixinPlugin).
 */
@Mixin(Minecraft.class)
public abstract class FrameTelemetryMixin {

    @Inject(method = "runTick", at = @At("HEAD"))
    private void crystaltides$recordFrameStart(boolean renderLevel, CallbackInfo ci) {
        AgentBridge.onFrameStart();
    }
}
