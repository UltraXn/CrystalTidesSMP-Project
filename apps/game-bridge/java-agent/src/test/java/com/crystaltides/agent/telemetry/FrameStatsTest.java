package com.crystaltides.agent.telemetry;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class FrameStatsTest {

    private static final long MS = 1_000_000L;
    private static final long T0 = 5_000L * MS;

    @Test
    void testNoFrameSourceYieldsNoSample() {
        FrameStats stats = new FrameStats();
        assertNull(stats.sample(T0));
        assertNull(stats.sample(T0 + 1000 * MS));
    }

    @Test
    void testFirstSampleIsBaselineOnly() {
        FrameStats stats = new FrameStats();
        stats.onFrameStart(T0);
        assertNull(stats.sample(T0), "First sample only establishes the window baseline");
    }

    @Test
    void testFpsAndP99OverWindow() {
        FrameStats stats = new FrameStats();
        long now = T0;
        stats.onFrameStart(now);
        assertNull(stats.sample(now));

        // 100 frames: 98 x 10 ms and 2 x 30 ms spikes -> 1040 ms window
        for (int i = 0; i < 100; i++) {
            now += (i == 40 || i == 80) ? 30 * MS : 10 * MS;
            stats.onFrameStart(now);
        }

        FrameStats.Sample sample = stats.sample(now);
        assertNotNull(sample);
        assertEquals(100 / 1.04, sample.fps(), 1e-9);
        assertEquals(30.0, sample.frametimeP99Ms(), 1e-9, "p99 of 100 frames with 2 spikes is the spike");
    }

    @Test
    void testWindowWithoutFramesReportsZero() {
        FrameStats stats = new FrameStats();
        stats.onFrameStart(T0);
        stats.sample(T0);

        FrameStats.Sample sample = stats.sample(T0 + 1000 * MS);
        assertNotNull(sample);
        assertEquals(0.0, sample.fps());
        assertEquals(0.0, sample.frametimeP99Ms());
    }

    @Test
    void testWindowsAreIndependent() {
        FrameStats stats = new FrameStats();
        long now = T0;
        stats.onFrameStart(now);
        stats.sample(now);

        for (int i = 0; i < 50; i++) {
            now += 20 * MS;
            stats.onFrameStart(now);
        }
        assertEquals(50.0, stats.sample(now).fps(), 1e-9);

        for (int i = 0; i < 100; i++) {
            now += 10 * MS;
            stats.onFrameStart(now);
        }
        FrameStats.Sample second = stats.sample(now);
        assertEquals(100.0, second.fps(), 1e-9);
        assertEquals(10.0, second.frametimeP99Ms(), 1e-9);
    }

    @Test
    void testRingBufferOverflowIsBounded() {
        FrameStats stats = new FrameStats();
        long now = T0;
        stats.onFrameStart(now);
        stats.sample(now);

        int frames = FrameStats.CAPACITY * 3;
        for (int i = 0; i < frames; i++) {
            now += MS;
            stats.onFrameStart(now);
        }
        FrameStats.Sample sample = stats.sample(now);
        assertEquals(1000.0, sample.fps(), 1e-6);
        assertEquals(1.0, sample.frametimeP99Ms(), 1e-9);
    }
}
