package com.crystaltides.boost.config;

import com.crystaltides.boost.platform.Services;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.IOException;
import java.io.Reader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Properties;

/**
 * crystaltides-boost.properties, read once by the mixin config plugin before any Minecraft class
 * is transformed. Immutable: changes need a game restart. Missing keys take their default, invalid
 * values fall back to the default and out-of-range numbers are clamped.
 */
public final class BoostConfig {

    private static final Logger LOGGER = LoggerFactory.getLogger("crystaltides-boost");
    public static final String FILE_NAME = "crystaltides-boost.properties";

    public static final String KEY_THREAD_QOS = "threadQos";
    public static final String KEY_SOUND_THREAD_PRIORITY = "soundThreadPriority";
    public static final String KEY_NETWORK_THREAD_PRIORITY = "networkThreadPriority";
    public static final String KEY_BACKGROUND_ECO = "backgroundEco";
    public static final String KEY_UNFOCUSED_FPS_LIMIT = "unfocusedFpsLimit";
    public static final String KEY_MINIMIZED_FPS_LIMIT = "minimizedFpsLimit";
    public static final String KEY_MUTE_WHEN_MINIMIZED = "muteWhenMinimized";
    public static final String KEY_ANIMATED_TEXTURE_CULLING = "animatedTextureCulling";
    public static final String KEY_FAST_AMBIENT_PARTICLES = "fastAmbientParticles";
    public static final String KEY_SHADER_SAMPLER_CACHE = "shaderSamplerCache";
    public static final String KEY_SKIP_FRAME_YIELD = "skipFrameYield";
    public static final String KEY_BACKGROUND_WORKER_LIMIT = "backgroundWorkerLimit";
    public static final String KEY_AGENT_BRIDGE = "agentBridge";

    /** backgroundWorkerLimit value meaning "size the pool from the CPU" (see BackgroundWorkers). */
    public static final int BACKGROUND_WORKERS_AUTO = -1;
    public static final String BACKGROUND_WORKERS_AUTO_NAME = "auto";
    /** Same upper bound Util#getMaxThreads accepts for max.bg.threads. */
    public static final int MAX_BACKGROUND_WORKERS = 255;

    public static final int DEFAULT_SOUND_THREAD_PRIORITY = 8;
    public static final int DEFAULT_NETWORK_THREAD_PRIORITY = 7;
    public static final int DEFAULT_UNFOCUSED_FPS_LIMIT = 30;
    public static final int DEFAULT_MINIMIZED_FPS_LIMIT = 5;
    public static final int DEFAULT_BACKGROUND_WORKER_LIMIT = BACKGROUND_WORKERS_AUTO;

    /** Thread priorities: 0 leaves vanilla's priority untouched (the mixin is not applied). */
    public static final int MAX_THREAD_PRIORITY = 10;
    /** FPS caps: 0 disables the cap; 260 and above would mean "unlimited" to Minecraft#runTick. */
    public static final int MAX_FPS_LIMIT = 259;

    private final boolean threadQos;
    private final int soundThreadPriority;
    private final int networkThreadPriority;
    private final boolean backgroundEco;
    private final int unfocusedFpsLimit;
    private final int minimizedFpsLimit;
    private final boolean muteWhenMinimized;
    private final boolean animatedTextureCulling;
    private final boolean fastAmbientParticles;
    private final boolean shaderSamplerCache;
    private final boolean skipFrameYield;
    private final int backgroundWorkerLimit;
    private final boolean agentBridge;

    private static volatile BoostConfig instance;

    private BoostConfig(Builder builder) {
        this.threadQos = builder.threadQos;
        this.soundThreadPriority = clamp(builder.soundThreadPriority, MAX_THREAD_PRIORITY);
        this.networkThreadPriority = clamp(builder.networkThreadPriority, MAX_THREAD_PRIORITY);
        this.backgroundEco = builder.backgroundEco;
        this.unfocusedFpsLimit = clamp(builder.unfocusedFpsLimit, MAX_FPS_LIMIT);
        this.minimizedFpsLimit = clamp(builder.minimizedFpsLimit, MAX_FPS_LIMIT);
        this.muteWhenMinimized = builder.muteWhenMinimized;
        this.animatedTextureCulling = builder.animatedTextureCulling;
        this.fastAmbientParticles = builder.fastAmbientParticles;
        this.shaderSamplerCache = builder.shaderSamplerCache;
        this.skipFrameYield = builder.skipFrameYield;
        // -1 is "auto"; any other negative number is invalid and falls back to the default
        this.backgroundWorkerLimit = builder.backgroundWorkerLimit < BACKGROUND_WORKERS_AUTO
            ? DEFAULT_BACKGROUND_WORKER_LIMIT
            : Math.min(MAX_BACKGROUND_WORKERS, builder.backgroundWorkerLimit);
        this.agentBridge = builder.agentBridge;
    }

    public BoostConfig(boolean threadQos, boolean animatedTextureCulling) {
        this(builder().threadQos(threadQos).animatedTextureCulling(animatedTextureCulling));
    }

    public BoostConfig(boolean threadQos, boolean animatedTextureCulling, boolean agentBridge) {
        this(builder().threadQos(threadQos).animatedTextureCulling(animatedTextureCulling).agentBridge(agentBridge));
    }

    public static Builder builder() {
        return new Builder();
    }

    public static BoostConfig defaults() {
        return builder().build();
    }

    public static BoostConfig getInstance() {
        if (instance == null) {
            synchronized (BoostConfig.class) {
                if (instance == null) {
                    instance = load(defaultConfigDirectory());
                }
            }
        }
        return instance;
    }

    public static void setInstance(BoostConfig customConfig) {
        instance = customConfig;
    }

    /**
     * Loads {@code <configDir>/crystaltides-boost.properties} (or {@code config/} relative to the working
     * directory when {@code configDir} is null), writing the documented defaults if the file is missing.
     * An existing file is never rewritten.
     */
    public static BoostConfig load(Path configDir) {
        Path configFile = resolveConfigPath(configDir);
        BoostConfig config;
        if (!Files.exists(configFile)) {
            config = defaults();
            config.saveDefault(configFile);
        } else {
            try (BufferedReader reader = Files.newBufferedReader(configFile)) {
                config = parse(reader);
            } catch (IOException e) {
                LOGGER.warn("[CrystalTides Boost] Could not read {}, using defaults: {}", configFile, e.getMessage());
                config = defaults();
            }
        }
        instance = config;
        return config;
    }

    public static BoostConfig parse(Reader reader) {
        Properties properties = new Properties();
        try {
            properties.load(reader);
        } catch (IOException | IllegalArgumentException e) {
            LOGGER.warn("[CrystalTides Boost] Error parsing properties stream, using defaults: {}", e.getMessage());
            return defaults();
        }

        return builder()
            .threadQos(parseBoolean(properties.getProperty(KEY_THREAD_QOS), true))
            .soundThreadPriority(parseInt(properties.getProperty(KEY_SOUND_THREAD_PRIORITY), DEFAULT_SOUND_THREAD_PRIORITY))
            .networkThreadPriority(parseInt(properties.getProperty(KEY_NETWORK_THREAD_PRIORITY), DEFAULT_NETWORK_THREAD_PRIORITY))
            .backgroundEco(parseBoolean(properties.getProperty(KEY_BACKGROUND_ECO), true))
            .unfocusedFpsLimit(parseInt(properties.getProperty(KEY_UNFOCUSED_FPS_LIMIT), DEFAULT_UNFOCUSED_FPS_LIMIT))
            .minimizedFpsLimit(parseInt(properties.getProperty(KEY_MINIMIZED_FPS_LIMIT), DEFAULT_MINIMIZED_FPS_LIMIT))
            .muteWhenMinimized(parseBoolean(properties.getProperty(KEY_MUTE_WHEN_MINIMIZED), false))
            .animatedTextureCulling(parseBoolean(properties.getProperty(KEY_ANIMATED_TEXTURE_CULLING), true))
            .fastAmbientParticles(parseBoolean(properties.getProperty(KEY_FAST_AMBIENT_PARTICLES), true))
            .shaderSamplerCache(parseBoolean(properties.getProperty(KEY_SHADER_SAMPLER_CACHE), true))
            .skipFrameYield(parseBoolean(properties.getProperty(KEY_SKIP_FRAME_YIELD), true))
            .backgroundWorkerLimit(parseWorkerLimit(properties.getProperty(KEY_BACKGROUND_WORKER_LIMIT)))
            .agentBridge(parseBoolean(properties.getProperty(KEY_AGENT_BRIDGE), true))
            .build();
    }

    /** "auto" or a number; anything else falls back to the default. */
    private static int parseWorkerLimit(String value) {
        if (value != null && value.trim().equalsIgnoreCase(BACKGROUND_WORKERS_AUTO_NAME)) {
            return BACKGROUND_WORKERS_AUTO;
        }
        return parseInt(value, DEFAULT_BACKGROUND_WORKER_LIMIT);
    }

    private static boolean parseBoolean(String value, boolean defaultValue) {
        if (value == null) {
            return defaultValue;
        }
        String trimmed = value.trim();
        if (trimmed.equalsIgnoreCase("false")) {
            return false;
        }
        if (trimmed.equalsIgnoreCase("true")) {
            return true;
        }
        return defaultValue;
    }

    /** Range clamping happens in the constructor; here only unparsable values fall back to the default. */
    private static int parseInt(String value, int defaultValue) {
        if (value == null) {
            return defaultValue;
        }
        try {
            return Integer.parseInt(value.trim());
        } catch (NumberFormatException e) {
            return defaultValue;
        }
    }

    private static int clamp(int value, int max) {
        return Math.max(0, Math.min(max, value));
    }

    private static Path defaultConfigDirectory() {
        try {
            return Services.PLATFORM.getConfigDirectory();
        } catch (RuntimeException | LinkageError e) {
            // No platform helper (e.g. unit tests): fall back to config/ relative to the working directory
            return null;
        }
    }

    private static Path resolveConfigPath(Path configDir) {
        if (configDir != null) {
            return configDir.resolve(FILE_NAME);
        }
        return Path.of("config", FILE_NAME);
    }

    public void saveDefault(Path targetFile) {
        try {
            if (targetFile.getParent() != null && !Files.exists(targetFile.getParent())) {
                Files.createDirectories(targetFile.getParent());
            }
            try (BufferedWriter writer = Files.newBufferedWriter(targetFile)) {
                writer.write(template());
            }
        } catch (IOException e) {
            LOGGER.warn("[CrystalTides Boost] Could not write default config to {}: {}", targetFile, e.getMessage());
        }
    }

    /** Documented properties file with this configuration's values. */
    public String template() {
        return "# CrystalTides Boost configuration (Minecraft 1.21.1, Fabric / NeoForge)\n"
            + "# Read once at startup, before Minecraft classes load: restart the game after editing.\n"
            + "# Invalid values fall back to the default; numbers outside their range are clamped.\n"
            + "\n"
            + "# --- Thread QoS ---------------------------------------------------------------\n"
            + "# Raises the render thread to MAX_PRIORITY (10). Vanilla already does this on CPUs with more\n"
            + "# than 4 cores; on 4 cores or fewer it can take CPU time from the singleplayer server.\n"
            + KEY_THREAD_QOS + "=" + threadQos + "\n"
            + "\n"
            + "# Minimum priority of the \"Sound engine\" thread (music/record streaming). 1-10, 0 = keep vanilla's.\n"
            + "# Priorities are only ever raised. Windows maps 7-8 to ABOVE_NORMAL and 9-10 to HIGHEST;\n"
            + "# Linux ignores Java thread priorities.\n"
            + KEY_SOUND_THREAD_PRIORITY + "=" + soundThreadPriority + "\n"
            + "\n"
            + "# Minimum priority of the Netty client IO threads (packet decoding/decompression). 1-10, 0 = keep vanilla's.\n"
            + "# 6 is still NORMAL on Windows: 7 is the first value above the chunk worker threads.\n"
            + KEY_NETWORK_THREAD_PRIORITY + "=" + networkThreadPriority + "\n"
            + "\n"
            + "# --- Background eco mode ------------------------------------------------------\n"
            + "# Caps the frame rate while the window is minimized or unfocused; never raises your own limit.\n"
            + "# Switched off automatically when Dynamic FPS or FPS Reducer is installed.\n"
            + KEY_BACKGROUND_ECO + "=" + backgroundEco + "\n"
            + "# FPS cap while the window is visible but unfocused. 1-259, 0 = no cap.\n"
            + KEY_UNFOCUSED_FPS_LIMIT + "=" + unfocusedFpsLimit + "\n"
            + "# FPS cap while the window is minimized. 1-259, 0 = use unfocusedFpsLimit.\n"
            + KEY_MINIMIZED_FPS_LIMIT + "=" + minimizedFpsLimit + "\n"
            + "# Silences the game while minimized without changing your volume settings.\n"
            + KEY_MUTE_WHEN_MINIMIZED + "=" + muteWhenMinimized + "\n"
            + "\n"
            + "# --- Rendering ----------------------------------------------------------------\n"
            + "# Stops animated texture uploads (water, lava, portals...) while the window is minimized.\n"
            + KEY_ANIMATED_TEXTURE_CULLING + "=" + animatedTextureCulling + "\n"
            + "# Skips the per-position biome lookup for ambient particles while no nearby biome has any\n"
            + "# (in vanilla only some Nether biomes do). Works with and without Sodium.\n"
            + KEY_FAST_AMBIENT_PARTICLES + "=" + fastAmbientParticles + "\n"
            + "# Reuses cached sampler uniform locations instead of querying the driver on every shader bind\n"
            + "# (expensive on NVIDIA). Skipped automatically with Sodium or Embeddium, which ship the same fix.\n"
            + KEY_SHADER_SAMPLER_CACHE + "=" + shaderSamplerCache + "\n"
            + "# Skips the Thread.yield() Minecraft calls at the end of every frame, which on Windows hands the\n"
            + "# render thread's core to any waiting thread, background workers included.\n"
            + KEY_SKIP_FRAME_YIELD + "=" + skipFrameYield + "\n"
            + "\n"
            + "# --- Background workers ---------------------------------------------------------\n"
            + "# Size of the pool that generates terrain in singleplayer and builds chunk meshes with the vanilla\n"
            + "# renderer (Sodium uses its own threads). auto = half the logical CPUs minus one, at least 2: it\n"
            + "# assumes two logical CPUs per core and leaves cores for the render thread and the server.\n"
            + "# 0 = vanilla (one per logical CPU minus one) or a fixed 1-255. Fewer workers keep the frame rate\n"
            + "# steadier while new terrain loads, but terrain appears more slowly. -Dmax.bg.threads always wins.\n"
            + KEY_BACKGROUND_WORKER_LIMIT + "=" + (backgroundWorkerLimit == BACKGROUND_WORKERS_AUTO ? BACKGROUND_WORKERS_AUTO_NAME : String.valueOf(backgroundWorkerLimit)) + "\n"
            + "\n"
            + "# --- Launcher -----------------------------------------------------------------\n"
            + "# Reports FPS / p99 frametime and game_ready to the CrystalTides launcher (no-op without it).\n"
            + KEY_AGENT_BRIDGE + "=" + agentBridge + "\n";
    }

    public boolean isThreadQosEnabled() {
        return threadQos;
    }

    public int getSoundThreadPriority() {
        return soundThreadPriority;
    }

    public int getNetworkThreadPriority() {
        return networkThreadPriority;
    }

    public boolean isBackgroundEcoEnabled() {
        return backgroundEco;
    }

    public int getUnfocusedFpsLimit() {
        return unfocusedFpsLimit;
    }

    public int getMinimizedFpsLimit() {
        return minimizedFpsLimit;
    }

    public boolean isMuteWhenMinimized() {
        return muteWhenMinimized;
    }

    public boolean isAnimatedTextureCullingEnabled() {
        return animatedTextureCulling;
    }

    public boolean isFastAmbientParticlesEnabled() {
        return fastAmbientParticles;
    }

    public boolean isShaderSamplerCacheEnabled() {
        return shaderSamplerCache;
    }

    public boolean isSkipFrameYield() {
        return skipFrameYield;
    }

    /** {@link #BACKGROUND_WORKERS_AUTO}, 0 (vanilla) or a fixed cap. */
    public int getBackgroundWorkerLimit() {
        return backgroundWorkerLimit;
    }

    public boolean isAgentBridgeEnabled() {
        return agentBridge;
    }

    public static final class Builder {
        private boolean threadQos = true;
        private int soundThreadPriority = DEFAULT_SOUND_THREAD_PRIORITY;
        private int networkThreadPriority = DEFAULT_NETWORK_THREAD_PRIORITY;
        private boolean backgroundEco = true;
        private int unfocusedFpsLimit = DEFAULT_UNFOCUSED_FPS_LIMIT;
        private int minimizedFpsLimit = DEFAULT_MINIMIZED_FPS_LIMIT;
        private boolean muteWhenMinimized = false;
        private boolean animatedTextureCulling = true;
        private boolean fastAmbientParticles = true;
        private boolean shaderSamplerCache = true;
        private boolean skipFrameYield = true;
        private int backgroundWorkerLimit = DEFAULT_BACKGROUND_WORKER_LIMIT;
        private boolean agentBridge = true;

        private Builder() {
        }

        public Builder threadQos(boolean value) {
            this.threadQos = value;
            return this;
        }

        public Builder soundThreadPriority(int value) {
            this.soundThreadPriority = value;
            return this;
        }

        public Builder networkThreadPriority(int value) {
            this.networkThreadPriority = value;
            return this;
        }

        public Builder backgroundEco(boolean value) {
            this.backgroundEco = value;
            return this;
        }

        public Builder unfocusedFpsLimit(int value) {
            this.unfocusedFpsLimit = value;
            return this;
        }

        public Builder minimizedFpsLimit(int value) {
            this.minimizedFpsLimit = value;
            return this;
        }

        public Builder muteWhenMinimized(boolean value) {
            this.muteWhenMinimized = value;
            return this;
        }

        public Builder animatedTextureCulling(boolean value) {
            this.animatedTextureCulling = value;
            return this;
        }

        public Builder fastAmbientParticles(boolean value) {
            this.fastAmbientParticles = value;
            return this;
        }

        public Builder shaderSamplerCache(boolean value) {
            this.shaderSamplerCache = value;
            return this;
        }

        public Builder skipFrameYield(boolean value) {
            this.skipFrameYield = value;
            return this;
        }

        public Builder backgroundWorkerLimit(int value) {
            this.backgroundWorkerLimit = value;
            return this;
        }

        public Builder agentBridge(boolean value) {
            this.agentBridge = value;
            return this;
        }

        public BoostConfig build() {
            return new BoostConfig(this);
        }
    }
}
