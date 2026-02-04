# 🗺️ CrystalTides SMP - Admin & Web Master Plan

Este documento centraliza el roadmap completo del proyecto, organizando las tareas `Por Hacer`, `En Progreso` y los módulos ya `Completados`.

## 🟢 Completado (Módulos Listos)

### ✅ Gestión y Staff

- [x] **Staff Hub**: Kanban Board y Notas Adhesivas.
- [x] **Gestión de Contenido**: Noticias, Eventos, Encuestas (CRUDs).
- [x] **Staff Cards Manager**: Constructor de cartas de presentación.
- [x] **Semáforo de Reclutamiento**: Widget de estado.
- [x] **Calendario Kanban**: Vista de calendario interactiva con gestión de duraciones.
- [x] **Google Calendar Sync**: Visualización de eventos externos en el Staff Hub.
- [x] **Notion Integration**: Sincronización de tareas desde espacios de trabajo de Notion.
- [x] **Premium UI/UX**: Rediseño completo con Glassmorphism y animaciones fluidas.
- [x] **Sincronización de Estado Dual**: Visualización en tiempo real de estado Minecraft y Discord (Staff Cards).

### ✅ Web Pública

- [x] **Página `/staff`**: Visualización del equipo.
- [x] **Perfil Público**: Skin 3D y Medallas.
- [x] **Buscador Global**: Command Palette (`Ctrl + K`).
- [x] **KilluCoin Gacha**: Minijuego con backend seguro y entrega asíncrona (MySQL).

### ✅ Funcionalidades Core

- [x] **Foros**: Categorías, Markdown, Comentarios.
- [x] **Encuestas**: Votaciones integradas.
- [x] **Notificaciones**: Centro de avisos en navbar.
- [x] **Seguridad**: Roles centralizados, Middleware de Auth, Docker Scout.
- [x] **Integraciones**: Webhooks de Discord y Minecraft, Consola Segura (Pterodactyl).
- [x] **Internacionalización**: Panel Admin Bilingüe (ES/EN).

---

## 🚧 En Progreso y Pendientes (Roadmap)

### 🚨 Prioridad: Infraestructura

- [x] **Rate Limiting**: Protección Anti-Spam en rutas críticas.
- [x] **Cabeceras de Seguridad**: Implementar Helmet.js.
- [x] **Validación Backend**: Esquemas estrictos (Zod/Joi).
- [x] **Dominio Personalizado**: Configuración de `crystaltidessmp.net` (Web) y `api` (Backend) con SSL Full Strict.
- [x] **CORS Production-Ready**: Configuración de seguridad para el nuevo dominio.

### 🚨 Alta Prioridad: Calidad de Código

- [ ] **Storybook**: Documentación visual de componentes UI (Design System) - _PRIORIDAD MÁXIMA_.
- [x] **Inferencia de tipos en Frontend**: Reutilizar esquemas Zod en React (react-hook-form).
  - [x] Admin Noticias (`NewsForm` refactorizado)
  - [x] Login/Register
  - [x] Tickets
    - [x] Crear esquema Zod para tickets (`client/src/schemas/ticket.ts`)
    - [x] Refactorizar formulario de tickets con react-hook-form
  - [x] Perfil de Usuario
    - [x] Crear esquema Zod para usuario (`client/src/schemas/user.ts`)
    - [x] Refactorizar formulario de edición de perfil con react-hook-form
  - [x] Sugerencias (Nuevo)
    - [x] Crear esquema y refactorizar formulario.

### ⚙️ Configuración del Sitio (Fase 1)

- [x] **Broadcast & Hero Manager**: Gestores de alertas y banner.
- [ ] **Debug Hero Slides**: Revisar funcionalidad de carrusel (Baja Prioridad).
- [x] **Gestor de Donadores**: Carrusel dinámico.
- [x] **Reglas Interactivas (Editor)**: Página `/rules` dinámica con gestión desde el panel.
- [x] **Editor de Políticas**: `/privacy` y `/tos`.

### 👤 Perfiles y Social (Fase 6)

- [x] **Perfiles Avanzados**: Estadísticas reales y personalización (Bio/Redes).
- [x] **Premium Social UI**: Banner personalizable, posado dinámico en skin 3D y sistema de reputación.
- [x] **Muro de Comentarios**: Mensajes en perfiles.
- [ ] **Marcos de Perfil (Avatar Frames)**: Cosméticos circulares para el avatar del usuario.
- [x] **Selector de Avatar**: Opción para elegir entre Avatar Web (Discord) o Skin de Minecraft.
- [x] **Wiki / Gamepedia**: Sección de guías.

### 🎨 UX/UI y Diseño

- [ ] **Verificación de Dispositivos**: Revisar diseño responsivo en Tablet y Móvil (Web y Admin). (En progreso: Fixed Navbar mobile name & Support buttons).

### 🔗 Integración Profunda (Fase 8)

- [x] **Sincronización de Rangos**: MC <-> Discord.
- [ ] **Requisito de Cuenta Vinculada**: Para tickets o gacha.
- [ ] **Integración Economía Real**: Vault bidireccional.

### 🏗️ Mantenimiento Profesional (Fase 7)

- [x] **Configuración Unificada**: ESLint/Prettier compartido y tipos compartidos en `@crystaltides/shared`.

- [x] **Turborepo**: Estructura de monorepo unificada (`apps/`, `plugins/`, `packages/`).
- [x] **Unificación de Proyectos**: Web, Launcher y Plugin CrystalCore integrados en el mismo workspace.
- [ ] **Discord Bot (Premium)**:
  - 📄 Ver roadmap detallado en [`TODO_DISCORD_BOT.md`](./TODO_DISCORD_BOT.md)
  - [/] Infraestructura base y Docker (Hecho).
  - [x] **Asignación de Roles**: Sincronización Web -> Discord.
- [ ] **Mapa Dinámico**: Integración de Dynmap.
- [ ] **Porteo de Mods (1.21.1)**: Ver lista detallada en [`MODS_PORTING.md`](./MODS_PORTING.md)
- [ ] **Tope Dinámico para "Mercader"**: Ajustar el 100% del Playstyle Radar basado en la economía total del servidor (Inflación-aware).

### ☁️ Infraestructura Futura (VPS)

- [ ] **VPS Dedicado**: Migración del servidor de juego a infraestructura propia (Futuro).
- [x] **Dockerización Pro**: Uso de Google Artifact Registry para imágenes de apps (`pkg.dev`).
- [x] **CI/CD**: Automatización de despliegue mediante GitHub Actions.

---

## 🚀 Notas de Mantenimiento

- [x] **Higiene de Dependencias**: `npm audit fix` ejecutado (0 vulnerabilidades).
- [x] **Monitoreo de Imágenes Base**: Verificado uso de `node:22-alpine`, `oven/bun:1` y `nginx:alpine` (Versiones mantenidas).
- [x] **Overrides de Seguridad**: `package.json` protegido.

### 🔒 Seguridad Avanzada (Fase 9)

- [ ] **Confirmación Destructiva**: Requerir 2FA o contraseña para comandos críticos (ban/stop/op) desde la web.
- [x] **Whitelist de Comandos**: Lista blanca estricta para comandos web.
- [x] **Auditoría Web**: Logs inmutables de acciones administrativas.

### 🧹 Deuda Técnica (Post-Auditoría Context7)

- [x] **Migración a React Router v7**: Cambiar imports de `react-router-dom` a `react-router` y adoptar `createBrowserRouter` (40+ archivos afectados). (Arquitectura implementada)
- [x] **Unificación de Íconos**: Reemplazar `react-icons` por `lucide-react` para reducir bundle size y tener consistencia visual. (Completado)
- [x] **Limpieza de Animaciones**: Evaluar eliminación de `GSAP` en favor de `framer-motion` si no se usan timelines complejos. (Eliminado)
- [x] **Soporte Nativo HTML Head**: Reemplazar `react-helmet` (si existe) por soporte nativo de React 19 (`<title>`, `<meta>`). (React 19 Nativo)

### 🧪 Futuro: Stack Tecnológico & "Wow" Features (2026)

Esta sección define el "Siguiente Nivel" para profesionalizar el portfolio al máximo.

#### Frontend & UX

- [x] **TanStack Query**: Migrar data-fetching para mejor caché y UX. (Migración Admin Panel Completada)
- [x] **Zustand**: Gestión de estado global ligera y moderna. (Instalado v5.0.9)
- [x] **Live Dashboard**: Implementar **Supabase Realtime** para actualizaciones instantáneas (Chat/Donaciones).
- [ ] **Live Activity Feed ("El Pulso")**: Stream en tiempo real de logros, eventos y donaciones en la web.
- [ ] **Mapa 3D Integrado**: Embed de **BlueMap** dentro del dashboard de usuario.

#### DevOps & Mantenimiento

- [x] **Husky + Commitlint**: Estandarizar commits (`feat:`, `fix:`) antes de subir código. (Configurado)
- [ ] **Renovate Bot**: Automatización de actualizaciones de dependencias (`npm`).

#### Observabilidad & Analítica

- [ ] **Sentry**: Monitorización de errores en tiempo real (Backend/Frontend).
- [ ] **PostHog**: Analítica de producto (Mapas de calor, Grabación de sesiones).
  - _Nota_: Requiere Banner de Cookies/Privacidad (GDPR).

#### Seguridad

- [x] **2FA (TOTP)**: Autenticación de dos factores para el Panel de Admin.

> Última actualización: 10 de Enero, 2026
