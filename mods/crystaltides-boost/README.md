# ⚡ CrystalTides Boost (`crystaltides-boost`)

> **Client-side performance & low-level hardware optimization mod for CrystalTides.**  
> Arquitectura multiloader agnóstica (`common`, `fabric`, `neoforge`) orientada a exprimir el hardware, estabilizar los frametimes y eliminar micro-stutters en Minecraft 1.21.1.

---

## 🏗️ 1. Arquitectura Multiloader

El proyecto sigue una división estricta en 4 módulos:

```
mods/crystaltides-boost/
├── common/                  # Lógica universal y Mixins de SpongePowered
│   ├── src/main/java/com/crystaltides/boost/
│   │   ├── mixin/           # Mixins de alto rendimiento
│   │   └── platform/        # Abstracción de servicios (ServiceLoader)
├── fabric/                  # Entrypoints y bindings específicos para Fabric Loader
├── neoforge/                # Entrypoints y bindings específicos para NeoForge
├── stubs/                   # Capa de contratos y tipos API de Minecraft (compile-only)
└── libs/                    # Fallback de dependencias empaquetadas locales
```

---

## 🚀 2. Optimizaciones Implementadas

| Optimización                        | Archivo                                                                                                                                                                                                 | Mecanismo & Impacto                                                                                                                                                    |
| :---------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Animated Texture Culling**        | [`AnimatedTextureCullingMixin.java`](file:///c:/Users/nacho/Desktop/Portafolio/crystaltides/mods/crystaltides-boost/common/src/main/java/com/crystaltides/boost/mixin/AnimatedTextureCullingMixin.java) | Congela subidas redundantes a la VRAM (`glTexSubImage2D`) cuando el juego está minimizado o en pausa. Deduplica pases múltiples por tick.                              |
| **Chest Occlusion & Hibernation**   | [`ChestOcclusionMixin.java`](file:///c:/Users/nacho/Desktop/Portafolio/crystaltides/mods/crystaltides-boost/common/src/main/java/com/crystaltides/boost/mixin/ChestOcclusionMixin.java)                 | Culling espacial zero-allocation para cofres enterrados o con obstrucción total superior/frontal. Culling por distancia cuadrática (>64 bloques) para cofres cerrados. |
| **Render Thread QoS**               | [`ThreadQosMixin.java`](file:///c:/Users/nacho/Desktop/Portafolio/crystaltides/mods/crystaltides-boost/common/src/main/java/com/crystaltides/boost/mixin/ThreadQosMixin.java)                           | Eleva el hilo de Renderizado OpenGL a `Thread.MAX_PRIORITY (10)` para minimizar el jitter de presentación y la latencia de entrada.                                    |
| **Worker Priority Demotion**        | [`WorkerPriorityMixin.java`](file:///c:/Users/nacho/Desktop/Portafolio/crystaltides/mods/crystaltides-boost/common/src/main/java/com/crystaltides/boost/mixin/WorkerPriorityMixin.java)                 | Degrada los hilos de generación y mallado de chunks a `NORM_PRIORITY - 2` para evitar que saturen la CPU e interrumpan al hilo de render.                              |
| **SaveSkip (CRC32C Deduplication)** | [`SaveSkipMixin.java`](file:///c:/Users/nacho/Desktop/Portafolio/crystaltides/mods/crystaltides-boost/common/src/main/java/com/crystaltides/boost/mixin/SaveSkipMixin.java)                             | Checksum CRC32C acelerado por hardware para descartar escrituras en disco de chunks que no sufrieron modificaciones durante el autoguardado.                           |
| **Lazy Narrator Boot**              | [`LazyNarratorMixin.java`](file:///c:/Users/nacho/Desktop/Portafolio/crystaltides/mods/crystaltides-boost/common/src/main/java/com/crystaltides/boost/mixin/LazyNarratorMixin.java)                     | Pospone la inicialización síncrona de las librerías nativas de texto a voz (Flite/SAPI), recortando 2-4 segundos del arranque inicial.                                 |

---

## 🛡️ 3. Arquitectura de Stubs y Aislamiento en Compilación

Para permitir el análisis estático en el IDE y la compilación sin exigir la descarga pesada de mappings de Mojang (Loom 500MB+):

1. **Módulo `stubs/`**: Declara las firmas de tipo mínimas (`Minecraft`, `ChestRenderer`, `PoseStack`, `Vec3`, etc.).
2. **Scope `provided` / `compileOnly`**:
   - Maven (`common/pom.xml`): `<scope>provided</scope>`.
   - Gradle (`common/build.gradle`): `compileOnly project(':stubs')` y `compileOnly fileTree(dir: '../libs')`.
3. **Regla de Exclusión en Empaquetado**:
   - `maven-jar-plugin` excluye estrictamente `net/minecraft/**` y `com/mojang/**`.
   - **Garantía:** El JAR distribuible **jamás** contiene stubs, eliminando colisiones en runtime con el ClassLoader del loader.

---

## 🔍 4. Supresiones de Linters y Estándares de Calidad

Los mixins utilizan supresiones explícitas para alinear SpongePowered con SonarQube y PMD:

| Supresión                                | Herramienta | Justificación Técnica                                                                                                                |
| :--------------------------------------- | :---------- | :----------------------------------------------------------------------------------------------------------------------------------- |
| `java:S100` / `java:S116`                | SonarQube   | SpongePowered exige el uso de prefijos con signo de dólar (`crystaltides$method`) para evitar colisiones entre mods.                 |
| `PMD.UnusedPrivateMethod`                | PMD 7       | Métodos `@Inject` son invocados dinámicamente mediante transformación de bytecode en runtime (ASM), no por llamadas directas.        |
| `PMD.UnusedFormalParameter`              | PMD 7       | SpongePowered exige replicar la firma exacta del método destino de Minecraft, independientemente de si se usan todos los parámetros. |
| `PMD.AbstractClassWithoutAbstractMethod` | PMD 7       | Convención de SpongePowered para impedir instanciación directa (`new Mixin()`) y permitir `@Shadow`.                                 |

---

## 🧪 5. Comandos de Verificación

```powershell
# 1. Ejecutar análisis estático con PMD 7 CLI (JDK 21):
$env:JAVA_HOME = "C:\Program Files\Java\jdk-21"
$env:PATH = "C:\Program Files\Java\jdk-21\bin;$env:PATH"
.tools/pmd-bin-7.10.0/bin/pmd.bat check -d mods/crystaltides-boost/common/src/main/java/com/crystaltides/boost --use-version java-21 -R category/java/errorprone.xml,category/java/bestpractices.xml --no-fail-on-violation -f text

# 2. Análisis SonarQube vía túnel SSH hacia OCI:
# Iniciar túnel si no está activo: ssh -N -L 9000:localhost:9000 oci
pnpm sonar:mod

# 3. Consultar Quality Gate en SonarQube:
sonar quality-gate status -p crystaltides-boost
```
