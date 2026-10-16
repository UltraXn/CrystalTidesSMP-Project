package com.crystaltides.boost.client;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ThreadQosTest {

    @Test
    @DisplayName("clamp mantiene la prioridad dentro de 1-10")
    void testClamp() {
        assertEquals(Thread.MIN_PRIORITY, ThreadQos.clamp(0));
        assertEquals(Thread.MIN_PRIORITY, ThreadQos.clamp(-5));
        assertEquals(7, ThreadQos.clamp(7));
        assertEquals(Thread.MAX_PRIORITY, ThreadQos.clamp(42));
    }

    @Test
    @DisplayName("apply cambia la prioridad una vez y es idempotente")
    void testApplyIsIdempotent() throws InterruptedException {
        AtomicBoolean first = new AtomicBoolean();
        AtomicBoolean second = new AtomicBoolean();
        AtomicInteger observed = new AtomicInteger();
        Thread worker = new Thread(() -> {
            first.set(ThreadQos.applyToCurrent("test", 7));
            second.set(ThreadQos.applyToCurrent("test", 7));
            observed.set(Thread.currentThread().getPriority());
        }, "qos-test");
        worker.setPriority(Thread.NORM_PRIORITY);
        worker.start();
        worker.join();

        assertTrue(first.get(), "la primera llamada cambia la prioridad");
        assertFalse(second.get(), "la segunda no hace nada");
        assertEquals(7, observed.get());
    }

    @Test
    @DisplayName("apply nunca baja la prioridad: un hilo heredado del render thread (10) se queda en 10")
    void testApplyNeverLowers() throws InterruptedException {
        AtomicBoolean changed = new AtomicBoolean(true);
        AtomicInteger observed = new AtomicInteger();
        Thread worker = new Thread(() -> {
            changed.set(ThreadQos.applyToCurrent("test", 8));
            observed.set(Thread.currentThread().getPriority());
        }, "qos-high-test");
        worker.setPriority(Thread.MAX_PRIORITY);
        worker.start();
        worker.join();

        assertFalse(changed.get());
        assertEquals(Thread.MAX_PRIORITY, observed.get());
    }

    @Test
    @DisplayName("apply respeta el máximo del ThreadGroup en vez de reintentarlo en cada llamada")
    void testApplyRespectsThreadGroupMaximum() throws InterruptedException {
        ThreadGroup limited = new ThreadGroup("qos-limited");
        limited.setMaxPriority(6);
        AtomicBoolean first = new AtomicBoolean();
        AtomicBoolean second = new AtomicBoolean();
        AtomicInteger observed = new AtomicInteger();
        Thread worker = new Thread(limited, () -> {
            first.set(ThreadQos.applyToCurrent("test", Thread.MAX_PRIORITY));
            second.set(ThreadQos.applyToCurrent("test", Thread.MAX_PRIORITY));
            observed.set(Thread.currentThread().getPriority());
        }, "qos-limited-test");
        worker.setPriority(Thread.NORM_PRIORITY);
        worker.start();
        worker.join();

        assertTrue(first.get());
        assertFalse(second.get(), "ya está en el máximo permitido por el grupo");
        assertEquals(6, observed.get());
    }
}
