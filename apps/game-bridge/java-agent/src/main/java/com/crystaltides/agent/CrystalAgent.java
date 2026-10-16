package com.crystaltides.agent;

import java.lang.instrument.Instrumentation;

/**
 * CrystalAgent - Ultra-low-overhead Minecraft Client Bridge.
 *
 * Injected as a -javaagent before Minecraft starts. Orchestrates:
 * 1. IPC connection to the CrystalTides Launcher (127.0.0.1).
 * 2. Non-intrusive JMX GC pause and memory telemetry.
 */
@SuppressWarnings({"java:S106", "java:S1172"})
public class CrystalAgent {

    private CrystalAgent() {
        // Utility agent entrypoint
    }

    private static final long START_TIME_MS = System.currentTimeMillis();
    private static final java.util.concurrent.atomic.AtomicBoolean GAME_READY_SENT = new java.util.concurrent.atomic.AtomicBoolean(false);

    public static void premain(String agentArgs, Instrumentation inst) {
        // 1. Boot IPC client and Non-Intrusive GcMonitor
        com.crystaltides.agent.ipc.IpcClient.startAsyncClient();
        com.crystaltides.agent.telemetry.GcMonitor.start();

        // 2. Send Initial Handshake
        String javaVer = System.getProperty("java.version", "Unknown");
        String osName = System.getProperty("os.name", "Unknown");
        String ipcToken = System.getProperty("crystaltides.ipc.token", "");
        String mcVersion = System.getProperty("crystaltides.minecraft.version", "unknown");
        com.crystaltides.agent.ipc.IpcClient.sendHandshake(
            ipcToken,
            mcVersion,
            "CrystalAgent-v2.0 (" + osName + ", Java " + javaVer + ")",
            0,
            null,
            null,
            null
        );

        System.out.println("[CrystalAgent] Agente cargado (IPC iniciado)");
    }

    /**
     * Public bridge entrypoint, invoked by the crystaltides-boost mod on the render thread at
     * the start of every frame (resolved reflectively through the system class loader).
     * Never allocates and never blocks.
     */
    public static void recordFrameStart(long nanoTime) {
        com.crystaltides.agent.telemetry.FrameStats.global().onFrameStart(nanoTime);
    }

    /**
     * Public bridge entrypoint, invoked by the crystaltides-boost mod once the TitleScreen is
     * initialised. Idempotent: only the first call dispatches game_ready.
     */
    public static void notifyGameReady() {
        if (GAME_READY_SENT.compareAndSet(false, true)) {
            long duration = System.currentTimeMillis() - START_TIME_MS;
            com.crystaltides.agent.ipc.IpcClient.sendGameReady(duration);
            System.out.println("🎮 [CrystalAgent] Dispatched game_ready (Bootstrap duration: " + duration + "ms)");
        }
    }

    public static void agentmain(String agentArgs, Instrumentation inst) {
        premain(agentArgs, inst);
    }
}
