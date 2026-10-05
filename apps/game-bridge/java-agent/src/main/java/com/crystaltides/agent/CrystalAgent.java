package com.crystaltides.agent;

import java.lang.instrument.Instrumentation;

/**
 * CrystalAgent - The JVM Infiltrator & Native Hardware Bridge.
 *
 * Injected as a -javaagent before Minecraft starts. Orchestrates:
 * 1. Direct Win32 ThreadQoS & EcoQoS bypass for the Render Thread.
 * 2. WGL_NV_DX_interop2 zero-copy texture sharing with DirectX 12.
 * 3. AMD FidelityFX FSR 3.1 & Frame Generation pipeline.
 */
public class CrystalAgent {

    private static volatile boolean nativeLoaded = false;

    public static void premain(String agentArgs, Instrumentation inst) {
        System.out.println("==================================================");
        System.out.println("🧟 [CrystalAgent] INJECTION SUCCESSFUL");
        System.out.println("🧪 [CrystalAgent] JVM Infiltrator Active (v2.0-native)");

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
}
