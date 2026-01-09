# CrystalTides Global TODO

## Próximas Tareas (Short-term)
- [ ] Migración de `web-client` a **Tailwind CSS 4**.
- [ ] Implementación de `WebSocketModule` en el plugin para reducir latencia del Bridge.
- [ ] Creación de diagramas de arquitectura detallados para el flujo de datos Rust-Java.

## Deuda Técnica
- [ ] **Tailwind Mismatch**: El `package.json` del cliente usa 3.4 mientras que la documentación de arquitectura menciona v4.
- [ ] **Bridge Polling**: Dependencia de polling en base de datos MySQL (2s de latencia).
- [ ] **Java Plugin Safety**: Posibles condiciones de carrera en el acceso asíncrono a perfiles de jugadores.
- [ ] **Secrets Exposure**: Limpieza de archivos `.env` y `.json` en el historial de Git (pendiente de auditoría profunda).


## Ideas & Backlog
- [ ] **Sistema Automatizado de Reporte de Crashes (Crystal Crash Pipeline)**:
    - [ ] **Launcher**: Detección automática de crasheos y envío de logs (Watchdog).
    - [ ] **Web Server**: Endpoint para ingesta de logs y creación automática de tickets.
    - [ ] **Análisis**: Parsing automático de excepciones comunes (OOM, Mod Conflicts).
    - [ ] **Analytics**: Implementación de DuckDB para análisis estadístico de fallos.

---
*Este archivo se mantiene sincronizado según la Regla 6 del proyecto.*
