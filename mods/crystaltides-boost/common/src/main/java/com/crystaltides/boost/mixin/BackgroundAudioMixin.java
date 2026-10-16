package com.crystaltides.boost.mixin;

import com.crystaltides.boost.client.WindowStateTracker;
import com.mojang.blaze3d.audio.Listener;
import net.minecraft.client.Camera;
import net.minecraft.client.Minecraft;
import net.minecraft.client.Options;
import net.minecraft.client.sounds.SoundEngine;
import net.minecraft.sounds.SoundSource;
import org.spongepowered.asm.mixin.Final;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.Shadow;
import org.spongepowered.asm.mixin.Unique;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.ModifyVariable;

/**
 * BackgroundAudioMixin - Silences the game while the window is minimized (muteWhenMinimized=true).
 * Target: SoundEngine.updateSource(Camera), called once per frame from Minecraft.runTick.
 *
 * Mutes through the OpenAL listener gain, like vanilla's master volume slider does from this same
 * render thread (SoundEngine.updateCategoryVolume), so Options and the user's volume are never
 * touched: on restore the gain is set back from Options. While minimized the zero gain is re-applied
 * if anything restores it (SoundEngine.loadLibrary does after a reload). OpenAL keeps mixing at zero
 * gain, so this is a comfort setting, not a CPU saving.
 */
@Mixin(value = SoundEngine.class, priority = 1050)
public abstract class BackgroundAudioMixin {

    @Shadow
    @Final
    private Options options;

    @Shadow
    @Final
    private Listener listener;

    @Shadow
    private boolean loaded;

    @Unique
    private boolean crystaltides$mutedWhileMinimized;

    /** Observes the argument and returns it unchanged: no CallbackInfo, so no per-frame allocation. */
    @ModifyVariable(method = "updateSource", at = @At("HEAD"), argsOnly = true)
    private Camera crystaltides$muteWhileMinimized(Camera camera) {
        WindowStateTracker.ensureInstalled(Minecraft.getInstance().getWindow().getWindow());
        if (!this.loaded) {
            return camera;
        }
        if (WindowStateTracker.isIconified()) {
            if (this.listener.getGain() != 0.0F) {
                this.listener.setGain(0.0F);
            }
            this.crystaltides$mutedWhileMinimized = true;
        } else if (this.crystaltides$mutedWhileMinimized) {
            this.crystaltides$mutedWhileMinimized = false;
            this.listener.setGain(this.options.getSoundSourceVolume(SoundSource.MASTER));
        }
        return camera;
    }
}
