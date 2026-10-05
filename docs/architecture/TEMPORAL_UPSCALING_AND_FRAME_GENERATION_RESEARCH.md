# 🔬 Investigación Técnica: Reconstrucción Temporal y Frame Generation en Minecraft PC (Sustituto de MetalFX)

> **Documento de Investigación Arquitectónica — CrystalTides Client & Engine**  
> **Objetivo:** Analizar cómo trasladar las capacidades de MetalFX (Temporal Scaler y Frame Generation de Apple Silicon en `mcopt`) al ecosistema PC (Intel, AMD y NVIDIA en Windows/Linux) preservando 100% de compatibilidad con Sodium e Iris Shaders.

---

## 1. El Desafío Fundamental: Metal vs. OpenGL 4.6 en PC

En `mcopt` (macOS), el autor aprovechó que Minecraft corre sobre la API privativa **Metal**, la cual integra a nivel de sistema operativo el framework **MetalFX**:

- `MTLFXTemporalScaler`: Reconstruye imágenes de menor resolución utilizando el búfer de color, profundidad, vectores de movimiento (motion vectors) y jitter de subpíxel.
- `FrameGen.java`: Genera fotogramas interpolados mediante Optical Flow acelerado por el Neural Engine de los chips Apple Silicon M-series.

### En PC (Windows / Linux):

- Minecraft Java Edition corre sobre **OpenGL 4.6 (LWJGL 3)**.
- **Iris Shaders** está estrictamente atado a la tubería de shaders en **GLSL** (`gbuffers_*.vsh/fsh`, `composite*.fsh`, `final.fsh`).
- Las tecnologías modernas de Frame Generation (**AMD FSR 3.1, NVIDIA DLSS 3, Intel XeSS**) requieren de manera nativa **DirectX 12 o Vulkan** con colas de cómputo asíncrono (_Async Compute_) y swapchains con modelo Flip de DXGI.
- **AMD confirmó oficialmente que FSR 3 Frame Generation NO tiene soporte directo para OpenGL.**
- Si cambiamos el motor a Vulkan (como en _VulkanMod_ o _Radiance_), **se rompe el 100% de los shaders existentes (Complementary, Bliss, BSL, Kappa)**.

---

## 2. Las 4 Vías Técnicas Reales para PC

```mermaid
graph TD
    A[Render de Minecraft en OpenGL 4.6 + Sodium + Iris] --> B{¿Qué técnica aplicar?}

    B -->|Vía 1: Mod Fabric en Juego| C[FSR Reloaded / Super Resolution]
    C --> C1[OpenGL 4.3 Compute Shaders GL_ARB_compute_shader]
    C1 --> C2[FSR 1.0 EASU + RCAS / FSR 2.2 Temporal]

    B -->|Vía 2: Shaderpack Nativo| D[TAAU Integrado en Iris]
    D --> D1[Complementary / Bliss / Photon / Kappa]
    D1 --> D2[Render a 0.75x o 0.5x + TAAU Reconstruction]

    B -->|Vía 3: Swapchain Interop| E[Puente WGL_NV_DX_interop2]
    E --> E1[OpenGL FBO compartido con DirectX 12 Zero-Copy en VRAM]
    E1 --> E2[FidelityFX SDK 3.1 Frame Generation en DX12 Swapchain]

    B -->|Vía 4: Nivel Sistema / Driver| F[AMD AFMF 2 / Lossless Scaling LSFG]
    F --> F1[Captura de ventana Borderless sin alterar la JVM]
    F1 --> F2[Duplicación / Triplicación de FPS 2x / 3x]
```

---

## 3. Análisis Detallado de Cada Vía

### 🟢 Vía 1: Mod Fabric "FSR Reloaded" (FSR en Compute Shaders OpenGL 4.3)

- **Autor:** `cdefpigger` (publicado en Modrinth y CurseForge).
- **Cómo opera:**
  - Requiere GPUs con soporte para **OpenGL 4.3 o superior** (introdujo `GL_ARB_compute_shader` y Shader Storage Buffer Objects / SSBO).
  - Intercepta el framebuffer (FBO) de Minecraft antes de dibujar la interfaz de usuario (HUD / inventario).
  - Pasa la textura de color y el buffer de profundidad a los Compute Shaders portados de FidelityFX.
  - Dibuja la GUI/HUD a resolución nativa (1080p / 1440p / 4K) para que el texto y los iconos nunca se vean borrosos.
- **Soporte:** FSR 1 (Spatial), FSR 2 (Temporal con sub-píxel jitter y matriz de proyección) y modo experimental de Frame Generation.
- **Compatibilidad:** 100% compatible con Fabric, Sodium, Distant Horizons e Iris.
- **Acción en CrystalTides:** Integrar `FSR Reloaded` como mod de optimización opcional de un solo clic en el catálogo del Launcher.

---

### 🟢 Vía 2: Reconstrucción Temporal Integrada en el Shaderpack (TAAU en Iris)

- **Cómo opera:**
  - Shaderpacks de referencia como **Complementary Reimagined**, **Bliss Shaders**, **Photon** y **Kappa** ya poseen pipelines internos de **TAAU (Temporal Anti-Aliasing Upscaling)** y pases de **FidelityFX CAS (Contrast Adaptive Sharpening)** en sus archivos `composite.fsh` y `final.fsh`.
  - En lugar de renderizar la geometría y la iluminación a resolución nativa, renderizan a escala reducida (por ejemplo, **0.75x o 0.67x / modo Calidad**) y el pase de TAA acumula información de fotogramas anteriores mediante reproyección temporal.
- **Ventajas:**
  - Cero dependencias de librerías nativas en C++ o DLLs externas.
  - 100% compatible con todas las GPUs (NVIDIA GeForce, AMD Radeon, Intel Arc y gráficos integrados).
  - Genera una ganancia de entre **40% y 75% más FPS** con una pérdida visual imperceptible.
- **Acción en CrystalTides:** Nuestro módulo [`gpu_preset.rs`](file:///c:/Users/nacho/Desktop/Portafolio/crystaltides/apps/launcher/client/src-tauri/src/gpu_preset.rs) ya clasifica el hardware. Podemos expandir la configuración de shaders para fijar automáticamente `renderResolution = 0.75` con TAAU en perfiles MEDIUM y HIGH.

---

### 🚀 Vía 3: El "Santo Grial" Técnico — Puente `WGL_NV_DX_interop2` $\rightarrow$ DX12 Frame Generation

- **Cómo opera:**
  - Windows ofrece la extensión de driver `WGL_NV_DX_interop2` (soportada universalmente por NVIDIA, AMD e Intel).
  - Permite enlazar una textura de OpenGL directamente con un recurso de **DirectX 11 o DirectX 12 en la misma VRAM, sin copiar datos por CPU (Zero-Copy)**.
  - La arquitectura:
    1. Minecraft renderiza en OpenGL 4.6 con Sodium e Iris normalmente.
    2. En el pase final de intercambio de buffers (`wglSwapBuffers` o gancho en GLFW), el framebuffer de OpenGL se vincula a una textura de DirectX 12.
    3. Una librería nativa en C++/Rust ejecuta el pipeline de **AMD FidelityFX SDK 3.1 Frame Generation** en DX12:
       - Recibe el frame actual y el frame anterior.
       - Genera el flujo óptico (_Optical Flow_).
       - Interpola un fotograma intermedio sintético.
    4. Presenta ambos fotogramas utilizando el modelo Flip de DXGI (`IDXGISwapChain::Present`).
- **Ventajas:** Permite **Frame Generation real en DirectX 12 sobre Minecraft OpenGL**, logrando 144Hz a 360Hz estables con shaders pesados sin romper Iris.
- **Complejidad:** Alta. Requiere inyección nativa de DLL (`crystaltides_agent.dll`).

---

### ⚡ Vía 4: A Nivel de Sistema / Driver — AMD AFMF 2 y Lossless Scaling (LSFG)

- **Cómo opera:**
  - **AMD Fluid Motion Frames 2 (AFMF 2)**: AMD integró soporte directo para juegos OpenGL en sus drivers Adrenalin recientes mediante interoperabilidad interna con Vulkan. Se activa en el panel de control de AMD para `javaw.exe` y duplica los fotogramas a nivel de driver con baja latencia.
  - **Lossless Scaling (LSFG 2.3+)**: Es la herramienta reina en la comunidad de modding de Minecraft. Captura la ventana del juego en modo sin bordes (_borderless_) y aplica interpolación 2x o 3x mediante redes neuronales en la GPU.
- **Recomendación para jugadores:** Bloquear los FPS base de Minecraft a 60 o 72 FPS fijos; al activar Frame Generation externo, la tasa se duplica limpiamente a 120 o 144 FPS con tiempos de cuadro (_frametimes_) ultra-planos.

---

## 📋 Conclusión y Hoja de Ruta para CrystalTides

| Nivel de Implementación     | Solución                                            | Estado / Plan de Acción                                                                                                                                                                            |
| :-------------------------- | :-------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Corto Plazo (Inmediato)** | **Preajuste TAAU en Shaders + FSR Reloaded**        | Integrar `FSR Reloaded` en el catálogo de mods del launcher y configurar en `gpu_preset.rs` la escala de renderizado óptima (0.75x con TAAU) para duplicar FPS de forma nativa sin romper shaders. |
| **Mediano Plazo (Nativo)**  | **Integración en `crystaltides-boost`**             | Agregar un pase de contraste adaptativo (RCAS / CAS) en GLSL compute dentro de `mods/crystaltides-boost` para aplicar nitidez adaptativa a las texturas escaladas.                                 |
| **Largo Plazo (Avanzado)**  | **Puente `WGL_NV_DX_interop2` + FSR 3.1 Frame Gen** | Desarrollar el interceptor nativo en `crystaltides_agent.dll` para vincular OpenGL con el swapchain DX12 de FSR 3.1.                                                                               |
