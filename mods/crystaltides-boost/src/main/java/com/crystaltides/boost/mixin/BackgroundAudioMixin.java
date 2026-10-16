package com.crystaltides.boost.mixin;

import com.crystaltides.boost.client.SoundVolumes;
import com.crystaltides.boost.client.WindowState;
import com.llamalad7.mixinextras.injector.ModifyReturnValue;
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
 * Up to 1.21.8 it mutes through the OpenAL listener gain, like vanilla's master volume slider does
 * from this same render thread, and sets the gain back from Options on restore; the zero gain is
 * re-applied if anything restores it while minimized (SoundEngine.loadLibrary does after a reload).
 * 1.21.9 dropped the listener gain and folds the master volume into every sound's volume instead, so
 * there SoundEngine.calculateVolume returns 0 while minimized and every playing sound is refreshed when
 * the window is minimized or restored. Either way Options and the user's volume are never touched.
 * OpenAL keeps mixing silent sounds, so this is a comfort setting, not a CPU saving.
 */
@Mixin(value = SoundEngine.class, priority = 1050)
public abstract class BackgroundAudioMixin {

    @Shadow
    private boolean loaded;

    //? if <1.21.9 {
    @Shadow
    @Final
    private Options options;

    @Shadow
    @Final
    private Listener listener;
    //?}

    @Unique
    private boolean crystaltides$mutedWhileMinimized;

    /** Observes the argument and returns it unchanged: no CallbackInfo, so no per-frame allocation. */
    @ModifyVariable(method = "updateSource", at = @At("HEAD"), argsOnly = true)
    private Camera crystaltides$muteWhileMinimized(Camera camera) {
        if (!this.loaded) {
            return camera;
        }
        boolean minimized = WindowState.isMinimized(Minecraft.getInstance());
        //? if <1.21.9 {
        if (minimized) {
            if (this.listener.getGain() != 0.0F) {
                this.listener.setGain(0.0F);
            }
            this.crystaltides$mutedWhileMinimized = true;
        } else if (this.crystaltides$mutedWhileMinimized) {
            this.crystaltides$mutedWhileMinimized = false;
            this.listener.setGain(this.options.getSoundSourceVolume(SoundSource.MASTER));
        }
        //?} else {
        /*if (minimized != this.crystaltides$mutedWhileMinimized) {
            this.crystaltides$mutedWhileMinimized = minimized;
            // calculateVolume below reads the flag: re-apply it to the sounds already playing
            SoundVolumes.refreshAll((SoundEngine) (Object) this);
        }
        *///?}
        return camera;
    }

    //? if >=1.21.9 {
    /*@ModifyReturnValue(method = "calculateVolume(Lnet/minecraft/client/resources/sounds/SoundInstance;)F", at = @At("RETURN"))
    private float crystaltides$silenceWhileMinimized(float volume) {
        return this.crystaltides$mutedWhileMinimized ? 0.0F : volume;
    }
    *///?}
}
