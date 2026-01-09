# 🎰 KilluCoin Gacha

El **KilluCoin Gacha** es el minijuego principal de gamificación en la web de CrystalTides, diseñado para recompensar la fidelidad de los usuarios con premios dentro del juego.

## 🕹️ Experiencia de Usuario (UX)

- **Interfaz Visual**: Un sistema de apertura de cajas con animaciones matemáticas suaves (CSS Transitions + JS).
- **Acceso**: Requiere que el usuario esté logueado.
- **Limitación**: El sistema impone un **Cooldown de 24 horas** por usuario para mantener la economía del servidor equilibrada.

## 🛠️ Integración Técnica

El sistema funciona mediante una orquestación de tres capas, actualmente implementada como una **Tirada Diaria Gratuita**:

1.  **Frontend (React)**:
    - Muestra una interfaz de **Multi-Tier** (Bronze, Silver, Gold...) con costes visuales.
    - *Nota*: Actualmente el backend ejecuta una lógica única de "Daily Reward", por lo que la selección de Tier es visualmente representativa en esta versión.
    - Envía una petición `POST` segura al backend al girar la palanca.

2.  **Backend (Node.js/Express)**:
    - **Servicio**: [`gachaService.ts`](../server/services/gachaService.ts).
    - **Lógica Actual**:
      - **Pool de Premios**: Hardcoded en `REWARDS_POOL` (no en BD), dividido por rarezas simples (XP, Monedas, Items).
      - **RNG**: Algoritmo de peso ponderado (Common 70%, Rare 20%, Epic 8%, Legendary 2%).
      - **Cooldown**: Verificación estricta de **24 horas** contra la tabla `gacha_history`.
      - **Entrega**: Inserta comandos en la cola de **CrystalBridge**.

3.  **Entrega (CrystalBridge)**:
    - Ejecuta comandos nativos de Minecraft (`eco give`, `lp user`, `give`) basándose en el tipo de premio (`currency`, `rank`, `item`).

## 💎 Configuración de Premios (Pool Actual)

Los premios están definidos en código (`gachaService.ts`) y siguen esta distribución:

- **Common (70%)**: XP, KilluCoins pequeñas.
- **Rare (20%)**: KilluCoins medianas, Diamantes.
- **Epic (8%)**: Rangos temporales (VIP), Manzanas de Oro.
- **Legendary (2%)**: Rangos altos (MVP), Netherite, Llaves de Caja.

> 🚧 **Roadmap**: La funcionalidad de "Tiers de Pago" (gastar KilluCoins por mejores premios) está presente en el Frontend pero pendiente de implementación en el Backend.

---

_Documentación generada el 25 de diciembre de 2025._
