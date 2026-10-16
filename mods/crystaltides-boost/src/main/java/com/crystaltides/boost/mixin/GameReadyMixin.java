package com.crystaltides.boost.mixin;

import com.crystaltides.boost.bridge.AgentBridge;
import net.minecraft.client.Minecraft;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;

/**
 * GameReadyMixin - Signals game_ready to the launcher agent when the initial load finishes.
 * Target: Minecraft.onGameLoadFinished(GameLoadCookie), run once when the loading overlay closes.
 *
 * TitleScreen.init is not a reliable signal: with quickPlay the game joins a world directly, on a
 * first launch the accessibility onboarding screen comes first, and menu mods replace the title
 * screen. The handler omits the target's arguments, so the private GameLoadCookie type is never
 * referenced. Only applied when the agent is present (see BoostMixinPlugin).
 */
@Mixin(value = Minecraft.class, priority = 950)
public abstract class GameReadyMixin {

    @Inject(method = "onGameLoadFinished", at = @At("TAIL"))
    private void crystaltides$notifyGameReady(CallbackInfo ci) {
        AgentBridge.notifyGameReady();
    }
}
