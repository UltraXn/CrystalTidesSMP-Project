package com.crystaltides.boost.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.IOException;
import java.io.Reader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Properties;

public final class BoostConfig {

    private static final Logger LOGGER = LoggerFactory.getLogger("crystaltides-boost");
    public static final String FILE_NAME = "crystaltides-boost.properties";

    public static final String KEY_THREAD_QOS = "threadQos";
    public static final String KEY_ANIMATED_TEXTURE_CULLING = "animatedTextureCulling";
    public static final String KEY_AGENT_BRIDGE = "agentBridge";

    private final boolean threadQos;
    private final boolean animatedTextureCulling;
    private final boolean agentBridge;

    private static volatile BoostConfig instance;

    public BoostConfig(boolean threadQos, boolean animatedTextureCulling) {
        this(threadQos, animatedTextureCulling, true);
    }

    public BoostConfig(boolean threadQos, boolean animatedTextureCulling, boolean agentBridge) {
        this.threadQos = threadQos;
        this.animatedTextureCulling = animatedTextureCulling;
        this.agentBridge = agentBridge;
    }

    public static BoostConfig getInstance() {
        if (instance == null) {
            synchronized (BoostConfig.class) {
                if (instance == null) {
                    instance = load(null);
                }
            }
        }
        return instance;
    }

    public static void setInstance(BoostConfig customConfig) {
        instance = customConfig;
    }

    public static BoostConfig load(Path configDir) {
        Path configFile = resolveConfigPath(configDir);
        if (!Files.exists(configFile)) {
            BoostConfig defaultConfig = new BoostConfig(true, true);
            defaultConfig.saveDefault(configFile);
            instance = defaultConfig;
            return defaultConfig;
        }

        try (BufferedReader reader = Files.newBufferedReader(configFile)) {
            BoostConfig config = parse(reader);
            instance = config;
            return config;
        } catch (IOException e) {
            LOGGER.warn("[CrystalTides Boost] Could not read {}, defaulting all mixins to true: {}", configFile, e.getMessage());
            BoostConfig fallback = new BoostConfig(true, true);
            instance = fallback;
            return fallback;
        }
    }

    public static BoostConfig parse(Reader reader) {
        Properties properties = new Properties();
        try {
            properties.load(reader);
        } catch (IOException e) {
            LOGGER.warn("[CrystalTides Boost] Error parsing properties stream, using defaults: {}", e.getMessage());
            return new BoostConfig(true, true);
        }

        boolean threadQos = parseBooleanStrict(properties.getProperty(KEY_THREAD_QOS), true);
        boolean animatedTextureCulling = parseBooleanStrict(properties.getProperty(KEY_ANIMATED_TEXTURE_CULLING), true);
        boolean agentBridge = parseBooleanStrict(properties.getProperty(KEY_AGENT_BRIDGE), true);

        return new BoostConfig(threadQos, animatedTextureCulling, agentBridge);
    }

    private static boolean parseBooleanStrict(String value, boolean defaultValue) {
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
                writer.write("# CrystalTides Boost Configuration\n");
                writer.write("# Controls client-side low-level optimizations\n\n");
                writer.write("# Elevates the OpenGL / Iris render thread to MAX_PRIORITY for lower jitter\n");
                writer.write(KEY_THREAD_QOS + "=" + threadQos + "\n\n");
                writer.write("# Skips ticking animated textures when the game window is minimized (iconified)\n");
                writer.write(KEY_ANIMATED_TEXTURE_CULLING + "=" + animatedTextureCulling + "\n\n");
                writer.write("# Reports FPS / p99 frametime and game_ready to the CrystalTides launcher (no-op without it)\n");
                writer.write(KEY_AGENT_BRIDGE + "=" + agentBridge + "\n");
            }
        } catch (IOException e) {
            LOGGER.warn("[CrystalTides Boost] Could not write default config to {}: {}", targetFile, e.getMessage());
        }
    }

    public boolean isThreadQosEnabled() {
        return threadQos;
    }

    public boolean isAnimatedTextureCullingEnabled() {
        return animatedTextureCulling;
    }

    public boolean isAgentBridgeEnabled() {
        return agentBridge;
    }
}
