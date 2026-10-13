# Task 2 Report: Remediación de 3 Bugs en GameBridge (Java Agent)

## Resumen de Ejecución

- **Objetivo**: Resolver los 3 bugs Java detectados por SonarQube en `apps/game-bridge/java-agent`.
- **Archivos Modificados**:
  - `apps/game-bridge/java-agent/src/main/java/com/crystaltides/agent/CrystalAgent.java`
  - `apps/game-bridge/java-agent/src/main/java/com/crystaltides/agent/ipc/IpcClient.java`
- **Estado**: **DONE**

---

## Cambios Implementados

### 1. `CrystalAgent.java` (`[java:S2142]`)

- **Ubicación**: Bloque `catch (InterruptedException ignored)` en el hilo daemon `CrystalAgent-ReadyWatcher` (L47).
- **Problema**: Capturar `InterruptedException` sin re-interrumpir el hilo oculta la interrupción a los llamadores y hilos superiores.
- **Solución**: Se reemplazó el catch vacío por la preservación explícita del estado de interrupción con `Thread.currentThread().interrupt()`:
  ```java
  Thread readyWatcher = new Thread(() -> {
      try {
          Thread.sleep(12000);
          notifyGameReady();
      } catch (InterruptedException e) {
          Thread.currentThread().interrupt();
      }
  }, "CrystalAgent-ReadyWatcher");
  ```

### 2. `IpcClient.java` (`[java:S899]`)

- **Ubicación**: Método `sendJson(String json)` (L59).
- **Problema**: Se ignoraba el valor booleano devuelto por `OUTGOING_QUEUE.offer(singleLine)`, omitiendo el estado de saturación del buffer.
- **Solución**: Se evalúa explícitamente el resultado de `.offer(...)`. Si la cola está llena (`false`), se registra en `System.err` informando el descarte sin bloquear el hilo del juego:
  ```java
  // Drop message if queue is full to avoid any memory buildup
  if (!OUTGOING_QUEUE.offer(singleLine)) {
      System.err.println("⚠️ [CrystalAgent-IPC] Outgoing queue full, dropping payload");
  }
  ```

### 3. `IpcClient.java` (`[java:S2142]`)

- **Ubicación**: Bucle de conexión y polling en `workerLoop()` (L133).
- **Problema**: `OUTGOING_QUEUE.poll(500, TimeUnit.MILLISECONDS)` dentro del bloque `try` lanza `InterruptedException`. El bloque `catch (Exception ignored)` capturaba la excepción general sin restablecer el estado de interrupción del hilo daemon.
- **Solución**: Se introdujo un bloque específico `catch (InterruptedException ie)` anterior a `catch (Exception ignored)`, re-interrumpiendo el hilo y saliendo del bucle de trabajo de forma ordenada:
  ```java
  } catch (InterruptedException ie) {
      Thread.currentThread().interrupt();
      break;
  } catch (Exception ignored) {
      // Connection failed or disconnected
  } finally {
      connected = false;
  }
  ```

---

## Verificación

1. **Compilación Java y Creación de JAR**:
   - Ejecutado `apps/game-bridge/java-agent/build-agent.ps1` con JDK 21 (`javac --release 17`).
   - Código de salida: `0` (SUCCESS).
   - Artefacto generado: `apps/game-bridge/java-agent/target/game-bridge-1.0-SNAPSHOT.jar` (9,667 bytes).

2. **Análisis Estático (PMD 7.10.0)**:
   - Ejecutado `scripts/lint-java.ps1 -Tool pmd` sobre `apps/game-bridge/java-agent/src/main/java`.
   - Cero violaciones o code smells en `CrystalAgent.java` e `IpcClient.java`.
