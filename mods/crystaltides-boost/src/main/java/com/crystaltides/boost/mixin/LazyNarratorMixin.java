package com.crystaltides.boost.mixin;

import com.crystaltides.boost.CrystalTidesBoostClient;
import net.minecraft.client.NarratorStatus;
import net.minecraft.client.gui.components.toasts.ToastComponent;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.Shadow;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;

/**
 * LazyNarratorMixin - Defers native text-to-speech initialization.
 *
 * Prevents the 2-4 second splash screen hang during game startup caused by
 * synchronous loading of native audio/speech synthesis binaries (Flite / SAPI).
 * Narration is only initialized on demand if the user turns it on (Ctrl+B).
 */
@Mixin(targets = "net.minecraft.client.NarratorManager")
public abstract class LazyNarratorMixin {

    @Shadow
    public abstract NarratorStatus getStatus();

    @Inject(method = "updateBookText(Ljava/lang/String;)V", at = @At("HEAD"), cancellable = true)
    private void crystaltides$onUpdateBookText(String text, CallbackInfo ci) {
        if (this.getStatus() == NarratorStatus.OFF) {
            ci.cancel();
        }
    }

    @Inject(method = "sayNow(Ljava/lang/String;)V", at = @At("HEAD"), cancellable = true)
    private void crystaltides$onSayNow(String message, CallbackInfo ci) {
        if (this.getStatus() == NarratorStatus.OFF) {
            ci.cancel();
        }
    }
}
