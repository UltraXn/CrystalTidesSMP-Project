package com.crystaltides.boost.config;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.io.StringReader;

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
    @DisplayName("Valores explícitos 'true' (case-insensitive y con espacios) deben habilitar los mixins")
    void testExplicitTrueEnablesMixins() {
        String input = "threadQos = true \nanimatedTextureCulling = TRUE ";
        BoostConfig config = BoostConfig.parse(new StringReader(input));
        assertTrue(config.isThreadQosEnabled(), "threadQos debe ser true");
        assertTrue(config.isAnimatedTextureCullingEnabled(), "animatedTextureCulling debe ser true");
    }
}
