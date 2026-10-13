package com.crystaltides.agent;

import java.lang.instrument.Instrumentation;
import java.util.concurrent.atomic.AtomicReference;

/**
 * CrystalAgent - The JVM Infiltrator & Native Hardware Bridge.
 *
 * Injected as a -javaagent before Minecraft starts. Orchestrates:
 * 1. Direct Win32 ThreadQoS & EcoQoS bypass for the Render Thread.
 * 2. WGL_NV_DX_interop2 zero-copy texture sharing with DirectX 12.
 * 3. AMD FidelityFX FSR 3.1 & Frame Generation pipeline.
 */
@SuppressWarnings({"java:S106", "java:S1172"})
public class CrystalAgent {

    private CrystalAgent() {
        // Utility agent entrypoint
    }

    private static volatile boolean nativeLoaded = false;
    private static final long START_TIME_MS = System.currentTimeMillis();
    private static final java.util.concurrent.atomic.AtomicBoolean GAME_READY_SENT = new java.util.concurrent.atomic.AtomicBoolean(false);
    private static final AtomicReference<Thread> READY_WATCHER = new AtomicReference<>();

    public static void premain(String agentArgs, Instrumentation inst) {
        System.out.println("==================================================");
        System.out.println("🧟 [CrystalAgent] INJECTION SUCCESSFUL");
        System.out.println("🧪 [CrystalAgent] JVM Infiltrator Active (v2.0-native)");

        // 1. Boot IPC client and Non-Intrusive GcMonitor
        com.crystaltides.agent.ipc.IpcClient.startAsyncClient();
        com.crystaltides.agent.telemetry.GcMonitor.start();

        // 2. Send Initial Handshake
        String javaVer = System.getProperty("java.version", "Unknown");
        String osName = System.getProperty("os.name", "Unknown");
        String ipcToken = System.getProperty("crystaltides.ipc.token", "");
        com.crystaltides.agent.ipc.IpcClient.sendHandshake(
            ipcToken,
            "1.21.1",
            "CrystalAgent-v2.0 (" + osName + ", Java " + javaVer + ")",
            0,
            null,
            null,
            null
        );

        // 3. Fallback TitleScreen / GameReady trigger (after 12s if not triggered explicitly)
        Thread readyWatcher = new Thread(() -> {
            try {
                Thread.sleep(12000);
                notifyGameReady();
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }, "CrystalAgent-ReadyWatcher");
        readyWatcher.setDaemon(true);
        readyWatcher.setPriority(Thread.MIN_PRIORITY);
        READY_WATCHER.set(readyWatcher);
        readyWatcher.start();

        try {
            System.loadLibrary("game_bridge_core");
            nativeLoaded = true;
            String response = nativeInit("Bootstrapping FSR 3.1 & Native Swapchain Bridge...");
            System.out.println(response);

            // Automatically optimize the startup thread
            String qos = nativeOptimizeCurrentThread(true);
            System.out.println("⚡ [CrystalAgent] Initial Thread QoS: " + qos);
        } catch (UnsatisfiedLinkError e) {
            System.err.println("❌ [CrystalAgent] FAILED to load Native Core: " + e.getMessage());
            System.err.println("⚠️ [CrystalAgent] Running in fallback software mode.");
        }

        System.out.println("==================================================");
    }

    public static void notifyGameReady() {
        if (GAME_READY_SENT.compareAndSet(false, true)) {
            Thread watcher = READY_WATCHER.getAndSet(null);
            if (watcher != null) {
                watcher.interrupt();
            }
            long duration = System.currentTimeMillis() - START_TIME_MS;
            com.crystaltides.agent.ipc.IpcClient.sendGameReady(duration);
            System.out.println("🎮 [CrystalAgent] Dispatched game_ready (Bootstrap duration: " + duration + "ms)");
        }
    }

    public static void agentmain(String agentArgs, Instrumentation inst) {
        premain(agentArgs, inst);
    }

    public static boolean isNativeLoaded() {
        return nativeLoaded;
    }

    // --- Native JNI Interface (Rust game_bridge_core) ---

    public static native String nativeInit(String input);

    public static native String nativeOptimizeCurrentThread(boolean timeCritical);

    public static native boolean nativeSetFsrConfig(
        boolean enabled,
        boolean frameGen,
        float renderScale,
        int targetFps,
        float sharpness
    );

    public static native String nativeGetFsrTelemetry();

    public static native String nativeInitInterop(int textureId, int width, int height);

    public static native void nativeRecordFrame();

    public static native void nativeRenderOverlay(int width, int height);

    public static native boolean nativeIsOverlayVisible();

    public static native boolean nativeToggleOverlay();

    public static native String nativeSaveReplayClip();
}
