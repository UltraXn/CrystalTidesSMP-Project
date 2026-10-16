package com.crystaltides.boost.bridge;

import com.crystaltides.agent.CrystalAgent;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertTrue;

class AgentBridgeTest {

    @Test
    @DisplayName("Sin agente en el classloader el bridge queda deshabilitado (no-op)")
    void testResolveWithoutAgentReturnsNone() {
        ClassLoader bootstrapOnly = new ClassLoader(null) {
        };
        AgentBridge.Handles handles = AgentBridge.Handles.resolve(bootstrapOnly);
        assertSame(AgentBridge.Handles.NONE, handles);
        assertNull(handles.recordFrameStart());
        assertNull(handles.notifyGameReady());
    }

    @Test
    @DisplayName("Con el agente en el system classloader se resuelven ambos entrypoints")
    void testResolveFindsAgentEntrypoints() {
        AgentBridge.Handles handles = AgentBridge.Handles.resolve(ClassLoader.getSystemClassLoader());
        assertNotNull(handles.recordFrameStart());
        assertNotNull(handles.notifyGameReady());
        assertTrue(AgentBridge.isAgentPresent());
    }

    @Test
    @DisplayName("onFrameStart reenvía un timestamp monotónico por frame y game_ready se envía una sola vez")
    void testBridgeForwardsCalls() {
        int framesBefore = CrystalAgent.FRAMES.get();
        long before = System.nanoTime();
        AgentBridge.onFrameStart();
        AgentBridge.onFrameStart();
        assertEquals(framesBefore + 2, CrystalAgent.FRAMES.get());
        assertTrue(CrystalAgent.LAST_FRAME_NANOS.get() >= before);

        AgentBridge.notifyGameReady();
        AgentBridge.notifyGameReady();
        assertEquals(1, CrystalAgent.GAME_READY_CALLS.get());
    }
}
