# 🦋 CrystalLauncher

**CrystalLauncher** es la puerta de entrada exclusiva al ecosistema CrystalTides. No es solo un lanzador, es una plataforma integrada construida con **Flutter** (Frontend) y **Rust** (Backend) que garantiza rendimiento, seguridad y una experiencia de usuario premium.

## 🏗️ Arquitectura Híbrida

El launcher utiliza un diseño de procesos desacoplados para combinar lo mejor de dos mundos:

### 1. Frontend (Flutter UI)
- **Tecnología**: Flutter (Dart) para Windows Desktop.
- **Responsabilidad**: Renderizado de interfaz, animaciones Rive (60 FPS), gestión de estado de navegación y visualización de progreso.
- **Ventaja**: Permite crear diseños "Glassmorphism" complejos y fluidos que serían imposibles en Swing (Java) o pesados en Electron.

### 2. Backend Nativo (Rust Core)
- **Tecnología**: Rust (crate `native`).
- **Responsabilidad**:
    - Operaciones de disco pesadas (Hashing de archivos).
    - Criptografía y Login seguro.
    - Comunicación FFI (Foreign Function Interface) con Flutter.
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
3.  Crea **Symbolic Links** (o copias) en su directorio privado.
**Resultado**: La primera instalación toma segundos en lugar de minutos.

### Inyección de Agente
Al lanzar el juego, el launcher añade automáticamente el argumento `-javaagent:game-bridge.jar`. Esto permite que nuestro código se ejecute *dentro* del proceso de Minecraft desde el segundo 0, habilitando comunicación bidireccional Launcher <-> Juego.

## 🛠️ Desarrollo

### Estructura de Carpetas (`apps/launcher`)
- `lib/`: Código Dart/Flutter.
- `native/`: Código Rust.
- `windows/`: Runner de C++ para Windows.

### Requisitos
- Flutter SDK.
- Rust Toolchain (`cargo`).
- Visual Studio C++ (Build Tools).

---
*Ver también: [Game Bridge](./GAME_BRIDGE.md)*
