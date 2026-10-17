# ⚡ CrystalTides Boost (`crystaltides-boost`)

> **Client-side performance & thread scheduling mod for Minecraft 1.21 – 26.3.**
> Arquitectura multiversión con **Stonecutter 0.9.8** (`fabric`, `neoforge`), **Fabric Loom** y **NeoForge ModDevGradle**. Estabiliza el frametime, prioriza los hilos de render, audio y red, y reduce el consumo cuando el juego está en segundo plano. Compatible con **Sodium**, **Embeddium**, **Iris**, **Oculus** e **ImmediatelyFast**.

---

## 🏗️ 1. Arquitectura multiversión (Stonecutter)

El mod usa un único árbol de fuentes que **Stonecutter 0.9.8** preprocesa para **10 grupos de versiones** en **Fabric** y **NeoForge** (20 jars en total):

```
mods/crystaltides-boost/
├── src/main/java/com/crystaltides/boost/
│   ├── bridge/               # AgentBridge (telemetría hacia el launcher, MethodHandle invokeExact)
│   ├── client/               # BackgroundEco, BackgroundWorkers, AmbientBiomes, ThreadQos, WindowState,
│   │                         # SoundVolumes, WindowStateTracker (+ GlfwIconifyHook, solo 1.21.1)
│   ├── compat/               # CompatReport (mods detectados), MixinSelection (qué mixins aplicar)
│   │                         # y VersionSupport (qué existe en cada versión de Minecraft)
│   ├── config/               # BoostConfig (crystaltides-boost.properties)
│   ├── fabric/               # Inicializador y PlatformHelper de Fabric
│   ├── mixin/                # Mixins + BoostMixinPlugin
│   ├── neoforge/             # Inicializador, PlatformHelper y FmlAccess de NeoForge
│   └── platform/             # IPlatformHelper y Services (implementación elegida al compilar)
├── src/main/resources/       # fabric.mod.json, neoforge.mods.toml y el JSON de mixins
├── build.fabric.gradle.kts   # Nodos Fabric (Loom 1.19, vía loom-back-compat)
├── build.neoforge.gradle.kts # Nodos NeoForge (ModDevGradle 2.0)
├── buildSrc/                 # neoforge-mutex: una decompilación de NeoForge a la vez
├── gradle/gradle-daemon-jvm.properties  # Gradle se ejecuta con Java 25
├── settings.gradle.kts       # Los 10 grupos de versiones × 2 loaders
├── stonecutter.gradle.kts    # Nodo activo y constantes (fabric / neoforge)
└── stonecutter.properties.toml # Versión del mod, dependencias y rangos de compatibilidad
```

- **Grupos de versiones (10 × 2 loaders).** Cada grupo compila contra la versión más nueva de una actualización de Minecraft y declara todo su rango:

  | Nodo | Versiones de Minecraft |
  | :-- | :-- |
  | `1.21.1` | 1.21 – 1.21.1 |
  | `1.21.3` | 1.21.2 – 1.21.3 |
  | `1.21.4` | 1.21.4 |
  | `1.21.5` | 1.21.5 |
  | `1.21.8` | 1.21.6 – 1.21.8 |
  | `1.21.10` | 1.21.9 – 1.21.10 |
  | `1.21.11` | 1.21.11 |
  | `26.1.2` | 26.1 – 26.1.2 |
  | `26.2` | 26.2 |
  | `26.3` | 26.3 |
- **Java:**
  - Los nodos compilan con Java 21 (1.21.x) o Java 25 (26.x).
  - Gradle se ejecuta siempre con Java 25, que lo exige Loom 1.19. Lo pide `gradle/gradle-daemon-jvm.properties`, así que no depende de `JAVA_HOME`. Los JDK que falten los descarga el resolver de Foojay.
- **Mapeos:** Mojang oficiales (Mojmap) en todo el código. 26.x ya no está ofuscado.
- **Sin refmap en Fabric:**
  - En 1.21.x, Loom 1.19 remapea a Intermediary las anotaciones de Mixin y MixinExtras directamente en el bytecode de los mixins (por ejemplo, `method = "runTick"` pasa a `method = "method_1523"`).
  - En 26.x no hay nada que remapear. NeoForge usa los nombres de Mojang en ejecución.
- **Nodo activo:**
  - `src/` está escrito en el estado de `1.21.1-fabric` (`stonecutter.gradle.kts`), que compila directamente desde ahí.
  - El resto de nodos compila desde `versions/<nodo>/build/generated/stonecutter`.
- **Condiciones de Stonecutter:**
  - Se escriben como `//? if fabric {`, `//? if >=1.21.2 {` o `//? if neoforge && >=1.21.9 {`, y se encadenan con `//?} else if ... {`.
  - El código inactivo se guarda como `/*...*///?}`.
  - **Cuidado:** una rama formada solo por comentarios `//` se toma por código comentado y se descomenta. Los comentarios van fuera de la condición.
- **IDs:** Fabric `crystaltides-boost`; NeoForge `crystaltides_boost`, porque FML exige el formato `^[a-z][a-z0-9_]{1,63}$`.

---

## 🚀 2. Optimizaciones

| Optimización | Objetivo (Mojmap) | Versiones | Qué hace |
| :-- | :-- | :-- | :-- |
| **Render thread QoS** | `Minecraft.run()` | Todas | Sube el hilo de render a `MAX_PRIORITY` (10). Vanilla ya lo hace con más de 4 núcleos; este mixin lo aplica también con 4 o menos, a costa de algo de CPU del servidor integrado en singleplayer. |
| **Sound thread QoS** | `SoundEngineExecutor.run()` | Todas | Sube a prioridad 8 como mínimo (configurable) el hilo "Sound engine", que decodifica la música y los discos en streaming. Evita cortes cuando los workers de chunks saturan la CPU. |
| **Netty client IO QoS** | `Connection.channelActive(...)` | Todas | Sube a prioridad 7 como mínimo (configurable) el hilo de E/S que atiende la conexión del cliente. Las conexiones del servidor integrado no se tocan. |
| **Modo eco en segundo plano** | `Minecraft.getFramerateLimit()` hasta 1.21.1; `FramerateLimitTracker.getFramerateLimit()` desde 1.21.2 | Todas | 5 FPS con la ventana minimizada y 30 FPS sin foco (configurable). Nunca sube el límite y no actúa durante la carga de recursos. Desde 1.21.2 se suma al limitador por inactividad de vanilla. Se desactiva solo si hay Dynamic FPS o FPS Reducer. |
| **Silencio al minimizar** (opcional) | `SoundEngine.updateSource(Camera)`, y desde 1.21.9 también `SoundEngine.calculateVolume(SoundInstance)` | Todas | Hasta 1.21.8 pone a 0 la ganancia del listener de OpenAL. Desde 1.21.9, que eliminó esa ganancia, el volumen de cada sonido vale 0 mientras la ventana está minimizada, y se refrescan los que ya suenan. Nunca modifica las opciones. |
| **Animated texture culling** | llamada a `TextureManager.tick()` en `Minecraft.tick()` hasta 1.21.10; en `Minecraft.runTick()` desde 1.21.11 | Todas | Con la ventana minimizada, deja de subir texturas animadas a la GPU. Congela de forma coherente vanilla, el seguimiento de sprites de Sodium y los atlas PBR de Iris. |
| **Partículas ambientales rápidas** | `ClientLevel.animateTick(...)` y `doAnimateTick(...)` | 1.21 – 1.21.10 | Una vez por segundo comprueba si algún bioma cercano tiene partículas ambientales (en vanilla, solo algunos del Nether). Mientras ninguno las tenga, se salta la búsqueda de bioma que `doAnimateTick` hace en cada posición; en el perfil de 1.21.1 era el 22 % del tiempo Java del hilo de render. 1.21.11 movió las partículas a los atributos de entorno, con capas de dimensión, bioma, timeline y clima. |
| **Caché de samplers de shader** | llamada a `Uniform.glGetUniformLocation` en `ShaderInstance.apply()` | 1.21 – 1.21.1 | Reutiliza la posición de cada sampler, que vanilla ya guarda al enlazar el shader, en vez de pedírsela al driver en cada `apply()`; en el perfil con NVIDIA era el 21 % del tiempo nativo del hilo de render. Se omite con Sodium o Embeddium, que traen el mismo arreglo. `ShaderInstance` desaparece en 1.21.2. |
| **Sin `Thread.yield()` por frame** | llamada a `Thread.yield()` en `Minecraft.runTick(boolean)` | 1.21 – 1.21.11 | Quita la cesión de CPU del final de cada frame. En Windows, `yield` entrega el núcleo del hilo de render a cualquier hilo listo en ese núcleo, workers incluidos. En 26.x vanilla ya no cede la CPU ahí. |
| **Límite de workers en segundo plano** | `Util.getMaxThreads()` (`net.minecraft.util.Util` desde 1.21.11) | Todas | Reduce el pool `Worker-Main`, que genera el terreno en singleplayer y construye las mallas de chunks con el renderer vanilla (Sodium usa sus propios hilos). `auto` usa un worker por núcleo físico menos uno, con un mínimo de 2. Un `-Dmax.bg.threads` explícito siempre gana. Solo cambia el máximo con el que vanilla dimensiona el pool, sin tocar sus lambdas (ver §4). |
| **Agent bridge (frametime)** | `Minecraft.runTick(boolean)` | Todas | Marca el inicio de cada frame para el agente `game-bridge.jar` del launcher (FPS y p99). Solo se aplica si el agente está presente. |
| **Agent bridge (`game_ready`)** | `Minecraft.onGameLoadFinished(...)` | Todas | Avisa al launcher cuando termina la carga inicial, también con quickPlay o con la pantalla de accesibilidad del primer arranque. Solo se aplica si el agente está presente. |

En las versiones donde una optimización no existe, el log la muestra desactivada con el motivo `not present in this Minecraft version`, aunque esté activada en la config (`VersionSupport`).

**Prioridades de hilo:**

- HotSpot en Windows traduce 5-6 a NORMAL, 7-8 a ABOVE_NORMAL y 9-10 a HIGHEST. En Linux las prioridades de Java se ignoran salvo con `-XX:ThreadPriorityPolicy=1` y root.
- Solo se suben, nunca se bajan. Un hilo de Java hereda la prioridad de quien lo crea, así que los hilos que vanilla recrea desde el hilo de render (por ejemplo, "Sound engine" al recargar el sonido) pueden llegar ya con prioridad 10, y se respeta.

**Cero asignaciones** en los hooks que se ejecutan en cada frame o en cada tick:

- `@ModifyVariable`, `@ModifyReturnValue`, `@ModifyExpressionValue` y `@WrapWithCondition` no reciben `CallbackInfo` ni crean objetos.
- El `@Inject` por tick de las partículas ambientales no es cancelable y no usa su `CallbackInfo`, así que Mixin pasa `null`.
- El `@WrapOperation` de la caché de samplers envuelve una llamada estática, así que MixinExtras genera un `Operation` sin capturas (una única instancia). Solo empaqueta argumentos el camino de respaldo, que vanilla nunca toma.
- El resto de `@Inject` se ejecutan una sola vez: al arrancar un hilo, al abrir una conexión o al terminar la carga.

**Compatibilidad verificada** en 1.21.1, contra el código de Sodium `mc1.21.1-0.6.9` e Iris `1.21.1`. En el resto de versiones todavía no se ha probado con Sodium ni con Iris.

- Ninguno de los dos toca `getFramerateLimit` ni `limitDisplayFPS`.
- La espera de fence que Sodium inyecta en `runTick` queda dentro del intervalo de frame una sola vez.
- Cancelar el tick de texturas congela juntos los contadores de Sodium y los atlas PBR de Iris.

Los mixins que apuntan a una llamada concreta usan `require = 0`: texturas animadas, partículas ambientales, samplers de shader y `Thread.yield()`. Si otro mod reescribe esa llamada, la optimización se omite en vez de impedir que el juego arranque.

**Medido en Minecraft 1.21.1:** Fabric sin Sodium, flags de JVM del launcher (ZGC), afinidad de 12 hilos (6 núcleos con SMT), vuelo de 3 minutos generando terreno nuevo y 2 runs por configuración. Cada fila añade algo a la anterior:

| Configuración | FPS medio | p99 (mediana) | Peor segundo | Secciones renderizadas |
| :-- | --: | --: | --: | --: |
| Base: QoS de hilos, sin las optimizaciones de abajo | 85,7 / 155,7 ¹ | 70,6 / 12,2 ms | 8,5 / 122,8 | 516 |
| + partículas ambientales y caché de samplers | 88,7 | 72,4 ms | 29,0 | 510 |
| + sin `Thread.yield()` | 96,3 | 53,1 ms | 31,5 | 507 |
| + 6 workers (vanilla: 11) | 114,2 | 19,0 ms | 57,9 | 481 |
| + 4 workers | 135,1 | 14,4 ms | 79,3 | 432 |

¹ Las dos runs base difieren mucho: la segunda se mantuvo en 156 FPS con el terreno cargado y no se identificó la causa. Las otras nueve runs son coherentes entre sí.

- Menos workers también significa menos terreno a la vista mientras se genera: un 7 % menos de secciones con 6 workers y un 16 % menos con 4. Parte de la subida de FPS viene de ahí.
- `auto` (5 workers con 12 hilos) no se midió directamente; queda entre las dos últimas filas.
- Ninguna run superó ~165 FPS en un segundo. Es un tope externo al juego, probablemente del driver, y recorta las diferencias por arriba.
- El arranque no cambió: 16-19 s de recursos y 5-6 s de mundo en todas las runs.

---

## ⚙️ 3. Configuración (`<gameDir>/config/crystaltides-boost.properties`)

El plugin de mixins la lee una sola vez, antes de que se cargue cualquier clase de Minecraft. Si el archivo no existe, se crea con valores documentados; un archivo existente nunca se reescribe y las claves que falten toman su valor por defecto.

Los valores por defecto (en un `.properties` los comentarios van en su propia línea):

```properties
threadQos=true
# 1-10, 0 = no tocar
soundThreadPriority=8
networkThreadPriority=7
backgroundEco=true
# 1-259, 0 = sin límite
unfocusedFpsLimit=30
# 1-259, 0 = usar unfocusedFpsLimit
minimizedFpsLimit=5
muteWhenMinimized=false
animatedTextureCulling=true
fastAmbientParticles=true
# se omite solo con Sodium o Embeddium
shaderSamplerCache=true
skipFrameYield=true
# auto, 0 = vanilla, o un número fijo de 1 a 255
backgroundWorkerLimit=auto
agentBridge=true
```

Java no ve los núcleos físicos, así que `backgroundWorkerLimit=auto` lee `-Dcrystaltides.boost.physicalCores`. El launcher de CrystalTides lo pasa con los núcleos que quedan dentro de su máscara de afinidad. Sin ese dato, `auto` supone dos CPUs lógicas por núcleo, y en una CPU sin SMT se queda corto: usa un número fijo. Un `-Dmax.bg.threads` explícito gana siempre sobre la config.

Al arrancar, el log muestra la plataforma, los mods detectados (Sodium, Embeddium, Iris, Oculus, ImmediatelyFast, Dynamic FPS, FPS Reducer, Lithium y FerriteCore), los mixins activos y los desactivados, con el motivo de cada uno.

---

## 🗑️ 4. Mixins eliminados (no reintroducir)

1. **`WorkerPriorityMixin`:** inyectaba en `Util.makeExecutor`, cuyas lambdas internas no son estables entre compilaciones.
2. **`SaveSkipMixin`:** saltaba escrituras de chunks y ponía en riesgo la integridad de los mundos.
3. **`LazyNarratorMixin`:** modificaba `NarratorStatus` de forma frágil.
4. **`ChestOcclusionMixin`:** hacía culling de `ChestRenderer` y causaba fallos visuales con Sodium y Embeddium.

Tampoco se usan `@Overwrite` ni `@Redirect`, ni se cargan clases `net.minecraft.*` desde `BoostMixinPlugin`.

---

## 🎮 5. Integración con CrystalTides Launcher Lite

1. **Jars embebidos:** el launcher embebe un jar por grupo y loader (hoy 20) en `src-tauri/assets/boost/`.
2. **`deploy_boost_mod`:** despliega en `mods/crystaltides-boost.jar` el jar del grupo que contiene la versión de Minecraft de la instancia: el de Fabric en Fabric y Quilt, y el de NeoForge en NeoForge.
   - La versión tiene que estar en `mod.mc_releases` de un grupo. Si no hay build para ella (1.20.1, un snapshot o una versión posterior a las soportadas), retira el jar que el launcher hubiera desplegado antes.
   - En TypeScript, `resolveBoostMcVersion` solo filtra por loader y normaliza la versión (`quilt-loader-0.31.0-beta.4-26.2` → `26.2`).
3. **`remove_crystaltides_boost`:** solo borra el jar si su SHA-256 coincide con un binario oficial, sea el actual o uno anterior.
4. **Sincronización:** `node scripts/sync-launcher-assets.mjs [--from-ci <id>|--build|--check]`, desde la raíz del monorepo.
   - Copia los jars, genera `src-tauri/src/boost_jars.rs` (la tabla grupo → versiones de Minecraft que usa `deploy_boost_mod`) y las filas de `MANIFEST.md`, y conserva los hashes anteriores en `LEGACY_BOOST_JAR_SHA256`.
   - Con `--from-ci <id>` usa los jars de una ejecución en verde de `ci-boost.yml`, que tiene que ser de los mismos fuentes del mod que el checkout. Es la forma recomendada: no hace falta compilar los 20 nodos.
   - Con `--build` compila antes todos los nodos en local. Tarda: los de NeoForge decompilan Minecraft uno a uno.
   - Con `LAUNCHER_LITE_DIR=<ruta>` trabaja sobre otra copia de launcher-lite, por ejemplo un git worktree.

---

## 🛠️ 6. Compilación y desarrollo

**Requisitos:** un JDK 25 para ejecutar Gradle. Los JDK 21 y 25 con los que compila cada nodo los localiza Gradle entre los instalados, o los descarga con Foojay.

```bash
./gradlew :1.21.1-fabric:build                      # un nodo: compila, pasa los tests y genera el jar
./gradlew :1.21.1-fabric:build :26.3-fabric:build   # varios nodos en una sola ejecución
./gradlew :<versión>-neoforge:build                 # un nodo NeoForge (de uno en uno: ver nota)
./gradlew :<versión>-fabric:runClient               # cliente de desarrollo Fabric
./gradlew :<versión>-neoforge:runClient             # cliente de desarrollo NeoForge
```

Los tests unitarios (40) no dependen del loader: se ejecutan en los nodos Fabric. En los de NeoForge están desactivados.

> [!WARNING]
> `./gradlew build` o `./gradlew assemble` sin prefijo construyen **los 20 nodos**, incluidos los 10 de NeoForge. La primera vez, cada nodo NeoForge decompila Minecraft con Vineflower, que reserva hasta ~12 GB de heap; después queda en caché. `org.gradle.parallel=false` y `neoforge-mutex` impiden que se solapen, pero conviene construir los nodos NeoForge de uno en uno y con memoria libre.

Cada nodo usa su propia carpeta de ejecución, `runs/<versión>-<loader>`: los mundos y el `options.txt` de una versión nueva pueden romper una anterior.

Opciones solo para desarrollo, que nunca entran en el jar ni en el CI:

| Propiedad | Efecto |
| :-- | :-- |
| `-PcompatTest` | Añade Sodium 0.6.9 e Iris 1.8.8 al run (desde el maven de Modrinth), y en NeoForge también ImmediatelyFast 1.3.5. De momento solo está configurado para el grupo `1.21.1` (claves `compat.*` de `stonecutter.properties.toml`). En Fabric no se incluye ImmediatelyFast, porque Loom no pone en el classpath de desarrollo la librería que lleva dentro de su jar. |
| `-PcompatDynamicFps` | Junto con `-PcompatTest`, añade Dynamic FPS; el modo eco debe desactivarse solo. |
| `-PmixinExport` | Exporta las clases transformadas a `.mixin.out`. |
| `-PmixinStrict` | Convierte en error cualquier inyección sin objetivo, también las opcionales. No combinar con `-PcompatTest`: algunos inyectores de Sodium solo tienen objetivo en NeoForge y son opcionales en Fabric. |
| `-PagentJar=<ruta>` | Engancha `game-bridge.jar` para ejercitar la telemetría y `game_ready`. |
| `-PquickPlay=<host:port>` | Conecta al arrancar (abre una conexión Netty de cliente). |
| `-PquickPlayWorld=<carpeta>` | Solo Fabric. Abre ese mundo de singleplayer al arrancar (benchmarks). |
| `-PjvmArgs="<flags>"` | Solo Fabric. Añade flags de JVM, por ejemplo los del launcher para medir con su GC. Con `-Dcrystaltides.boost.debugStats=true`, el log registra cada segundo los FPS y las secciones renderizadas (`[BenchStats]`). |
| `-PjfrFile=<ruta>.jfr` | Solo Fabric. Graba un perfil de Java Flight Recorder de 150 s a partir del segundo 50. |

Artefactos (20 jars): `versions/<versión>-<loader>/build/libs/crystaltides-boost-<loader>-<versión>-<versión del mod>.jar`.
