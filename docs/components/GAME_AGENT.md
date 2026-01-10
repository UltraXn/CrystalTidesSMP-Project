# 🧠 Game Bridge (Agente de Cliente)

**Game Bridge** es el componente de inteligencia in-game de CrystalTides. Es una pieza de software híbrida (Java + Rust) que se inyecta en el cliente de Minecraft para extender sus capacidades sin modificar el JAR del juego (Modding sin Mods).

## 🧩 Arquitectura "Dual Core"

El Game Bridge no es un mod de Fabric ni Forge. Es un **Agente de Java** que inicializa un entorno nativo.

### 1. Java Agent (`java-agent`)
- **Punto de Entrada**: `premain` (Se ejecuta antes que `Minecraft.main`).
- **Función**:
    - Intercepta el ClassLoader de Minecraft.
    - Utiliza **Byte Buddy** o **ASM** para instrumentar clases clave (Renderizado, Chat, Red).
    - Carga la librería dinámica nativa (DLL/SO).

### 2. Native Core (`native-core`)
- **Tecnología**: Rust (exportado como DLL).
- **Acceso**: JNI (Java Native Interface).
- **Función**:
    - **Renderizado de HUD**: Dibuja sobre la ventana de OpenGL con latencia cero.
    - **IPC (Inter-Process Communication)**: Se comunica con el Launcher vía Named Pipes para reportar estado (Discord RPC, memoria, etc).
    - **Seguridad**: Monitorea integridad de memoria (Anti-Cheat básico).

## 🚀 Capacidades

### HUD Personalizado
Dibuja elementos visuales que el servidor no puede:
- Notificaciones Toast animadas.
- Radar/Minimapa de eventos.
- Menús in-game nativos.

### Comunicación Launcher
Permite que el Launcher sepa qué está pasando en el juego:
- "Jugando en CrystalTides: SkyBlock" (Rich Presence).
- Sincronización de configuraciones Launcher -> Juego.

## 🛠️ Integración

Este componente reside en `apps/game-bridge` y produce dos artefactos:
1. `agent.jar` (El inyector Java).
2. `crystal_native.dll` (La lógica Rust).

El Launcher se encarga de colocar estos archivos y añadir los argumentos de JVM necesarios al iniciar Minecraft.
