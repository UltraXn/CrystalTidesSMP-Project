# Task 2 Brief: Remediación de 3 Bugs en GameBridge

## Objetivo

Resolver los 3 bugs Java detectados por SonarQube en `apps/game-bridge/java-agent`:

1. `[java:S2142]` en `java-agent/src/main/java/com/crystaltides/agent/CrystalAgent.java:L47`: Re-interrumpir el hilo con `Thread.currentThread().interrupt();` cuando se captura `InterruptedException`.
2. `[java:S899]` en `java-agent/src/main/java/com/crystaltides/agent/ipc/IpcClient.java:L59`: Manejar el valor boolean devuelto por `OUTGOING_QUEUE.offer(json)` (ej. si falla o la cola está llena, loguear debug o descartar explícitamente).
3. `[java:S2142]` en `java-agent/src/main/java/com/crystaltides/agent/ipc/IpcClient.java:L133`: Re-interrumpir el hilo con `Thread.currentThread().interrupt();` en el bloque catch de `InterruptedException` (o asegurar que el estado de interrupción se preserve).

## Archivos a Modificar

- `apps/game-bridge/java-agent/src/main/java/com/crystaltides/agent/CrystalAgent.java`
- `apps/game-bridge/java-agent/src/main/java/com/crystaltides/agent/ipc/IpcClient.java`

## Verificación

Compilar ejecutando en powershell:
`powershell -NoProfile -ExecutionPolicy Bypass -File apps/game-bridge/java-agent/build-agent.ps1`
Asegurarse de que termine con éxito (código 0).

## Reporte

Escribir el reporte en:
`.superpowers/sdd/2026-10-11-monorepo-quality-remediation/task-2-report.md`
