package com.crystaltides.agent;

import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Test fixture mirroring the public bridge surface of the game-bridge agent
 * (apps/game-bridge/java-agent: com.crystaltides.agent.CrystalAgent).
 */
public final class CrystalAgent {

    public static final AtomicInteger FRAMES = new AtomicInteger();
    public static final AtomicLong LAST_FRAME_NANOS = new AtomicLong();
    public static final AtomicInteger GAME_READY_CALLS = new AtomicInteger();

    private CrystalAgent() {
    }

    public static void recordFrameStart(long nanoTime) {
        FRAMES.incrementAndGet();
        LAST_FRAME_NANOS.set(nanoTime);
    }

    public static void notifyGameReady() {
        GAME_READY_CALLS.incrementAndGet();
    }
}
