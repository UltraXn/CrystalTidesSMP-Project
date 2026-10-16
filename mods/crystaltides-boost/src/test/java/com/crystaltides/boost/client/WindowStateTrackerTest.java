package com.crystaltides.boost.client;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

/** Exercises the callback logic without GLFW: attach/onIconify never touch LWJGL natives. */
class WindowStateTrackerTest {

    private static final long WINDOW = 0x1234L;

    @Test
    @DisplayName("El estado inicial y los eventos de iconificación de la ventana instalada se reflejan en isIconified")
    void testTracksIconifyEvents() {
        WindowStateTracker.attach(WINDOW, true, null);
        assertTrue(WindowStateTracker.isIconified(), "la ventana ya estaba minimizada al instalar el callback");

        WindowStateTracker.onIconify(WINDOW, false);
        assertFalse(WindowStateTracker.isIconified());

        WindowStateTracker.onIconify(WINDOW, true);
        assertTrue(WindowStateTracker.isIconified());
    }

    @Test
    @DisplayName("Eventos de otra ventana no cambian el estado pero se siguen encadenando")
    void testIgnoresOtherWindowsButChains() {
        List<String> chained = new ArrayList<>();
        WindowStateTracker.attach(WINDOW, false, (window, iconified) -> chained.add(window + ":" + iconified));

        WindowStateTracker.onIconify(0x9999L, true);
        assertFalse(WindowStateTracker.isIconified());

        WindowStateTracker.onIconify(WINDOW, true);
        assertTrue(WindowStateTracker.isIconified());

        assertEquals(List.of(0x9999L + ":true", WINDOW + ":true"), chained,
            "el callback que había antes (de otro mod) recibe todos los eventos");
    }
}
