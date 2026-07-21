# 🦋 CrystalLauncher

**CrystalLauncher** es la puerta de entrada exclusiva al ecosistema CrystalTides. No es solo un lanzador, es una plataforma integrada construida con **Tauri v2** (React + Rust) que garantiza rendimiento, seguridad y una experiencia de usuario premium.

## 🏗️ Arquitectura Híbrida

El launcher utiliza un diseño de procesos desacoplados para combinar lo mejor de dos mundos:

### 1. Frontend (React + TypeScript)

- **Tecnología**: React 19 + TypeScript para la interfaz.
- **Responsabilidad**: Renderizado de interfaz, animaciones CSS/JS (60 FPS), gestión de estado de navegación y visualización de progreso.
- **Ventaja**: Permite crear diseños "Glassmorphism" complejos y fluidos con componentes reutilizables y ecosistema web maduro.

### 2. Backend Nativo (Rust via Tauri)

- **Tecnología**: Rust (Tauri v2 commands).
- **Responsabilidad**:
  - Operaciones de disco pesadas (Hashing de archivos).
  - Criptografía y Login seguro.
  - Comunicación directa Tauri IPC (Inter-Process Communication) con el frontend.
- **Ventaja**: Zero-GC (Sin recolección de basura), uso mínimo de RAM y seguridad de memoria.

### 3. Orquestador de Minecraft (Engine)

Lógica personalizada para iniciar el juego:

- Valida la integridad de los archivos (SHA1).
- Descarga dependencias (Librerías, Assets, JVM).
- Construye los argumentos de lanzamiento dinámicamente.
- Inyecta el **Game Bridge** (Agente).

## ⚡ Características Destacadas

### Descubrimiento de Activos (Smart Asset Discovery)

A diferencia de otros launchers custom que obligan a redescargar 5GB de assets:

1.  CrystalLauncher escanea tu instalación `.minecraft` vanilla.
2.  Detecta librerías y assets ya existentes.
3.  Crea **Symbolic Links** (o copias) en su directorio privado (`~/.crystaltides`).
    **Resultado**: La primera instalación toma segundos en lugar de minutos.

### Inyección de Agente

Al lanzar el juego, el launcher añade automáticamente el argumento `-javaagent:game-bridge.jar`. Esto permite que nuestro código se ejecute _dentro_ del proceso de Minecraft desde el segundo 0, habilitando comunicación bidireccional Launcher <-> Juego.

### Visor de Skins 3D

Integra un motor de renderizado WebGL (vía skinview3d) para previsualizar la skin del jugador en tiempo real. Soporta:

- Modelos Classic (Steve) y Slim (Alex).
- Capas externas (Hat, Jacket, Pants).
- Rotación interactiva y animaciones suaves.

## 📦 Suite Completa

El launcher se distribuye como una suite de 3 aplicaciones independientes:

| Módulo | Carpeta | Windows | Linux | macOS |
|--------|---------|---------|-------|-------|
| **CrystalTides Launcher** | `client/` | `.exe` / `.msi` | `.AppImage` / `.deb` | `.dmg` / `.app` |
| **CTLauncher Installer** | `installer/` | `.exe` / `.msi` | `.AppImage` / `.deb` | `.dmg` / `.app` |
| **CTLauncher Uninstaller** | `uninstaller/` | `.exe` / `.msi` | `.AppImage` / `.deb` | `.dmg` / `.app` |

## 🛠️ Desarrollo

### Estructura de Carpetas (`apps/launcher`)

- `client/`: Launcher principal (React + Tauri).
- `installer/`: Instalador personalizado con UI glassmórfica.
- `uninstaller/`: Desinstalador con temática de océano oscuro.

Cada módulo contiene:
- `src/`: Código React + TypeScript (frontend).
- `src-tauri/src/`: Código Rust (backend nativo).

### Requisitos

- Node.js 22+.
- Rust Toolchain (`cargo` + `rustup`).
- Tauri CLI (se instala automáticamente vía `npm`).

### Comandos

#### 1. Launcher Principal (`client`)
```bash
cd apps/launcher/client
npx tauri dev    # Modo desarrollo
npx tauri build  # Compilación de producción
```

#### 2. Instalador (`installer`)
```bash
cd apps/launcher/installer
npx tauri dev    # Modo desarrollo
npx tauri build  # Compilación de producción
```

#### 3. Desinstalador (`uninstaller`)
```bash
cd apps/launcher/uninstaller
npx tauri dev    # Modo desarrollo
npx tauri build  # Compilación de producción
```

---

_Ver también: [Game Agent](./GAME_AGENT.md)_
