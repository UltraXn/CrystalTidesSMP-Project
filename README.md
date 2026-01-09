# 🌊 CrystalTides Ecosystem - Monorepo

Bienvenido al repositorio central de **CrystalTides**, un ecosistema de software de "Alto Nivel" diseñado para gestionar, potenciar y conectar la experiencia de juego en Minecraft con interfaces modernas y núcleos nativos de alto rendimiento.

---

## 🏗️ Arquitectura del Monorepo

Este proyecto utiliza una estructura de **Monorepo** moderna para gestionar múltiples aplicaciones, servicios y núcleos nativos con máxima coherencia.

| Componente          | Directorio             | Descripción                                            | Tecnologías                |
| :------------------ | :--------------------- | :----------------------------------------------------- | :------------------------- |
| **CrystalLauncher** | `apps/launcher`        | Launcher Premium con estética Glassmorphism.           | Flutter, Rust (Dart FFI)   |
| **CrystalNative**   | `apps/launcher/native` | Núcleo nativo de alto rendimiento (DLL).               | Rust, Lua (Hot-patching)   |
| **Web Portal**      | `apps/web-client`      | Portal de usuario y Dashboard Administrativo.          | React, Vite, TSX           |
| **API Server**      | `apps/web-server`      | API RESTful, Webhooks y agregadores.                   | Node.js, Express, Supabase |
| **CrystalCore**     | `plugins/crystalcore`  | Plugin de servidor para sincronización en tiempo real. | Java 21, Paper API         |
| **Game-Bridge**     | `apps/game-bridge`     | Agente in-game para inyección de HUD y lógica.         | Java (Agent), Rust (JNI)   |

---

## ✨ Características Destacadas

### 🦋 CrystalLauncher (The Commander)

- **Estética Premium**: Interfaz fluida con **Glassmorphism**, animaciones a 144Hz y soporte para fondos en video 4K.
- **Hybrid Logic**: Interfaz en Flutter comunicada con un núcleo en **Rust** para seguridad y velocidad máxima.
- **Gestor de Perfiles**: Sistema tipo "MultiMC" para gestionar múltiples instancias y versiones.
- **Auth Híbrido**: Login dual (Microsoft Premium vía OAuth2/Loopback + Sistema Offline).
- **Hot-Patching (Lua)**: Capacidad de actualizar la lógica del launcher bajo demanda sin necesidad de re-descargar el `.exe`.

### 🖥️ Ecosistema Web & Social

- **Perfiles 3D**: Visualización de Skins en tiempo real y estadísticas avanzadas.
- **Staff Hub**: Sistema integral de administración con Tablero Kanban y comunicación interna.
- **Secure Command Bridge**: Ejecución segura de comandos RCON mediante arquitectura Pull.

---

## ⚡ Tecnologías y Stack (High Fidelity)

- **UI/UX**: [Flutter](https://flutter.dev/), [React 18](https://reactjs.org/), [Framer Motion](https://www.framer.com/motion/).
- **Rendimiento**: [Rust](https://www.rust-lang.org/) (Core DLL), [Lua](https://www.lua.org/) (Dynamic Scripts).
- **Persistence**: [Drift/SQLite](https://drift.simonbinder.eu/) (Local), [Supabase](https://supabase.com/) (Cloud).
- **Languages**: Dart, Rust, TypeScript, Java, Lua.

---

## 🛠️ Instalación y Desarrollo

### 1. Prerrequisitos

- **Flutter SDK** (Canal Stable)
- **Rust Up** (Toolchain `stable-x86_64-pc-windows-msvc`)
- **Node.js 18+** & **JDK 21**
- **VS C++ Build Tools** (Para compilación nativa en Windows)

### 2. Configuración Inicial

```bash
# Instalar dependencias del monorepo
npm install

# Compilar el Core Nativo (DLL)
cd apps/launcher/native
cargo build --release
```

### 3. Ejecutar Launcher (Dev Mode)

```bash
cd apps/launcher
flutter run -d windows
```

### 4. Ejecutar Stack Web (Full Environment)

Para levantar Frontend, Backend y Bot simultáneamente con Docker:

```bash
# Desde la raíz del repo (Windows)
.\scripts\start-dev.bat
```

---

## 🛡️ Verificación y Seguridad

Utilizamos **Docker Scout** y escaneos de vulnerabilidades en CI/CD. Cualquier despliegue a producción requiere pasar pruebas de seguridad automáticas y auditoría de CVEs.

---

Desarrollado con 💜 y **arquitectura overkill** por **CrystalTides Team**.
