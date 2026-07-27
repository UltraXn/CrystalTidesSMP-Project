# 🚀 CrystalLauncher - Client & Installer Suite

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Tauri](https://img.shields.io/badge/Tauri-v2.0-FFC107.svg?logo=tauri)
![React](https://img.shields.io/badge/React-19.0-61DAFB.svg?logo=react)
![Rust](https://img.shields.io/badge/Rust-2024-000000.svg?logo=rust)

**CrystalLauncher** es la suite nativa de escritorio oficial para el servidor de Minecraft **CrystalTidesSMP (Java Edition 1.21.1)**. Diseñada sobre **Tauri v2 + Rust + React 19**, ofrece un rendimiento ultra liviano, bajo consumo de memoria RAM y arranque instantáneo.

---

## 🏗️ Estructura de la Suite (`workspaces`)

```
crystal-launcher/
├── client/          # Cliente principal (Autenticación Microsoft, Mod Sync, Skin Viewer 3D, Stats)
├── installer/       # Instalador visual animado con burbujas de vidrio y creador de accesos directos
└── uninstaller/     # Desinstalador limpio para eliminar cachés y binarios locales
```

---

## ⚡ Características Principales

1. **Autenticación Zero-Click & Microsoft OAuth2**:
   - Inicio de sesión nativo con cuentas oficiales Mojang/Microsoft.
   - Compatibilidad con deep linking `crystaltides://` para lanzar el juego desde la plataforma Web.

2. **Sincronizador de Mods (SHA-256 Hash Check)**:
   - Descarga e inspección de archivos `.jar` comparando hashes contra la API REST (`/api/launcher/manifest`).
   - Evita la necesidad de descargar modpacks enteros manualmente.

3. **Visor de Skins 3D en Tiempo Real**:
   - Renderizado Canvas 3D dinámico con `skinview3d` de las skins del jugador.

4. **Monitoreo & Telemetría**:
   - Visualización live de TPS, jugadores conectados y registros de la consola del cliente.

---

## 🛠️ Requisitos de Desarrollo

- **Node.js**: `v20.x` o superior
- **Rust**: `v1.75.0` o superior (`cargo` instalado)
- **Tauri CLI**: `npm install -g @tauri-apps/cli`

---

## 🚀 Comandos de Compilación & Ejecución

```bash
# 1. Instalar todas las dependencias del workspace:
npm install

# 2. Ejecutar el Cliente en modo desarrollo (Tauri Dev):
npm run dev

# 3. Compilar los binarios de producción (.exe / .msi / .app):
npm run build:tauri
```

---

## 📦 CI/CD & Compilación Automatizada

El repositorio incluye pipelines automáticos en GitHub Actions (`.github/workflows/build-launcher.yml`) que compilan y generan ejecutables firmados en cada tag de versión (`v*`).

---
*Desarrollado para la comunidad de CrystalTidesSMP.*
