package com.crystaltides.boost.mixin;

import com.crystaltides.boost.config.BoostConfig;
import org.objectweb.asm.tree.ClassNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.spongepowered.asm.mixin.extensibility.IMixinConfigPlugin;
import org.spongepowered.asm.mixin.extensibility.IMixinInfo;

import java.util.List;
import java.util.Set;

public class BoostMixinPlugin implements IMixinConfigPlugin {

    private static final Logger LOGGER = LoggerFactory.getLogger("crystaltides-boost");
    private BoostConfig config;

    @Override
    public void onLoad(String mixinPackage) {
        this.config = BoostConfig.getInstance();
        LOGGER.info("[CrystalTides Boost] Mixin configuration plugin loaded. ThreadQoS: {}, AnimatedTextureCulling: {}",
            config.isThreadQosEnabled(), config.isAnimatedTextureCullingEnabled());
    }

    @Override
    public String getRefMapperConfig() {
        return null;
    }

    @Override
    public boolean shouldApplyMixin(String targetClassName, String mixinClassName) {
        if (mixinClassName.endsWith("ThreadQosMixin")) {
            boolean enabled = config != null && config.isThreadQosEnabled();
            if (!enabled) {
                LOGGER.info("[CrystalTides Boost] Disabling ThreadQosMixin via configuration.");
            }
            return enabled;
        }

        if (mixinClassName.endsWith("AnimatedTextureCullingMixin")) {
            boolean enabled = config != null && config.isAnimatedTextureCullingEnabled();
            if (!enabled) {
                LOGGER.info("[CrystalTides Boost] Disabling AnimatedTextureCullingMixin via configuration.");
            }
            return enabled;
        }

        return true;
    }

    @Override
    public void acceptTargets(Set<String> myTargets, Set<String> otherTargets) {
        // No custom dynamic targets needed
    }

    @Override
    public List<String> getMixins() {
        return null;
    }

    @Override
    public void preApply(String targetClassName, ClassNode targetClass, String mixinClassName, IMixinInfo mixinInfo) {
        // No bytecode manipulation needed prior to injection
    }

    @Override
    public void postApply(String targetClassName, ClassNode targetClass, String mixinClassName, IMixinInfo mixinInfo) {
        // No post-application transformations needed
    }
}
