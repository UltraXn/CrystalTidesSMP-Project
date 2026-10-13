import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { m as motion, AnimatePresence } from 'framer-motion';
import { Trash2, Send, MessageCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getUserRole } from '../../utils/roleUtils';
import {
  getProfileComments,
  postProfileComment,
  deleteProfileComment,
  ProfileComment,
} from '../../services/profileCommentService';
import Loader from '../UI/Loader';
import { formatDate } from '../../utils/date';

import ConfirmationModal from '../UI/ConfirmationModal';

interface ProfileWallProps {
  profileId: string; // The UUID of the profile owner
  isAdmin?: boolean;
  mockComments?: ProfileComment[];
}

const RANK_IMAGES: Record<string, string> = {
  admin: '/ranks/admin.png',
  developer: '/ranks/developer.png',
  moderator: '/ranks/moderator.png',
  helper: '/ranks/helper.png',
  staff: '/ranks/staff.png',
  donador: '/ranks/rank-donador.png',
  fundador: '/ranks/rank-fundador.png',
  killu: '/ranks/rank-killu.png',
  neroferno: '/ranks/rank-neroferno.png',
  user: '/ranks/user.png',
};

import type { User } from '@supabase/supabase-js';

interface AuthorMetadata {
  avatar_preference?: string;
  minecraft_nick?: string;
  status_message?: string;
  full_name?: string;
  username?: string;
  discord_tag?: string;
}

function resolveCommentAvatar(
  authorMetadata: AuthorMetadata | undefined,
  isMe: boolean,
  user: User | null,
  commentAuthor: ProfileComment['author'],
): string {
  const pref = authorMetadata?.avatar_preference ?? 'minecraft';
  const mcNick = authorMetadata?.minecraft_nick ?? '';
  if (pref === 'minecraft' && mcNick) {
    return `https://mc-heads.net/avatar/${mcNick}/128`;
  }
  if (isMe) {
    return (
      user?.user_metadata?.picture ??
      user?.user_metadata?.avatar_url ??
      commentAuthor?.avatar_url ??
      ''
    );
  }
  return commentAuthor?.social_avatar_url ?? commentAuthor?.avatar_url ?? '';
}

function resolveCommentRole(
  isMe: boolean,
  user: User | null,
  commentAuthor: ProfileComment['author'],
): string {
  if (isMe) {
    return String(user ? getUserRole(user) : 'user').toLowerCase();
  }
  return String(commentAuthor?.role ?? 'user').toLowerCase();
}

function resolveCommentDisplayName(
  mcNick: string,
  authorMetadata: AuthorMetadata | undefined,
  commentAuthor: ProfileComment['author'],
  fallback: string,
): string {
  if (mcNick && authorMetadata?.avatar_preference === 'minecraft') {
    return mcNick;
  }
  return (
    authorMetadata?.full_name ?? authorMetadata?.username ?? commentAuthor?.username ?? fallback
  );
}

function renderWallContent(
  loading: boolean,
  comments: ProfileComment[],
  t: TFunction,
  renderComments: () => React.ReactNode,
) {
  if (loading) {
    return (
      <motion.div
        key="loading-wall"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex flex-col items-center justify-center py-12"
      >
        <Loader text={t('common.loading')} />
      </motion.div>
    );
  }

  if (comments.length === 0) {
    return (
      <motion.div
        key="empty-wall"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="rounded-2xl border border-white/5 bg-black/20 px-6 py-12 text-center"
      >
        <div className="mb-4 text-4xl opacity-20">💬</div>
        <p className="font-bold italic text-gray-500">
          {t('profile.wall.empty', 'Aún no hay mensajes. ¡Sé el primero!')}
        </p>
      </motion.div>
    );
  }

  return renderComments();
}

export default function ProfileWall({
  profileId,
  isAdmin,
  mockComments,
}: Readonly<ProfileWallProps>) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [comments, setComments] = useState<ProfileComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Deletion State
  const [deleteCommentId, setDeleteCommentId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let ignore = false;
    if (mockComments) {
      setComments(mockComments);
      setLoading(false);
      return;
    }

    const fetchComments = async () => {
      try {
        const data = await getProfileComments(profileId);
        if (!ignore) setComments(data);
      } catch (error) {
        console.error('Error loading wall comments:', error);
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    if (profileId) fetchComments();
    return () => {
      ignore = true;
    };
  }, [profileId, mockComments]);

  const handlePostComment = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim() || sending) return;

    setSending(true);
    try {
      const comment = await postProfileComment(profileId, newComment);
      setComments((prev) => [comment, ...prev]);
      setNewComment('');
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setSending(false);
    }
  };

  const handleDeleteClick = (id: number) => {
    setDeleteCommentId(id);
  };

  const confirmDelete = async () => {
    if (!deleteCommentId) return;
    setIsDeleting(true);
    try {
      await deleteProfileComment(deleteCommentId);
      setComments((prev) => prev.filter((c) => c.id !== deleteCommentId));
      setDeleteCommentId(null);
    } catch (error) {
      console.error('Error deleting comment:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
      <h3 className="mb-6 flex items-center gap-3 border-b border-white/5 pb-4 text-xl font-black uppercase tracking-widest text-white">
        <MessageCircle className="text-(--accent)" />{' '}
        {t('profile.wall.title', 'Muro de Comentarios')}
      </h3>

      {/* Input Form */}
      {user ? (
        <form onSubmit={handlePostComment} className="relative mb-8">
          <div className="group/input relative">
            <textarea
              aria-label="Text input"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={t('profile.wall.placeholder', 'Escribe algo en este muro...')}
              maxLength={500}
              className="focus:border-(--accent)/30 min-h-30 scrollbar-thin scrollbar-thumb-white/10 w-full resize-none rounded-2xl border border-white/5 bg-black/20 p-4 text-sm font-medium text-white transition-colors placeholder:text-gray-600 focus:outline-none"
            />
            <div className="absolute bottom-4 right-4 rounded-lg bg-black/40 px-2 py-1 text-[10px] font-black text-gray-700 backdrop-blur-md">
              {newComment.length}/500
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              disabled={!newComment.trim() || sending}
              className="hover:bg-(--accent) flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-xs font-black uppercase tracking-widest text-black shadow-lg shadow-black/20 transition-colors hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:bg-white"
            >
              {sending ? (
                <Loader minimal />
              ) : (
                <>
                  <Send size={16} /> {t('profile.wall.post', 'Publicar')}
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-8 rounded-2xl border border-dashed border-white/5 bg-black/20 p-8 text-center">
          <p className="text-sm font-bold text-gray-500">
            {t('profile.wall.login_required', 'Inicia sesión para dejar un comentario.')}
          </p>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {renderWallContent(loading, comments, t, () =>
            comments.map((comment) => {
              const isMe = user?.id === comment.author_id;
              const authorMetadata = (isMe ? user?.user_metadata : comment.author) as
                | AuthorMetadata
                | undefined;

              const mcNick = (authorMetadata?.minecraft_nick as string) || '';
              const statusMessage = (authorMetadata?.status_message as string) || '';
              const discordTag = (authorMetadata?.discord_tag as string) || '';
              const displayAvatar = resolveCommentAvatar(
                authorMetadata,
                isMe,
                user,
                comment.author,
              );

              const displayName = resolveCommentDisplayName(
                mcNick,
                authorMetadata,
                comment.author,
                t('common.anonymous', 'Anónimo'),
              );

              const role = resolveCommentRole(isMe, user, comment.author);
              const roleImage =
                RANK_IMAGES[role] ||
                (role.includes('donador') ? RANK_IMAGES['donador'] : RANK_IMAGES['user']);

              return (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="group relative rounded-2xl border border-white/5 bg-black/20 p-6 transition-colors duration-300 hover:-translate-y-2 hover:scale-[1.02] hover:border-white/20 hover:bg-black/30 hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.5)]"
                >
                  <div className="flex gap-4">
                    {/* Author Avatar & Info with Tooltip */}
                    <div className="group/author relative shrink-0">
                      {/* Avatar Display */}
                      <div className="cursor-pointer">
                        {displayAvatar ? (
                          <img
                            src={displayAvatar}
                            alt={displayName}
                            className="size-12 rounded-xl border border-white/10 object-cover shadow-lg"
                          />
                        ) : (
                          <div className="flex size-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/20">
                            <MessageCircle className="size-6" />
                          </div>
                        )}
                      </div>

                      {/* Tooltip implementation ... */}
                      <div className="pointer-events-none absolute bottom-full left-0 z-50 mb-3 w-64 translate-y-2 rounded-xl border border-white/10 bg-[#0a0a0a]/95 p-4 opacity-0 shadow-2xl backdrop-blur-xl transition-opacity duration-200 group-hover/author:translate-y-0 group-hover/author:opacity-100">
                        <div className="mb-3 flex items-center gap-3 border-b border-white/5 pb-3">
                          <img
                            src={displayAvatar || `https://ui-avatars.com/api/?name=${displayName}`}
                            className="size-10 rounded-lg shadow-inner"
                            alt="Avatar"
                          />
                          <div>
                            <p className="text-sm/tight font-bold text-white">{displayName}</p>
                            {statusMessage && (
                              <p className="mt-0.5 line-clamp-2 text-[10px] italic text-gray-400">
                                "{statusMessage}"
                              </p>
                            )}
                            <img
                              src={roleImage}
                              alt={role}
                              className="mt-1 object-contain object-left"
                              style={{ maxHeight: '24px' }}
                            />
                          </div>
                        </div>

                        <div className="space-y-2 text-xs text-gray-400">
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
                            <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                              Rol
                            </span>
                            <span className="capitalize text-white">{role}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Comment Content */}
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex items-start justify-between">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="hover:text-(--accent) cursor-pointer text-sm font-black tracking-wide text-white transition-colors">
                            {displayName}
                          </span>
                          <img
                            src={roleImage}
                            alt={role}
                            className="select-none object-contain"
                            style={{ maxHeight: '28px' }}
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                        <span className="rounded-lg bg-black/20 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-gray-600">
                          {formatDate(comment.created_at)}
                        </span>
                      </div>
                      <div className="wrap-break-word whitespace-pre-wrap text-sm/relaxed font-medium text-gray-300">
                        {comment.content}
                      </div>
                    </div>
                  </div>
                  {/* Actions */}
                  {(isAdmin || user?.id === comment.author_id || user?.id === profileId) && (
                    <button
                      type="button"
                      onClick={() => handleDeleteClick(comment.id)}
                      className="absolute right-4 top-4 rounded-lg p-2 text-gray-600 opacity-0 transition-colors hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100"
                      title={t('common.delete', 'Eliminar')}
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </motion.div>
              );
            }),
          )}
        </AnimatePresence>
      </div>

      <ConfirmationModal
        isOpen={!!deleteCommentId}
        onClose={() => !isDeleting && setDeleteCommentId(null)}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title={t('common.confirm_delete_title', 'Confirmar eliminación')}
        message={t(
          'common.confirm_delete_msg',
          '¿Estás seguro de que deseas eliminar este comentario? Esta acción no se puede deshacer.',
        )}
        confirmText={t('common.delete', 'Eliminar')}
        cancelText={t('common.cancel', 'Cancelar')}
      />
    </div>
  );
}
