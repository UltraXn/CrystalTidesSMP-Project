package com.crystaltides.agent;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class CrystalAgentTest {

    @Test
    void testAgentLifecycle() {
        assertDoesNotThrow(() -> {
            CrystalAgent.agentmain("", null);
            Thread.sleep(50);
            CrystalAgent.notifyGameReady();
            // Second call should be a no-op (compareAndSet false)
            CrystalAgent.notifyGameReady();
        });
    }
}
