import { useState } from "react"
import { useTranslation } from "react-i18next"
import { AnimatePresence } from "framer-motion"
import { MessageCircle } from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "../../context/AuthContext"
import { getProfileComments, postProfileComment, deleteProfileComment, ProfileComment } from "../../services/profileCommentService"
import Loader from "../UI/Loader"
import ConfirmationModal from "../UI/ConfirmationModal"
import ProfileCommentItem from "./ProfileCommentItem"
import ProfileCommentForm from "./ProfileCommentForm"

interface ProfileWallProps {
    profileId: string; // The UUID of the profile owner
    isAdmin?: boolean;
    mockComments?: ProfileComment[];
}

export default function ProfileWall({ profileId, isAdmin, mockComments }: ProfileWallProps) {
    const { t } = useTranslation()
    const { user } = useAuth()
    const queryClient = useQueryClient()
    const [deleteCommentId, setDeleteCommentId] = useState<number | null>(null)

    // Data Fetching with TanStack Query
    const { data: comments = [], isLoading } = useQuery({
        queryKey: ['profile-comments', profileId],
        queryFn: () => getProfileComments(profileId),
        enabled: !!profileId && !mockComments,
        initialData: mockComments
    })

    // Mutations
    const postMutation = useMutation({
        mutationFn: (content: string) => postProfileComment(profileId, content),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile-comments', profileId] })
        }
    })

    const deleteMutation = useMutation({
        mutationFn: (commentId: number) => deleteProfileComment(commentId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile-comments', profileId] })
            setDeleteCommentId(null)
        }
    })

    const handlePostComment = async (content: string) => {
        await postMutation.mutateAsync(content)
    }

    const handleDeleteClick = (id: number) => {
        setDeleteCommentId(id);
    };

    const confirmDelete = async () => {
        if (!deleteCommentId) return;
        await deleteMutation.mutateAsync(deleteCommentId)
    }

    return (
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8 shadow-2xl">
            <h3 className="flex items-center gap-3 text-xl font-black uppercase tracking-widest text-white mb-6 border-b border-white/5 pb-4">
                <MessageCircle className="text-(--accent)" /> {t('profile.wall.title', 'Muro de Comentarios')}
            </h3>

            {/* Input Form */}
            {user ? (
                <ProfileCommentForm 
                    onSubmit={handlePostComment} 
                    isSending={postMutation.isPending} 
                />
            ) : (
                <div className="p-8 bg-black/20 border border-white/5 rounded-2xl text-center mb-8 border-dashed">
                    <p className="text-gray-500 font-bold text-sm">
                        {t('profile.wall.login_required', 'Inicia sesión para dejar un comentario.')}
                    </p>
                </div>
            )}

            {/* Comments List */}
            <div className="space-y-4">
                {isLoading ? (
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
                    <div className="space-y-4">
                        <AnimatePresence mode="popLayout">
                            {comments.map((comment) => (
                                <ProfileCommentItem
                                    key={comment.id}
                                    comment={comment}
                                    currentUser={user}
                                    profileOwnerId={profileId}
                                    isAdmin={isAdmin}
                                    onDelete={handleDeleteClick}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            <ConfirmationModal
                isOpen={!!deleteCommentId}
                onClose={() => !deleteMutation.isPending && setDeleteCommentId(null)}
                onConfirm={confirmDelete}
                isLoading={deleteMutation.isPending}
                title={t('common.confirm_delete_title', 'Confirmar eliminación')}
                message={t('common.confirm_delete_msg', '¿Estás seguro de que deseas eliminar este comentario? Esta acción no se puede deshacer.')}
                confirmText={t('common.delete', 'Eliminar')}
                cancelText={t('common.cancel', 'Cancelar')}
            />
        </div>
    )
}
