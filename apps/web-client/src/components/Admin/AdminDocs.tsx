import { useState, useEffect } from 'react';
import { IconType } from 'react-icons';
import { 
    FaBook, FaBullhorn, FaUserShield, FaClipboardList, FaTerminal, 
    FaGamepad, FaChevronDown, FaEdit, FaSave, FaTimes, FaListUl, FaUndo
} from 'react-icons/fa';
import MarkdownRenderer from '../UI/MarkdownRenderer';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../services/supabaseClient';
import { getAuthHeaders } from '../../services/adminAuth';

const API_URL = import.meta.env.VITE_API_URL;

const ICON_MAP: Record<string, IconType> = {
    'intro': FaBook,
    'security': FaUserShield,
    'staff-hub': FaClipboardList,
    'moderation': FaUserShield,
    'discord': FaBullhorn,
    'audit': FaListUl,
    'console': FaTerminal,
    'content': FaBullhorn,
    'gamification': FaGamepad
};

const useDocsDefaults = () => {
    const { t } = useTranslation();
    
    return [
    {
        id: 'intro',
        title: t('admin.docs.titles.intro', 'Introducción'),
        icon: FaBook,
        content: `
# ${t('admin.docs.titles.intro', 'Introducción')}

${t('admin.docs.content.intro_msg', 'Bienvenido al centro de control. Desde aquí puedes gestionar casi todos los aspectos del servidor y la comunidad.')}

⚠️ **${t('admin.docs.content.warning_title', 'Advertencia')}**: ${t('admin.docs.content.warning_msg', 'Las acciones realizadas aquí tienen impacto directo en el juego y la base de datos en vivo. Úsalas con responsabilidad.')}
        `
    },
    {
        id: 'security',
        title: t('admin.docs.titles.security', 'Seguridad (2FA)'),
        icon: FaUserShield,
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
        icon: FaClipboardList,
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
        icon: FaUserShield,
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
        icon: FaBullhorn,
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
        icon: FaListUl,
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
        icon: FaTerminal,
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
        icon: FaBullhorn,
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
        icon: FaGamepad,
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

    // Fetch docs from DB
    useEffect(() => {
        const fetchDocs = async () => {
             if (mockDocs) return; // Use mocked docs
            try {
                const { data: { session } } = await supabase.auth.getSession();
                const res = await fetch(`${API_URL}/settings/admin_docs`, {
                    headers: getAuthHeaders(session?.access_token || null)
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.value) {
                        const parsed = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
                        setDocs(parsed);
                    } else {
                        setDocs(defaults);
                    }
                } else {
                    setDocs(defaults);
                }
            } catch (err) {
                console.error("Error fetching docs:", err);
                setDocs(defaults);
            } finally {
                setLoading(false);
            }
        };
        fetchDocs();
    }, [defaults]);

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
            alert(t('admin.docs.save_error'));
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        if (window.confirm(t('admin.docs.reset_confirm'))) {
            const defaultDoc = defaults.find(d => d.id === activeTab);
            if (defaultDoc) setEditContent(defaultDoc.content);
        }
    };

    if (loading) return <div style={{ color: '#aaa', padding: '2rem' }}>{t('admin.docs.loading')}</div>;

    const ActiveIcon = ICON_MAP[activeDoc?.id] || FaBook;

    return (
        <div className="admin-docs-container">
            <style>{`
                .admin-docs-container {
                    display: flex;
                    gap: 2rem;
                    height: calc(100vh - 150px);
                    color: #fff;
                    position: relative;
                }
                .docs-sidebar {
                    width: 250px;
                    flex-shrink: 0;
                    border-right: 1px solid rgba(255,255,255,0.1);
                    overflow-y: auto;
                    padding-bottom: 2rem;
                }
                .docs-content {
                    flex: 1;
                    overflow-y: auto;
                    padding-right: 2rem;
                    display: flex;
                    flex-direction: column;
                }
                .docs-card {
                    background: rgba(0,0,0,0.2);
                    padding: 2rem;
                    border-radius: 12px;
                    border: 1px solid rgba(255,255,255,0.05);
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                }
                .sidebar-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.8rem;
                    padding: 0.8rem 1rem;
                    background: transparent;
                    color: #ccc;
                    border: none;
                    border-radius: 0 8px 8px 0;
                    cursor: pointer;
                    text-align: left;
                    width: 100%;
                    transition: all 0.2s;
                    font-size: 0.95rem;
                }
                .sidebar-btn:hover {
                    background: rgba(255,255,255,0.05);
                    color: #fff;
                }
                .sidebar-btn.active {
                    background: var(--accent);
                    color: #000;
                    font-weight: bold;
                }
                
                .docs-editor {
                    width: 100%;
                    min-height: 400px;
                    background: #111;
                    color: #eee;
                    border: 1px solid #333;
                    border-radius: 8px;
                    padding: 1rem;
                    font-family: monospace;
                    font-size: 1rem;
                    line-height: 1.5;
                    resize: vertical;
                    outline: none;
                }
                .docs-editor:focus {
                    border-color: var(--accent);
                }

                /* Mobile Dropdown Styles */
                .mobile-dropdown-container {
                    display: none;
                    position: relative;
                    margin-bottom: 1rem;
                    z-index: 100;
                }
                .mobile-dropdown-btn {
                    width: 100%;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.1);
                    color: #fff;
                    padding: 1rem;
                    border-radius: 8px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-weight: bold;
                    cursor: pointer;
                }
                .mobile-dropdown-list {
                    position: absolute;
                    top: 100%;
                    left: 0;
                    width: 100%;
                    background: #1a1a1a;
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 8px;
                    margin-top: 0.5rem;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.5);
                    overflow: hidden;
                    animation: fadeIn 0.2s ease;
                }
                .mobile-dropdown-item {
                    padding: 1rem;
                    display: flex;
                    align-items: center;
                    gap: 0.8rem;
                    color: #ccc;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                    cursor: pointer;
                }
                .mobile-dropdown-item:last-child { border-bottom: none; }
                .mobile-dropdown-item.active { background: var(--accent); color: #000; }

                /* Mobile Responsive Improvements */
                .docs-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 2rem;
                    border-bottom: 1px solid var(--accent);
                    padding-bottom: 1rem;
                }
                
                @media (max-width: 768px) {
                    .admin-docs-container {
                        flex-direction: column;
                        height: auto;
                        gap: 1rem;
                        overflow: visible;
                    }
                    .docs-sidebar { display: none; }
                    .mobile-dropdown-container { display: block; }
                    .docs-content { 
                        padding-right: 0; 
                        overflow-y: visible;
                        min-height: 500px; /* Ensure height on mobile */
                    }
                    .docs-card { padding: 1.25rem; }
                    h2 { font-size: 1.5rem !important; }

                    /* Header Stacking */
                    .docs-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 1.5rem;
                    }
                    .docs-header > div {
                        width: 100%;
                        justify-content: space-between;
                        flex-wrap: wrap; /* Allow buttons to wrap */
                        gap: 0.8rem;
                    }
                    /* Button adjustments for better touch targets */
                    .btn-primary, .btn-secondary {
                        flex: 1;
                        justify-content: center;
                        padding: 0.8rem;
                        white-space: nowrap;
                    }
                }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
            
            {/* Desktop Sidebar */}
            <div className="docs-sidebar">
                <h3 style={{ padding: '0 1rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'var(--muted)' }}>{t('admin.docs.index')}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1rem 0' }}>
                    {docs.map(doc => {
                        const Icon = ICON_MAP[doc.id] || FaBook;
                        return (
                            <button
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
                <button 
                    className="mobile-dropdown-btn"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                        <ActiveIcon color="var(--accent)" /> {activeDoc.title}
                    </span>
                    <FaChevronDown style={{ transform: mobileMenuOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
                </button>
                
                {mobileMenuOpen && (
                    <div className="mobile-dropdown-list">
                        {docs.map(doc => {
                            const Icon = ICON_MAP[doc.id] || FaBook;
                            return (
                                <div 
                                    key={doc.id}
                                    className={`mobile-dropdown-item ${activeTab === doc.id ? 'active' : ''}`}
                                    onClick={() => {
                                        setActiveTab(doc.id);
                                        setMobileMenuOpen(false);
                                        setIsEditing(false);
                                    }}
                                >
                                    <Icon /> {doc.title}
                                </div>
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
                                    <button onClick={handleReset} className="btn-secondary" style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)' }} title={t('admin.docs.reset')}>
                                        <FaUndo />
                                    </button>
                                    <button onClick={() => setIsEditing(false)} className="btn-secondary" style={{ color: '#ef4444' }}>
                                        <FaTimes /> {t('admin.actions.cancel')}
                                    </button>
                                    <button onClick={handleSave} className="btn-primary" disabled={saving}>
                                        <FaSave /> {saving ? t('admin.docs.saving') : t('admin.actions.save')}
                                    </button>
                                </>
                            ) : (
                                <button onClick={() => setIsEditing(true)} className="btn-primary" style={{ background: 'rgba(22, 140, 128, 0.2)', border: '1px solid var(--accent)', color: 'var(--accent)' }}>
                                    <FaEdit /> {t('admin.docs.edit_section')}
                                </button>
                            )}
                        </div>
                    </div>
                    
                    {isEditing ? (
                        <textarea 
                            className="docs-editor"
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            placeholder={t('admin.docs.placeholder')}
                        />
                    ) : (
                        <div className="markdown-body" style={{ color: '#ddd', lineHeight: 1.6 }}>
                            <MarkdownRenderer content={activeDoc.content} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

