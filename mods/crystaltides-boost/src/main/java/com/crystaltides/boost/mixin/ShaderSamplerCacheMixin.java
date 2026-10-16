package com.crystaltides.boost.mixin;

//? if <1.21.2 {
import com.llamalad7.mixinextras.injector.wrapoperation.Operation;
import com.llamalad7.mixinextras.injector.wrapoperation.WrapOperation;
import com.llamalad7.mixinextras.sugar.Local;
import net.minecraft.client.renderer.ShaderInstance;
import org.spongepowered.asm.mixin.Final;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.Shadow;
import org.spongepowered.asm.mixin.injection.At;

import java.util.List;

/**
 * ShaderSamplerCacheMixin - Stops ShaderInstance#apply from querying sampler uniform locations from the
 * driver every time a shader is applied.
 * Target: the Uniform.glGetUniformLocation call inside ShaderInstance.apply().
 *
 * updateLocations() already stores each sampler's location in samplerLocations, index-aligned with
 * samplerNames, and they never change after linking; apply() still asks the driver again for every
 * sampler. On NVIDIA (threaded optimizations) glGetUniformLocation forces a sync with the driver
 * thread: a profile of vanilla 1.21.1 put 21% of the render thread's native time there.
 *
 * Sodium and Embeddium ship the same fix (their own ShaderInstanceMixin), so BoostMixinPlugin skips
 * this mixin when either is installed. require = 0: if another mod rewrote this call, the cache is
 * skipped instead of failing startup. ShaderInstance only exists up to 1.21.1.
 */
@Mixin(value = ShaderInstance.class, priority = 1050)
public abstract class ShaderSamplerCacheMixin {

    @Shadow
    @Final
    private List<String> samplerNames;

    @Shadow
    @Final
    private List<Integer> samplerLocations;

    /**
     * apply() passes samplerNames.get(j) as the name, so the cached location is used only when that exact
     * String instance sits at the captured loop index; anything else falls back to the driver query.
     */
    @WrapOperation(
        method = "apply",
        at = @At(value = "INVOKE", target = "Lcom/mojang/blaze3d/shaders/Uniform;glGetUniformLocation(ILjava/lang/CharSequence;)I"),
        require = 0
    )
    private int crystaltides$cachedSamplerLocation(int program, CharSequence name, Operation<Integer> original,
                                                   @Local(ordinal = 1) int samplerIndex) {
        if (samplerIndex >= 0 && samplerIndex < this.samplerLocations.size() && this.samplerNames.get(samplerIndex) == name) {
            return this.samplerLocations.get(samplerIndex);
        }
        return original.call(program, name);
    }
}
//?} else {
/*import net.minecraft.client.Minecraft;
import org.spongepowered.asm.mixin.Mixin;

// ShaderInstance only exists up to 1.21.1. This empty placeholder keeps one mixin config for every
// Minecraft version; BoostMixinPlugin never applies it (VersionSupport.shaderSamplerCache).
@Mixin(Minecraft.class)
public abstract class ShaderSamplerCacheMixin {
}
*///?}
