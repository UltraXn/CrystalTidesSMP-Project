package com.crystaltides.agent;

import java.lang.instrument.Instrumentation;

/**
 * The CrystalAgent is the "Biological Infiltrator" of the Lunar-style
 * architecture.
 * It is loaded into the Minecraft JVM before the main method starts.
 */
public class CrystalAgent {

    public static void premain(String agentArgs, Instrumentation inst) {
        System.out.println("--------------------------------------------------");
        System.out.println("🧟 [CrystalAgent] INJECTION SUCCESSFUL");
        System.out.println("🧪 [CrystalAgent] Biological Agent Active");

        try {
            System.loadLibrary("game_bridge_core");
            String response = nativeInit("Awaiting orders...");
            System.out.println(response);
        } catch (UnsatisfiedLinkError e) {
            System.err.println("❌ [CrystalAgent] FAILED to load Native Core: " + e.getMessage());
        }

        System.out.println("--------------------------------------------------");
    }

    // Native method to talk to Rust
    public static native String nativeInit(String input);

    public static void agentmain(String agentArgs, Instrumentation inst) {
        premain(agentArgs, inst);
    }
}
