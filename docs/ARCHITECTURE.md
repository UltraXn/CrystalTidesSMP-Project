# 🏗️ Arquitectura de CrystalTides

CrystalTides no es solo una página web; es un ecosistema completo que integra Web, Juego (Minecraft) y Comunidad (Discord).

## 🧩 Componentes Principales

### 1. Frontend (Cliente)

- **Tecnología**: React + Vite + TypeScript.
- **Estilos**: CSS Modules / Styled Components con diseño "Glassmorphism" premium.
- **Rol**: Interfaz visual puramente consumidora de API. No contiene lógica de negocio sensible ni accesos a BD.

### 2. Backend (API Server)

- **Tecnología**: Node.js + Express + TypeScript.
- **Seguridad**:
  - **API First**: Toda la lógica pasa por endpoints RESTful seguros.
  - **JWT Auth**: Autenticación de usuarios vía Supabase Auth.
  - **Middleware de Roles**: Protección granular de rutas (`isAdmin`, `isStaff`).
- **Swagger**: Documentación automática disponible en `/api/docs`.

### 3. Bases de Datos (Estrategia Multi-DB)

Utilizamos una arquitectura híbrida optimizada para cada caso de uso:

| Base de Datos | Tecnología | Uso Principal                                 | Ubicación        |
| ------------- | ---------- | --------------------------------------------- | ---------------- |
| **Web DB**    | PostgreSQL | Usuarios Web, Foros, Tickets, Noticias, Gacha | Supabase (Cloud) |
| **Server DB** | MySQL      | Datos del Pluging Plan, LuckPerms, Economía   | HolyHosting      |
| **Logs DB**   | MySQL      | CoreProtect (Bloques y acciones masivas)      | HolyHosting      |

### 4. CrystalBridge (Integración Minecraft) 🌉

El "arma secreta" para conectar la Web con el Servidor de forma segura sin abrir puertos peligrosos (RCON).

- **Inbox Pattern**:
  1. La Web (Gacha/Tienda) inserta un comando en una cola MySQL (`web_pending_commands`).
  2. El Plugin **CrystalCore** en el servidor lee esta tabla periódicamente.
  3. Ejecuta el comando localmente y marca la tarea como completada.
- **Ventajas**: Funciona asíncronamente (incluso si el server está offline) y no requiere exponer puertos UDP.

### 5. Pterodactyl Integration 🦖

Para acciones administrativas inmediatas (Baneos, Kicks, Reinicios), la API se comunica directamente con el panel de hosting Pterodactyl vía HTTP seguro.

---

## 📖 Documentación de Funcionalidades

- [🦋 CrystalLauncher (Cliente Híbrido)](./LAUNCHER.md)
- [🧠 Game Bridge (Agente In-Game)](./GAME_BRIDGE.md)
- [🛡️ Staff Hub (Gestión Interna)](./STAFF_HUB.md)
- [🌉 CrystalBridge (Integración Server)](./CRYSTAL_BRIDGE.md)
- [🎰 Sistema Gacha (KilluCoin)](./GACHA_SYSTEM.md)
- [🏛️ Foro y Comunidad](./FORUM_SYSTEM.md)
- [👤 Perfiles y Estadísticas](./USER_PROFILES.md)
- [🎨 Arquitectura Frontend (Forms V2)](./FRONTEND_ARCHITECTURE.md)
- [🛡️ Calidad de Código y Estándares](./CODE_QUALITY.md)

---

## 🔄 Flujos Clave

### A. Sistema Gacha (Ejemplo Completo)

1. **Frontend**: Usuario hace click en "Tirar". Llama a `POST /api/gacha/roll`.
2. **API**:
   - Verifica saldo/cooldown en Supabase.
   - Calcula premio (RNG seguro en servidor).
   - Guarda el resultado en historial (Supabase).
   - **Bridge**: Inserta el comando de entrega (`give diamond 1`) en la cola MySQL.
3. **Minecraft**: CrystalCore detecta el comando y entrega el item al jugador in-game.

### B. Estadísticas de Jugador

1. **API**: Recibe petición `GET /player-stats/:user`.
2. **Service**:
   - Consulta MySQL (Sessions) para tiempo de juego.
   - Consulta MySQL (LuckPerms) para rango.
   - Consulta MySQL (CoreProtect) para bloques minados (optimizada).
3. **Response**: Devuelve un JSON unificado al Frontend.

---

## 📂 Estructura de Carpetas (Monorepo)

```
/
├── apps/
│   ├── web-client/         # [Portal Web & Dashboard](../apps/web-client/)
│   ├── web-server/         # [Backend API REST](../apps/web-server/)
│   ├── discord-bot/        # [Bot de Moderación & Sync](../apps/discord-bot/)
│   └── launcher/           # [CrystalLauncher (Flutter)](../apps/launcher/)
├── plugins/
│   └── crystalcore/        # [Plugin Spigot/Paper](../plugins/crystalcore/)
├── packages/               # Librerías compartidas (UI, TS Config, etc)
└── docs/                   # [Documentación Central](../docs/)
```
