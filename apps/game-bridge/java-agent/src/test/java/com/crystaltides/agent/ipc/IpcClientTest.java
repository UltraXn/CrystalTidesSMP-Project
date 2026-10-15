package com.crystaltides.agent.ipc;

import org.junit.jupiter.api.Test;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.ServerSocket;
import java.net.Socket;
import java.net.SocketTimeoutException;
import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.*;

class IpcClientTest {

    @Test
    void testSendMethodsDoNotThrow() {
        assertDoesNotThrow(() -> {
            IpcClient.sendJson("{\"type\":\"test\"}");
            IpcClient.sendJson(null);
            IpcClient.sendJson("");
            IpcClient.sendJson("line1\nline2\rline3");
            IpcClient.sendHandshake("dummy-token", "1.20.1", "1.0.0", 5, "NVIDIA", "NVIDIA Corp", "4.6.0");
            IpcClient.sendHandshake(null, null, null, 0, null, null, null);
            IpcClient.sendHandshake("token\"with\\escape", "mc", "client", 1, "glR", "glV", "glVer");
            IpcClient.sendGameReady(1234L);
            IpcClient.sendTelemetry(2.5, 512L, 2048L, "Vulkan");
            IpcClient.sendTelemetry(0.0, null, null, null);
        });
    }

    @Test
    void testQueueSaturationTriggersWarningBranch() {
        assertDoesNotThrow(() -> {
            for (int i = 0; i < 300; i++) {
                IpcClient.sendJson("{\"index\":" + i + "}");
            }
        });
    }

    @Test
    void testStartAsyncClientConnectsToLocalServer() throws Exception {
        resetClient();
        try (ServerSocket serverSocket = new ServerSocket(0)) {
            int port = serverSocket.getLocalPort();
            System.setProperty("crystaltides.ipc.port", String.valueOf(port));

            IpcClient.sendHandshake("connect-token", "1.21.1", "test", 0, null, null, null);
            IpcClient.startAsyncClient();

            // Accept connection from worker thread
            serverSocket.setSoTimeout(5000);
            try (Socket client = serverSocket.accept()) {
                IpcClient.sendJson("{\"hello\":\"world\"}");
                String line = readFirstLine(client);
                assertNotNull(line);
                assertTrue(line.startsWith("{\"type\":\"handshake\""), "First frame must be the handshake: " + line);
                assertTrue(line.contains("\"token\":\"connect-token\""), line);
                assertTrue(IpcClient.isConnected());
            } finally {
                IpcClient.stopAsyncClient();
                Thread.sleep(100);
            }
        }
    }

    @Test
    void testHandshakeIsReplayedOnReconnect() throws Exception {
        resetClient();
        try (ServerSocket serverSocket = new ServerSocket(0)) {
            System.setProperty("crystaltides.ipc.port", String.valueOf(serverSocket.getLocalPort()));

            IpcClient.sendHandshake("reconnect-token", "1.21.1", "test", 0, null, null, null);
            IpcClient.startAsyncClient();
            try {
                serverSocket.setSoTimeout(5000);
                try (Socket first = serverSocket.accept()) {
                    assertTrue(readFirstLine(first).contains("\"token\":\"reconnect-token\""));
                }

                // The launcher closed the session; the worker only notices on write, so keep
                // telemetry flowing until it reconnects.
                serverSocket.setSoTimeout(200);
                Socket second = null;
                long deadline = System.currentTimeMillis() + 10_000;
                while (second == null && System.currentTimeMillis() < deadline) {
                    IpcClient.sendJson("{\"type\":\"telemetry\",\"gc_pause_time_ms\":0.0}");
                    try {
                        second = serverSocket.accept();
                    } catch (SocketTimeoutException retry) {
                        // Not reconnected yet
                    }
                }
                assertNotNull(second, "IPC worker did not reconnect after the launcher closed the session");
                try (Socket reconnected = second) {
                    String line = readFirstLine(reconnected);
                    assertTrue(line.startsWith("{\"type\":\"handshake\""),
                            "Reconnected session must start with the handshake, got: " + line);
                    assertTrue(line.contains("\"token\":\"reconnect-token\""), line);
                }
            } finally {
                IpcClient.stopAsyncClient();
                Thread.sleep(100);
            }
        }
    }

    private static void resetClient() throws InterruptedException {
        // Other tests (e.g. CrystalAgentTest) may have left a worker running against another port
        IpcClient.stopAsyncClient();
        Thread.sleep(200);
    }

    private static String readFirstLine(Socket socket) throws Exception {
        socket.setSoTimeout(5000);
        BufferedReader reader = new BufferedReader(new InputStreamReader(socket.getInputStream(), StandardCharsets.UTF_8));
        return reader.readLine();
    }
}
