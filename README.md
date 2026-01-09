
# 🌊 CrystalTides Ecosystem

> **The High-Performance Minecraft SMP Middleware & Web Suite**

Bienvenido a **CrystalTides**, un ecosistema de software de grado industrial diseñado para fusionar la experiencia de juego en Minecraft con interfaces web modernas y núcleos nativos de alto rendimiento.

[![Ecosystem Status](https://img.shields.io/badge/Status-Active-brightgreen?style=for-the-badge)](./docs/MASTER_PRD.md)
[![Tech Stack](https://img.shields.io/badge/Stack-Bleeding%20Edge-blueviolet?style=for-the-badge)](./docs/MASTER_PRD.md)

---


## 🏗️ Arquitectura del Monorepo (Turbo-powered)

Este proyecto utiliza una estructura de **Monorepo** moderna con `Turbo` para gestionar múltiples aplicaciones y servicios con máxima coherencia tecnológica.

| Componente | Directorio | Status | Stack |
| :--- | :--- | :--- | :--- |
| **CrystalLauncher** | `apps/launcher` | 🚀 Beta | Flutter + Rust (Core DLL) |
| **Web Portal** | `apps/web-client` | 🎨 Dev | React 19 + Vite 6 + Tailwind 4 |
| **API Server** | `apps/web-server` | ⚡ Stable | Node.js + Express 5 + Supabase |
| **Discord Bot** | `apps/discord-bot` | 🤖 Dev | TypeScript + Bun |
| **CrystalCore** | `plugins/crystalcore` | 💎 Active | Java 21 + Paper API |


---

## ✨ Características de "Alto Nivel"

### 🦋 CrystalLauncher (The Commander)
- **Glassmorphism UI**: Interfaz fluida con animaciones a 144Hz y soporte para fondos dinámicos.
- **Hybrid Security**: Interfaz en Flutter comunicada con un núcleo en **Rust** (Pure Performance).
- **Insta-Update**: Lógica hot-patchable mediante scripts Lua incrustados.

### 🖥️ Ecosistema Web & Social
- **Real-Time Synergy**: Sincronización instantánea de skins 3D, estadísticas y rangos vía Supabase.
- **Staff Control Hub**: Administración integral con auditoría en tiempo real y Bridge de comandos.
- **Security-First**: Sanitización de nicks, mitigación IDOR y validación de tokens JWE.


---

## 🛠️ Guía de Desarrollo Rápido

### 1. Prerrequisitos
- **Node.js 20+** & **npm 10+**
- **Rust Up** (Toolchain `stable-x86_64-pc-windows-msvc`)
- **JDK 21** (Para el plugin CrystalCore)
- **Flutter SDK** (Canal Stable)

### 2. Inicialización
```bash
# Instalar dependencias del monorepo
npm install

# Compilar dependencias nativas
turbo run build
```

### 3. Ejecución en Desarrollo
```bash
# Web Client & API Server simultáneamente
npm run dev
```


---

## 📘 Documentación Centralizada

Toda la documentación estratégica y técnica se encuentra en la carpeta `/docs`:

- 📜 **[Master PRD (Estrategia)](./docs/MASTER_PRD.md)** - Visión global y arquitectura.
- 🏗️ **[Arquitectura Detallada](./docs/ARCHITECTURE.md)** - Flujos de datos y Bridge.
- ☁️ **[Guía de Despliegue GCP](./docs/GCP_DEPLOYMENT.md)** - DevOps y Serverless.
- 🛡️ **[Calidad y Estándares](./docs/CODE_QUALITY.md)** - Guía de estilo y testing.

---

Desarrollado con 💜 por el equipo de **CrystalTides**.
*"Bridging the gap between Minecraft and the Modern Web."*
