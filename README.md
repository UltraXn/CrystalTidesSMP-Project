# CrystalTides SMP - Web

Bienvenido al repositorio oficial del sitio web de **CrystalTides SMP**.
Esta aplicación web sirve como el portal principal para la comunidad de nuestro servidor de Minecraft, permitiendo a los usuarios ver noticias, rankings, donaciones y gestionar su cuenta.

## 🚀 Tecnologías

Este proyecto está construido con un stack moderno y eficiente:

*   **Frontend:** [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
*   **Backend:** [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/)
*   **Base de Datos & Auth:** [Supabase](https://supabase.com/) (PostgreSQL)
*   **Estilos:** CSS Modules / Vanilla CSS personalizado
*   **Gestión de Paquetes:** npm

## 🛠️ Instalación y Configuración

Sigue estos pasos para levantar el proyecto en tu entorno local:

### 1. Prerrequisitos
*   Node.js (v18 o superior)
*   Git

### 2. Clonar el repositorio
```bash
git clone https://github.com/UltraXn/CrystalTidesSMP-Web.git
cd CrystalTidesSMP-Web
```

### 3. Instalar Dependencias
Hemos creado un comando útil para instalar todo de una vez (raíz, cliente y servidor):
```bash
npm run install:all
```

### 4. Configurar Variables de Entorno
Necesitas crear archivos `.env` en las carpetas `client` y `server`.

**En `client/.env`:**
```env
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_anon_key_de_supabase
```

**En `server/.env`:**
```env
PORT=3000
SUPABASE_URL=tu_url_de_supabase
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_de_supabase
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=crystaltides
```

### 5. Iniciar la Aplicación
Para correr tanto el cliente como el servidor al mismo tiempo:
```bash
npm start
```
*   Frontend: `http://localhost:5173`
*   Backend: `http://localhost:3000`

## 📁 Estructura del Proyecto

*   `/client`: Código fuente del Frontend (React).
*   `/server`: API REST y lógica del Backend (Express).
*   `/server/seed_donations.js`: Script para poblar la base de datos de donaciones.

## ✨ Características Principales
*   **Sistema de Cuentas:** Registro e inicio de sesión seguro.
*   **Muro de Donadores:** Carrusel y feed de últimas donaciones (integración Ko-Fi).
*   **Noticias y Blog:** Sistema para mantener informada a la comunidad.
*   **Diseño Responsivo:** Adaptado para móviles y escritorio.

---
Desarrollado con 💜 por **Neroferno Ultranix** para CrystalTides SMP.
