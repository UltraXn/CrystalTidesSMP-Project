import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { m as motion, AnimatePresence } from "framer-motion"
import { Trash2, Send, MessageCircle } from "lucide-react"
import { useAuth } from "../../context/AuthContext"
import { getProfileComments, postProfileComment, deleteProfileComment, ProfileComment } from "../../services/profileCommentService"
import Loader from "../UI/Loader"

import ConfirmationModal from "../UI/ConfirmationModal"

interface ProfileWallProps {
    profileId: string; // The UUID of the profile owner
    isAdmin?: boolean;
    mockComments?: ProfileComment[];
}

const RANK_IMAGES: Record<string, string> = {
    'admin': '/ranks/admin.png',
    'developer': '/ranks/developer.png',
    'moderator': '/ranks/moderator.png',
    'helper': '/ranks/helper.png',
    'staff': '/ranks/staff.png',
    'donador': '/ranks/rank-donador.png',
    'fundador': '/ranks/rank-fundador.png',
    'killu': '/ranks/rank-killu.png',
    'neroferno': '/ranks/rank-neroferno.png',
    'user': '/ranks/user.png',
};

export default function ProfileWall({ profileId, isAdmin, mockComments }: ProfileWallProps) {
    const { t } = useTranslation()
    const { user } = useAuth()
    const [comments, setComments] = useState<ProfileComment[]>([])
    const [newComment, setNewComment] = useState("")
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    
    // Deletion State
    const [deleteCommentId, setDeleteCommentId] = useState<number | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    useEffect(() => {
        let ignore = false;
        if (mockComments) {
            setComments(mockComments);
            setLoading(false);
            return;
        }

        const fetchComments = async () => {
            try {
                const data = await getProfileComments(profileId)
                if (!ignore) setComments(data)
            } catch (error) {
                console.error("Error loading wall comments:", error)
            } finally {
                if (!ignore) setLoading(false)
            }
        }
        if (profileId) fetchComments()
        return () => { ignore = true; }
    }, [profileId, mockComments])

    const handlePostComment = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user || !newComment.trim() || sending) return

        setSending(true)
        try {
            const comment = await postProfileComment(profileId, newComment)
            setComments(prev => [comment, ...prev])
            setNewComment("")
        } catch (error) {
            console.error("Error posting comment:", error)
        } finally {
            setSending(false)
        }
    }

    const handleDeleteClick = (id: number) => {
        setDeleteCommentId(id);
    };

    const confirmDelete = async () => {
        if (!deleteCommentId) return;
        setIsDeleting(true);
        try {
            await deleteProfileComment(deleteCommentId)
            setComments(prev => prev.filter(c => c.id !== deleteCommentId))
            setDeleteCommentId(null)
        } catch (error) {
            console.error("Error deleting comment:", error)
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
            <h3 className="flex items-center gap-3 text-xl font-black uppercase tracking-widest text-white mb-6 border-b border-white/5 pb-4">
                <MessageCircle className="text-(--accent)" /> {t('profile.wall.title', 'Muro de Comentarios')}
            </h3>

            {/* Input Form */}
            {user ? (
                <form onSubmit={handlePostComment} className="mb-8 relative">
                    <div className="relative group/input">
                        <textarea aria-label="Text input"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder={t('profile.wall.placeholder', 'Escribe algo en este muro...')}
                            maxLength={500}
                            className="w-full bg-black/20 border border-white/5 rounded-2xl p-4 text-sm font-medium text-white placeholder:text-gray-600 focus:outline-none focus:border-(--accent)/30 transition-colors min-h-30 resize-none scrollbar-thin scrollbar-thumb-white/10"
                        />
                        <div className="absolute bottom-4 right-4 text-[10px] font-black text-gray-700 bg-black/40 px-2 py-1 rounded-lg backdrop-blur-md">
                            {newComment.length}/500
                        </div>
                    </div>
                    
                    <div className="flex justify-end mt-4">
                        <button 
                            type="submit" 
                            disabled={!newComment.trim() || sending}
                            className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-xl text-xs font-black uppercase tracking-widest hover:bg-(--accent) hover:scale-105 active:scale-95 transition-colors shadow-lg shadow-black/20 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:bg-white"
                        >
                            {sending ? <Loader minimal /> : <><Send size={16} /> {t('profile.wall.post', 'Publicar')}</>}
                        </button>
                    </div>
                </form>
            ) : (
                <div className="p-8 bg-black/20 border border-white/5 rounded-2xl text-center mb-8 border-dashed">
                    <p className="text-gray-500 font-bold text-sm">
                        {t('profile.wall.login_required', 'Inicia sesión para dejar un comentario.')}
                    </p>
                </div>
            )}

            {/* Comments List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <Loader text={t('common.loading')} />
                    </div>
                ) : (
                    <AnimatePresence>
                        {comments.length === 0 ? (
                            <motion.div 
                                key="empty-wall"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-center py-12 px-6 bg-black/20 rounded-2xl border border-white/5"
                            >
                                <div className="text-4xl mb-4 opacity-20">💬</div>
                                <p className="text-gray-500 font-bold italic">
                                    {t('profile.wall.empty', 'Aún no hay mensajes. ¡Sé el primero!')}
                                </p>
                            </motion.div>
                        ) : (
                            comments.map((comment) => {
                            return (
                            <motion.div
                                key={comment.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="relative bg-black/20 border border-white/5 rounded-2xl p-6 hover:bg-black/30 hover:-translate-y-2 hover:scale-[1.02] hover:border-white/20 hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.5)] transition-colors duration-300 group"
                            >
                                {(() => {
                                    // Use local user data if it's my own comment (to ensure settings are up-to-date)
                                    const isMe = user?.id === comment.author_id;
                                    
                                    interface AuthorMetadata {
                                        avatar_preference?: string;
                                        minecraft_nick?: string;
                                        status_message?: string;
                                        full_name?: string;
                                        username?: string;
                                        discord_tag?: string;
                                    }

                                    const authorMetadata = (isMe 
                                        ? user?.user_metadata 
                                        : comment.author) as AuthorMetadata | undefined;
                                    
                                    const pref = (authorMetadata?.avatar_preference as string) || 'minecraft';
                                    const mcNick = (authorMetadata?.minecraft_nick as string) || '';
                                    const statusMessage = (authorMetadata?.status_message as string) || '';
                                    const discordTag = (authorMetadata?.discord_tag as string) || '';

                                    const useMinecraft = pref === 'minecraft' && mcNick;

                                    const displayAvatar = useMinecraft 
                                        ? `https://mc-heads.net/avatar/${mcNick}/128`
                                        : (isMe 
                                            ? ((user?.user_metadata?.picture || user?.user_metadata?.avatar_url || comment.author?.avatar_url) as string)
                                            : ((comment.author?.social_avatar_url || comment.author?.avatar_url) as string));

                                    const displayName = String((useMinecraft && mcNick)
                                        ? mcNick 
                                        : (authorMetadata?.full_name || authorMetadata?.username || comment.author?.username || t('common.anonymous', 'Anónimo')));

                                    const roleRaw = isMe ? user?.user_metadata?.role : comment.author?.role;
                                    const role = String(roleRaw || 'user').toLowerCase();
                                    const roleImage = RANK_IMAGES[role] || (role.includes('donador') ? RANK_IMAGES['donador'] : RANK_IMAGES['user']);

                                    return (
                                        <div className="flex gap-4">
                                            {/* Author Avatar & Info with Tooltip */}
                                            <div className="shrink-0 group/author relative">
                                                {/* Avatar Display */}
                                                <div className="cursor-pointer">
                                                    {displayAvatar ? (
                                                        <img 
                                                            src={displayAvatar} 
                                                            alt={displayName} 
                                                            className="w-12 h-12 rounded-xl object-cover border border-white/10 shadow-lg"
                                                        />
                                                    ) : (
                                                        <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/20">
                                                            <MessageCircle className="w-6 h-6" />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Tooltip implementation ... */}
                                                <div className="absolute bottom-full left-0 mb-3 opacity-0 group-hover/author:opacity-100 transition-opacity duration-200 pointer-events-none z-50 w-64 bg-[#0a0a0a]/95 border border-white/10 rounded-xl shadow-2xl backdrop-blur-xl p-4 translate-y-2 group-hover/author:translate-y-0">
                                                    <div className="flex items-center gap-3 mb-3 border-b border-white/5 pb-3">
                                                        <img src={displayAvatar || `https://ui-avatars.com/api/?name=${displayName}`} className="w-10 h-10 rounded-lg shadow-inner" alt="Avatar" />
                                                        <div>
                                                            <p className="font-bold text-white text-sm leading-tight">{displayName}</p>
                                                            {statusMessage && (
                                                                <p className="text-[10px] text-gray-400 italic mt-0.5 line-clamp-2">"{statusMessage}"</p>
                                                            )}
                                                            <img src={roleImage} alt={role} className="mt-1 object-contain object-left" style={{ maxHeight: '24px' }} />
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="space-y-2 text-xs text-gray-400">
                                                        {mcNick && (
                                                            <div className="flex items-center justify-between">
                                                                <span className="font-bold uppercase tracking-wider text-[10px] opacity-70">Minecraft</span>
                                                                <span className="text-white font-mono">{mcNick}</span>
                                                            </div>
                                                        )}
                                                        {discordTag && (
                                                            <div className="flex items-center justify-between">
                                                                <span className="font-bold uppercase tracking-wider text-[10px] opacity-70">Discord</span>
                                                                <span className="text-indigo-300">{discordTag}</span>
                                                            </div>
                                                        )}
                                                        <div className="flex items-center justify-between">
                                                            <span className="font-bold uppercase tracking-wider text-[10px] opacity-70">Rol</span>
                                                            <span className="text-white capitalize">{role}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Comment Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex items-center gap-3 flex-wrap">
                                                        <span className="font-black text-white text-sm tracking-wide hover:text-(--accent) cursor-pointer transition-colors">
                                                            {displayName}
                                                        </span>
                                                        <img 
                                                            src={roleImage} 
                                                            alt={role} 
                                                            className="object-contain select-none"
                                                            style={{ maxHeight: '28px' }}
                                                            onError={(e) => {
                                                                e.currentTarget.style.display = 'none';
                                                            }}
                                                        />
                                                    </div>
                                                    <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest bg-black/20 px-2 py-1 rounded-lg">
                                                        {new Date(comment.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap wrap-break-word font-medium">
                                                    {comment.content}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })()}

                                {/* Actions */}
                                {(isAdmin || user?.id === comment.author_id || user?.id === profileId) && (
                                    <button type="button" 
                                        onClick={() => handleDeleteClick(comment.id)}
                                        className="absolute top-4 right-4 p-2 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                        title={t('common.delete', 'Eliminar')}
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                )}
                            </motion.div>
                        );
                    })
                )}
                </AnimatePresence>
            )}
            </div>

            <ConfirmationModal
                isOpen={!!deleteCommentId}
                onClose={() => !isDeleting && setDeleteCommentId(null)}
                onConfirm={confirmDelete}
                isLoading={isDeleting}
                title={t('common.confirm_delete_title', 'Confirmar eliminación')}
                message={t('common.confirm_delete_msg', '¿Estás seguro de que deseas eliminar este comentario? Esta acción no se puede deshacer.')}
                confirmText={t('common.delete', 'Eliminar')}
                cancelText={t('common.cancel', 'Cancelar')}
            />
        </div>
    )
}
