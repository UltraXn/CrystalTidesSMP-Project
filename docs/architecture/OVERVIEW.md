# 🏗️ Arquitectura de CrystalTides (Master Overview)

CrystalTides es un ecosistema de alta fidelidad que integra Web, Juego (Minecraft) y Cliente Nativo bajo una infraestructura unificada.

## 🧩 Componentes Principales

### 1. Web Suite (Portal & Admin)

- **Tecnología**: React 19 + Vite 6 + TypeScript + Tailwind 4.
- **Estado**: Migrado a TanStack Query (v5) y Zod para validación.
- **Rol**: Interfaz visual de alta gama con Glassmorphism para gestión de usuarios, noticias, tickets y gacha.

### 2. Backend (Supabase + API Server)

- **Capa Híbrida**:
  - **Supabase**: Maneja Auth, Realtime y la base de datos de "estado caliente".
  - **Node.js Express 5**: Actúa como orquestador para operaciones complejas, Webhooks y el CrystalBridge.
- **Seguridad**: JWT (Supabase) + Middleware de roles (`isAdmin`).

### 3. CrystalLauncher (Native Core) 🦋

- **Tecnología**: Tauri v2 (React 19 + TypeScript + Rust).
- **Enfoque 2026**: Manejo nativo de procesos Java, actualizaciones delta y validación de integridad mediante el backend en Rust. Suite completa con Installer y Uninstaller personalizados.

### 4. CrystalCore (Minecraft Plugin) 💎

- **Tecnología**: Java 21 + Paper API.
- **Rol**: El "brazo ejecutor" dentro del servidor. Escucha el Bridge y aplica cambios en tiempo real (roles, items, estadísticas).

---

## 🗄️ Estrategia de Datos Dual

| Base de Datos | Tecnología | Uso Principal                              | Proveedor        |
| :------------ | :--------- | :----------------------------------------- | :--------------- |
| **Web DB**    | PostgreSQL | Perfiles, Tickets, Foro, Configuración     | Supabase (Cloud) |
| **Server DB** | MySQL      | LuckPerms, Economía, Estadísticas de juego | HolyHosting      |
| **Audit DB**  | MySQL      | CoreProtect (Bloques y transacciones)      | HolyHosting      |

---

## 🌉 Conectividad (El Bridge)

El **CrystalBridge V2** elimina el uso de RCON mediante un sistema híbrido:

1. **Inbox (MySQL)**: Los comandos se encolan para asegurar que se ejecuten aunque el servidor esté offline.
2. **WebSocket (Realtime)**: Una señal instantánea avisa al plugin para procesar la cola en <50ms.

---

## 📂 Navegación de Documentación

### Arquitectura Técnica

- [🌉 CrystalBridge (Integración Server)](./CRYSTAL_BRIDGE.md)
- [🦀 Rust-Java Native Bridge](./RUST_JAVA_BRIDGE.md)
- [☁️ Integración Supabase](./SUPABASE_INTEGRATION.md)

### Componentes y Apps

- [🦋 CrystalLauncher](../components/LAUNCHER.md)
- [🌐 Web Client & Dashboard](../components/WEB_CLIENT.md)
- [🤖 Discord Sync Bot](../components/DISCORD_BOT.md)

### Funcionalidades (Features)

- [🎰 Sistema Gacha](../features/GACHA_SYSTEM.md)
- [🛡️ Staff Hub](../features/STAFF_HUB.md)
- [👤 Perfiles y Skins](../features/USER_PROFILES.md)

---

_Documentación técnica actualizada: 12 de Enero, 2026_
