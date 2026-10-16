# ⚡ CrystalTides Boost (`crystaltides-boost`)

> **Client-side performance & thread scheduling mod for Minecraft 1.21.1.**  
> Arquitectura MultiLoader nativa (`common`, `fabric`, `neoforge`) construida con **Fabric Loom** y **NeoForge ModDevGradle**. Diseñado para estabilizar frametimes, optimizar la prioridad del render thread y eliminar sobrecarga de VRAM cuando el juego está minimizado, manteniendo 100% de compatibilidad con **Sodium**, **Iris**, **Embeddium** y **Oculus**.

---

## 🏗️ 1. Arquitectura MultiLoader

El proyecto se estructura bajo el estándar MultiLoader de Gradle 8.10:

```
mods/crystaltides-boost/
├── common/                  # Lógica agnóstica de plataforma, config y Mixins
│   ├── src/main/java/com/crystaltides/boost/
│   │   ├── config/          # Parser BoostConfig (crystaltides-boost.properties)
│   │   ├── mixin/           # ThreadQosMixin, AnimatedTextureCullingMixin, BoostMixinPlugin
│   │   └── platform/        # Abstracción de servicios de plataforma (IPlatformHelper)
├── fabric/                  # Subproyecto Fabric (Fabric Loom 1.8.x + Intermediary Refmap)
├── neoforge/                # Subproyecto NeoForge (ModDevGradle 2.0.x + NeoForm Refmap)
└── buildSrc/                # Convenciones Gradle compartidas (multiloader-common, multiloader-loader)
```

- **Mapeos Oficiales**: Desarrollado contra mappings oficiales de Mojang en tiempo de compilación.
- **Refmaps de Producción**: Fabric genera automáticamente `crystaltides-boost.refmap.json` mapeando a Intermediary (`class_310`, `class_1060`, etc.), garantizando que los mixins operen en clientes de producción sin requerir mappings de desarrollo.
- **Identificadores Normalizados**:
  - Fabric: `id = "crystaltides-boost"` en `fabric.mod.json`.
  - NeoForge: `modId = "crystaltides_boost"` en `neoforge.mods.toml` (cumpliendo con la restricción FML `^[a-z][a-z0-9_]{1,63}$`).

---

## 🚀 2. Optimizaciones Activas

| Optimización                    | Clase Destino en MC 1.21.1                                    | Funcionamiento & Beneficio                                                                                                                                                                                                                                                                                                                                                                                                       |
| :------------------------------ | :------------------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Render Thread QoS**           | `net.minecraft.client.Minecraft.run()`                        | Eleva el hilo de renderizado principal (`Render thread`) a `Thread.MAX_PRIORITY` (10) inmediatamente al iniciar el bucle de juego. Minimiza la latencia de entrada y previene micro-tirones (frame drops) causados por la contención de hilos de fondo del sistema operativo o del recolector de basura (GC).                                                                                                                    |
| **Animated Texture Culling**    | `net.minecraft.client.renderer.texture.TextureManager.tick()` | Consulta el estado de la ventana en tiempo real vía GLFW (`GLFW.glfwGetWindowAttrib(window, GLFW.GLFW_ICONIFIED) == GLFW.GLFW_TRUE`). Si el cliente está minimizado en la barra de tareas, congela el procesamiento de texturas animadas y las subidas a la VRAM (`glTexSubImage2D`), reduciendo drásticamente el uso de GPU en segundo plano. Al restaurar la ventana, las texturas continúan fluidamente sin desincronización. |
| **Agent Bridge (Frametime)**    | `net.minecraft.client.Minecraft.runTick(boolean)`             | Reporta el inicio de cada frame al agente `game-bridge.jar` del launcher, que calcula FPS medio y frametime p99 por ventana de 1 s y los envía por IPC. Llamada sin allocations vía `MethodHandle` resuelto en el system class loader. Solo se aplica si el agente está presente.                                                                                                                                                |
| **Agent Bridge (`game_ready`)** | `net.minecraft.client.gui.screens.TitleScreen.init()`         | Al inicializarse por primera vez la pantalla de título, notifica `game_ready` al launcher (una sola vez por sesión). Solo se aplica si el agente está presente.                                                                                                                                                                                                                                                                  |

---

## ⚙️ 3. Configuración (`crystaltides-boost.properties`)

El mod lee su configuración automáticamente desde el directorio estándar `config/` relativo al entorno de ejecución de la instancia:

**Ruta:** `<gameDir>/config/crystaltides-boost.properties`

```properties
# CrystalTides Boost - Configuración de Optimización
# Valores: true | false

threadQos=true
animatedTextureCulling=true
agentBridge=true
```

El plugin de configuración de Mixins (`BoostMixinPlugin`, implementando `IMixinConfigPlugin`) lee este archivo antes de que las clases del juego sean cargadas por el ClassLoader, permitiendo activar o desactivar cada optimización a nivel de bytecode de forma segura. Los mixins de `agentBridge` además se omiten automáticamente cuando el juego no fue lanzado con el agente (`-javaagent:game-bridge.jar`), así que fuera del launcher no añaden ningún hook por frame. Las configs existentes sin la clave `agentBridge` la toman como `true`.

---

## 🗑️ 4. Mixins Obsoletos / Eliminados (Auditoría Técnica)

Durante la refactorización arquitectónica de la versión 1.21.1, se eliminaron los siguientes mixins de versiones anteriores:

1. **`WorkerPriorityMixin`**: Intentaba degradar la prioridad de los hilos de chunks inyectando en `Util.createWorker`. En Minecraft 1.21.1, Mojang reemplazó esa estructura por expresiones lambda anónimas dentro de `makeExecutor`, haciendo imposible la inyección limpia.
2. **`SaveSkipMixin`**: Saltaba escrituras en disco de chunks no modificados mediante un cálculo de checksum en singleplayer. Se eliminó para prevenir riesgos de corrupción de partidas ante cierres inesperados.
3. **`LazyNarratorMixin`**: Modificaba `NarratorStatus` de forma frágil sin refmaps de Loom.
4. **`ChestOcclusionMixin`**: Realizaba culling espacial directo sobre `ChestRenderer` sin verificación de oclusión real; provocaba glitch visual en las tapas de los cofres al utilizarse junto a motores de renderizado modernos como Sodium o Embeddium.

---

## 🎮 5. Integración con CrystalTides Launcher Lite

El launcher gestiona el ciclo de vida del mod automáticamente:

1. **Despliegue Dinámico (`deploy_boost_mod`)**:
   - En instancias **Fabric** o **Quilt** (1.21.1), extrae el binario embebido de Fabric en `mods/crystaltides-boost.jar`.
   - En instancias **NeoForge** (1.21.1), extrae el binario embebido de NeoForge en `mods/crystaltides-boost.jar`.
2. **Restricción Estricta de Versión (`shouldDeployBoost`)**:
   - El launcher valida que la versión sea exactamente `1.21.1` antes de desplegar. Si se detecta otra versión (ej. 1.20.x o 1.21.4), el mod se retira o se omite para prevenir fallos de arranque por diferencias de mappings.
3. **Limpieza Criptográfica (`remove_crystaltides_boost`)**:
   - Comprueba el checksum SHA-256 del archivo en `mods/crystaltides-boost.jar` contra los hashes conocidos (legacy, Fabric y NeoForge). Solo elimina el mod si coincide con uno de los binarios oficiales del launcher, respetando modificaciones personalizadas del usuario.

---

## 🛠️ 6. Compilación y Desarrollo

Requisitos: **JDK 21**.

```bash
# Compilar ambos loaders y generar los JARs de producción:
./gradlew build

# Ejecutar cliente de desarrollo Fabric (1.21.1):
./gradlew :fabric:runClient

# Ejecutar cliente de desarrollo NeoForge (1.21.1):
./gradlew :neoforge:runClient
```

Los artefactos finales listos para distribución se generan en:

- `fabric/build/libs/crystaltides-boost-fabric-1.21.1-1.0.0.jar`
- `neoforge/build/libs/crystaltides-boost-neoforge-1.21.1-1.0.0.jar`
