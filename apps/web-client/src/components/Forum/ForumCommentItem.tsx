import type { useTranslation } from 'react-i18next';
import MarkdownRenderer from '../UI/MarkdownRenderer';
import { RANK_IMAGES, type Comment } from '../../types/forum';

interface ForumCommentItemProps {
  readonly comment: Comment;
  readonly isOwnerOrAdmin: boolean;
  readonly isEditing: boolean;
  readonly editPostContent: string;
  readonly onStartEdit: () => void;
  readonly onCancelEdit: () => void;
  readonly onSaveEdit: () => void;
  readonly onDelete: () => void;
  readonly onEditContentChange: (val: string) => void;
  readonly t: ReturnType<typeof useTranslation>['t'];
}

function getCommentAuthorAvatar(comment: Comment): string {
  const metadata = comment.author_data_fresh;
  const pref = metadata?.avatar_preference || 'minecraft';
  const mcNick = metadata?.minecraft_nick;
  const useMinecraft = pref === 'minecraft' && Boolean(mcNick);

  if (useMinecraft && mcNick) {
    return `https://mc-heads.net/avatar/${mcNick}/128`;
  }
  return (
    metadata?.social_avatar_url ||
    metadata?.avatar_url ||
    comment.avatar ||
    `https://ui-avatars.com/api/?name=${comment.user}`
  );
}

function getCommentAuthorDisplayName(comment: Comment): string {
  const metadata = comment.author_data_fresh;
  const pref = metadata?.avatar_preference || 'minecraft';
  const mcNick = metadata?.minecraft_nick;
  const useMinecraft = pref === 'minecraft' && Boolean(mcNick);

  if (useMinecraft && mcNick) {
    return mcNick;
  }
  return metadata?.full_name || metadata?.username || comment.user;
}

function getCommentAuthorRoleInfo(comment: Comment): { roleRaw: string; roleImage: string } {
  const roleRaw = (comment.author_data_fresh?.role || comment.role || 'user').toLowerCase();
  const roleImage =
    RANK_IMAGES[roleRaw] || (roleRaw.includes('donador') ? RANK_IMAGES.donador : RANK_IMAGES.user);
  return { roleRaw, roleImage };
}

export default function ForumCommentItem({
  comment,
  isOwnerOrAdmin,
  isEditing,
  editPostContent,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  onEditContentChange,
  t,
}: Readonly<ForumCommentItemProps>) {
  const metadata = comment.author_data_fresh;
  const mcNick = metadata?.minecraft_nick;
  const discordTag = metadata?.social_discord || metadata?.discord_tag;
  const statusMessage = metadata?.status_message;

  const displayAvatar = getCommentAuthorAvatar(comment);
  const displayName = getCommentAuthorDisplayName(comment);
  const { roleRaw, roleImage } = getCommentAuthorRoleInfo(comment);

  return (
    <div style={{ display: 'flex', gap: '1rem' }}>
      {/* Avatar Sidebar with Tooltip */}
      <div className="group/comment relative flex shrink-0 items-center">
        <div className="size-12 cursor-pointer overflow-hidden rounded-xl border border-white/10 bg-black/20 shadow-lg transition-transform group-hover/comment:scale-105">
          <img src={displayAvatar} alt={displayName} className="size-full object-cover" />
        </div>

        <div className="pointer-events-none absolute bottom-full left-0 z-50 mb-3 w-64 translate-y-2 rounded-xl border border-white/10 bg-[#0a0a0a]/95 p-4 text-left opacity-0 shadow-2xl backdrop-blur-xl transition-colors duration-300 group-hover/comment:translate-y-0 group-hover/comment:opacity-100">
          <div className="mb-3 flex items-center gap-3 border-b border-white/5 pb-3">
            <img
              src={displayAvatar}
              className="size-10 rounded-lg border border-white/10 shadow-inner"
              alt="Avatar"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm/tight font-bold text-white">{displayName}</p>
              {statusMessage && (
                <p className="mt-0.5 line-clamp-2 text-[10px] italic text-gray-400">
                  "{statusMessage}"
                </p>
              )}
              <div className="mt-1">
                <img src={roleImage} alt={roleRaw} className="h-4 object-contain object-left" />
              </div>
            </div>
          </div>

          <div className="space-y-1.5 text-xs text-gray-400">
            {mcNick && (
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                  Minecraft
                </span>
                <span className="font-mono text-white">{mcNick}</span>
              </div>
            )}
            {discordTag && (
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                  Discord
                </span>
                <span className="text-indigo-300">{discordTag}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">Rol</span>
              <span className="capitalize text-white">{roleRaw}</span>
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          flexGrow: 1,
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: '12px',
          padding: '1.2rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.8rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
            paddingBottom: '0.6rem',
          }}
        >
          <div className="flex items-center gap-2">
            <span style={{ fontWeight: 'bold', color: '#fff', fontSize: '0.95rem' }}>
              {displayName}
            </span>
            <span style={{ fontSize: '0.8rem', color: '#666' }}>{comment.date}</span>
          </div>

          {/* Actions for Comment */}
          {isOwnerOrAdmin && !isEditing && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label={t('forum_thread.edit_comment', 'Editar comentario')}
                onClick={onStartEdit}
                className="hover:text-(--accent) text-[11px] font-black uppercase tracking-tighter text-gray-500 transition-colors"
              >
                Editar
              </button>
              <button
                type="button"
                aria-label={t('forum_thread.delete_comment', 'Eliminar comentario')}
                onClick={onDelete}
                className="text-[11px] font-black uppercase tracking-tighter text-red-500/70 transition-colors hover:text-red-500"
              >
                Eliminar
              </button>
            </div>
          )}
        </div>

        {isEditing ? (
          <div style={{ marginTop: '0.5rem' }}>
            <textarea
              aria-label={t('forum_thread.edit_comment', 'Editar comentario')}
              value={editPostContent}
              onChange={(e) => onEditContentChange(e.target.value)}
              style={{
                width: '100%',
                background: '#222',
                border: '1px solid #444',
                color: '#fff',
                padding: '0.5rem',
                borderRadius: '4px',
              }}
              rows={3}
            />
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                aria-label={t('common.save', 'Guardar')}
                onClick={onSaveEdit}
                className="btn-primary"
                style={{ fontSize: '0.8rem', padding: '0.3rem 0.8rem' }}
              >
                Guardar
              </button>
              <button
                type="button"
                aria-label={t('common.cancel', 'Cancelar')}
                onClick={onCancelEdit}
                className="btn-secondary"
                style={{ fontSize: '0.8rem', padding: '0.3rem 0.8rem' }}
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div style={{ color: '#ccc', lineHeight: '1.5', margin: 0 }}>
            <MarkdownRenderer content={comment.content} />
          </div>
        )}
      </div>
    </div>
  );
}
