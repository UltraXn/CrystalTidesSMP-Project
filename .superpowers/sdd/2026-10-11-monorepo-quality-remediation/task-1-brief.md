# Task 1 Brief: Remediación de 6 Bugs en CrystalCore

## Objetivo

Resolver los 6 bugs de concurrencia `[java:S3078]` detectados por SonarQube en `plugins/crystalcore/src/main/java/com/crystaltides/core/profile/CrystalProfile.java`.

## Archivos a Modificar

- `plugins/crystalcore/src/main/java/com/crystaltides/core/profile/CrystalProfile.java`

## Regla y Causa Raíz

- **Regla**: `java:S3078` ("Use an AtomicInteger/AtomicLong for this field; its operations are atomic").
- **Problema**: Los campos `blocksMined`, `blocksPlaced`, `kills`, `mobKills`, `deaths` y `playtimeSeconds` están declarados como `volatile` primitivos pero se modifican con operadores compuestos (`++`, `+=`) que no son atómicos en Java, provocando condiciones de carrera y pérdida de actualizaciones en servidores Paper multihilo.

## Requisitos de Implementación

1. Importar `java.util.concurrent.atomic.AtomicInteger` y `java.util.concurrent.atomic.AtomicLong`.
2. Convertir los campos a `private final AtomicInteger` (para los 5 contadores) y `private final AtomicLong` (para `playtimeSeconds`). Inicializarlos en el constructor con `new AtomicInteger(0)` / `new AtomicLong(0)`.
3. Mantener exactamente la API pública existente:
   - `getBlocksMined()` retorna `int` llamando a `blocksMined.get()`
   - `setBlocksMined(int v)` llama a `blocksMined.set(v)`
   - `addBlockMined()` llama a `blocksMined.incrementAndGet()`
   - Idéntico para `blocksPlaced`, `kills`, `mobKills`, `deaths`.
   - `getPlaytimeSeconds()` retorna `long` llamando a `playtimeSeconds.get()`
   - `setPlaytimeSeconds(long v)` llama a `playtimeSeconds.set(v)`
   - `addPlaytimeSeconds(long v)` llama a `playtimeSeconds.addAndGet(v)`.
4. Compilar y verificar con Maven:
   `mvn -f plugins/crystalcore/pom.xml compile -DskipTests` (o verificar que no haya errores de sintaxis).

## Archivo de Reporte

Escribir el reporte en: `.superpowers/sdd/2026-10-11-monorepo-quality-remediation/task-1-report.md`.
