# 🌐 CrystalTides Web Client

El **Web Client** es el portal principal de interacción para los usuarios y la administración de CrystalTides. Construido con React 18 y Vite, enfocado en una experiencia visual premium ("High Fidelity UX") y rendimiento extremo.

## 🛠️ Stack Tecnológico

- **Core**: React 18, TypeScript, Vite.
- **Estilos**: Vanilla CSS Modules (Glassmorphism), `framer-motion` (Animaciones).
- **Gráficos**: `recharts` (Métricas), `skinview3d` (Renderizado 3D de Skins).
- **Estado**: React Context API + Local Storage.
- **Data Fetching**: Fetch nativo con interceptores JWT.

## 🧩 Módulos Principales

### 1. 📢 Portal Público (`src/pages/Home`, `/PublicProfile`)
- Landing page con diseño inmersivo.
- **Perfil Público**: Visualización 3D interactiva de la skin del jugador, vitrina de medallas y estadísticas en tiempo real.
- **Foros**: Sistema de comunidad con categorías, temas y respuestas enriquecidas.
- **Wiki**: Guías y tutoriales del servidor (Renderizado Markdown).

### 2. 🔐 Dashboard de Usuario (`/account`)
El panel de control personal para jugadores registrados.
- **Autenticación Híbrida**: Login con Discord (OAuth2) y vinculación segura con Minecraft.
- **Playstyle Radar**: Gráfico pentagonal que analiza el estilo de juego (Constructor, Luchador, Explorador, etc.) basado en datos del servidor.
- **Gestión de Sesión**: Vinculación de redes sociales y ajustes de privacidad.
- **Métricas**: Visualización de horas jugadas, economía (KilluCoins) y progreso.

### 3. 🛡️ Staff Hub (`/staff-hub`)
*Acceso restringido a roles administativos.*
- **Kanban Board**: Gestión de tareas y proyectos del equipo.
- **Gestor de Contenido**: CMS integrado para Noticias, Eventos y Encuestas.
- **Buscador Universal**: Command Palette (`Ctrl+K`) para acciones rápidas.

## 🚀 Instalación y Desarrollo

Este proyecto es parte del monorepo CrystalTides.

```bash
# Instalar dependencias (desde la raíz del monorepo)
npm install

# Iniciar en modo desarrollo (Hot Module Replacement)
# Puerto default: 5173
cd apps/web-client
npm run dev

# Construir para producción
npm run build
```

## 📂 Estructura del Proyecto

```
src/
├── assets/         # Imágenes, iconos y recursos estáticos
├── components/     # Componentes Reutilizables
│   ├── Account/    # Widgets del Dashboard (Radar, Stats)
│   ├── Auth/       # Formularios de Login/Registro
│   ├── Forum/      # Tarjetas y listas del foro
│   ├── Layout/     # Navbar, Footer, Sidebar
│   └── Widgets/    # UI Genérica (Botones, Inputs, Loaders)
├── context/        # React Contexts (Auth, Theme)
├── hooks/          # Custom Hooks (useAuth, useFetch)
├── pages/          # Vistas principales (Rutas)
├── services/       # Clientes API (Supabase, Backend)
└── App.tsx         # Router principal
```
