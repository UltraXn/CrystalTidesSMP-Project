# 🌉 Plan de Acción: Evolución de Game Bridge (Fases 1, 2 y 3)

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformar `apps/game-bridge` en un motor de rendimiento y experiencia in-game de vanguardia para CrystalTides: cerrando el loop de telemetría IPC (Fase 1), construyendo un overlay nativo DirectX 12 estilo Steam (Fase 2) y habilitando duplicación de FPS con FSR 3.1 Frame Generation y grabador de clips sin lag (Fase 3).

**Architecture:** El agente Java (`CrystalAgent`) se infiltra en la JVM de Minecraft 1.21.1 al inicio. A través de JNI enlaza con el crate de Rust `game_bridge_core.dll`, el cual comparte el framebuffer de OpenGL con DirectX 12 vía `WGL_NV_DX_interop2`. Se comunica con el Launcher mediante un socket TCP local en `127.0.0.1:28195` y expone un overlay acelerado por hardware libre del Garbage Collector de Java.

**Tech Stack:** Java 21 (Instrumentation API, Sockets), Rust (Windows Win32 API, JNI 0.21, WGL, DirectX 12, AMD FidelityFX FSR 3.1, Tokio), Tauri v2, React 19, TypeScript.

**Spec:** [`docs/architecture/RUST_JAVA_BRIDGE.md`](file:///c:/Users/nacho/Desktop/Portafolio/crystaltides/docs/architecture/RUST_JAVA_BRIDGE.md)

---

## 🛡️ Global Constraints

- **Zero Game Crashes**: Cualquier fallo en la carga de la DLL nativa o desconexión del socket IPC debe degradar a modo software silencioso sin detener el proceso de Minecraft.
- **Zero GC Impact**: Ningún hilo de telemetría o renderizado de overlay en Rust puede generar asignaciones de memoria dentro de la heap de la JVM.
- **Cross-Vendor Compatibility**: El renderizado DirectX 12 e interpolación de cuadros debe operar de forma agnóstica en GPUs NVIDIA, AMD e Intel.
- **Non-Blocking IPC**: La comunicación socket entre Minecraft y Tauri debe ser 100% asíncrona sobre hilos dedicados para jamás pausar el `Render Thread`.

---

## 🎯 Review Focus

1. **Pausas de GC severas**: Si Java detiene el hilo por recolección de basura, el socket IPC no debe cerrarse por timeout.
2. **Pérdida de foco / Minimizado**: Si el juego se minimiza o cambia de resolución, el swapchain interop DX12 debe recrearse sin fugas de memoria VRAM.
3. **Bloqueo de puertos (28195)**: Si el puerto por defecto está ocupado por otra instancia, el sistema debe negociar un puerto efímero sin romper el handshake.
4. **Seguridad Anti-Cheat**: Las estructuras inyectadas deben operar exclusivamente sobre APIs públicas de Win32/OpenGL sin modificar firmas de memoria del cliente.
5. **Consumo de CPU en reposo**: Los hilos de sondeo de telemetría deben dormir con temporizadores de precisión para consumir < 0.1% de CPU.

---

## 📋 FASE 1: Telemetría & IPC Activo (Cerrar el Loop Actual)

> **Objetivo:** Conectar el cliente dentro de Minecraft con el servidor de Tauri para monitorear FPS, tiempos de cuadro p99, pausas de GC y estado de carga en tiempo real.

### Task 1.1: Cliente IPC Socket en `CrystalAgent.java`

- [x] **Files:**
  - Modify: `apps/game-bridge/java-agent/src/main/java/com/crystaltides/agent/CrystalAgent.java`
  - Create: `apps/game-bridge/java-agent/src/main/java/com/crystaltides/agent/ipc/IpcClient.java`
- [x] Implementar cliente TCP socket asíncrono en `IpcClient.java` que lea la propiedad del sistema `-Dcrystaltides.ipc.port` (default: 28195).
- [x] Implementar reconexión automática con retroceso exponencial (1s, 2s, 5s) si el Launcher se reinicia.
- [x] Emitir mensaje inicial `{"type":"handshake"}` con versión de Minecraft, renderer OpenGL y conteo de mods.
- [x] Compilar agente: `cd apps/game-bridge/java-agent && mvn package`.
- [x] Verificar que genere `game-bridge-1.0-SNAPSHOT.jar` con cero advertencias.

### Task 1.2: Detector In-Game de Pantalla de Título (`game_ready`) & Telemetría Periódica

- [x] **Files:**
  - Create: `apps/game-bridge/java-agent/src/main/java/com/crystaltides/agent/telemetry/GcMonitor.java`
  - Modify: `apps/game-bridge/java-agent/src/main/java/com/crystaltides/agent/CrystalAgent.java`
- [x] Enganchar listener de `GarbageCollectorMXBean` (`GarbageCollectionNotificationInfo`) en `GcMonitor.java` para medir pausas acumuladas de GC sin costo de asignación en la heap.
- [x] Detectar la carga del `TitleScreen` de Minecraft e inmediatamente emitir `{"type":"game_ready","load_duration_ms":...}` hacia Tauri.
- [x] Despachar latido periódico (cada 1000ms) con payload `{"type":"telemetry","fps":...,"frametime_p99_ms":...,"gc_pause_time_ms":...}`.
- [x] Probar conexión local contra el servidor Tauri en el puerto 28195.

### Task 1.3: Visualización Opcional en Launcher Lite (Cápsula A Desactivada por Defecto)

- [x] **Files:**
  - Modify: `apps/launcher-lite/src/store/launcherStore.ts`
  - Modify: `apps/launcher-lite/src/components/modals/SettingsModal.tsx`
  - Modify: `apps/launcher-lite/src/services/agentIpcService.ts`
  - Create: `apps/launcher-lite/src/components/TelemetryCapsule.tsx`
  - Modify: `apps/launcher-lite/src/components/HomeDock.tsx`
- [x] Añadir `telemetryCapsuleEnabled: boolean` en `LauncherSettings` con valor **`false` por defecto**.
- [x] Añadir interruptor toggle en `SettingsModal` (sección "Rendimiento"): _"Mostrar telemetría en vivo del juego en el Dock"_.
- [x] Suscribir `subscribeGameIpcEvents` únicamente cuando el juego esté activo. Si `telemetryCapsuleEnabled` está en `false`, evitar re-renders y no montar el componente en el DOM (0% overhead de CPU).
- [x] Cuando esté activado: renderizar la **Cápsula A** discreta en el Dock/HUD (`🟢 144 FPS • GC: 0ms • VRAM: 4.2GB`) con estilo cian translúcido de CrystalTides.
- [x] Validar con `npx tsc --noEmit` que compile con 0 errores.

---

## 🎮 FASE 2: Overlay In-Game Nativo (`Shift + Tab`)

> **Objetivo:** Renderizar una interfaz gráfica acelerada por GPU sobre el juego sin consumir ciclos de CPU de Java ni alterar los FPS de Minecraft, utilizando la técnica estándar de la industria (MinHook sobre `wglSwapBuffers` + Dear ImGui).

### Task 2.1: Interceptor Win32 de Hotkey Global (`Shift + Tab`) y Control de Cursor

- [x] **Files:**
  - Create: `apps/game-bridge/native-core/src/input_hook.rs`
  - Modify: `apps/game-bridge/native-core/src/lib.rs`
- [x] Subclasear la ventana principal de Minecraft (`GWLP_WNDPROC` vía `SetWindowLongPtrW`) para capturar `Shift + Tab` limpiamente.
- [x] Disparar bandera atómica `OVERLAY_VISIBLE` sin bloquear el loop de entrada de Minecraft.
- [x] Gestionar el cursor del mouse (`ShowCursor(TRUE)` y `ClipCursor(NULL)`) cuando el overlay esté activo para interactuar con los menús devorando eventos antes de que lleguen a LWJGL.

### Task 2.2: Inicialización de Renderizado OpenGL / Dear ImGui vía `wglSwapBuffers`

- [x] **Files:**
  - Modify: `apps/game-bridge/native-core/Cargo.toml`
  - Create: `apps/game-bridge/native-core/src/overlay_renderer.rs`
  - Modify: `apps/game-bridge/native-core/src/lib.rs`
- [x] Añadir bindings y soporte en `Cargo.toml`.
- [x] Renderizar el overlay con preservación completa de atributos de OpenGL (`glPushAttrib`/`glPopAttrib`) e inversión de matrices ortográficas 2D.
- [x] Renderizar el frame justo antes del intercambio de buffers original.

### Task 2.3: Interfaz del Menú del Servidor CrystalTides

- [x] **Files:**
  - Create: `apps/game-bridge/native-core/src/ui/server_menu.rs`
  - Create: `apps/game-bridge/native-core/src/ui/telemetry_hud.rs`
- [x] Diseñar el panel visual en modo oscuro con temática cian de CrystalTides:
  - Widget 1: **Telemetría Pro** (Gráfica de frametimes en tiempo real, latencia de red en ms, consumo de RAM y VRAM).
  - Widget 2: **Acceso Rápido al Servidor** (Enlace a la tienda web, discord de la comunidad, estado de misiones).
  - Widget 3: **Conmutador de Optimización** (Botón para activar/desactivar bypass de EcoQoS y Frame Gen).
- [x] Probar compilación con `cargo build --release` en `native-core`.

---

## ⚡ FASE 3: Vanguardia Gráfica (FSR 3.1 Frame Gen & Instant Replay)

> **Objetivo:** Duplicar la fluidez percibida de Minecraft mediante generación de fotogramas por hardware y permitir grabación instantánea de jugadas sin impacto de rendimiento.

### Task 3.1: Pipeline de AMD FidelityFX FSR 3.1 Frame Generation

- [x] **Files:**
  - Modify: `apps/game-bridge/native-core/src/fsr.rs`
  - Modify: `apps/game-bridge/native-core/src/interop.rs`
- [x] Completar la inicialización del contexto de interpolación temporal de FSR 3.1 sobre el búfer DirectX 12.
- [x] Extraer vectores de movimiento estimados (Optical Flow) para generar cuadros interpolados limpios.
- [x] Sincronizar el ritmo de cuadros (_frame pacing_) para monitores de 144Hz / 165Hz / 240Hz: presentar 1 fotograma real + 1 fotograma generado sintéticamente.
- [x] Exponer switch dinámico a través de JNI (`nativeSetFsrConfig`).

### Task 3.2: Amortiguador Anti-Stutter contra el Garbage Collector

- [x] **Files:**
  - Create: `apps/game-bridge/native-core/src/pacing_guard.rs`
  - Modify: `apps/game-bridge/native-core/src/fsr.rs`
- [x] Implementar un watchdog en Rust que monitoree el delta entre cuadros.
- [x] Si el hilo de Java se congela por una pausa de recolección de basura (`delta > 50ms`), el swapchain de Rust presenta un cuadro sintético re-proyectado de emergencia.
- [x] Eliminar la sensación de congelamiento en pantalla durante las pausas de G1GC/ZGC.

### Task 3.3: Módulo de Instant Replay GPU (NVENC / AMF / QuickSync)

- [x] **Files:**
  - Create: `apps/game-bridge/native-core/src/instant_replay.rs`
  - Modify: `apps/game-bridge/native-core/src/lib.rs`
- [x] Crear un buffer circular en memoria VRAM que almacene los últimos 30 segundos de cuadros codificados en hardware (H.264 / HEVC).
- [x] Asignar hotkey de captura (ej. tecla `F8`).
- [x] Al pulsar `F8`, vaciar el buffer a un archivo `.mp4` / `.ctreplay` en `%USERPROFILE%/.crystaltides/replays/` con metadata del jugador y timestamp.
- [x] Notificar al Launcher vía IPC para que muestre una alerta toast: _"¡Clip guardado con éxito!"_.

---

## 🚀 Plan de Empaquetado y Entrega Continua

- [x] **Sincronización Automática con Launcher Lite**:
  - Script en `apps/game-bridge/package.json` para compilar Java (`build-agent.ps1`) y Rust (`cargo build --release`).
  - Copiar automáticamente el artefacto resultante a `apps/launcher-lite/src-tauri/assets/game-bridge.jar` y `game_bridge_core.dll`.
  - Embebido en `agent.rs` con auto-despliegue en `natives` y validación de integridad SHA-256.
- [ ] **Pruebas de Regresión y Validación**:
  - Verificar que Minecraft arranque en menos de 15 segundos sin fugas de memoria.
  - Probar que el desinstalador y el instalador continúen funcionando con cero regresiones.
