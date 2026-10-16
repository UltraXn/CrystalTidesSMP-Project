package com.crystaltides.boost.client;

import com.crystaltides.boost.config.BoostConfig;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.io.StringReader;

import static org.junit.jupiter.api.Assertions.assertEquals;

class BackgroundWorkersTest {

    @Test
    @DisplayName("Sin el dato del launcher, auto supone dos CPUs lógicas por núcleo y deja al menos 2 workers")
    void testAutoLimitAssumesSmt() {
        assertEquals(2, BackgroundWorkers.autoLimit(4, 0));
        assertEquals(2, BackgroundWorkers.autoLimit(6, 0));
        assertEquals(3, BackgroundWorkers.autoLimit(8, 0));
        assertEquals(5, BackgroundWorkers.autoLimit(12, 0));
        assertEquals(7, BackgroundWorkers.autoLimit(16, 0));
        assertEquals(23, BackgroundWorkers.autoLimit(48, 0));
    }

    @Test
    @DisplayName("Con los núcleos físicos del launcher, auto usa un worker por núcleo menos uno; sin SMT queda igual que vanilla")
    void testAutoLimitWithLauncherPhysicalCores() {
        assertEquals(5, BackgroundWorkers.autoLimit(12, 6), "6 núcleos con SMT: lo mismo que sin el dato");
        assertEquals(7, BackgroundWorkers.autoLimit(8, 8), "Xeon con un hilo por núcleo: vanilla (8 - 1)");
        assertEquals(5, BackgroundWorkers.autoLimit(6, 6), "6 núcleos sin SMT: vanilla (6 - 1)");
        assertEquals(7, BackgroundWorkers.autoLimit(16, 8), "CCD0 de un Ryzen X3D: 8 núcleos con SMT");
        assertEquals(7, BackgroundWorkers.autoLimit(8, 24), "nunca más núcleos que CPUs lógicas visibles");
        assertEquals(2, BackgroundWorkers.autoLimit(2, 2), "mínimo de 2");
    }

    @Test
    @DisplayName("resolve: 0 es vanilla, un número es un tope fijo y auto se calcula desde la CPU")
    void testResolve() {
        assertEquals(0, BackgroundWorkers.resolve(0, 12, 6));
        assertEquals(4, BackgroundWorkers.resolve(4, 12, 6));
        assertEquals(5, BackgroundWorkers.resolve(BoostConfig.BACKGROUND_WORKERS_AUTO, 12, 0));
        assertEquals(7, BackgroundWorkers.resolve(BoostConfig.BACKGROUND_WORKERS_AUTO, 8, 8));
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
