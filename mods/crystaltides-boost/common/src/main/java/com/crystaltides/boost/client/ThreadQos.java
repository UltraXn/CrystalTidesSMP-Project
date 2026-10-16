package com.crystaltides.boost.client;

import com.crystaltides.boost.config.BoostConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Thread priority helpers shared by the QoS mixins.
 *
 * HotSpot maps Java priorities to OS levels. On Windows: 1-2 LOWEST, 3-4 BELOW_NORMAL, 5-6 NORMAL,
 * 7-8 ABOVE_NORMAL, 9-10 HIGHEST, so 6 is no different from the default 5. On Linux the JVM ignores
 * priorities unless started with -XX:ThreadPriorityPolicy=1 as root, which makes these calls no-ops.
 */
public final class ThreadQos {

    private static final Logger LOGGER = LoggerFactory.getLogger("crystaltides-boost");

    private ThreadQos() {
    }

    /** Applies {@code priority} to the calling thread. See {@link #apply(Thread, String, int)}. */
    public static boolean applyToCurrent(String label, int priority) {
        return apply(Thread.currentThread(), label, priority);
    }

    /**
     * Raises the thread priority to {@code priority} (clamped to 1-10 and to the thread group's maximum).
     * Never lowers it: Java threads inherit their creator's priority, so a thread that vanilla recreates
     * from the render thread (e.g. "Sound engine" after a sound reload) can already be at 10, and this
     * QoS must not demote it. Idempotent: when nothing changes nothing is called or logged, so it is safe
     * on paths that run once per connection or per thread start.
     *
     * @return true if the priority changed
     */
    public static boolean apply(Thread thread, String label, int priority) {
        int target = clamp(priority);
        ThreadGroup group = thread.getThreadGroup();
        if (group != null) {
            target = Math.min(target, group.getMaxPriority());
        }
        int current = thread.getPriority();
        if (current >= target) {
            return false;
        }
        try {
            thread.setPriority(target);
        } catch (SecurityException | IllegalArgumentException e) {
            LOGGER.warn("[ThreadQoS] Unable to set {} ('{}') priority to {}: {}", label, thread.getName(), target, e.toString());
            return false;
        }
        LOGGER.info("[ThreadQoS] {} ('{}') priority {} -> {}", label, thread.getName(), current, thread.getPriority());
        return true;
    }

    public static int clamp(int priority) {
        return Math.max(Thread.MIN_PRIORITY, Math.min(Thread.MAX_PRIORITY, priority));
    }

    /** Configuration snapshot read once by the QoS mixins. */
    public static final class Settings {
        public static final int SOUND_PRIORITY = BoostConfig.getInstance().getSoundThreadPriority();
        public static final int NETWORK_PRIORITY = BoostConfig.getInstance().getNetworkThreadPriority();

        private Settings() {
        }
    }
}
