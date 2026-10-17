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
    /**
     * Physical cores the process may run on. Java cannot see SMT, so the CrystalTides launcher, which sets
     * the process affinity, passes the count of physical cores inside its affinity mask.
     */
    public static final String PHYSICAL_CORES_PROPERTY = "crystaltides.boost.physicalCores";

    private BackgroundWorkers() {
    }

    /** Called once, while Util initializes its executors. */
    public static int maxThreads(int vanillaMax) {
        if (System.getProperty(MAX_THREADS_PROPERTY) != null) {
            return vanillaMax; // an explicit -Dmax.bg.threads always wins
        }
        int logicalCpus = Runtime.getRuntime().availableProcessors();
        int physicalCores = Integer.getInteger(PHYSICAL_CORES_PROPERTY, 0);
        int cap = resolve(BoostConfig.getInstance().getBackgroundWorkerLimit(), logicalCpus, physicalCores);
        if (cap <= 0) {
            return vanillaMax;
        }
        int vanillaPool = Math.max(1, logicalCpus - 1);
        LOGGER.info("[Workers] background pool: {} workers (vanilla: {}; {} logical CPUs, physical cores: {})",
            Math.min(vanillaPool, cap), vanillaPool, logicalCpus, physicalCores > 0 ? physicalCores : "unknown");
        return Math.min(vanillaMax, cap);
    }

    /** Effective cap for a backgroundWorkerLimit setting; 0 or less means vanilla. */
    public static int resolve(int configured, int logicalCpus, int physicalCores) {
        if (configured == BoostConfig.BACKGROUND_WORKERS_AUTO) {
            return autoLimit(logicalCpus, physicalCores);
        }
        return configured;
    }

    /**
     * One worker per physical core minus one, never fewer than two. Workers then leave the SMT siblings
     * free for the render thread and the integrated server; with one logical CPU per core this matches
     * vanilla's pool, since there is no sibling to free. Without the launcher's count (0) it assumes two
     * logical CPUs per core.
     */
    public static int autoLimit(int logicalCpus, int physicalCores) {
        int cores = physicalCores > 0 ? Math.min(physicalCores, logicalCpus) : logicalCpus / 2;
        return Math.max(2, cores - 1);
    }
}
