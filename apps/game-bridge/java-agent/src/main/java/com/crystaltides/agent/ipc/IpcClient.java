package com.crystaltides.agent.ipc;

import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.net.InetSocketAddress;
import java.net.Socket;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicReference;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Asynchronous, ultra-low-overhead IPC client connecting Minecraft JVM
 * to the local Tauri Launcher backend (127.0.0.1:28195).
 * 
 * Runs entirely on a dedicated daemon thread. Never allocates objects on the
 * game render thread and never blocks Minecraft execution.
 */
public class IpcClient {

    private IpcClient() {
        // Utility / Singleton class
    }

    private static final Logger LOGGER = Logger.getLogger(IpcClient.class.getName());
    private static final String DEFAULT_HOST = "127.0.0.1";
    private static final int DEFAULT_PORT = 28195;

    private static final BlockingQueue<String> OUTGOING_QUEUE = new LinkedBlockingQueue<>(256);
    private static final AtomicBoolean RUNNING = new AtomicBoolean(false);
    private static volatile boolean connected = false;
    private static final AtomicReference<Thread> WORKER_THREAD = new AtomicReference<>();

    private static int targetPort = DEFAULT_PORT;

    public static synchronized void startAsyncClient() {
        if (RUNNING.get()) {
            return;
        }
        RUNNING.set(true);

        try {
            targetPort = Integer.getInteger("crystaltides.ipc.port", DEFAULT_PORT);
        } catch (Exception e) {
            targetPort = DEFAULT_PORT;
        }

        Thread worker = new Thread(IpcClient::workerLoop, "CrystalAgent-IPC-Worker");
        worker.setDaemon(true);
        worker.setPriority(Thread.MIN_PRIORITY);
        WORKER_THREAD.set(worker);
        worker.start();
    }

    public static synchronized void stopAsyncClient() {
        RUNNING.set(false);
        Thread worker = WORKER_THREAD.getAndSet(null);
        if (worker != null) {
            worker.interrupt();
        }
    }

    public static boolean isConnected() {
        return connected;
    }

    public static void sendJson(String json) {
        if (json == null || json.isEmpty()) return;
        // Strip line breaks so each JSON payload is exactly one line
        String singleLine = json.replace('\n', ' ').replace('\r', ' ').trim();
        // Drop message if queue is full to avoid any memory buildup
        if (!OUTGOING_QUEUE.offer(singleLine)) {
            LOGGER.warning("Outgoing queue full, dropping payload");
        }
    }

    public static void sendHandshake(
            String token,
            String mcVersion,
            String clientVersion,
            int modsCount,
            String glRenderer,
            String glVendor,
            String glVersion
    ) {
        StringBuilder sb = new StringBuilder();
        sb.append("{\"type\":\"handshake\"");
        if (token != null && !token.isEmpty()) sb.append(",\"token\":\"").append(escape(token)).append("\"");
        if (mcVersion != null) sb.append(",\"minecraft_version\":\"").append(escape(mcVersion)).append("\"");
        if (clientVersion != null) sb.append(",\"client_version\":\"").append(escape(clientVersion)).append("\"");
        sb.append(",\"mods_count\":").append(modsCount);
        if (glRenderer != null) sb.append(",\"gl_renderer\":\"").append(escape(glRenderer)).append("\"");
        if (glVendor != null) sb.append(",\"gl_vendor\":\"").append(escape(glVendor)).append("\"");
        if (glVersion != null) sb.append(",\"gl_version\":\"").append(escape(glVersion)).append("\"");
        sb.append("}");
        sendJson(sb.toString());
    }

    public static void sendGameReady(long loadDurationMs) {
        sendJson("{\"type\":\"game_ready\",\"load_duration_ms\":" + loadDurationMs + "}");
    }

    public static void sendTelemetry(
            double fps,
            double frametimeP99Ms,
            double gcPauseTimeMs,
            Long memoryUsedMb,
            Long memoryTotalMb,
            String swapchainBackend
    ) {
        StringBuilder sb = new StringBuilder();
        sb.append("{\"type\":\"telemetry\"");
        sb.append(String.format(java.util.Locale.US, ",\"fps\":%.1f", fps));
        sb.append(String.format(java.util.Locale.US, ",\"frametime_p99_ms\":%.2f", frametimeP99Ms));
        sb.append(String.format(java.util.Locale.US, ",\"gc_pause_time_ms\":%.1f", gcPauseTimeMs));
        if (memoryUsedMb != null) sb.append(",\"memory_used_mb\":").append(memoryUsedMb);
        if (memoryTotalMb != null) sb.append(",\"memory_total_mb\":").append(memoryTotalMb);
        if (swapchainBackend != null) sb.append(",\"swapchain_backend\":\"").append(escape(swapchainBackend)).append("\"");
        sb.append("}");
        sendJson(sb.toString());
    }

    @SuppressWarnings("PMD.UnusedAssignment")
    private static void workerLoop() {
        int backoffMs = 1000;

        while (RUNNING.get()) {
            connectAndServe();
            try {
                Thread.sleep(backoffMs);
                backoffMs = Math.min(backoffMs * 2, 5000);
            } catch (InterruptedException ie) {
                Thread.currentThread().interrupt();
                break;
            }
        }
    }

    private static void connectAndServe() {
        try (Socket socket = new Socket()) {
            socket.setTcpNoDelay(true);
            socket.connect(new InetSocketAddress(DEFAULT_HOST, targetPort), 3000);

            connected = true;
            LOGGER.log(Level.INFO, "Connected to Tauri Launcher on port {0}", targetPort);

            try (PrintWriter writer = new PrintWriter(new OutputStreamWriter(socket.getOutputStream(), StandardCharsets.UTF_8), true)) {
                sendLoop(socket, writer);
            }
        } catch (InterruptedException ie) {
            Thread.currentThread().interrupt();
        } catch (Exception ignored) {
            // Connection failed or disconnected
        } finally {
            connected = false;
        }
    }

    private static void sendLoop(Socket socket, PrintWriter writer) throws InterruptedException {
        while (RUNNING.get() && !socket.isClosed()) {
            String payload = OUTGOING_QUEUE.poll(500, java.util.concurrent.TimeUnit.MILLISECONDS);
            if (payload != null) {
                writer.println(payload);
                if (writer.checkError()) {
                    break;
                }
            }
        }
    }

    private static String escape(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
