package com.crystaltides.boost.client;

import net.minecraft.client.sounds.SoundEngine;
import net.minecraft.sounds.SoundSource;

/**
 * Re-applies the volume of every playing sound. Only needed since 1.21.9, when the master volume moved
 * from the OpenAL listener gain into each sound's volume; vanilla renamed the method in 1.21.11.
 */
public final class SoundVolumes {

    private SoundVolumes() {
    }

    // Up to 1.21.8 the master volume is the listener gain, which BackgroundAudioMixin sets directly:
    // there this is never called and does nothing
    public static void refreshAll(SoundEngine engine) {
        //? if >=1.21.11 {
        /*engine.refreshCategoryVolume(SoundSource.MASTER);
        *///?} else if >=1.21.9 {
        /*engine.updateCategoryVolume(SoundSource.MASTER);
        *///?}
    }
}
