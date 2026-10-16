package com.crystaltides.boost.mixin;

import com.crystaltides.boost.bridge.AgentBridge;
import com.crystaltides.boost.compat.CompatReport;
import com.crystaltides.boost.compat.MixinSelection;
import com.crystaltides.boost.config.BoostConfig;
import com.crystaltides.boost.platform.IPlatformHelper;
import com.crystaltides.boost.platform.Services;
import org.objectweb.asm.tree.ClassNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.spongepowered.asm.mixin.extensibility.IMixinConfigPlugin;
import org.spongepowered.asm.mixin.extensibility.IMixinInfo;

import java.nio.file.Path;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Pre-launch gate for every CrystalTides Boost mixin.
 *
 * Runs before Minecraft classes are transformed, so it never touches net.minecraft.* (that would
 * load them untransformed). It only reads the config file, the loader's mod list (through
 * IPlatformHelper) and the launcher agent on the system class loader, decides once which mixins
 * apply and logs a single diagnostic summary.
 */
public class BoostMixinPlugin implements IMixinConfigPlugin {

    private static final Logger LOGGER = LoggerFactory.getLogger("crystaltides-boost");

    private MixinSelection selection;

    @Override
    public void onLoad(String mixinPackage) {
        IPlatformHelper platform = platform();
        BoostConfig config = BoostConfig.load(configDirectory(platform));
        CompatReport compat = detectMods(platform);
        boolean agentPresent = AgentBridge.isAgentPresent();
        this.selection = MixinSelection.evaluate(config, compat, agentPresent);
        logDiagnostics(platform, config, compat, agentPresent);
    }

    @Override
    public String getRefMapperConfig() {
        // Fabric Loom adds the refmap to the mixin config; NeoForge runs on Mojang names and needs none
        return null;
    }

    @Override
    public boolean shouldApplyMixin(String targetClassName, String mixinClassName) {
        return selection == null || selection.isEnabled(simpleName(mixinClassName));
    }

    private static IPlatformHelper platform() {
        try {
            return Services.PLATFORM;
        } catch (RuntimeException | LinkageError e) {
            LOGGER.warn("[CrystalTides Boost] Platform helper unavailable at pre-launch, mod detection disabled: {}", e.toString());
            return null;
        }
    }

    private static Path configDirectory(IPlatformHelper platform) {
        if (platform == null) {
            return null;
        }
        try {
            return platform.getConfigDirectory();
        } catch (RuntimeException e) {
            LOGGER.warn("[CrystalTides Boost] Config directory unavailable, using ./config: {}", e.toString());
            return null;
        }
    }

    private static CompatReport detectMods(IPlatformHelper platform) {
        if (platform == null) {
            return CompatReport.none();
        }
        try {
            return CompatReport.detect(platform::isModLoaded);
        } catch (RuntimeException e) {
            LOGGER.warn("[CrystalTides Boost] Could not query the mod list at pre-launch: {}", e.toString());
            return CompatReport.none();
        }
    }

    private void logDiagnostics(IPlatformHelper platform, BoostConfig config, CompatReport compat, boolean agentPresent) {
        List<String> detected = compat.detectedMods();
        LOGGER.info("[CrystalTides Boost] Pre-launch on {} | detected: {} | launcher agent: {}",
            platform != null ? platform.getPlatformName() : "unknown platform",
            detected.isEmpty() ? "none" : String.join(", ", detected),
            agentPresent ? "present" : "absent");
        LOGGER.info("[CrystalTides Boost] Mixins enabled: {}", String.join(", ", selection.enabled()));
        for (Map.Entry<String, String> disabled : selection.disabled().entrySet()) {
            LOGGER.info("[CrystalTides Boost] Mixin disabled: {} ({})", disabled.getKey(), disabled.getValue());
        }
        LOGGER.info("[CrystalTides Boost] Sound thread priority {}, Netty client IO priority {}, eco FPS cap minimized {} / unfocused {}, mute when minimized {}",
            config.getSoundThreadPriority(),
            config.getNetworkThreadPriority(),
            config.getMinimizedFpsLimit(),
            config.getUnfocusedFpsLimit(),
            config.isMuteWhenMinimized());
    }

    private static String simpleName(String className) {
        return className.substring(className.lastIndexOf('.') + 1);
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
