package com.crystaltides.boost.client;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Tracks whether the game window is iconified (minimized) without polling GLFW every frame.
 *
 * Vanilla 1.21.1 registers no iconify callback on its window, so one is installed (by
 * {@link GlfwIconifyHook}) the first time a render-thread hook hands over the window handle,
 * chaining whatever callback another mod may have set before. From then on {@link #isIconified()}
 * is a volatile field read: no JNI, no allocation.
 *
 * GLFW delivers callbacks on the main (render) thread during glfwPollEvents, which is also the only
 * thread that calls {@link #ensureInstalled(long)}; the volatile flag makes the state safe to read
 * from other threads too. This class does not reference LWJGL, so it loads (and is unit-tested)
 * without GLFW on the classpath.
 *
 * Wayland does not report iconification to GLFW: there the state stays false and only the
 * "unfocused" policies apply.
 *
 * Only used on 1.21.1 (see {@link WindowState}): Minecraft tracks the iconified state itself since 1.21.2.
 */
public final class WindowStateTracker {

    private static final Logger LOGGER = LoggerFactory.getLogger("crystaltides-boost");

    /** A previously registered iconify callback, adapted so it can be chained. */
    @FunctionalInterface
    interface IconifyListener {
        void onIconify(long window, boolean iconified);
    }

    private static volatile boolean iconified;

    // Main thread only
    private static long installedWindow;
    private static IconifyListener previous;

    private WindowStateTracker() {
    }

    /** Main (render) thread. Allocation-free no-op once installed for this window. */
    public static void ensureInstalled(long window) {
        if (window == 0L || window == installedWindow) {
            return;
        }
        try {
            //? if <1.21.2 {
            GlfwIconifyHook.install(window);
            //?} else {
            /*attach(window, false, null);
            *///?}
        } catch (RuntimeException | LinkageError e) {
            // Without the callback, minimized detection stays off (only focus-based caps apply);
            // marking the window as handled keeps this from failing again every frame.
            attach(window, false, null);
            LOGGER.warn("[CrystalTides Boost] Could not install the GLFW iconify callback, minimized detection disabled: {}", e.toString());
        }
    }

    /** True while the window is minimized. Volatile read, safe from any thread. */
    public static boolean isIconified() {
        return iconified;
    }

    static void attach(long window, boolean initiallyIconified, IconifyListener previousListener) {
        installedWindow = window;
        previous = previousListener;
        iconified = initiallyIconified;
    }

    static void onIconify(long window, boolean value) {
        if (window == installedWindow) {
            iconified = value;
        }
        IconifyListener chained = previous;
        if (chained != null) {
            chained.onIconify(window, value);
        }
    }
}
