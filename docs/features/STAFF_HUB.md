# 🛡️ Staff Hub (Centro de Administración)

El **Staff Hub** es el panel centralizado diseñado para que el equipo de CrystalTides gestione las operaciones internas del servidor de forma eficiente y visual.

## 📋 Tablero Kanban (Gestión de Tareas)

Ubicación: `/admin` -> **Staff Hub** ([Componente](../client/src/components/Admin/StaffHub/KanbanBoard.tsx))

### Funcionalidades:

- **Columnas Dinámicas**: Organización clásica Kanban (Backlog, To Do, In Progress, etc.).
- **Gestión Avanzada**:
  - **Creación/Edición**: Modal premium con soporte para `due_date` y `end_date`.
  - **Validación**: Prevención de inconsistencias temporales (Time Travel protection).
- **Persistencia**: Sincronización en tiempo real con Supabase.

## 📅 Vista de Calendario (Planificación Temporal)

El Staff Hub incluye una vista de calendario avanzada ([Componente](../client/src/components/Admin/StaffHub/CalendarView.tsx)) para la gestión de cronogramas.

### Características:

- **Drag & Resize**: Permite mover tareas y ajustar su duración directamente en el calendario.
- **Sincronización Multi-plataforma**:
  - **Google Calendar**: Visualización de eventos externos y suscripción mediante iCal.
  - **Notion Integration**: Fetch directo de tareas desde bases de datos de Notion.
- **Backlog Inteligente**: Las ideas de la columna "Backlog" no aparecen en el calendario hasta tener una fecha asignada, manteniendo la vista limpia.

## ✨ Interfaz Premium (Glassmorphism)

Se ha implementado un sistema de diseño moderno enfocado en la experiencia de usuario:

- **Estética Crystal**: Uso de desfoque profundo (`backdrop-filter`) y sombras suaves.
- **Feedback Interactivo**: Micro-animaciones en tarjetas, botones y modales.
- **Indicadores Visuales**: Brillo dinámico (`glow`) según la prioridad de la tarea.

## 📌 Staff Notes (Muro de Notas)

Espacio de comunicación asíncrona mediante notas adhesivas digitales ([Componente](../client/src/components/Admin/StaffHub/StaffNotes.tsx)).

## 🔐 Seguridad y Acceso

- **Autorización**: Solo los usuarios con el rol `ADMIN` o `STAFF` en su perfil de Supabase pueden acceder a esta sección.
- **Middleware**: El backend utiliza un interceptor de roles para evitar que usuarios regulares vean o modifiquen datos internos.

---

_Documentación actualizada el 27 de diciembre de 2025._
