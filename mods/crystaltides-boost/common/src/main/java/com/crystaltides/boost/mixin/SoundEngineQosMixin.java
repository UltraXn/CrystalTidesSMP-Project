package com.crystaltides.boost.mixin;

import com.crystaltides.boost.client.ThreadQos;
import net.minecraft.client.sounds.SoundEngineExecutor;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;

/**
 * SoundEngineQosMixin - Raises the "Sound engine" thread priority (default 8, ABOVE_NORMAL on Windows).
 * Target: SoundEngineExecutor.run(), the loop body of the sound thread itself.
 *
 * That thread streams and decodes music and records (Channel#updateStream); when chunk workers
 * saturate the CPU it can starve and the stream underruns. run() executes on the thread being
 * boosted and again every time SoundEngineExecutor.flush() recreates it (sound engine reloads),
 * so no thread reference has to be captured. Once per thread start: not a hot path.
 *
 * Only raises: a thread recreated from the render thread inherits its priority (10 once ThreadQosMixin
 * or vanilla's own boost applied) and is left there.
 */
@Mixin(value = SoundEngineExecutor.class, priority = 950)
public abstract class SoundEngineQosMixin {

    @Inject(method = "run", at = @At("HEAD"))
    private void crystaltides$raiseSoundThreadPriority(CallbackInfo ci) {
        ThreadQos.applyToCurrent("Sound engine", ThreadQos.Settings.SOUND_PRIORITY);
    }
}
