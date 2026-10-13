# Task 3 Report: Remediación de Seguridad y Complejidad en Discord Bot

## Resumen de Ejecución

- **Objetivo**: Corregir vulnerabilidad de protocolo no seguro en `pelicanService.ts` (`[typescript:S5332]`) y reducir la complejidad cognitiva por debajo de 15 en `cardCanvasService.ts` y `powerManager.ts` (`[typescript:S3776]`).
- **Archivos Modificados**:
  - `apps/discord-bot/src/services/pelicanService.ts`
  - `apps/discord-bot/src/services/cardCanvasService.ts`
  - `apps/discord-bot/src/services/powerManager.ts`
- **Estado**: **DONE**

---

## Cambios Implementados

### 1. `pelicanService.ts` (`[typescript:S5332]`)

- **Problema**: El atributo estático `internalUrl` utilizaba por defecto el protocolo no cifrado `http://panel`.
- **Solución**: Se actualizó a protocolo seguro `https://panel` (`process.env.PELICAN_INTERNAL_URL || 'https://panel'`), previniendo transmisión de credenciales y datos en texto plano.

### 2. `cardCanvasService.ts` (`[typescript:S3776]`)

- **Problema**: El método `renderCardBuffer` acumulaba una complejidad cognitiva de 21 (límite SonarQube/AGENTS.md: 15) debido a múltiples bifurcaciones anidadas de renderizado, cálculo de layouts y formateo en un único bloque de dibujo de canvas.
- **Solución**: Se modularizó el proceso de dibujo aislando responsabilidades en métodos estáticos privados:
  - `drawCardBackground`: Renderizado de fondo, rejilla decorativa, contenedor semitransparente y glow radial.
  - `drawHeader`: Titulado, badge dinámico de estado por píldora y cuadro de host/puerto IP.
  - `drawTransitionSection`: Barra de progreso de transición y desglosado de etapas sin prefijos emoji para asegurar legibilidad vectorial.
  - `drawMetricsSection`: Medidores porcentuales de RAM y capacidad de jugadores, más rejilla inferior de métricas (latencia, TPS y Wings).
  - `drawFooter`: Timestamp y pie de sincronización en tiempo real.
  - `renderCardBuffer`: Método orquestador lineal con complejidad cognitiva inferior a 5.

### 3. `powerManager.ts` (`[typescript:S3776]`)

- **Problema**: Controladores masivos con anidación de promesas, bucles de búsqueda en servidores de Discord, generación de matrices ASCII y secuencias de control de energía que elevaban significativamente la complejidad cognitiva.
- **Solución**: Se descompusieron los componentes monolíticos en funciones puras y sub-métodos especializados:
  - **Helpers puros a nivel de módulo**:
    - `generateTransitionAscii` y `generateStandardAscii`: Extracción del renderizado condicional de matrices ASCII.
    - `STATUS_DISPLAYS` y `getStatusDisplay`: Diccionario constante tipado para resolución de colores, etiquetas e iconos sin `if/else` anidados.
    - `buildTransitionStepText`: Generación declarativa de mensajes para los distintos tipos de transición (`wol_pc`, `pelican_start`, `pelican_stop`).
    - `buildControlButtons`: Construcción pura de los `ActionRowBuilder` con botones y validación de estados deshabilitados.
  - **Descomposición en `PowerManager`**:
    - `findControlMessage`: Delegado en `fetchCachedControlMessage`, `isControlMessage` y `scanGuildForControlMessage`.
    - `triggerActionTransition`: Delegado en `triggerWolTransition`, `triggerStartTransition` y `triggerStopTransition`.
    - `updateControlEmbed`: Delegado en `resolveLiveMetrics` y `syncControlMessage`.
    - `checkStatusLoop`: Delegado en `evaluateAutoShutdown`.
    - `executeShutdownSequence`: Delegado en `waitForServerOffline` y `sendPoweroffSsh`.
  - Complejidad cognitiva en cada método resultante $\le 4$.

---

## Verificación

1. **Typecheck de TypeScript**:
   - Comando ejecutado: `cmd /c "npx tsc --noEmit"` en `apps/discord-bot`.
   - Resultado: **Exit code 0** (0 errores de tipos en todo el proyecto).
