package com.crystaltides.boost.config;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.io.StringReader;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class BoostConfigTest {

    @Test
    @DisplayName("Un archivo de configuración vacío debe mantener todos los mixins en true por defecto")
    void testEmptyConfigDefaultsToTrue() {
        BoostConfig config = BoostConfig.parse(new StringReader(""));
        assertTrue(config.isThreadQosEnabled(), "threadQos debe ser true por defecto");
        assertTrue(config.isAnimatedTextureCullingEnabled(), "animatedTextureCulling debe ser true por defecto");
    }

    @Test
    @DisplayName("Propiedades desconocidas no deben afectar los valores por defecto (true)")
    void testUnknownKeysPreserveDefaults() {
        String input = "unknownKey=false\nrandomSetting=0\notherValue=disabled";
        BoostConfig config = BoostConfig.parse(new StringReader(input));
        assertTrue(config.isThreadQosEnabled(), "threadQos debe seguir siendo true");
        assertTrue(config.isAnimatedTextureCullingEnabled(), "animatedTextureCulling debe seguir siendo true");
    }

    @Test
    @DisplayName("Valores inválidos o mal formateados deben resolver a true por defecto")
    void testInvalidValuesDefaultToTrue() {
        String input = "threadQos=notABoolean\nanimatedTextureCulling=12345";
        BoostConfig config = BoostConfig.parse(new StringReader(input));
        assertTrue(config.isThreadQosEnabled(), "threadQos con valor inválido debe ser true");
        assertTrue(config.isAnimatedTextureCullingEnabled(), "animatedTextureCulling con valor inválido debe ser true");
    }

    @Test
    @DisplayName("Valores explícitos 'false' (case-insensitive) deben desactivar los mixins")
    void testExplicitFalseDisablesMixins() {
        String input = "threadQos=false\nanimatedTextureCulling=FALSE";
        BoostConfig config = BoostConfig.parse(new StringReader(input));
        assertFalse(config.isThreadQosEnabled(), "threadQos debe ser false");
        assertFalse(config.isAnimatedTextureCullingEnabled(), "animatedTextureCulling debe ser false");
    }

    @Test
    @DisplayName("agentBridge es true por defecto (configs antiguas sin la clave) y se desactiva explícitamente")
    void testAgentBridgeKey() {
        assertTrue(BoostConfig.parse(new StringReader("threadQos=true\nanimatedTextureCulling=true")).isAgentBridgeEnabled(),
            "Una config previa sin agentBridge debe mantener el bridge activo");
        assertTrue(new BoostConfig(true, true).isAgentBridgeEnabled());

        BoostConfig disabled = BoostConfig.parse(new StringReader("agentBridge=false"));
        assertFalse(disabled.isAgentBridgeEnabled(), "agentBridge=false debe desactivar el bridge");
        assertTrue(disabled.isThreadQosEnabled());
        assertTrue(disabled.isAnimatedTextureCullingEnabled());
    }

    @Test
    @DisplayName("La config por defecto escrita a disco incluye agentBridge y se puede releer")
    void testSaveDefaultRoundTrip(@org.junit.jupiter.api.io.TempDir java.nio.file.Path dir) throws Exception {
        java.nio.file.Path file = dir.resolve(BoostConfig.FILE_NAME);
        new BoostConfig(true, false, false).saveDefault(file);
        String content = java.nio.file.Files.readString(file);
        assertTrue(content.contains("agentBridge=false"), content);

        BoostConfig reloaded = BoostConfig.parse(new StringReader(content));
        assertTrue(reloaded.isThreadQosEnabled());
        assertFalse(reloaded.isAnimatedTextureCullingEnabled());
        assertFalse(reloaded.isAgentBridgeEnabled());
    }

    @Test
    @DisplayName("Valores explícitos 'true' (case-insensitive y con espacios) deben habilitar los mixins")
    void testExplicitTrueEnablesMixins() {
        String input = "threadQos = true \nanimatedTextureCulling = TRUE ";
        BoostConfig config = BoostConfig.parse(new StringReader(input));
        assertTrue(config.isThreadQosEnabled(), "threadQos debe ser true");
        assertTrue(config.isAnimatedTextureCullingEnabled(), "animatedTextureCulling debe ser true");
    }

    @Test
    @DisplayName("Una config de la versión 1.0 (sin las claves nuevas) recibe los valores por defecto de eco, QoS, render y workers")
    void testLegacyConfigGetsNewDefaults() {
        BoostConfig config = BoostConfig.parse(new StringReader("threadQos=true\nanimatedTextureCulling=true\nagentBridge=true"));
        assertEquals(BoostConfig.DEFAULT_SOUND_THREAD_PRIORITY, config.getSoundThreadPriority());
        assertEquals(BoostConfig.DEFAULT_NETWORK_THREAD_PRIORITY, config.getNetworkThreadPriority());
        assertTrue(config.isBackgroundEcoEnabled());
        assertEquals(BoostConfig.DEFAULT_UNFOCUSED_FPS_LIMIT, config.getUnfocusedFpsLimit());
        assertEquals(BoostConfig.DEFAULT_MINIMIZED_FPS_LIMIT, config.getMinimizedFpsLimit());
        assertFalse(config.isMuteWhenMinimized(), "silenciar al minimizar es opcional (false por defecto)");
        assertTrue(config.isFastAmbientParticlesEnabled());
        assertTrue(config.isShaderSamplerCacheEnabled());
        assertTrue(config.isSkipFrameYield(), "skipFrameYield=true por defecto");
        assertEquals(BoostConfig.BACKGROUND_WORKERS_AUTO, config.getBackgroundWorkerLimit(), "backgroundWorkerLimit=auto por defecto");
    }

    @Test
    @DisplayName("Prioridades y límites de FPS fuera de rango se ajustan al rango y los no numéricos usan el defecto")
    void testNumericKeysAreClampedOrDefaulted() {
        BoostConfig clamped = BoostConfig.parse(new StringReader(
            "soundThreadPriority=15\nnetworkThreadPriority=-3\nunfocusedFpsLimit=1000\nminimizedFpsLimit=-1"));
        assertEquals(10, clamped.getSoundThreadPriority());
        assertEquals(0, clamped.getNetworkThreadPriority());
        assertEquals(BoostConfig.MAX_FPS_LIMIT, clamped.getUnfocusedFpsLimit(), "260+ sería 'ilimitado' para runTick");
        assertEquals(0, clamped.getMinimizedFpsLimit());

        BoostConfig invalid = BoostConfig.parse(new StringReader(
            "soundThreadPriority=high\nnetworkThreadPriority=\nunfocusedFpsLimit=30fps\nminimizedFpsLimit= 12 "));
        assertEquals(BoostConfig.DEFAULT_SOUND_THREAD_PRIORITY, invalid.getSoundThreadPriority());
        assertEquals(BoostConfig.DEFAULT_NETWORK_THREAD_PRIORITY, invalid.getNetworkThreadPriority());
        assertEquals(BoostConfig.DEFAULT_UNFOCUSED_FPS_LIMIT, invalid.getUnfocusedFpsLimit());
        assertEquals(12, invalid.getMinimizedFpsLimit(), "se recortan los espacios");
    }

    @Test
    @DisplayName("Las claves booleanas nuevas se leen y la plantilla escrita conserva todos los valores")
    void testTemplateRoundTripWithAllKeys(@TempDir Path dir) throws Exception {
        BoostConfig custom = BoostConfig.builder()
            .threadQos(false)
            .soundThreadPriority(9)
            .networkThreadPriority(0)
            .backgroundEco(false)
            .unfocusedFpsLimit(45)
            .minimizedFpsLimit(0)
            .muteWhenMinimized(true)
            .animatedTextureCulling(false)
            .fastAmbientParticles(false)
            .shaderSamplerCache(false)
            .skipFrameYield(false)
            .backgroundWorkerLimit(6)
            .agentBridge(false)
            .build();
        Path file = dir.resolve(BoostConfig.FILE_NAME);
        custom.saveDefault(file);

        String content = Files.readString(file);
        for (String key : new String[] {
            BoostConfig.KEY_THREAD_QOS, BoostConfig.KEY_SOUND_THREAD_PRIORITY, BoostConfig.KEY_NETWORK_THREAD_PRIORITY,
            BoostConfig.KEY_BACKGROUND_ECO, BoostConfig.KEY_UNFOCUSED_FPS_LIMIT, BoostConfig.KEY_MINIMIZED_FPS_LIMIT,
            BoostConfig.KEY_MUTE_WHEN_MINIMIZED, BoostConfig.KEY_ANIMATED_TEXTURE_CULLING, BoostConfig.KEY_FAST_AMBIENT_PARTICLES,
            BoostConfig.KEY_SHADER_SAMPLER_CACHE, BoostConfig.KEY_SKIP_FRAME_YIELD, BoostConfig.KEY_BACKGROUND_WORKER_LIMIT,
            BoostConfig.KEY_AGENT_BRIDGE}) {
            assertTrue(content.contains(key + "="), "falta la clave " + key);
        }

        BoostConfig reloaded = BoostConfig.load(dir);
        assertFalse(reloaded.isThreadQosEnabled());
        assertEquals(9, reloaded.getSoundThreadPriority());
        assertEquals(0, reloaded.getNetworkThreadPriority());
        assertFalse(reloaded.isBackgroundEcoEnabled());
        assertEquals(45, reloaded.getUnfocusedFpsLimit());
        assertEquals(0, reloaded.getMinimizedFpsLimit());
        assertTrue(reloaded.isMuteWhenMinimized());
        assertFalse(reloaded.isAnimatedTextureCullingEnabled());
        assertFalse(reloaded.isFastAmbientParticlesEnabled());
        assertFalse(reloaded.isShaderSamplerCacheEnabled());
        assertFalse(reloaded.isSkipFrameYield());
        assertEquals(6, reloaded.getBackgroundWorkerLimit());
        assertFalse(reloaded.isAgentBridgeEnabled());
    }

    @Test
    @DisplayName("Sin archivo se escribe la plantilla por defecto y un archivo existente nunca se reescribe")
    void testLoadWritesDefaultsOnlyWhenMissing(@TempDir Path dir) throws Exception {
        BoostConfig created = BoostConfig.load(dir);
        Path file = dir.resolve(BoostConfig.FILE_NAME);
        assertTrue(Files.exists(file));
        String template = Files.readString(file);
        assertEquals(BoostConfig.defaults().template(), template);
        assertTrue(template.contains(BoostConfig.KEY_BACKGROUND_WORKER_LIMIT + "=auto"), "auto se escribe por nombre");
        assertTrue(template.contains(BoostConfig.KEY_SKIP_FRAME_YIELD + "=true"));
        assertTrue(created.isBackgroundEcoEnabled());

        Files.writeString(file, "# editado a mano\nunfocusedFpsLimit=20\n");
        BoostConfig edited = BoostConfig.load(dir);
        assertEquals(20, edited.getUnfocusedFpsLimit());
        assertEquals("# editado a mano\nunfocusedFpsLimit=20\n", Files.readString(file));
    }
}
