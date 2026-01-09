# Task: Redocumentación del Ecosistema CrystalTides

## Estado Actual
- El repositorio es un monorepo con `apps/`, `packages/` y `plugins/`.
- El stack tecnológico es moderno (React 19, Tailwind 4, Vite 6, Turbo 2).
- Existe documentación dispersa en el repo y en un vault de Obsidian.

## Roadmap de Redocumentación
- [x] Crear/Actualizar `task.md` (Fuente de verdad). <!-- id: 0 -->
- [x] Corregir incoherencias tecnológicas (Vite vs Next.js) en Obsidian. <!-- id: 6 -->
- [x] Mapear estructura completa del monorepo y dependencias entre paquetes. <!-- id: 1 -->
- [x] Sincronizar y mejorar archivos de documentación en Obsidian (`f:\Abyssal Throughts\...`). <!-- id: 2 -->
- [x] Generar un PRD estandarizado para el sistema completo. <!-- id: 3 -->
- [x] Actualizar el `README.md` principal con la información más reciente del stack y arquitectura. <!-- id: 4 -->
- [x] Crear guías de desarrollo específicas para los componentes nuevos (Edge Functions, Scripts, etc.). <!-- id: 5 -->

## Deuda Técnica Identificada
- [ ] **Tailwind Mismatch**: El código usa v3.4 pero la documentación apunta a v4.
- [ ] **Polling Latency**: Los 2s de espera en el Bridge pueden sentirse lentos. Evaluar WebSockets.
- [ ] **Thread Safety**: Verificar comportamiento de caché asíncrona en el plugin Java.
- [ ] **Diagramas de Flujo**: Falta documentación visual del flujo de datos entre Launcher (Rust) y el Servidor.
