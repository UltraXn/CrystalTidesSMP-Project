package com.crystaltides.boost.mixin;

import net.minecraft.client.Minecraft;
import net.minecraft.client.renderer.texture.TextureManager;
import org.lwjgl.glfw.GLFW;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;

/**
 * AnimatedTextureCullingMixin - Culls GPU animated texture uploads when minimized.
 * Target: TextureManager.tick (concrete class).
 * Freezes ONLY when window is minimized (iconified via GLFW), NOT when losing focus.
 */
@Mixin(TextureManager.class)
public abstract class AnimatedTextureCullingMixin {

    @Inject(method = "tick", at = @At("HEAD"), cancellable = true)
    private void crystaltides$cullWhenIconified(CallbackInfo ci) {
        Minecraft mc = Minecraft.getInstance();
        if (mc == null) {
            return;
        }
        long window = mc.getWindow().getWindow();
        if (window != 0L && GLFW.glfwGetWindowAttrib(window, GLFW.GLFW_ICONIFIED) == GLFW.GLFW_TRUE) {
            ci.cancel();
        }
    }
}
