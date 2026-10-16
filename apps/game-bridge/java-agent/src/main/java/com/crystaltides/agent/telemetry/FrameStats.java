package com.crystaltides.agent.telemetry;

import java.util.Arrays;

/**
 * FrameStats - Zero-allocation frametime accumulator.
 *
 * The render thread (single writer) reports the start of every frame through
 * {@link #onFrameStart(long)}; the telemetry thread (single reader) calls
 * {@link #sample(long)} once per heartbeat to derive average FPS and p99 frametime
 * over the window since the previous sample.
 *
 * Frame durations live in a fixed ring buffer. Under extreme frame rates the writer
 * may overwrite slots while the reader copies them, which only blends a few samples
 * of adjacent windows; acceptable for telemetry.
 */
public final class FrameStats {

    private static final FrameStats GLOBAL = new FrameStats();

    static final int CAPACITY = 4096; // power of two
    private static final int MASK = CAPACITY - 1;

    private final long[] frameNanos = new long[CAPACITY];
    private volatile long frameCount;
    private volatile boolean sourceAttached;

    // Writer-only state (render thread)
    private long lastFrameStartNanos;

    // Reader-only state (telemetry thread)
    private final long[] scratch = new long[CAPACITY];
    private long lastSampleCount;
    private long lastSampleNanos;

    public static FrameStats global() {
        return GLOBAL;
    }

    /** Called by the render thread at the start of each frame. Never allocates. */
    public void onFrameStart(long nowNanos) {
        long previous = lastFrameStartNanos;
        lastFrameStartNanos = nowNanos;
        if (previous == 0L) {
            sourceAttached = true;
            return;
        }
        long count = frameCount;
        frameNanos[(int) (count & MASK)] = nowNanos - previous;
        frameCount = count + 1; // single writer: volatile publish after the slot write
    }

    /**
     * Samples the window since the previous call.
     *
     * @return null when no frame source is attached yet or this is the first (baseline) sample.
     */
    public synchronized Sample sample(long nowNanos) {
        if (!sourceAttached) {
            return null;
        }
        long count = frameCount;
        long frames = count - lastSampleCount;
        long elapsedNanos = nowNanos - lastSampleNanos;
        boolean baseline = lastSampleNanos == 0L;
        lastSampleCount = count;
        lastSampleNanos = nowNanos;
        if (baseline || elapsedNanos <= 0L) {
            return null;
        }

        double fps = frames * 1_000_000_000.0 / elapsedNanos;
        int n = (int) Math.min(frames, CAPACITY);
        if (n == 0) {
            return new Sample(0.0, 0.0);
        }
        for (int i = 0; i < n; i++) {
            scratch[i] = frameNanos[(int) ((count - 1 - i) & MASK)];
        }
        Arrays.sort(scratch, 0, n);
        int p99Index = (int) Math.ceil(0.99 * n) - 1;
        double p99Ms = scratch[p99Index] / 1_000_000.0;
        return new Sample(fps, p99Ms);
    }

    public record Sample(double fps, double frametimeP99Ms) {
    }
}
