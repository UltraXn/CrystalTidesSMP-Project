package com.crystaltides.boost.client;

import com.crystaltides.boost.config.BoostConfig;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.io.StringReader;

import static org.junit.jupiter.api.Assertions.assertEquals;

class BackgroundWorkersTest {

    @Test
    @DisplayName("auto deja un núcleo físico al render y otro al servidor integrado, con un mínimo de 2 workers")
    void testAutoLimit() {
        assertEquals(2, BackgroundWorkers.autoLimit(4));
        assertEquals(2, BackgroundWorkers.autoLimit(6));
        assertEquals(3, BackgroundWorkers.autoLimit(8));
        assertEquals(5, BackgroundWorkers.autoLimit(12));
        assertEquals(7, BackgroundWorkers.autoLimit(16));
        assertEquals(23, BackgroundWorkers.autoLimit(48));
    }

    @Test
    @DisplayName("resolve: 0 es vanilla, un número es un tope fijo y auto se calcula desde la CPU")
    void testResolve() {
        assertEquals(0, BackgroundWorkers.resolve(0, 12));
        assertEquals(4, BackgroundWorkers.resolve(4, 12));
        assertEquals(5, BackgroundWorkers.resolve(BoostConfig.BACKGROUND_WORKERS_AUTO, 12));
    }

    @Test
    @DisplayName("backgroundWorkerLimit acepta auto y números; sin la clave o con valores inválidos usa el defecto (auto)")
    void testConfigParsing() {
        assertEquals(BoostConfig.BACKGROUND_WORKERS_AUTO, BoostConfig.DEFAULT_BACKGROUND_WORKER_LIMIT);
        assertEquals(BoostConfig.BACKGROUND_WORKERS_AUTO, parse("backgroundWorkerLimit=auto").getBackgroundWorkerLimit());
        assertEquals(BoostConfig.BACKGROUND_WORKERS_AUTO, parse("backgroundWorkerLimit= AUTO ").getBackgroundWorkerLimit());
        assertEquals(6, parse("backgroundWorkerLimit=6").getBackgroundWorkerLimit());
        assertEquals(0, parse("backgroundWorkerLimit=0").getBackgroundWorkerLimit(), "0 = vanilla, explícito");
        assertEquals(BoostConfig.BACKGROUND_WORKERS_AUTO, parse("backgroundWorkerLimit=-5").getBackgroundWorkerLimit());
        assertEquals(BoostConfig.BACKGROUND_WORKERS_AUTO, parse("backgroundWorkerLimit=many").getBackgroundWorkerLimit());
        assertEquals(BoostConfig.MAX_BACKGROUND_WORKERS, parse("backgroundWorkerLimit=9999").getBackgroundWorkerLimit());
        assertEquals(BoostConfig.BACKGROUND_WORKERS_AUTO, parse("").getBackgroundWorkerLimit(), "sin la clave: el defecto");
    }

    private static BoostConfig parse(String text) {
        return BoostConfig.parse(new StringReader(text));
    }
}
