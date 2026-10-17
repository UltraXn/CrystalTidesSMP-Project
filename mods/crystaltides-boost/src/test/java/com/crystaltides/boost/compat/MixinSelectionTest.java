package com.crystaltides.boost.compat;

import com.crystaltides.boost.config.BoostConfig;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class MixinSelectionTest {

    @Test
    @DisplayName("CompatReport detecta los mod IDs de ambos loaders y solo Dynamic FPS / FPS Reducer cuentan como limitadores externos")
    void testCompatReportDetection() {
        CompatReport rendering = CompatReport.detect(Set.of("sodium", "iris", "immediatelyfast", "lithium")::contains);
        assertTrue(rendering.sodium());
        assertTrue(rendering.iris());
        assertTrue(rendering.immediatelyFast());
        assertFalse(rendering.hasExternalFrameLimiter(), "Sodium/Iris/ImmediatelyFast no limitan FPS en segundo plano");
        assertEquals(List.of("sodium", "iris", "immediatelyfast", "lithium"), rendering.detectedMods());

        assertTrue(CompatReport.detect(Set.of("dynamic_fps")::contains).hasExternalFrameLimiter());
        assertTrue(CompatReport.detect(Set.of("fpsreducer")::contains).hasExternalFrameLimiter());
        assertTrue(CompatReport.detect(Set.of("embeddium", "oculus")::contains).embeddium());
        assertTrue(CompatReport.none().detectedMods().isEmpty());
    }

    @Test
    @DisplayName("Con la config por defecto, Sodium + Iris y el agente presente: solo quedan fuera lo opcional y lo que ya hace Sodium")
    void testDefaultsWithRenderingModsAndAgent() {
        CompatReport compat = CompatReport.detect(Set.of("sodium", "iris", "immediatelyfast")::contains);
        MixinSelection selection = MixinSelection.evaluate(BoostConfig.defaults(), compat, true, false, VersionSupport.ALL);

        assertEquals(Set.of(
            MixinSelection.BACKGROUND_AUDIO,
            MixinSelection.SHADER_SAMPLER_CACHE,
            MixinSelection.DEBUG_STATS
        ), selection.disabled().keySet());
        assertEquals(BoostConfig.KEY_MUTE_WHEN_MINIMIZED + "=false", selection.disabled().get(MixinSelection.BACKGROUND_AUDIO));
        assertEquals("already provided by sodium", selection.disabled().get(MixinSelection.SHADER_SAMPLER_CACHE));
        assertTrue(selection.isEnabled(MixinSelection.ANIMATED_TEXTURE_CULLING), "compatible con Sodium e Iris");
        assertTrue(selection.isEnabled(MixinSelection.AMBIENT_PARTICLES), "Sodium no toca doAnimateTick");
        assertTrue(selection.isEnabled(MixinSelection.FRAME_YIELD), "skipFrameYield=true por defecto");
        assertTrue(selection.isEnabled(MixinSelection.BACKGROUND_WORKER_LIMIT), "backgroundWorkerLimit=auto por defecto");
        assertTrue(selection.isEnabled(MixinSelection.BACKGROUND_ECO));
        assertEquals(MixinSelection.ALL.size() - 3, selection.enabled().size());
    }

    @Test
    @DisplayName("Sin Sodium el cache de samplers se aplica; con Embeddium se omite igual que con Sodium")
    void testShaderSamplerCacheOnlyWithoutSodiumFamily() {
        MixinSelection vanilla = MixinSelection.evaluate(BoostConfig.defaults(), CompatReport.none(), true, false, VersionSupport.ALL);
        assertTrue(vanilla.isEnabled(MixinSelection.SHADER_SAMPLER_CACHE));

        MixinSelection embeddium = MixinSelection.evaluate(BoostConfig.defaults(), CompatReport.detect(Set.of("embeddium")::contains), true, false, VersionSupport.ALL);
        assertEquals("already provided by embeddium", embeddium.disabled().get(MixinSelection.SHADER_SAMPLER_CACHE));

        BoostConfig off = BoostConfig.builder().shaderSamplerCache(false).fastAmbientParticles(false).build();
        MixinSelection disabled = MixinSelection.evaluate(off, CompatReport.none(), true, false, VersionSupport.ALL);
        assertFalse(disabled.isEnabled(MixinSelection.SHADER_SAMPLER_CACHE));
        assertFalse(disabled.isEnabled(MixinSelection.AMBIENT_PARTICLES));
    }

    @Test
    @DisplayName("skipFrameYield=false y backgroundWorkerLimit=0 vuelven a vanilla; las estadísticas solo con la propiedad de depuración")
    void testFrameYieldWorkersAndDebugStats() {
        MixinSelection defaults = MixinSelection.evaluate(BoostConfig.defaults(), CompatReport.none(), true, true, VersionSupport.ALL);
        assertTrue(defaults.isEnabled(MixinSelection.FRAME_YIELD));
        assertTrue(defaults.isEnabled(MixinSelection.BACKGROUND_WORKER_LIMIT));
        assertTrue(defaults.isEnabled(MixinSelection.DEBUG_STATS));

        BoostConfig vanilla = BoostConfig.builder().skipFrameYield(false).backgroundWorkerLimit(0).build();
        MixinSelection off = MixinSelection.evaluate(vanilla, CompatReport.none(), true, false, VersionSupport.ALL);
        assertEquals(BoostConfig.KEY_SKIP_FRAME_YIELD + "=false", off.disabled().get(MixinSelection.FRAME_YIELD));
        assertEquals(BoostConfig.KEY_BACKGROUND_WORKER_LIMIT + "=0", off.disabled().get(MixinSelection.BACKGROUND_WORKER_LIMIT));
        assertFalse(off.isEnabled(MixinSelection.DEBUG_STATS));
        assertTrue(off.disabled().get(MixinSelection.DEBUG_STATS).contains(MixinSelection.DEBUG_STATS_PROPERTY));
    }

    @Test
    @DisplayName("Lo que no existe en la versión de Minecraft del jar se omite con su motivo, sea cual sea la config")
    void testUnavailableInThisMinecraftVersion() {
        VersionSupport none = new VersionSupport(false, false, false);
        MixinSelection selection = MixinSelection.evaluate(BoostConfig.defaults(), CompatReport.none(), true, false, none);
        for (String mixin : new String[] {MixinSelection.SHADER_SAMPLER_CACHE, MixinSelection.AMBIENT_PARTICLES, MixinSelection.FRAME_YIELD}) {
            assertEquals(MixinSelection.NOT_IN_THIS_VERSION, selection.disabled().get(mixin), mixin);
        }
        assertTrue(selection.isEnabled(MixinSelection.BACKGROUND_WORKER_LIMIT), "el límite de workers existe en todas las versiones");
        assertTrue(selection.isEnabled(MixinSelection.ANIMATED_TEXTURE_CULLING));
        assertTrue(selection.isEnabled(MixinSelection.BACKGROUND_ECO));

        // El motivo de versión tiene prioridad sobre el de la config o el de Sodium
        CompatReport sodium = CompatReport.detect(Set.of("sodium")::contains);
        BoostConfig off = BoostConfig.builder().shaderSamplerCache(false).skipFrameYield(false).build();
        MixinSelection both = MixinSelection.evaluate(off, sodium, true, false, none);
        assertEquals(MixinSelection.NOT_IN_THIS_VERSION, both.disabled().get(MixinSelection.SHADER_SAMPLER_CACHE));
        assertEquals(MixinSelection.NOT_IN_THIS_VERSION, both.disabled().get(MixinSelection.FRAME_YIELD));
    }

    @Test
    @DisplayName("Dynamic FPS o FPS Reducer desactivan el modo eco y el mute, no el resto")
    void testExternalFrameLimiterDisablesEco() {
        BoostConfig config = BoostConfig.builder().muteWhenMinimized(true).build();
        for (String limiter : List.of("dynamic_fps", "fpsreducer")) {
            MixinSelection selection = MixinSelection.evaluate(config, CompatReport.detect(Set.of(limiter)::contains), true);
            assertFalse(selection.isEnabled(MixinSelection.BACKGROUND_ECO));
            assertFalse(selection.isEnabled(MixinSelection.BACKGROUND_AUDIO));
            assertTrue(selection.disabled().get(MixinSelection.BACKGROUND_ECO).contains(limiter));
            assertTrue(selection.isEnabled(MixinSelection.ANIMATED_TEXTURE_CULLING));
            assertTrue(selection.isEnabled(MixinSelection.THREAD_QOS));
        }
    }

    @Test
    @DisplayName("Sin agente del launcher no se aplican los hooks de telemetría ni game_ready")
    void testAgentAbsentSkipsBridgeMixins() {
        MixinSelection selection = MixinSelection.evaluate(BoostConfig.defaults(), CompatReport.none(), false);
        assertFalse(selection.isEnabled(MixinSelection.FRAME_TELEMETRY));
        assertFalse(selection.isEnabled(MixinSelection.GAME_READY));
        assertEquals("launcher agent not present", selection.disabled().get(MixinSelection.FRAME_TELEMETRY));

        BoostConfig bridgeOff = BoostConfig.builder().agentBridge(false).build();
        MixinSelection off = MixinSelection.evaluate(bridgeOff, CompatReport.none(), true);
        assertEquals(BoostConfig.KEY_AGENT_BRIDGE + "=false", off.disabled().get(MixinSelection.GAME_READY));
    }

    @Test
    @DisplayName("Cada interruptor de la config desactiva su mixin y 0 desactiva las prioridades y los límites")
    void testConfigSwitches() {
        BoostConfig config = BoostConfig.builder()
            .threadQos(false)
            .soundThreadPriority(0)
            .networkThreadPriority(0)
            .unfocusedFpsLimit(0)
            .minimizedFpsLimit(0)
            .muteWhenMinimized(true)
            .animatedTextureCulling(false)
            .build();
        MixinSelection selection = MixinSelection.evaluate(config, CompatReport.none(), true);

        assertFalse(selection.isEnabled(MixinSelection.THREAD_QOS));
        assertFalse(selection.isEnabled(MixinSelection.SOUND_ENGINE_QOS));
        assertFalse(selection.isEnabled(MixinSelection.NETTY_QOS));
        assertFalse(selection.isEnabled(MixinSelection.BACKGROUND_ECO), "ambos límites a 0");
        assertTrue(selection.isEnabled(MixinSelection.BACKGROUND_AUDIO), "el mute funciona sin límite de FPS");
        assertFalse(selection.isEnabled(MixinSelection.ANIMATED_TEXTURE_CULLING));

        BoostConfig ecoOff = BoostConfig.builder().backgroundEco(false).muteWhenMinimized(true).build();
        MixinSelection noEco = MixinSelection.evaluate(ecoOff, CompatReport.none(), true);
        assertFalse(noEco.isEnabled(MixinSelection.BACKGROUND_ECO));
        assertFalse(noEco.isEnabled(MixinSelection.BACKGROUND_AUDIO), "backgroundEco=false apaga todo el modo eco");
    }

    @Test
    @DisplayName("Un mixin desconocido se aplica: solo se pueden desactivar las funciones conocidas")
    void testUnknownMixinIsApplied() {
        MixinSelection selection = MixinSelection.evaluate(BoostConfig.defaults(), CompatReport.none(), false);
        assertTrue(selection.isEnabled("SomeFutureMixin"));
    }
}
