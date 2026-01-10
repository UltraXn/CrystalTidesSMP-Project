import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { motion, AnimatePresence } from "framer-motion"
import { Trash2, Send, MessageCircle, User } from "lucide-react"
import { useAuth } from "../../context/AuthContext"
import { getProfileComments, postProfileComment, deleteProfileComment, ProfileComment } from "../../services/profileCommentService"
import Loader from "../UI/Loader"

interface ProfileWallProps {
    profileId: string; // The UUID of the profile owner
    isAdmin?: boolean;
    mockComments?: ProfileComment[];
}

export default function ProfileWall({ profileId, isAdmin, mockComments }: ProfileWallProps) {
    const { t } = useTranslation()
    const { user } = useAuth()
    const [comments, setComments] = useState<ProfileComment[]>([])
    const [newComment, setNewComment] = useState("")
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)

    useEffect(() => {
        if (mockComments) {
            setComments(mockComments);
            setLoading(false);
            return;
        }

        const fetchComments = async () => {
            try {
                const data = await getProfileComments(profileId)
                setComments(data)
            } catch (error) {
                console.error("Error loading wall comments:", error)
            } finally {
                setLoading(false)
            }
        }
        if (profileId) fetchComments()
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

    const handleDeleteComment = async (id: number) => {
        if (!window.confirm(t('common.confirm_delete', '¿Estás seguro de que quieres eliminar este comentario?'))) return

        try {
            await deleteProfileComment(id)
            setComments(prev => prev.filter(c => c.id !== id))
        } catch (error) {
            console.error("Error deleting comment:", error)
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
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder={t('profile.wall.placeholder', 'Escribe algo en este muro...')}
                            maxLength={500}
                            className="w-full bg-black/20 border border-white/5 rounded-2xl p-4 text-sm font-medium text-white placeholder:text-gray-600 focus:outline-none focus:border-(--accent)/30 transition-all min-h-[120px] resize-none scrollbar-thin scrollbar-thumb-white/10"
                        />
                        <div className="absolute bottom-4 right-4 text-[10px] font-black text-gray-700 bg-black/40 px-2 py-1 rounded-lg backdrop-blur-md">
                            {newComment.length}/500
                        </div>
                    </div>
                    
                    <div className="flex justify-end mt-4">
                        <button 
                            type="submit" 
                            disabled={!newComment.trim() || sending}
                            className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-xl text-xs font-black uppercase tracking-widest hover:bg-(--accent) hover:scale-105 active:scale-95 transition-all shadow-lg shadow-black/20 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:bg-white"
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
                ) : comments.length === 0 ? (
                    <div className="text-center py-12 px-6 bg-black/20 rounded-2xl border border-white/5">
                        <div className="text-4xl mb-4 opacity-20">💬</div>
                        <p className="text-gray-500 font-bold italic">
                            {t('profile.wall.empty', 'Aún no hay mensajes. ¡Sé el primero!')}
                        </p>
                    </div>
                ) : (
                    <AnimatePresence>
                        {comments.map((comment) => (
                            <motion.div
                                key={comment.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="relative bg-black/20 border border-white/5 rounded-2xl p-6 hover:bg-black/30 transition-colors group"
                            >
                                <div className="flex gap-4">
                                    {/* Author Avatar */}
                                    <div className="shrink-0">
                                        {comment.author?.avatar_url ? (
                                            <img 
                                                src={comment.author.avatar_url} 
                                                alt={comment.author.username} 
                                                className="w-12 h-12 rounded-xl object-cover border border-white/10 shadow-lg"
                                            />
                                        ) : (
                                            <User className="w-12 h-12 text-zinc-800" />
                                        )}
                                    </div>

                                    {/* Comment Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-black text-white text-sm tracking-wide">
                                                    {comment.author?.username || t('common.anonymous', 'Anónimo')}
                                                </span>
                                                {comment.author?.role && (
                                                    <span className="text-[10px] bg-white/5 text-gray-400 px-2 py-0.5 rounded uppercase font-bold tracking-wider border border-white/5">
                                                        {comment.author.role}
                                                    </span>
                                                )}
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

                                {/* Actions */}
                                {(isAdmin || user?.id === comment.author_id || user?.id === profileId) && (
                                    <button 
                                        onClick={() => handleDeleteComment(comment.id)}
                                        className="absolute top-4 right-4 p-2 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                        title={t('common.delete', 'Eliminar')}
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>
        </div>
    )
}
