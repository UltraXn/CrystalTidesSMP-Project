package com.crystaltides.boost.client;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class BackgroundEcoTest {

    private static final int UNLIMITED = 260; // Window#getFramerateLimit with the slider at "Unlimited"
    private static final int MINIMIZED = 5;
    private static final int UNFOCUSED = 30;

    private static int limit(int original, boolean loading, boolean iconified, boolean focused) {
        return BackgroundEco.limit(original, loading, iconified, focused, MINIMIZED, UNFOCUSED);
    }

    @Test
    @DisplayName("Con la ventana activa no se toca el límite del usuario")
    void testFocusedKeepsOriginal() {
        assertEquals(UNLIMITED, limit(UNLIMITED, false, false, true));
        assertEquals(144, limit(144, false, false, true));
        assertEquals(60, limit(60, false, false, true), "menús sin mundo: vanilla ya devuelve 60");
    }

    @Test
    @DisplayName("Minimizado se aplica minimizedFpsLimit y sin foco unfocusedFpsLimit")
    void testCapsWhileInBackground() {
        assertEquals(MINIMIZED, limit(UNLIMITED, false, true, false));
        assertEquals(UNFOCUSED, limit(UNLIMITED, false, false, false));
        assertEquals(UNFOCUSED, limit(60, false, false, false));
    }

    @Test
    @DisplayName("El límite nunca sube el del usuario")
    void testNeverRaisesUserLimit() {
        assertEquals(20, limit(20, false, false, false), "usuario a 20 FPS sin foco: se queda en 20");
        assertEquals(3, limit(3, false, true, false), "usuario a 3 FPS minimizado: se queda en 3");
    }

    @Test
    @DisplayName("Durante la carga de recursos (overlay) no se limita aunque esté minimizado")
    void testLoadingOverlayIsNeverThrottled() {
        assertEquals(UNLIMITED, limit(UNLIMITED, true, true, false));
        assertEquals(60, limit(60, true, false, false));
    }

    @Test
    @DisplayName("Un límite a 0 está desactivado; minimizado sin límite propio cae al de sin foco")
    void testZeroDisablesCap() {
        assertEquals(UNFOCUSED, BackgroundEco.limit(UNLIMITED, false, true, false, 0, UNFOCUSED));
        assertEquals(UNLIMITED, BackgroundEco.limit(UNLIMITED, false, false, false, MINIMIZED, 0));
        assertEquals(MINIMIZED, BackgroundEco.limit(UNLIMITED, false, true, false, MINIMIZED, 0));
        assertEquals(UNLIMITED, BackgroundEco.limit(UNLIMITED, false, true, false, 0, 0));
    }

    @Test
    @DisplayName("Minimizado con foco (p. ej. restaurando) sigue usando el límite de minimizado")
    void testIconifiedWinsOverFocus() {
        assertEquals(MINIMIZED, limit(UNLIMITED, false, true, true));
    }

    @Test
    @DisplayName("Los límites quedan por debajo de 260, el umbral a partir del cual runTick no limita")
    void testMaxLimitStaysBelowUnlimitedThreshold() {
        assertEquals(259, BackgroundEco.MAX_LIMIT);
        assertEquals(BackgroundEco.MAX_LIMIT, BackgroundEco.limit(UNLIMITED, false, false, false, MINIMIZED, BackgroundEco.MAX_LIMIT));
    }
}
