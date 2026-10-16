package com.crystaltides.boost.client;

import com.crystaltides.boost.config.BoostConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Sizes Minecraft's background worker pool ("Worker-Main-*", Util#backgroundExecutor), which generates
 * terrain for the integrated server and builds chunk meshes for the client.
 *
 * Vanilla uses one worker per logical CPU minus one. While new terrain loads they all stay busy, so on
 * CPUs with SMT a worker shares the render thread's physical core and the render thread loses
 * throughput that thread priorities cannot give back. Util#makeExecutor already reads the cap from
 * Util#getMaxThreads (the max.bg.threads system property): BackgroundWorkerLimitMixin only changes
 * that value, so no executor lambda is touched.
 */
public final class BackgroundWorkers {

    private static final Logger LOGGER = LoggerFactory.getLogger("crystaltides-boost");
    public static final String MAX_THREADS_PROPERTY = "max.bg.threads";

    private BackgroundWorkers() {
    }

    /** Called once, while Util initializes its executors. */
    public static int maxThreads(int vanillaMax) {
        if (System.getProperty(MAX_THREADS_PROPERTY) != null) {
            return vanillaMax; // an explicit -Dmax.bg.threads (player or launcher) always wins
        }
        int logicalCpus = Runtime.getRuntime().availableProcessors();
        int cap = resolve(BoostConfig.getInstance().getBackgroundWorkerLimit(), logicalCpus);
        if (cap <= 0) {
            return vanillaMax;
        }
        int result = Math.min(vanillaMax, cap);
        LOGGER.info("[Workers] background pool capped at {} workers (vanilla: {} on {} logical CPUs)",
            Math.min(result, Math.max(1, logicalCpus - 1)), Math.max(1, logicalCpus - 1), logicalCpus);
        return result;
    }

    /** Effective cap for a backgroundWorkerLimit setting; 0 or less means vanilla. */
    public static int resolve(int configured, int logicalCpus) {
        if (configured == BoostConfig.BACKGROUND_WORKERS_AUTO) {
            return autoLimit(logicalCpus);
        }
        return configured;
    }

    /**
     * Leaves about one physical core for the render thread and one for the integrated server, assuming
     * two logical CPUs per core, and never goes below two workers.
     */
    public static int autoLimit(int logicalCpus) {
        return Math.max(2, logicalCpus / 2 - 1);
    }
}
