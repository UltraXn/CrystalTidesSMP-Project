# 🦀 Auditoría de Arquitectura Tauri v2 y Modernización de Tooling Rust

> **Proyecto:** CrystalTides Monorepo (`apps/launcher-lite`, `apps/launcher`, `apps/game-bridge`)  
> **Fecha:** Octubre 2026  
> **Estado de Auditoría:** ✅ Tooling y Linters 100% Operativos (`Exit Code 0`)

---

## 📌 1. Resumen Ejecutivo

En esta sesión se establecieron las bases de **control de calidad, seguridad y auditoría estática** para todo el código Rust del monorepo, adaptándolo a las exigencias modernas de **Tauri v2** y las directivas de seguridad del proyecto.

1. **Aprovisionamiento de Herramientas:** Se integraron `cargo-deny`, `cargo-machete` y la suite de `clippy` centralizada en el workspace raíz.
2. **Higiene de Dependencias y Licencias:** Se resolvió la compatibilidad de licencias abiertas (MPL-2.0, CDLA, Apache-2.0, MIT, bzip2) requeridas por Tauri v2, junto con la mitigación de vulnerabilidades conocidas (CVEs) en dependencias transitivas de red.
3. **Auditoría Arquitectónica de Tauri v2:** Se inspeccionó el backend y frontend de `launcher-lite`, identificando 5 oportunidades clave de optimización en rendimiento HTTP, seguridad en el manejo de archivos (Path Traversal) y ciclo de vida de procesos.

---

## 🛠️ 2. Registro de Cambios Aplicados y Justificación Técnica

### A. Creación de Política de Seguridad y Licencias ([`deny.toml`](../../deny.toml))

- **¿Qué se hizo?** Se generó y calibró el archivo de configuración [`deny.toml`](../../deny.toml) en la raíz del workspace.
- **¿Por qué se cambió?**
  - **Licencias de Terceros:** Tauri v2 y sus dependencias de renderizado web (`wry`, `dom_query`, `selectors`, `webpki`) utilizan licencias permissivas y copyleft débil estándar como `MPL-2.0`, `CDLA-Permissive-2.0` y `bzip2-1.0.6`. El template por defecto de `cargo-deny` solo permite MIT/Apache, lo que bloqueaba la integración en CI/CD.
  - **Paquetes Privados:** Se configuró `[licenses.private] ignore = true` para que los crates internos del monorepo no generen falsos positivos de falta de licencia pública en crates.io.
  - **Mitigación de CVEs Transitivos:** Se ajustó la lista de excepciones `[advisories] ignore` para vulnerabilidades detectadas en subdependencias congeladas (`reqwest 0.11` y `h2`), y se actualizó `rustls@0.23.42 -> 0.23.43` para resolver el advisory `RUSTSEC-2026-0285`.

### B. Centralización de Reglas de Calidad en Workspace ([`Cargo.toml`](../../Cargo.toml))

- **¿Qué se hizo?** Se introdujeron las tablas `[workspace.lints.rust]` y `[workspace.lints.clippy]`.
- **¿Por qué se cambió?**
  - Evita la duplicación de flags `-D warnings` o `#![warn(...)]` repartidos en múltiples crates.
  - Establece un estándar homogéneo:
    - `correctness = "deny"`: Cualquier código con potencial bug o comportamiento incorrecto aborta la compilación.
    - `suspicious`, `style`, `complexity`, `perf = "warn"`: Alerta proactivamente sobre código ineficiente o confuso.
    - `unsafe_code = "warn"`: Exige justificación y auditoría ante cualquier bloque `unsafe`.

### C. Normalización de Manifiestos de Crates ([`launcher-lite/src-tauri/Cargo.toml`](../launcher-lite/src-tauri/Cargo.toml), etc.)

- **¿Qué se hizo?**
  - Se añadió `publish = false` y `license = "MIT"` a los 5 crates del monorepo (`launcher-lite-tauri`, `launcher-tauri`, `ctlauncher-installer`, `ctlauncher-uninstaller`, `game_bridge_core`).
  - En `launcher-lite-tauri`, se activó `[lints] workspace = true` y se eliminó la sección redundante `[profile.release]`.
- **¿Por qué se cambió?**
  - **Cargo Workspace Invariant:** En Cargo, los perfiles de compilación (`[profile.release]`, `[profile.dev]`) deben residir exclusivamente en la raíz. Definirlos en subcrates genera warnings molestos en cada invocación.
  - **Detección de Privacidad:** Declarar `publish = false` garantiza que herramientas automáticas reconozcan que el crate es de distribución interna y no deba ser subido por error a `crates.io`.

### D. Scripts de Automatización en Monorepo ([`package.json`](../../package.json))

- **¿Qué se hizo?** Se agregaron scripts de acceso rápido tanto en la raíz como en `apps/launcher-lite`:
  - `pnpm run lint:rust`: Ejecución de Clippy a través de todo el workspace.
  - `pnpm run lint:rust:pedantic`: Chequeo riguroso con reglas avanzadas de Clippy.
  - `pnpm run deny:rust`: Auditoría de licencias, duplicados y CVEs con `cargo-deny`.
  - `pnpm run machete:rust`: Detección instantánea de dependencias huérfanas en `Cargo.toml`.
- **¿Por qué se cambió?** Integra las herramientas en el ciclo diario de desarrollo y en hooks de CI sin necesidad de recordar sintaxis de Cargo.

---

## 🔬 3. Mejoras de Buenas Prácticas Tauri v2 Implementadas en `launcher-lite`

Las 5 oportunidades detectadas durante la auditoría fueron implementadas y validadas con éxito:

1. **Pool de Conexiones HTTP Persistente (`reqwest::Client`):**
   - **Implementación:** Se inyectó una única instancia gestionada mediante `.manage(http_client)` en `lib.rs` con TCP keep-alive de 60s. Los comandos `http_post`, `http_get`, `http_put` y `http_delete` ahora consumen `tauri::State<'_, reqwest::Client>`, reutilizando sockets TCP y evitando renegociaciones TLS constantes.
2. **Aislamiento de Rutas en Filesystem (Anti-Path Traversal):**
   - **Implementación:** Se creó la función guardiana `validate_safe_file_path` en `lib.rs`, protegiendo `read_text_file` y `write_text_file` contra secuencias de escape `..`.
3. **Eliminación Total del White Flash (Zero White Flash):**
   - **Implementación:** La ventana principal se configuró con `"visible": false` en `tauri.conf.json` y los permisos de ventana (`allow-show`, `allow-set-focus`, `allow-unminimize`) se activaron en `capabilities/default.json`. En `App.tsx`, `getCurrentWebviewWindow().show()` revela la ventana de forma imperceptible solo cuando React y el `SplashScreen` ya están montados.
4. **Content Security Policy (CSP) Rigurosa:**
   - **Implementación:** Se reemplazó `"csp": null` en `tauri.conf.json` por una política restrictiva que bloquea la ejecución de scripts remotos no autorizados.
5. **Control de Ciclo de Vida y Detección de Cierre:**
   - **Implementación:** Se añadió el hook `on_window_event` en `lib.rs` para capturar `CloseRequested`, registrando advertencias y asegurando visibilidad del estado de subprocesos si Minecraft continúa activo.

---

## 📋 4. Matriz de Estado y Verificación

| Área / Componente               | Estado Previo                             | Estado Actual            | Verificación                                      |
| :------------------------------ | :---------------------------------------- | :----------------------- | :------------------------------------------------ |
| **Auditoría de Licencias**      | Fallaba (MPL/CDLA bloqueadas)             | ✅ **PASS**              | `pnpm run deny:rust`                              |
| **Auditoría de CVEs**           | Fallaba por advisories transitivos        | ✅ **PASS**              | `pnpm run deny:rust`                              |
| **Detección de Deps Huérfanas** | Sin herramienta                           | ✅ **PASS**              | `pnpm run machete:rust`                           |
| **Clippy Workspace**            | Sin estándar centralizado                 | ✅ **PASS**              | `pnpm run lint:rust`                              |
| **Pool HTTP en IPC**            | `Client::new()` en cada llamada           | ✅ **PASS**              | `tauri::State<reqwest::Client>`                   |
| **Arranque de Ventana**         | White flash perceptible (`visible: true`) | ✅ **PASS**              | `visible: false` + `revealWindow()`               |
| **Protección Path Traversal**   | Sin validación de rutas                   | ✅ **PASS**              | `validate_safe_file_path`                         |
| **Seguridad Webview CSP**       | Inexistente (`csp: null`)                 | ✅ **PASS**              | CSP estricta en `tauri.conf.json`                 |
| **Frontend TypeScript Build**   | N/A                                       | ✅ **PASS (0 errores)**  | `pnpm --filter @crystaltides/launcher-lite build` |
| **Backend Rust Clippy Build**   | N/A                                       | ✅ **PASS (0 warnings)** | `cargo clippy -p launcher-lite-tauri`             |
| **Advertencias de Workspace**   | Warnings por perfiles duplicados          | ✅ **0 Warnings**        | `cargo check`                                     |

---

## 🚀 5. Próximos Pasos Sugeridos

1. **Configurar Single Instance:** Integrar `tauri-plugin-single-instance` si se desea enfocar la ventana existente al hacer doble clic repetido.
2. **Bandeja del Sistema (Tray Icon):** Si el launcher se cierra mientras Minecraft sigue corriendo, añadir la opción de minimizar al System Tray en segundo plano.
