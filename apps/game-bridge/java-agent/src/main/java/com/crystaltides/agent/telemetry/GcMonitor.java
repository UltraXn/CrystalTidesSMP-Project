package com.crystaltides.agent.telemetry;

import com.crystaltides.agent.ipc.IpcClient;
import com.sun.management.GarbageCollectionNotificationInfo;

import javax.management.NotificationEmitter;
import javax.management.NotificationListener;
import javax.management.openmbean.CompositeData;
import java.lang.management.GarbageCollectorMXBean;
import java.lang.management.ManagementFactory;
import java.lang.management.MemoryMXBean;
import java.lang.management.MemoryUsage;
import java.util.List;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.DoubleAdder;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * GcMonitor - Non-intrusive Zero-Allocation JVM Telemetry Monitor.
 *
 * Attaches JMX NotificationListeners to GarbageCollectorMXBeans to track
 * GC pauses without polling or allocation loops. Periodically dispatches
 * telemetry heartbeats over IPC on a low-priority daemon thread.
 */
public class GcMonitor {

    private GcMonitor() {
        // Utility telemetry class
    }

    private static final Logger LOGGER = Logger.getLogger(GcMonitor.class.getName());
    private static final DoubleAdder RECENT_GC_PAUSE_MS = new DoubleAdder();
    private static final AtomicBoolean STARTED = new AtomicBoolean(false);
    private static final AtomicBoolean RUNNING = new AtomicBoolean(true);
    private static final MemoryMXBean MEMORY_BEAN = ManagementFactory.getMemoryMXBean();

    private static final Object LOCK = new Object();

    public static void start() {
        synchronized (LOCK) {
            if (STARTED.getAndSet(true)) {
                return;
            }

            // 1. Attach JMX GC Listeners
            registerGcNotificationListeners();

            // 2. Start Telemetry Heartbeat Daemon Thread
            Thread heartbeatThread = new Thread(GcMonitor::telemetryLoop, "CrystalAgent-Telemetry-Worker");
            heartbeatThread.setDaemon(true);
            heartbeatThread.setPriority(Thread.MIN_PRIORITY);
            heartbeatThread.start();
        }
    }

    private static void registerGcNotificationListeners() {
        try {
            List<GarbageCollectorMXBean> gcBeans = ManagementFactory.getGarbageCollectorMXBeans();
            for (GarbageCollectorMXBean gcBean : gcBeans) {
                if (gcBean instanceof NotificationEmitter emitter) {
                    NotificationListener listener = (notification, handback) -> {
                        if (GarbageCollectionNotificationInfo.GARBAGE_COLLECTION_NOTIFICATION
                                .equals(notification.getType())) {
                            try {
                                CompositeData cd = (CompositeData) notification.getUserData();
                                GarbageCollectionNotificationInfo info =
                                        GarbageCollectionNotificationInfo.from(cd);
                                long durationMs = info.getGcInfo().getDuration();
                                RECENT_GC_PAUSE_MS.add(durationMs);
                            } catch (Exception ignored) {
                                LOGGER.log(Level.FINEST, "Failed to parse GC notification", ignored);
                            }
                        }
                    };
                    emitter.addNotificationListener(listener, null, null);
                }
            }
        } catch (Exception e) {
            LOGGER.log(Level.WARNING, "Could not attach JMX GC listener: {0}", e.getMessage());
        }
    }

    private static void telemetryLoop() {
        while (RUNNING.get() && !Thread.currentThread().isInterrupted()) {
            try {
                Thread.sleep(1000);

                if (IpcClient.isConnected()) {
                    // Extract memory stats
                    MemoryUsage heapUsage = MEMORY_BEAN.getHeapMemoryUsage();
                    long usedMb = heapUsage.getUsed() / (1024 * 1024);
                    long totalMb = heapUsage.getMax() > 0 
                            ? heapUsage.getMax() / (1024 * 1024) 
                            : heapUsage.getCommitted() / (1024 * 1024);

                    // Drain recent GC pause duration
                    double gcPause = RECENT_GC_PAUSE_MS.sumThenReset();

                    String backend = "OpenGL/LWJGL";

                    IpcClient.sendTelemetry(gcPause, usedMb, totalMb, backend);
                }
            } catch (InterruptedException ie) {
                Thread.currentThread().interrupt();
                break;
            } catch (Exception ignored) {
                LOGGER.log(Level.FINEST, "Error in telemetry loop", ignored);
            }
        }
    }

    public static void stop() {
        RUNNING.set(false);
    }

    public static double getAndResetRecentGcPauseMs() {
        return RECENT_GC_PAUSE_MS.sumThenReset();
    }
}
