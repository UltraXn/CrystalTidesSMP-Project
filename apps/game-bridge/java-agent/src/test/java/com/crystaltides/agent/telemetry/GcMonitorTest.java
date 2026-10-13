package com.crystaltides.agent.telemetry;

import com.crystaltides.agent.ipc.IpcClient;
import org.junit.jupiter.api.Test;
import java.net.ServerSocket;
import java.net.Socket;

import static org.junit.jupiter.api.Assertions.*;

class GcMonitorTest {

    @Test
    void testStartAndStopAndGcCycle() {
        assertDoesNotThrow(() -> {
            GcMonitor.start();
            // calling start again should be a no-op
            GcMonitor.start();

            // Trigger a GC to exercise JMX notification listener
            System.gc();
            Thread.sleep(100);

            try (ServerSocket serverSocket = new ServerSocket(0)) {
                int port = serverSocket.getLocalPort();
                System.setProperty("crystaltides.ipc.port", String.valueOf(port));
                IpcClient.startAsyncClient();

                serverSocket.setSoTimeout(2500);
                try (Socket client = serverSocket.accept()) {
                    // Let telemetryLoop tick while connected
                    Thread.sleep(1200);
                } catch (Exception ignored) {
                }
            }

            double pause = GcMonitor.getAndResetRecentGcPauseMs();
            assertTrue(pause >= 0.0);
            GcMonitor.stop();
        });
    }
}
