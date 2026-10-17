package com.crystaltides.boost.client;

import com.crystaltides.boost.config.BoostConfig;

/**
 * Background power policy: caps the frame rate while the window is minimized or unfocused.
 *
 * Minecraft 1.21.1 has no background limiter of its own (the inactivity FPS limit arrived in 1.21.2)
 * and keeps rendering at full resolution while minimized, because Window ignores the 0x0 framebuffer
 * size it receives on iconify. Minecraft#runTick only throttles when getFramerateLimit() is below 260
 * (RenderSystem.limitDisplayFPS, which sleeps in glfwWaitEventsTimeout), so returning a lower value
 * is enough to idle the render thread.
 */
public final class BackgroundEco {

    /** Highest limit that still throttles: runTick treats 260 and above as "unlimited". */
    public static final int MAX_LIMIT = 259;

    private BackgroundEco() {
    }

    /**
     * Frame rate limit to apply. Pure and allocation-free; called once per frame.
     *
     * @param original       limit computed by vanilla (and any mod applied before)
     * @param loading        an overlay is showing (resource reload): never throttled, it would slow loading
     * @param iconified      the window is minimized
     * @param focused        the window has input focus (Minecraft#isWindowActive)
     * @param minimizedLimit cap while minimized, 0 = no specific cap (falls back to the unfocused cap)
     * @param unfocusedLimit cap while unfocused, 0 = disabled
     * @return the lower of {@code original} and the applicable cap; never raises the user's limit
     */
    public static int limit(int original, boolean loading, boolean iconified, boolean focused,
                            int minimizedLimit, int unfocusedLimit) {
        if (loading) {
            return original;
        }
        int cap;
        if (iconified && minimizedLimit > 0) {
            cap = minimizedLimit;
        } else if ((iconified || !focused) && unfocusedLimit > 0) {
            cap = unfocusedLimit;
        } else {
            return original;
        }
        return cap < original ? cap : original;
    }

    /** Configuration snapshot read once, so the per-frame hook only touches static finals. */
    public static final class Settings {
        public static final int MINIMIZED_LIMIT = BoostConfig.getInstance().getMinimizedFpsLimit();
        public static final int UNFOCUSED_LIMIT = BoostConfig.getInstance().getUnfocusedFpsLimit();

        private Settings() {
        }
    }
}
