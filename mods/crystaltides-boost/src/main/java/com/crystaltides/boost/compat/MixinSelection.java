package com.crystaltides.boost.compat;

import com.crystaltides.boost.config.BoostConfig;

import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Decides which mixins BoostMixinPlugin applies, from the configuration, the detected mods and the
 * presence of the launcher agent. Computed once at pre-launch; holds no Minecraft references.
 */
public final class MixinSelection {

    public static final String THREAD_QOS = "ThreadQosMixin";
    public static final String SOUND_ENGINE_QOS = "SoundEngineQosMixin";
    public static final String NETTY_QOS = "NettyQosMixin";
    public static final String BACKGROUND_ECO = "BackgroundEcoMixin";
    public static final String BACKGROUND_AUDIO = "BackgroundAudioMixin";
    public static final String ANIMATED_TEXTURE_CULLING = "AnimatedTextureCullingMixin";
    public static final String AMBIENT_PARTICLES = "AmbientParticleMixin";
    public static final String SHADER_SAMPLER_CACHE = "ShaderSamplerCacheMixin";
    public static final String FRAME_YIELD = "FrameYieldMixin";
    public static final String BACKGROUND_WORKER_LIMIT = "BackgroundWorkerLimitMixin";
    public static final String FRAME_TELEMETRY = "FrameTelemetryMixin";
    public static final String GAME_READY = "GameReadyMixin";
    public static final String DEBUG_STATS = "DebugStatsMixin";

    /** System property that enables the per-second render statistics log used by benchmarks. */
    public static final String DEBUG_STATS_PROPERTY = "crystaltides.boost.debugStats";

    static final String NOT_IN_THIS_VERSION = "not present in this Minecraft version";

    public static final List<String> ALL = List.of(
        THREAD_QOS,
        SOUND_ENGINE_QOS,
        NETTY_QOS,
        BACKGROUND_ECO,
        BACKGROUND_AUDIO,
        ANIMATED_TEXTURE_CULLING,
        AMBIENT_PARTICLES,
        SHADER_SAMPLER_CACHE,
        FRAME_YIELD,
        BACKGROUND_WORKER_LIMIT,
        FRAME_TELEMETRY,
        GAME_READY,
        DEBUG_STATS
    );

    private final Map<String, String> disabled;

    private MixinSelection(Map<String, String> disabled) {
        this.disabled = Collections.unmodifiableMap(disabled);
    }

    public static MixinSelection evaluate(BoostConfig config, CompatReport compat, boolean agentPresent) {
        return evaluate(config, compat, agentPresent, Boolean.getBoolean(DEBUG_STATS_PROPERTY), VersionSupport.CURRENT);
    }

    public static MixinSelection evaluate(BoostConfig config, CompatReport compat, boolean agentPresent,
                                          boolean debugStats, VersionSupport support) {
        Map<String, String> disabled = new LinkedHashMap<>();
        selectThreadQos(config, disabled);
        selectBackground(config, compat, disabled);
        selectRendering(config, compat, support, disabled);
        selectAgentBridge(config, agentPresent, disabled);
        if (!debugStats) {
            disabled.put(DEBUG_STATS, "-D" + DEBUG_STATS_PROPERTY + " not set");
        }
        return new MixinSelection(disabled);
    }

    private static void selectRendering(BoostConfig config, CompatReport compat, VersionSupport support, Map<String, String> disabled) {
        if (!config.isAnimatedTextureCullingEnabled()) {
            disabled.put(ANIMATED_TEXTURE_CULLING, BoostConfig.KEY_ANIMATED_TEXTURE_CULLING + "=false");
        }
        if (!support.ambientParticles()) {
            disabled.put(AMBIENT_PARTICLES, NOT_IN_THIS_VERSION);
        } else if (!config.isFastAmbientParticlesEnabled()) {
            disabled.put(AMBIENT_PARTICLES, BoostConfig.KEY_FAST_AMBIENT_PARTICLES + "=false");
        }
        selectShaderSamplerCache(config, compat, support, disabled);
        if (!support.frameYield()) {
            disabled.put(FRAME_YIELD, NOT_IN_THIS_VERSION);
        } else if (!config.isSkipFrameYield()) {
            disabled.put(FRAME_YIELD, BoostConfig.KEY_SKIP_FRAME_YIELD + "=false");
        }
        if (config.getBackgroundWorkerLimit() == 0) {
            disabled.put(BACKGROUND_WORKER_LIMIT, BoostConfig.KEY_BACKGROUND_WORKER_LIMIT + "=0");
        }
    }

    private static void selectShaderSamplerCache(BoostConfig config, CompatReport compat, VersionSupport support, Map<String, String> disabled) {
        if (!support.shaderSamplerCache()) {
            disabled.put(SHADER_SAMPLER_CACHE, NOT_IN_THIS_VERSION);
        } else if (!config.isShaderSamplerCacheEnabled()) {
            disabled.put(SHADER_SAMPLER_CACHE, BoostConfig.KEY_SHADER_SAMPLER_CACHE + "=false");
        } else if (compat.sodium() || compat.embeddium()) {
            // Both ship their own ShaderInstanceMixin with the same cache (a @Redirect on the same call)
            disabled.put(SHADER_SAMPLER_CACHE, "already provided by " + (compat.sodium() ? CompatReport.SODIUM : CompatReport.EMBEDDIUM));
        }
    }

    private static void selectThreadQos(BoostConfig config, Map<String, String> disabled) {
        if (!config.isThreadQosEnabled()) {
            disabled.put(THREAD_QOS, BoostConfig.KEY_THREAD_QOS + "=false");
        }
        if (config.getSoundThreadPriority() == 0) {
            disabled.put(SOUND_ENGINE_QOS, BoostConfig.KEY_SOUND_THREAD_PRIORITY + "=0");
        }
        if (config.getNetworkThreadPriority() == 0) {
            disabled.put(NETTY_QOS, BoostConfig.KEY_NETWORK_THREAD_PRIORITY + "=0");
        }
    }

    private static void selectBackground(BoostConfig config, CompatReport compat, Map<String, String> disabled) {
        String blocker = backgroundEcoBlocker(config, compat);
        if (blocker != null) {
            disabled.put(BACKGROUND_ECO, blocker);
            disabled.put(BACKGROUND_AUDIO, blocker);
            return;
        }
        if (config.getMinimizedFpsLimit() == 0 && config.getUnfocusedFpsLimit() == 0) {
            disabled.put(BACKGROUND_ECO, BoostConfig.KEY_MINIMIZED_FPS_LIMIT + "=0 and " + BoostConfig.KEY_UNFOCUSED_FPS_LIMIT + "=0");
        }
        if (!config.isMuteWhenMinimized()) {
            disabled.put(BACKGROUND_AUDIO, BoostConfig.KEY_MUTE_WHEN_MINIMIZED + "=false");
        }
    }

    private static void selectAgentBridge(BoostConfig config, boolean agentPresent, Map<String, String> disabled) {
        String reason;
        if (!config.isAgentBridgeEnabled()) {
            reason = BoostConfig.KEY_AGENT_BRIDGE + "=false";
        } else if (!agentPresent) {
            // Without the launcher agent there is nobody to report to: skip the per-frame hook entirely
            reason = "launcher agent not present";
        } else {
            return;
        }
        disabled.put(FRAME_TELEMETRY, reason);
        disabled.put(GAME_READY, reason);
    }

    private static String backgroundEcoBlocker(BoostConfig config, CompatReport compat) {
        if (!config.isBackgroundEcoEnabled()) {
            return BoostConfig.KEY_BACKGROUND_ECO + "=false";
        }
        if (compat.dynamicFps()) {
            return "external frame limiter " + CompatReport.DYNAMIC_FPS + " detected";
        }
        if (compat.fpsReducer()) {
            return "external frame limiter " + CompatReport.FPS_REDUCER + " detected";
        }
        return null;
    }

    /** Unknown mixin names are applied: only the features listed in {@link #ALL} can be switched off. */
    public boolean isEnabled(String mixinSimpleName) {
        return !disabled.containsKey(mixinSimpleName);
    }

    /** Disabled mixins and the reason, in a stable order. */
    public Map<String, String> disabled() {
        return disabled;
    }

    public List<String> enabled() {
        List<String> enabled = new ArrayList<>();
        for (String mixin : ALL) {
            if (isEnabled(mixin)) {
                enabled.add(mixin);
            }
        }
        return enabled;
    }
}
