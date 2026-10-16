package com.crystaltides.boost.bridge;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.lang.invoke.MethodHandle;
import java.lang.invoke.MethodHandles;
import java.lang.invoke.MethodType;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * AgentBridge - Optional link to the CrystalTides launcher's game-bridge Java agent.
 *
 * The agent is injected with -javaagent, so it lives on the system class loader. It is
 * resolved reflectively from there on purpose: referencing it directly could make the
 * loader's game class loader (Knot / FML) define a second copy with its own static state.
 * When the agent is absent (game not started from the launcher) every call is a no-op.
 */
public final class AgentBridge {

    private static final Logger LOGGER = LoggerFactory.getLogger("crystaltides-boost");
    static final String AGENT_CLASS = "com.crystaltides.agent.CrystalAgent";

    private static final Handles HANDLES = Handles.resolve(ClassLoader.getSystemClassLoader());
    private static final AtomicBoolean GAME_READY_SENT = new AtomicBoolean(false);
    private static volatile boolean failed;

    private AgentBridge() {
    }

    public static boolean isAgentPresent() {
        return HANDLES.recordFrameStart() != null || HANDLES.notifyGameReady() != null;
    }

    /** Render thread, once per frame. Must stay allocation-free. */
    public static void onFrameStart() {
        MethodHandle handle = HANDLES.recordFrameStart();
        if (handle == null || failed) {
            return;
        }
        try {
            handle.invokeExact(System.nanoTime());
        } catch (Throwable t) {
            disable("recordFrameStart", t);
        }
    }

    /** Called when the TitleScreen is initialised; only the first call is forwarded. */
    public static void notifyGameReady() {
        MethodHandle handle = HANDLES.notifyGameReady();
        if (handle == null || failed || !GAME_READY_SENT.compareAndSet(false, true)) {
            return;
        }
        try {
            handle.invokeExact();
        } catch (Throwable t) {
            disable("notifyGameReady", t);
        }
    }

    private static void disable(String method, Throwable t) {
        failed = true;
        LOGGER.warn("[CrystalTides Boost] Agent bridge call {} failed, disabling bridge: {}", method, t.toString());
    }

    record Handles(MethodHandle recordFrameStart, MethodHandle notifyGameReady) {

        static final Handles NONE = new Handles(null, null);

        static Handles resolve(ClassLoader loader) {
            Class<?> agent;
            try {
                agent = Class.forName(AGENT_CLASS, false, loader);
            } catch (ClassNotFoundException | LinkageError e) {
                return NONE;
            }
            MethodHandles.Lookup lookup = MethodHandles.publicLookup();
            // Resolved independently so an older agent without frame telemetry still gets game_ready
            MethodHandle frame = find(lookup, agent, "recordFrameStart", MethodType.methodType(void.class, long.class));
            MethodHandle ready = find(lookup, agent, "notifyGameReady", MethodType.methodType(void.class));
            if (frame != null || ready != null) {
                LOGGER.info("[CrystalTides Boost] Launcher agent detected (frame telemetry: {}, game_ready: {})",
                    frame != null, ready != null);
            }
            return new Handles(frame, ready);
        }

        private static MethodHandle find(MethodHandles.Lookup lookup, Class<?> owner, String name, MethodType type) {
            try {
                return lookup.findStatic(owner, name, type);
            } catch (NoSuchMethodException | IllegalAccessException e) {
                LOGGER.warn("[CrystalTides Boost] Launcher agent does not expose {}{}", name, type);
                return null;
            }
        }
    }
}
