
# 💎 CrystalTides Master PRD (Product Requirement Document)

## 1. Visión General
CrystalTides es un ecosistema de software diseñado para potenciar servidores de Minecraft SMP mediante una integración profunda entre el juego, una plataforma web premium y servicios de comunidad (Discord). El objetivo es ofrecer una experiencia de usuario "High Fidelity" con interfaces modernas (Glassmorphism), rendimiento nativo y seguridad robusta.


---

## 2. Stack Tecnológico (Estado Actual)

El proyecto ha sido migrado a un stack "Bleeding Edge" para garantizar longevidad y rendimiento:

- **Frontend (Web Client)**: 
  - `React 19`, `Vite 6`, `TypeScript`.
  - `Tailwind CSS 4` (Estilos avanzados), `Framer Motion 12`, `GSAP` (Animaciones).
  - `React Router v7` (Navegación).
- **Backend (API Server)**: 
  - `Node.js`, `Express 5`, `TypeScript`.
  - `Supabase` (Auth, Realtime, DB Postgres).
- **Launcher (Native)**: 
  - `Flutter` (UI), `Rust` (Native Core DLL via Dart FFI).
- **Minecraft Plugin (CrystalCore)**: 
  - `Java 21`, `Paper API`.
- **Infraestructura**: 
  - `Turbo` (Monorepo Management), `Docker`, `Google Cloud Run` (Despliegue planeado).


---

## 3. Arquitectura del Sistema

### 3.1 Monorepo Structure

```bash
/
├── apps/
│   ├── web-client/         # React + Vite (Portal de Usuario)
│   ├── web-server/         # Express + Supabase (API Central)
│   ├── discord-bot/        # TypeScript + Bun (Sync & Moderación)
│   └── launcher/           # Flutter + Rust (Acceso al Juego)
├── plugins/
│   └── crystalcore/        # Plugin Java (Sincronización in-game)
├── packages/               # Configuraciones y tipos compartidos
└── docs/                   # Documentación técnica y procesos
```

### 3.2 Estrategia de Comunicación (Bridge)

- **Asíncrona (MySQL)**: Comandos de Gacha/Tienda encolados para ejecución resiliente.
- **Síncrona (Pterodactyl API)**: Acciones administrativas (Bans/Kicks) vía HTTP seguro.
- **Realtime (Supabase)**: Sincronización de estado de jugadores y notificaciones globales.

---

## 4. Auditoría y Seguridad

### ✅ Mitigaciones Implementadas

- **Sanitización de Nicks**: Implementado `sanitizeNick` para prevenir RCE en comandos de Minecraft.
- **Checks de Propiedad**: Resolución de vulnerabilidades IDOR en el sistema de tickets.
- **Auth Guard**: Validación de sesiones en todas las operaciones sensibles.

### ❌ Deuda Técnica de Seguridad (Prioridad Alta)

- **Verificación de Webhooks (Ko-Fi)**: Implementar validación de firmas.
- **Database Triggers**: Mover lógica de validación de roles de cliente a base de datos para evitar bypass.
- **API Bot Security**: Asegurar la comunicación interna del bot con tokens JWE/JWT.

---

## 5. Roadmap Estratégico Q1 2026

1. **Fase 1: Redocumentación Directa** (En proceso): Sincronización entre Obsidian y Repo.
2. **Fase 2: Unificación de Estilos**: Aplicar el lenguaje visual del Launcher a la Web mediante componentes Tailwind 4 compartidos.
3. **Fase 3: Despliegue GCP**: Migración completa a Cloud Run y Compute Engine.
4. **Fase 4: Storybook & Design System**: Documentación de componentes atómicos para escalabilidad.

---

### *Documento generado por Antigravity AI - Enero 2026*
