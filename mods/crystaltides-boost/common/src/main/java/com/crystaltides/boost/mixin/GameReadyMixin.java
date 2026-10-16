package com.crystaltides.boost.mixin;

import com.crystaltides.boost.bridge.AgentBridge;
import net.minecraft.client.gui.screens.TitleScreen;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;

/**
 * GameReadyMixin - Signals game_ready to the launcher agent the first time the TitleScreen
 * is initialised. Only applied when the agent is present (see BoostMixinPlugin).
 */
@Mixin(TitleScreen.class)
public abstract class GameReadyMixin {

    @Inject(method = "init", at = @At("TAIL"))
    private void crystaltides$notifyGameReady(CallbackInfo ci) {
        AgentBridge.notifyGameReady();
    }
}
