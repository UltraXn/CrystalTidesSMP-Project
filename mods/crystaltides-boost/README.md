# ⚡ CrystalTides Boost (`crystaltides-boost`)

> **Client-side performance & thread scheduling mod for Minecraft 1.21.1.**
> Arquitectura MultiLoader nativa (`common`, `fabric`, `neoforge`) construida con **Fabric Loom** y **NeoForge ModDevGradle**. Estabiliza el frametime, prioriza los hilos de render, audio y red, y reduce el consumo cuando el juego está en segundo plano. Compatible con **Sodium**, **Embeddium**, **Iris**, **Oculus** e **ImmediatelyFast**.

---

## 🏗️ 1. Arquitectura MultiLoader

```
mods/crystaltides-boost/
├── common/                  # Lógica agnóstica de plataforma, config y Mixins
│   └── src/main/java/com/crystaltides/boost/
│       ├── bridge/          # AgentBridge (telemetría hacia el launcher, MethodHandle invokeExact)
│       ├── client/          # BackgroundEco, BackgroundWorkers, AmbientBiomes, ThreadQos, WindowStateTracker (+ GlfwIconifyHook)
│       ├── compat/          # CompatReport (mods detectados) y MixinSelection (qué mixins aplicar)
│       ├── config/          # BoostConfig (crystaltides-boost.properties)
│       ├── mixin/           # Mixins + BoostMixinPlugin
│       └── platform/        # IPlatformHelper + Services (ServiceLoader)
├── fabric/                  # Fabric Loom 1.8.x (refmap Intermediary)
├── neoforge/                # ModDevGradle 2.0.x (Mojmap en runtime, sin refmap)
└── buildSrc/                # Convenciones Gradle compartidas
```

- **Mapeos:** Mojang oficiales (Mojmap 1.21.1) en todo el código.
- **Refmap de Fabric:** el JSON común declara `"refmap": "${mod_id}.refmap.json"`. Loom solo añade esa clave a los JSON de su propio source set, y este llega desde `:common`; sin ella, en producción (Intermediary) los mixins no encuentran sus objetivos. En NeoForge la clave se elimina al empaquetar, porque allí no hay refmap.
- **MixinExtras 0.4.1:** lo incluyen Fabric Loader 0.16+ y NeoForge 21.1. En el build se usa `compileOnly`, y en Fabric también el procesador de anotaciones, que genera las entradas del refmap de `@ModifyReturnValue` y `@WrapWithCondition`.
- **IDs:** Fabric `crystaltides-boost`; NeoForge `crystaltides_boost` (FML exige `^[a-z][a-z0-9_]{1,63}$`).

---

## 🚀 2. Optimizaciones

| Optimización | Objetivo (Mojmap 1.21.1) | Qué hace |
| :-- | :-- | :-- |
| **Render thread QoS** | `Minecraft.run()` | Sube el hilo de render a `MAX_PRIORITY` (10). Vanilla ya lo hace con más de 4 núcleos; este mixin lo aplica también con 4 o menos, a costa de algo de CPU del servidor integrado en singleplayer. |
| **Sound thread QoS** | `SoundEngineExecutor.run()` | Sube a prioridad 8 como mínimo (configurable) el hilo "Sound engine", que decodifica la música y los discos en streaming. Evita cortes cuando los workers de chunks saturan la CPU. |
| **Netty client IO QoS** | `Connection.channelActive(...)` | Sube a prioridad 7 como mínimo (configurable) el hilo de E/S que atiende la conexión del cliente. Las conexiones del servidor integrado no se tocan. |
| **Modo eco en segundo plano** | `Minecraft.getFramerateLimit()` | 5 FPS con la ventana minimizada y 30 FPS sin foco (configurable). Nunca sube tu límite y no actúa durante la carga de recursos. Se desactiva solo si hay Dynamic FPS o FPS Reducer. |
| **Silencio al minimizar** (opcional) | `SoundEngine.updateSource(Camera)` | Ganancia 0 en el listener de OpenAL mientras está minimizado y restaura tu volumen al volver, sin modificar las opciones. |
| **Animated texture culling** | llamada a `TextureManager.tick()` en `Minecraft.tick()` | Minimizado, deja de subir texturas animadas a la GPU. Congela de forma coherente vanilla, el seguimiento de sprites de Sodium y los atlas PBR de Iris. |
| **Partículas ambientales rápidas** | `ClientLevel.animateTick(...)` y `doAnimateTick(...)` | Una vez por segundo comprueba si algún bioma cercano tiene partículas ambientales (en vanilla, solo algunos del Nether). Mientras ninguno las tenga, se salta la búsqueda de bioma que `doAnimateTick` hace en cada posición; en el perfil era el 22 % del tiempo Java del hilo de render. Sodium e Iris no tocan este código. |
| **Caché de samplers de shader** | llamada a `Uniform.glGetUniformLocation` en `ShaderInstance.apply()` | Reutiliza la posición de cada sampler, que vanilla ya guarda al enlazar el shader, en vez de pedírsela al driver en cada `apply()`; en el perfil con NVIDIA era el 21 % del tiempo nativo del hilo de render. Se omite con Sodium o Embeddium, que traen el mismo arreglo. |
| **Sin `Thread.yield()` por frame** | llamada a `Thread.yield()` en `Minecraft.runTick(boolean)` | Quita la cesión de CPU del final de cada frame. En Windows, `yield` entrega el núcleo del hilo de render a cualquier hilo listo en ese núcleo, workers incluidos. |
| **Límite de workers en segundo plano** | `Util.getMaxThreads()` | Reduce el pool `Worker-Main`, que genera el terreno en singleplayer y construye las mallas de chunks con el renderer vanilla (Sodium usa sus propios hilos). `auto` usa un worker por núcleo físico menos uno, con un mínimo de 2. Un `-Dmax.bg.threads` explícito siempre gana. Solo cambia el máximo que lee `Util.makeExecutor`, sin tocar sus lambdas (ver §4). |
| **Agent bridge (frametime)** | `Minecraft.runTick(boolean)` | Marca el inicio de cada frame para el agente `game-bridge.jar` del launcher (FPS y p99). Solo se aplica si el agente está presente. |
| **Agent bridge (`game_ready`)** | `Minecraft.onGameLoadFinished(...)` | Avisa al launcher cuando termina la carga inicial, también con quickPlay o con la pantalla de accesibilidad del primer arranque. Solo se aplica si el agente está presente. |

**Prioridades de hilo:**
- HotSpot en Windows traduce 5-6 a NORMAL, 7-8 a ABOVE_NORMAL y 9-10 a HIGHEST. En Linux las prioridades de Java se ignoran salvo con `-XX:ThreadPriorityPolicy=1` y root.
- Solo se suben, nunca se bajan. Un hilo de Java hereda la prioridad de quien lo crea, así que los hilos que vanilla recrea desde el hilo de render (por ejemplo, "Sound engine" al recargar el sonido) pueden llegar ya con prioridad 10, y se respeta.

**Cero asignaciones** en los hooks que se ejecutan en cada frame o en cada tick:
- `@ModifyVariable`, `@ModifyReturnValue`, `@ModifyExpressionValue` y `@WrapWithCondition` no reciben `CallbackInfo` ni crean objetos.
- El `@Inject` por tick de las partículas ambientales no es cancelable y no usa su `CallbackInfo`, así que Mixin pasa `null`.
- El `@WrapOperation` de la caché de samplers envuelve una llamada estática, así que MixinExtras 0.4.1 genera un `Operation` sin capturas (una única instancia). Solo empaqueta argumentos el camino de respaldo, que vanilla nunca toma.
- El resto de `@Inject` se ejecutan una sola vez: al arrancar un hilo, al abrir una conexión o al terminar la carga.

**Compatibilidad verificada** contra el código de Sodium `mc1.21.1-0.6.9` e Iris `1.21.1`:
- Ninguno de los dos toca `getFramerateLimit` ni `limitDisplayFPS`.
- La espera de fence que Sodium inyecta en `runTick` queda dentro del intervalo de frame una sola vez.
- Cancelar el tick de texturas congela juntos los contadores de Sodium y los atlas PBR de Iris.

Los mixins que apuntan a una llamada concreta usan `require = 0`: texturas animadas, partículas ambientales, samplers de shader y `Thread.yield()`. Si otro mod reescribe esa llamada, la optimización se omite en vez de impedir que el juego arranque.

**Medido:** Fabric sin Sodium, flags de JVM del launcher (ZGC), afinidad de 12 hilos (6 núcleos con SMT), vuelo de 3 minutos generando terreno nuevo y 2 runs por configuración. Cada fila añade algo a la anterior:

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

1. **`deploy_boost_mod`:** extrae el jar embebido de Fabric (en instancias Fabric o Quilt) o de NeoForge en `mods/crystaltides-boost.jar`.
2. **`shouldDeployBoost`:** solo lo despliega en Minecraft 1.21.1.
3. **`remove_crystaltides_boost`:** solo borra el jar si su SHA-256 coincide con un binario oficial, sea el actual o uno anterior.
4. **Sincronización:** `node scripts/sync-launcher-assets.mjs [--build|--check]` desde la raíz del monorepo copia los jars, actualiza los hashes y conserva los anteriores. Con `LAUNCHER_LITE_DIR=<ruta>` trabaja sobre otra copia de launcher-lite, por ejemplo un git worktree.

---

## 🛠️ 6. Compilación y desarrollo

Requisitos: **JDK 21**.

```bash
./gradlew build                      # ambos loaders + tests de :common
./gradlew :fabric:runClient          # cliente de desarrollo Fabric
./gradlew :neoforge:runClient        # cliente de desarrollo NeoForge
```

Opciones solo para desarrollo, que nunca entran en el jar ni en el CI:

| Propiedad | Efecto |
| :-- | :-- |
| `-PcompatTest` | Añade Sodium 0.6.9 e Iris 1.8.8 al run (desde el maven de Modrinth), y en NeoForge también ImmediatelyFast 1.3.5. En Fabric no se incluye porque Loom no pone en el classpath de desarrollo la librería que lleva dentro de su jar. |
| `-PcompatDynamicFps` | Junto con `-PcompatTest`, añade Dynamic FPS; el modo eco debe desactivarse solo. |
| `-PmixinExport` | Exporta las clases transformadas a `.mixin.out`. |
| `-PmixinStrict` | Convierte en error cualquier inyección sin objetivo, también las opcionales. No combinar con `-PcompatTest`: algunos inyectores de Sodium solo tienen objetivo en NeoForge y son opcionales en Fabric. |
| `-PagentJar=<ruta>` | Engancha `game-bridge.jar` para ejercitar la telemetría y `game_ready`. |
| `-PquickPlay=<host:port>` | Conecta al arrancar (abre una conexión Netty de cliente). |
| `-PquickPlayWorld=<carpeta>` | Solo Fabric. Abre ese mundo de singleplayer al arrancar (benchmarks). |
| `-PjvmArgs="<flags>"` | Solo Fabric. Añade flags de JVM, por ejemplo los del launcher para medir con su GC. Con `-Dcrystaltides.boost.debugStats=true`, el log registra cada segundo los FPS y las secciones renderizadas (`[BenchStats]`). |
| `-PjfrFile=<ruta>.jfr` | Solo Fabric. Graba un perfil de Java Flight Recorder de 150 s a partir del segundo 50. |

Artefactos: `fabric/build/libs/crystaltides-boost-fabric-1.21.1-<versión>.jar` y `neoforge/build/libs/crystaltides-boost-neoforge-1.21.1-<versión>.jar`.
