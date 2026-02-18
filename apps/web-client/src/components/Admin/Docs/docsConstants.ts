import { 
    Book, Megaphone, Shield, ClipboardList, Terminal, 
    Gamepad2, List
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';

export const ICON_MAP: Record<string, LucideIcon> = {
    'intro': Book,
    'security': Shield,
    'staff-hub': ClipboardList,
    'moderation': Shield,
    'discord': Megaphone,
    'audit': List,
    'console': Terminal,
    'content': Megaphone,
    'gamification': Gamepad2
};

export interface AdminDoc {
    id: string;
    title: string;
    content: string;
}

export const getDefaults = (t: any) => [
    {
        id: 'intro',
        title: t('admin.docs.titles.intro', 'Introducción'),
        content: `
# ${t('admin.docs.titles.intro', 'Introducción')}

${t('admin.docs.content.intro_msg', 'Bienvenido al centro de control. Desde aquí puedes gestionar casi todos los aspectos del servidor y la comunidad.')}

⚠️ **${t('admin.docs.content.warning_title', 'Advertencia')}**: ${t('admin.docs.content.warning_msg', 'Las acciones realizadas aquí tienen impacto directo en el juego y la base de datos en vivo. Úsalas con responsabilidad.')}
        `
    },
    {
        id: 'security',
        title: t('admin.docs.titles.security', 'Seguridad (2FA)'),
        content: `
# 🛡️ ${t('admin.docs.titles.security', 'Seguridad (2FA)')}

${t('admin.docs.content.security_desc', 'Protección de acceso al panel administrativo.')}

### 🔐 ${t('admin.docs.titles.security', '2FA')}
- **TOTP**: ${t('admin.docs.content.security_2fa', 'El Panel requiere Autenticación de Dos Factores (TOTP) para acceder a funciones críticas.')}
- **Tokens**: ${t('admin.docs.content.security_tokens', 'Se emite un Token de Admin temporal tras la verificación válida.')}
        `
    },
    {
        id: 'staff-hub',
        title: t('admin.docs.titles.staff_hub', 'Staff Hub'),
        content: `
# 📋 ${t('admin.docs.titles.staff_hub', 'Staff Hub')}

${t('admin.docs.content.staff_intro', 'Herramientas para la organización interna del equipo.')}

### 📋 Kanban Board (Tareas)
${t('admin.docs.content.kanban_desc', 'Un tablero de gestión de proyectos simple.')}
- **To Do**: ${t('admin.docs.content.kanban_todo', 'Tareas pendientes.')}
- **In Progress**: ${t('admin.docs.content.kanban_progress', 'En lo que se está trabajando actualmente.')}
- **Done**: ${t('admin.docs.content.kanban_done', 'Tareas finalizadas.')}

### 📝 ${t('admin.docs.content.notes_title', 'Notas de Staff')}
${t('admin.docs.content.notes_desc', 'Un muro de post-its compartidos. Úsalo para dejar recordatorios rápidos.')}
        `
    },
    {
        id: 'moderation',
        title: t('admin.docs.titles.moderation', 'Moderación & Usuarios'),
        content: `
# 👮 ${t('admin.docs.titles.users_manage', 'Gestión de Usuarios')}

### Users Manager
${t('admin.docs.content.users_desc', 'Lista completa de usuarios registrados y control de staff.')}
- **Roles**: Asignar roles (Admin, Staff, Developer) con jerarquía protegida.
- **Auditoría**: Cada cambio de rol queda registrado en los logs.

### 🎟️ Tickets System (Soporte)
Centro de soporte avanzado para la comunidad. 
- **Modales Premium**: Interfaz mejorada con Portals para evitar errores visuales (z-index).
- **Gestión**: Prioriza, asigna y resuelve dudas de los usuarios en tiempo real.
        `
    },
    {
        id: 'discord',
        title: t('admin.docs.titles.discord', 'Integración Discord'),
        content: `
# 🤖 ${t('admin.docs.titles.discord', 'Integración Discord')}

${t('admin.docs.content.discord_desc', 'Sincronización entre la web y la comunidad de Discord.')}

### 🔗 ${t('admin.docs.content.discord_linking', 'Vinculación')}
- **Sync**: Los roles de Discord se sincronizan automáticamente con la cuenta web.

### 📢 ${t('admin.docs.content.discord_announcements', 'Anuncios')}
- **Noticias**: Al publicar una noticia, se envía automáticamente un aviso al canal configurado en Discord.
        `
    },
    {
        id: 'audit',
        title: t('admin.docs.titles.audit', 'Logs de Auditoría'),
        content: `
# 📝 ${t('admin.docs.titles.audit', 'Logs de Auditoría')}

${t('admin.docs.content.audit_desc', 'Registro histórico de todas las acciones administrativas.')}

- **Transparencia**: Registra quién, cuándo y qué cambió (Roles, Configuración, Gamificación).
- **Seguridad**: Los logs son inmutables para garantizar la integridad del equipo.
        `
    },
    {
        id: 'console',
        title: t('admin.docs.titles.console', 'Consola & Comandos'),
        content: `
# 💻 ${t('admin.docs.titles.console_bridge', 'Consola Remota (Secure Bridge)')}

${t('admin.docs.content.console_desc', 'Ejecuta comandos en el servidor de Minecraft en tiempo real.')}

### 🔥 Seguridad de Acciones
- **Premium Confirmation**: Toda acción destructiva (Kick, Ban total) requiere confirmación mediante el nuevo sistema de seguridad visual.
        `
    },
    {
        id: 'content',
        title: t('admin.docs.titles.content', 'Gestión de Contenido'),
        content: `
# 📢 ${t('admin.docs.titles.content_web', 'Contenido Web')}

### 📝 Noticias & Encuestas
Editor de Markdown integrado para publicar anuncios ricos y votaciones interactivas para los jugadores.

### 🛰️ Broadcasts
Mensajes emergentes globales en la parte superior de la web para avisos de mantenimiento o eventos inminentes.
        `
    },
    {
        id: 'gamification',
        title: t('admin.docs.titles.gamification', 'Gamificación (Medallas)'),
        content: `
# 🏆 Sistema de Medallas Premium

Gestión visual completa de los logros y medallas del servidor.

### 🏅 Medal Definitions
- **Upload Directo**: Ahora puedes subir imágenes personalizadas directamente desde el panel (vía Supabase Storage).
- **Control de Estética**: Ajuste de colores dinámicos y previsualización en tiempo real.
- **Iconografía**: Soporte para cientos de iconos de React Icons o archivos PNG/WebP personalizados.

### 🔒 Confirmaciones
Sistema de eliminación protegido con modales animados para evitar pérdidas accidentales de definiciones de medallas.
        `
    }
];
