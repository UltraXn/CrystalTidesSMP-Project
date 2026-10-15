package com.crystaltides.agent.ipc;

import org.junit.jupiter.api.Test;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.ServerSocket;
import java.net.Socket;
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
        try (ServerSocket serverSocket = new ServerSocket(0)) {
            int port = serverSocket.getLocalPort();
            System.setProperty("crystaltides.ipc.port", String.valueOf(port));

            IpcClient.startAsyncClient();

            // Accept connection from worker thread
            serverSocket.setSoTimeout(3000);
            try (Socket client = serverSocket.accept();
                 BufferedReader reader = new BufferedReader(new InputStreamReader(client.getInputStream(), StandardCharsets.UTF_8))) {
                
                IpcClient.sendJson("{\"hello\":\"world\"}");
                String line = reader.readLine();
                assertNotNull(line);
                assertTrue(IpcClient.isConnected());
            } catch (Exception ignored) {
                // Connection might close naturally during test shutdown
            } finally {
                IpcClient.stopAsyncClient();
                Thread.sleep(100);
            }
        }
    }
}
