import { useState, useEffect } from 'react';
import { LucideIcon } from 'lucide-react';
import { 
    Book, Megaphone, Shield, ClipboardList, Terminal, 
    Gamepad2, ChevronDown, Edit, Save, X, List, Undo2,
    Image, Loader2
} from 'lucide-react';
import MarkdownRenderer from '../UI/MarkdownRenderer';
import PremiumConfirm from '../UI/PremiumConfirm';
import PremiumAlert from '../UI/PremiumAlert';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../services/supabaseClient';
import { uploadImage as uploadImageSecure } from '../../services/uploadService';
import { getAuthHeaders } from '../../services/adminAuth';
import "../../styles/admin/admin_docs.css";

const API_URL = import.meta.env.VITE_API_URL;

const ICON_MAP: Record<string, LucideIcon> = {
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

const useDocsDefaults = () => {
    const { t } = useTranslation();
    
    return [
    {
        id: 'intro',
        title: t('admin.docs.titles.intro', 'Introducción'),
        icon: Book,
        content: `
# ${t('admin.docs.titles.intro', 'Introducción')}

${t('admin.docs.content.intro_msg', 'Bienvenido al centro de control. Desde aquí puedes gestionar casi todos los aspectos del servidor y la comunidad.')}

⚠️ **${t('admin.docs.content.warning_title', 'Advertencia')}**: ${t('admin.docs.content.warning_msg', 'Las acciones realizadas aquí tienen impacto directo en el juego y la base de datos en vivo. Úsalas con responsabilidad.')}
        `
    },
    {
        id: 'security',
        title: t('admin.docs.titles.security', 'Seguridad (2FA)'),
        icon: Shield,
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
        icon: ClipboardList,
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
        icon: Shield,
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
        icon: Megaphone,
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
        icon: List,
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
        icon: Terminal,
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
        icon: Megaphone,
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
        icon: Gamepad2,
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
};

interface AdminDoc {
    id: string;
    title: string;
    content: string;
}

interface AdminDocsProps {
    mockDocs?: AdminDoc[];
}

export default function AdminDocs({ mockDocs }: AdminDocsProps = {}) {
    const { t } = useTranslation();
    const defaults = useDocsDefaults();
    const [docs, setDocs] = useState<AdminDoc[]>(mockDocs || []);
    const [activeTab, setActiveTab] = useState('intro');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState('');
    const [loading, setLoading] = useState(!mockDocs);
    const [saving, setSaving] = useState(false);
    const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
    const [alertConfig, setAlertConfig] = useState<{ isOpen: boolean, message: string, variant: 'error' | 'success' }>({
        isOpen: false,
        message: '',
        variant: 'success'
    });
    const [uploading, setUploading] = useState(false);

    // Fetch docs from DB
    useEffect(() => {
        let ignore = false;
        const fetchDocs = async () => {
             if (mockDocs) return; // Use mocked docs
            try {
                const { data: { session } } = await supabase.auth.getSession();
                const res = await fetch(`${API_URL}/settings/admin_docs`, {
                    headers: getAuthHeaders(session?.access_token || null)
                });
                if (res.ok) {
                    const data = await res.json();
                    if (!ignore) {
                        if (data && data.value) {
                            const parsed = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
                            setDocs(parsed);
                        } else {
                            setDocs(defaults);
                        }
                    }
                } else if (!ignore) {
                    setDocs(defaults);
                }
            } catch (err) {
                console.error("Error fetching docs:", err);
                if (!ignore) setDocs(defaults);
            } finally {
                if (!ignore) setLoading(false);
            }
        };
        fetchDocs();
        return () => { ignore = true; };
    }, [defaults, mockDocs]);

    const activeDoc = docs.find(d => d.id === activeTab) || docs[0] || defaults[0];

    useEffect(() => {
        if (activeDoc) setEditContent(activeDoc.content);
    }, [activeDoc]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const updatedDocs = docs.map(d => 
                d.id === activeTab ? { ...d, content: editContent } : d
            );

            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch(`${API_URL}/settings/admin_docs`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders(session?.access_token || null)
                },
                body: JSON.stringify({ 
                    value: JSON.stringify(updatedDocs),
                    userId: session?.user?.id,
                    username: session?.user?.user_metadata?.username || 'Admin'
                })
            });

            if (!res.ok) throw new Error('Failed to save');
            
            setDocs(updatedDocs);
            setIsEditing(false);
        } catch (err) {
            console.error("Error saving docs:", err);
            setAlertConfig({
                isOpen: true,
                message: t('admin.docs.save_error'),
                variant: 'error'
            });
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        setIsResetConfirmOpen(true);
    };

    const executeReset = () => {
        const defaultDoc = defaults.find(d => d.id === activeTab);
        if (defaultDoc) setEditContent(defaultDoc.content);
        setIsResetConfirmOpen(false);
    };

    const handleImageUpload = async (file: File) => {
        setUploading(true);
        try {
            // Server-validated upload (magic bytes checked in backend)
            const publicUrl = await uploadImageSecure(file, 'admin-assets', 'docs');

            // Insert markdown at cursor or end
            const imageMarkdown = `\n![Image](${publicUrl})\n`;
            setEditContent(prev => prev + imageMarkdown);
            
            setAlertConfig({
                isOpen: true,
                message: t('admin.docs.image_uploaded', 'Imagen subida correctamente'),
                variant: 'success'
            });
        } catch (err) {
            console.error("Error uploading image:", err);
            setAlertConfig({
                isOpen: true,
                message: t('admin.docs.upload_error', 'Error al subir la imagen'),
                variant: 'error'
            });
        } finally {
            setUploading(false);
        }
    };

    if (loading) return <div style={{ color: '#aaa', padding: '2rem' }}>{t('admin.docs.loading')}</div>;

    const ActiveIcon = ICON_MAP[activeDoc?.id] || Book;

    return (
        <div className="admin-docs-container">
            
            {/* Desktop Sidebar */}
            <div className="docs-sidebar">
                <h3 style={{ padding: '0 1rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'var(--muted)' }}>{t('admin.docs.index')}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1rem 0' }}>
                    {docs.map(doc => {
                        const Icon = ICON_MAP[doc.id] || Book;
                        return (
                            <button aria-label="Action" type="button"
                                key={doc.id}
                                onClick={() => { setActiveTab(doc.id); setIsEditing(false); }}
                                className={`sidebar-btn ${activeTab === doc.id ? 'active' : ''}`}
                            >
                                <Icon />
                                {doc.title}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Mobile Dropdown */}
            <div className="mobile-dropdown-container">
                <button aria-label="Action" type="button" 
                    className="mobile-dropdown-btn"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                        <ActiveIcon color="var(--accent)" /> {activeDoc.title}
                    </span>
                    <ChevronDown style={{ transform: mobileMenuOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
                </button>
                
                {mobileMenuOpen && (
                    <div className="mobile-dropdown-list">
                        {docs.map(doc => {
                            const Icon = ICON_MAP[doc.id] || Book;
                            return (
                                <button
                                    type="button"
                                    key={doc.id}
                                    className={`mobile-dropdown-item ${activeTab === doc.id ? 'active' : ''}`}
                                    onClick={() => {
                                        setActiveTab(doc.id);
                                        setMobileMenuOpen(false);
                                        setIsEditing(false);
                                    }}
                                >
                                    <Icon /> {doc.title}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Área de Contenido */}
            <div className="docs-content">
                <div className="docs-card">
                    <div className="docs-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <ActiveIcon size={30} color="var(--accent)" />
                            <h2 style={{ margin: 0, fontSize: '1.8rem' }}>{activeDoc.title}</h2>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {isEditing ? (
                                <>
                                    <button type="button" onClick={handleReset} className="btn-secondary" style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)' }} title={t('admin.docs.reset')}>
                                        <Undo2 />
                                    </button>
                                    <button type="button" onClick={() => setIsEditing(false)} className="btn-secondary" style={{ color: '#ef4444' }}>
                                        <X /> {t('admin.actions.cancel')}
                                    </button>
                                    <button type="button" onClick={handleSave} className="btn-primary" disabled={saving}>
                                        <Save /> {saving ? t('admin.docs.saving') : t('admin.actions.save')}
                                    </button>
                                </>
                            ) : (
                                <button type="button" onClick={() => setIsEditing(true)} className="btn-primary" style={{ background: 'rgba(22, 140, 128, 0.2)', border: '1px solid var(--accent)', color: 'var(--accent)' }}>
                                    <Edit /> {t('admin.docs.edit_section')}
                                </button>
                            )}
                        </div>
                    </div>
                    
                    {isEditing ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
                            <div className="editor-toolbar" style={{ 
                                display: 'flex', 
                                gap: '0.5rem', 
                                padding: '0.5rem', 
                                background: 'rgba(255,255,255,0.02)', 
                                border: '1px solid rgba(255,255,255,0.05)', 
                                borderRadius: '8px' 
                            }}>
                                <label className="btn-icon-premium" style={{ cursor: 'pointer', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                                    {uploading ? <Loader2 className="spin" /> : <Image />}
                                    {uploading ? t('common.uploading', 'Subiendo...') : t('admin.docs.upload_image', 'Subir Imagen')}
                                    <input aria-label={t('admin.docs.upload_image', 'Subir Imagen')} 
                                        type="file" 
                                        accept="image/*" 
                                        style={{ display: 'none' }} 
                                        disabled={uploading}
                                        onChange={(e) => {
                                            if (e.target.files?.[0]) handleImageUpload(e.target.files[0]);
                                        }}
                                    />
                                </label>
                            </div>
                            <textarea aria-label={t('admin.docs.edit_content', 'Editar contenido de la documentación')} 
                                className="docs-editor"
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                placeholder={t('admin.docs.placeholder')}
                                style={{ flex: 1 }}
                            />
                        </div>
                    ) : (
                        <div className="markdown-body" style={{ color: '#ddd', lineHeight: 1.6 }}>
                            <MarkdownRenderer content={activeDoc.content} />
                        </div>
                    )}
                </div>
            </div>
            <PremiumConfirm 
                isOpen={isResetConfirmOpen}
                title={t('admin.docs.reset_confirm_title', 'Restablecer Sección')}
                message={t('admin.docs.reset_confirm', '¿Estás seguro de que quieres restablecer esta sección a los valores predeterminados?')}
                confirmLabel={t('admin.docs.reset', 'Restablecer')}
                onConfirm={executeReset}
                onCancel={() => setIsResetConfirmOpen(false)}
                variant="warning"
            />
            <PremiumAlert 
                isOpen={alertConfig.isOpen}
                message={alertConfig.message}
                variant={alertConfig.variant}
                onClose={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))}
            />
        </div>
    );
}

