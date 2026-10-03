import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  LucideIcon,
  Book,
  Megaphone,
  Shield,
  ClipboardList,
  Terminal,
  Gamepad2,
  ChevronDown,
  Edit,
  Save,
  X,
  List,
  Undo2,
  Image,
  Loader2,
} from 'lucide-react';
import MarkdownRenderer from '../UI/MarkdownRenderer';
import PremiumConfirm from '../UI/PremiumConfirm';
import PremiumAlert from '../UI/PremiumAlert';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../services/supabaseClient';
import { uploadImage as uploadImageSecure } from '../../services/uploadService';
import { getAuthHeaders } from '../../services/adminAuth';
import '../../styles/admin/admin_docs.css';

const API_URL = import.meta.env.VITE_API_URL;

const UI_CONSTANTS = {
  ACCENT_COLOR: 'var(--accent)',
  FADE_WHITE_BORDER: 'rgba(255, 255, 255, 0.05)',
  VARIANT_ERROR: 'error' as const,
  VARIANT_SUCCESS: 'success' as const,
  DEFAULT_TAB: 'intro',
  STORAGE_BUCKET: 'admin-assets',
  STORAGE_FOLDER: 'docs',
} as const;

const I18N_KEYS = {
  RESET: 'admin.docs.reset',
  INTRO_TITLE: 'admin.docs.titles.intro',
  SECURITY_TITLE: 'admin.docs.titles.security',
  STAFF_HUB_TITLE: 'admin.docs.titles.staff_hub',
  UPLOAD_IMAGE: 'admin.docs.upload_image',
} as const;

const ICON_MAP: Record<string, LucideIcon> = {
  [UI_CONSTANTS.DEFAULT_TAB]: Book,
  security: Shield,
  'staff-hub': ClipboardList,
  moderation: Shield,
  discord: Megaphone,
  audit: List,
  console: Terminal,
  content: Megaphone,
  gamification: Gamepad2,
};

const DocIcon = ({
  id,
  size,
  color,
  className,
  'aria-hidden': ariaHidden,
}: {
  id?: string;
  size?: number;
  color?: string;
  className?: string;
  'aria-hidden'?: boolean | 'true' | 'false';
}) => {
  const Icon = id ? (ICON_MAP[id] ?? Book) : Book;
  return <Icon size={size} color={color} className={className} aria-hidden={ariaHidden} />;
};

export interface AdminDoc {
  id: string;
  title: string;
  content: string;
}

export interface AdminDocsProps {
  mockDocs?: AdminDoc[];
}

interface AlertState {
  isOpen: boolean;
  message: string;
  variant: 'error' | 'success';
}

const useDocsDefaults = (): AdminDoc[] => {
  const { t } = useTranslation();

  return useMemo<AdminDoc[]>(
    () => [
      {
        id: UI_CONSTANTS.DEFAULT_TAB,
        title: t(I18N_KEYS.INTRO_TITLE, 'Introducción'),
        content: `
# ${t(I18N_KEYS.INTRO_TITLE, 'Introducción')}

${t('admin.docs.content.intro_msg', 'Bienvenido al centro de control. Desde aquí puedes gestionar casi todos los aspectos del servidor y la comunidad.')}

⚠️ **${t('admin.docs.content.warning_title', 'Advertencia')}**: ${t('admin.docs.content.warning_msg', 'Las acciones realizadas aquí tienen impacto directo en el juego y la base de datos en vivo. Úsalas con responsabilidad.')}
            `,
      },
      {
        id: 'security',
        title: t(I18N_KEYS.SECURITY_TITLE, 'Seguridad (2FA)'),
        content: `
# 🛡️ ${t(I18N_KEYS.SECURITY_TITLE, 'Seguridad (2FA)')}

${t('admin.docs.content.security_desc', 'Protección de acceso al panel administrativo.')}

### 🔐 ${t(I18N_KEYS.SECURITY_TITLE, '2FA')}
- **TOTP**: ${t('admin.docs.content.security_2fa', 'El Panel requiere Autenticación de Dos Factores (TOTP) para acceder a funciones críticas.')}
- **Tokens**: ${t('admin.docs.content.security_tokens', 'Se emite un Token de Admin temporal tras la verificación válida.')}
            `,
      },
      {
        id: 'staff-hub',
        title: t(I18N_KEYS.STAFF_HUB_TITLE, 'Staff Hub'),
        content: `
# 📋 ${t(I18N_KEYS.STAFF_HUB_TITLE, 'Staff Hub')}

${t('admin.docs.content.staff_intro', 'Herramientas para la organización interna del equipo.')}

### 📋 Kanban Board (Tareas)
${t('admin.docs.content.kanban_desc', 'Un tablero de gestión de proyectos simple.')}
- **To Do**: ${t('admin.docs.content.kanban_todo', 'Tareas pendientes.')}
- **In Progress**: ${t('admin.docs.content.kanban_progress', 'En lo que se está trabajando actualmente.')}
- **Done**: ${t('admin.docs.content.kanban_done', 'Tareas finalizadas.')}

### 📝 ${t('admin.docs.content.notes_title', 'Notas de Staff')}
${t('admin.docs.content.notes_desc', 'Un muro de post-its compartidos. Úsalo para dejar recordatorios rápidos.')}
            `,
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
            `,
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
            `,
      },
      {
        id: 'audit',
        title: t('admin.docs.titles.audit', 'Logs de Auditoría'),
        content: `
# 📝 ${t('admin.docs.titles.audit', 'Logs de Auditoría')}

${t('admin.docs.content.audit_desc', 'Registro histórico de todas las acciones administrativas.')}

- **Transparencia**: Registra quién, cuándo y qué cambió (Roles, Configuración, Gamificación).
- **Seguridad**: Los logs son inmutables para garantizar la integridad del equipo.
            `,
      },
      {
        id: 'console',
        title: t('admin.docs.titles.console', 'Consola & Comandos'),
        content: `
# 💻 ${t('admin.docs.titles.console_bridge', 'Consola Remota (Secure Bridge)')}

${t('admin.docs.content.console_desc', 'Ejecuta comandos en el servidor de Minecraft en tiempo real.')}

### 🔥 Seguridad de Acciones
- **Premium Confirmation**: Toda acción destructiva (Kick, Ban total) requiere confirmación mediante el nuevo sistema de seguridad visual.
            `,
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
            `,
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
            `,
      },
    ],
    [t],
  );
};

async function fetchRemoteDocs(token: string | null): Promise<AdminDoc[] | null> {
  const res = await fetch(`${API_URL}/settings/admin_docs`, {
    headers: getAuthHeaders(token),
  });
  if (!res.ok) return null;
  const data = await res.json();
  if (!data?.value) return null;
  return typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
}

async function saveRemoteDocs(
  updatedDocs: AdminDoc[],
  token: string | null,
  userId?: string,
  username?: string,
): Promise<boolean> {
  const res = await fetch(`${API_URL}/settings/admin_docs`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(token),
    },
    body: JSON.stringify({
      value: JSON.stringify(updatedDocs),
      userId,
      username: username || 'Admin',
    }),
  });
  return res.ok;
}

interface DesktopSidebarProps {
  docs: AdminDoc[];
  activeTab: string;
  onSelectTab: (id: string) => void;
}

function DesktopSidebar({ docs, activeTab, onSelectTab }: Readonly<DesktopSidebarProps>) {
  const { t } = useTranslation();
  return (
    <div className="docs-sidebar">
      <h3
        style={{
          padding: '0 1rem 1rem',
          borderBottom: `1px solid ${UI_CONSTANTS.FADE_WHITE_BORDER}`,
          color: 'var(--muted)',
        }}
      >
        {t('admin.docs.index')}
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1rem 0' }}>
        {docs.map((doc) => {
          const isActive = activeTab === doc.id;
          return (
            <button
              aria-label={t('admin.docs.view_doc', `Ver documento: ${doc.title}`)}
              aria-current={isActive ? 'page' : undefined}
              type="button"
              key={doc.id}
              onClick={() => onSelectTab(doc.id)}
              className={`sidebar-btn ${isActive ? 'active' : ''}`}
            >
              <DocIcon id={doc.id} aria-hidden="true" />
              {doc.title}
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface MobileDropdownProps {
  docs: AdminDoc[];
  activeTab: string;
  activeDoc: AdminDoc;
  isOpen: boolean;
  onToggle: () => void;
  onSelectTab: (id: string) => void;
}

function MobileDropdown({
  docs,
  activeTab,
  activeDoc,
  isOpen,
  onToggle,
  onSelectTab,
}: Readonly<MobileDropdownProps>) {
  const { t } = useTranslation();

  return (
    <div className="mobile-dropdown-container">
      <button
        aria-label={t('admin.docs.toggle_doc_menu', 'Alternar menú de documentación')}
        aria-expanded={isOpen}
        type="button"
        className="mobile-dropdown-btn"
        onClick={onToggle}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <DocIcon id={activeDoc.id} color={UI_CONSTANTS.ACCENT_COLOR} aria-hidden="true" />{' '}
          {activeDoc.title}
        </span>
        <ChevronDown
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
            transition: 'transform 0.2s',
          }}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div className="mobile-dropdown-list">
          {docs.map((doc) => (
            <button
              type="button"
              key={doc.id}
              className={`mobile-dropdown-item ${activeTab === doc.id ? 'active' : ''}`}
              onClick={() => onSelectTab(doc.id)}
            >
              <DocIcon id={doc.id} aria-hidden="true" /> {doc.title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface DocCategoryNavProps {
  docs: AdminDoc[];
  activeTab: string;
  activeDoc: AdminDoc;
  mobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
  onSelectTab: (id: string) => void;
}

function DocCategoryNav({
  docs,
  activeTab,
  activeDoc,
  mobileMenuOpen,
  onToggleMobileMenu,
  onSelectTab,
}: Readonly<DocCategoryNavProps>) {
  return (
    <>
      <DesktopSidebar docs={docs} activeTab={activeTab} onSelectTab={onSelectTab} />
      <MobileDropdown
        docs={docs}
        activeTab={activeTab}
        activeDoc={activeDoc}
        isOpen={mobileMenuOpen}
        onToggle={onToggleMobileMenu}
        onSelectTab={onSelectTab}
      />
    </>
  );
}

interface DocHeaderProps {
  activeDoc: AdminDoc;
  isEditing: boolean;
  saving: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSave: () => void;
  onReset: () => void;
}

function DocHeader({
  activeDoc,
  isEditing,
  saving,
  onStartEdit,
  onCancelEdit,
  onSave,
  onReset,
}: Readonly<DocHeaderProps>) {
  const { t } = useTranslation();

  return (
    <div className="docs-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <DocIcon id={activeDoc.id} size={30} color={UI_CONSTANTS.ACCENT_COLOR} />
        <h2 style={{ margin: 0, fontSize: '1.8rem' }}>{activeDoc.title}</h2>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {isEditing ? (
          <>
            <button
              aria-label={t(I18N_KEYS.RESET, 'Restablecer documento')}
              type="button"
              onClick={onReset}
              className="btn-secondary"
              style={{ padding: '0.5rem 1rem', background: UI_CONSTANTS.FADE_WHITE_BORDER }}
              title={t(I18N_KEYS.RESET)}
            >
              <Undo2 aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={onCancelEdit}
              className="btn-secondary"
              style={{ color: '#ef4444' }}
            >
              <X aria-hidden="true" /> {t('admin.actions.cancel')}
            </button>
            <button
              aria-busy={saving}
              type="button"
              onClick={onSave}
              className="btn-primary"
              disabled={saving}
            >
              <Save aria-hidden="true" />{' '}
              {saving ? t('admin.docs.saving') : t('admin.actions.save')}
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={onStartEdit}
            className="btn-primary"
            style={{
              background: 'rgba(22, 140, 128, 0.2)',
              border: '1px solid var(--accent)',
              color: UI_CONSTANTS.ACCENT_COLOR,
            }}
          >
            <Edit /> {t('admin.docs.edit_section')}
          </button>
        )}
      </div>
    </div>
  );
}

interface DocEditorProps {
  value: string;
  onChange: (value: string) => void;
  uploading: boolean;
  onUploadImage: (file: File) => void;
}

function DocEditor({ value, onChange, uploading, onUploadImage }: Readonly<DocEditorProps>) {
  const { t } = useTranslation();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
      <div
        className="editor-toolbar"
        style={{
          display: 'flex',
          gap: '0.5rem',
          padding: '0.5rem',
          background: 'rgba(255,255,255,0.02)',
          border: `1px solid ${UI_CONSTANTS.FADE_WHITE_BORDER}`,
          borderRadius: '8px',
        }}
      >
        <label
          className="btn-icon-premium"
          style={{
            cursor: 'pointer',
            padding: '0.5rem 1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.85rem',
          }}
        >
          {uploading ? <Loader2 className="spin" /> : <Image />}
          {uploading
            ? t('common.uploading', 'Subiendo...')
            : t(I18N_KEYS.UPLOAD_IMAGE, 'Subir Imagen')}
          <input
            aria-label={t(I18N_KEYS.UPLOAD_IMAGE, 'Subir Imagen')}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                onUploadImage(file);
              }
            }}
          />
        </label>
      </div>
      <textarea
        aria-label={t('admin.docs.edit_content', 'Editar contenido de la documentación')}
        className="docs-editor"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t('admin.docs.placeholder')}
        style={{ flex: 1 }}
      />
    </div>
  );
}

function DocViewer({ content }: { content: string }) {
  return (
    <div className="markdown-body" style={{ color: '#ddd', lineHeight: 1.6 }}>
      <MarkdownRenderer content={content} />
    </div>
  );
}

export default function AdminDocs({ mockDocs }: AdminDocsProps = {}) {
  const { t } = useTranslation();
  const defaults = useDocsDefaults();
  const [docs, setDocs] = useState<AdminDoc[]>(mockDocs || []);
  const [activeTab, setActiveTab] = useState<string>(UI_CONSTANTS.DEFAULT_TAB);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [loading, setLoading] = useState(!mockDocs);
  const [saving, setSaving] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [alertConfig, setAlertConfig] = useState<AlertState>({
    isOpen: false,
    message: '',
    variant: UI_CONSTANTS.VARIANT_SUCCESS,
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    let ignore = false;
    const loadDocs = async () => {
      if (mockDocs) return;
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const remote = await fetchRemoteDocs(session?.access_token || null);
        if (!ignore) {
          setDocs(remote ?? defaults);
        }
      } catch (err) {
        console.error('Error fetching docs:', err);
        if (!ignore) setDocs(defaults);
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    loadDocs();
    return () => {
      ignore = true;
    };
  }, [defaults, mockDocs]);

  const activeDoc = docs.find((d) => d.id === activeTab) || docs[0] || defaults[0];

  useEffect(() => {
    if (activeDoc) setEditContent(activeDoc.content);
  }, [activeDoc]);

  const handleSelectTab = useCallback((id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
    setIsEditing(false);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updatedDocs = docs.map((d) =>
        d.id === activeTab ? { ...d, content: editContent } : d,
      );

      const {
        data: { session },
      } = await supabase.auth.getSession();
      const success = await saveRemoteDocs(
        updatedDocs,
        session?.access_token || null,
        session?.user?.id,
        session?.user?.user_metadata?.username,
      );

      if (!success) throw new Error('Failed to save');

      setDocs(updatedDocs);
      setIsEditing(false);
    } catch (err) {
      console.error('Error saving docs:', err);
      setAlertConfig({
        isOpen: true,
        message: t('admin.docs.save_error'),
        variant: UI_CONSTANTS.VARIANT_ERROR,
      });
    } finally {
      setSaving(false);
    }
  };

  const executeReset = () => {
    const defaultDoc = defaults.find((d) => d.id === activeTab);
    if (defaultDoc) setEditContent(defaultDoc.content);
    setIsResetConfirmOpen(false);
  };

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const publicUrl = await uploadImageSecure(
        file,
        UI_CONSTANTS.STORAGE_BUCKET,
        UI_CONSTANTS.STORAGE_FOLDER,
      );
      const imageMarkdown = `\n![Image](${publicUrl})\n`;
      setEditContent((prev) => prev + imageMarkdown);

      setAlertConfig({
        isOpen: true,
        message: t('admin.docs.image_uploaded', 'Imagen subida correctamente'),
        variant: UI_CONSTANTS.VARIANT_SUCCESS,
      });
    } catch (err) {
      console.error('Error uploading image:', err);
      setAlertConfig({
        isOpen: true,
        message: t('admin.docs.upload_error', 'Error al subir la imagen'),
        variant: UI_CONSTANTS.VARIANT_ERROR,
      });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <div style={{ color: '#aaa', padding: '2rem' }}>{t('admin.docs.loading')}</div>;
  }

  return (
    <div className="admin-docs-container">
      <DocCategoryNav
        docs={docs}
        activeTab={activeTab}
        activeDoc={activeDoc}
        mobileMenuOpen={mobileMenuOpen}
        onToggleMobileMenu={() => setMobileMenuOpen((prev) => !prev)}
        onSelectTab={handleSelectTab}
      />

      <div className="docs-content">
        <div className="docs-card">
          <DocHeader
            activeDoc={activeDoc}
            isEditing={isEditing}
            saving={saving}
            onStartEdit={() => setIsEditing(true)}
            onCancelEdit={() => setIsEditing(false)}
            onSave={handleSave}
            onReset={() => setIsResetConfirmOpen(true)}
          />

          {isEditing ? (
            <DocEditor
              value={editContent}
              onChange={setEditContent}
              uploading={uploading}
              onUploadImage={handleImageUpload}
            />
          ) : (
            <DocViewer content={activeDoc.content} />
          )}
        </div>
      </div>

      <PremiumConfirm
        isOpen={isResetConfirmOpen}
        title={t('admin.docs.reset_confirm_title', 'Restablecer Sección')}
        message={t(
          'admin.docs.reset_confirm',
          '¿Estás seguro de que quieres restablecer esta sección a los valores predeterminados?',
        )}
        confirmLabel={t(I18N_KEYS.RESET, 'Restablecer')}
        onConfirm={executeReset}
        onCancel={() => setIsResetConfirmOpen(false)}
        variant="warning"
      />
      <PremiumAlert
        isOpen={alertConfig.isOpen}
        message={alertConfig.message}
        variant={alertConfig.variant}
        onClose={() => setAlertConfig((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
