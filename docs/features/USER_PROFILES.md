# 👤 Perfiles y Estadísticas de Jugador

Los perfiles públicos en CrystalTides ([`PublicProfile.tsx`](../client/src/pages/PublicProfile.tsx)) son la carta de presentación de cada jugador, unificando su identidad web con sus logros dentro del servidor de Minecraft (Logic: [`fetchData`](../client/src/pages/PublicProfile.tsx#L67)).

## 🎨 Visualización de Skin (Preview 3D)

Una de las características premium del frontend es el **Renderizado 3D Interactivo**:

- **Tecnología**: Utiliza `skinview3d` (basado en Three.js).
- **Componente**: [`SkinViewer.tsx`](../client/src/components/Widgets/SkinViewer.tsx)
- **Funcionalidad**: Los usuarios pueden rotar, hacer zoom y ver animaciones de sus propias skins de Minecraft directamente en el navegador.
- **Sincronización**: La skin se recupera automáticamente desde los servidores de Mojang usando el nombre de usuario del jugador.

## 📊 Estadísticas del Juego (In-Game Stats)

El backend consulta las bases de datos del servidor de Minecraft (MySQL) para mostrar datos en tiempo real ([`PlayerStats.tsx`](../client/src/components/Widgets/PlayerStats.tsx)):

- **Combate**: Kills totales, Muertes, Ratio K/D.
- **Actividad**: Tiempo total de juego, fecha de última conexión.
- **Economía**: Saldo actual de KilluCoins y dinero de la economía `Vault`.
- **Progresión**: Bloques minados/colocados (vía logs de CoreProtect).

## 🎖️ Vitrina de Medallas

Los jugadores pueden coleccionar medallas por méritos especiales (Veterano, Ganador de Eventos, Donador, etc.):

- Las medallas son asignadas por los Administradores desde el Staff Hub.
- Cada medalla tiene un icono único y una descripción que aparece al pasar el cursor (Tooltip).

## ⚙️ Personalización Web

Además de los datos del juego, el perfil permite:

- **Biografía**: Un espacio de texto libre para que el usuario se presente.
- **Redes Sociales**: Enlaces configurables a Discord, YouTube, Twitter, etc.
- **Privacidad**: Opción para ocultar ciertas estadísticas si el usuario lo desea.

---

_Documentación generada el 25 de diciembre de 2025._

## 🕸️ Gráfico de Estilo de Juego (Playstyle Radar)

_Implementado en Enero 2026_

El **Playstyle Radar** es una visualización hexagonal que categoriza el comportamiento del jugador en 5 ejes distintos. Permite identificar rápidamente si un jugador es más enfocado en la construcción, el combate, la economía o la interacción social.

### Métricas y Cálculos

Cada eje tiene un valor de 0 a 100, donde 100 representa haber alcanzado la "Meta" establecida para un jugador activo promedio-alto.

| Estilo | Icono | Fuente de Datos | Meta (100%) | Fórmula de Cálculo |
| :--- | :---: | :--- | :--- | :--- |
| **Constructor** | 🛠️ | `blocksPlaced` + `blocksMined` | **300,000 bloques** | `(Bloques / 300k) * 100` |
| **Luchador** | ⚔️ | `kills` (x10) + `mobKills` | **5,000 puntos** | `((Kills*10 + MobKills) / 5k) * 100` |
| **Explorador** | 🗺️ | `playtime` (Horas) | **200 horas** | `(Horas / 200) * 100` |
| **Mercader** | 💰 | `money` (KilluCoins) | **$1,000,000** | `(Dinero / 1M) * 100` |
| **Social** | 👥 | `playtime` + `rank` | **100 puntos** | `(Horas * 0.2) + Bono Rango` |

> **Nota sobre Explorador:** Se utiliza el *parsing* del string de tiempo ("64h 30m") para mayor precisión que el tick count crudo.

### 🌟 Bonus Social

La estadística **Social** premia la presencia en el servidor y el estatus en la comunidad:
*   **Base:** 0.2 puntos por cada hora de juego (aprox. 500 horas para el 100% solo jugando).
*   **Bono de Rango (+30 Puntos):** Se otorga automáticamente si el usuario posee alguno de los siguientes roles de soporte/staff:
    *   *Donador, Fundador, Killuwu, Neroferno*
    *   *Developer, Staff*

