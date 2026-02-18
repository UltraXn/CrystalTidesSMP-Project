import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Send } from "lucide-react"
import Loader from "../UI/Loader"

interface ProfileCommentFormProps {
    onSubmit: (content: string) => Promise<void>;
    isSending: boolean;
}

export default function ProfileCommentForm({ onSubmit, isSending }: ProfileCommentFormProps) {
    const { t } = useTranslation()
    const [newComment, setNewComment] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newComment.trim() || isSending) return

        await onSubmit(newComment)
        setNewComment("")
    }

    return (
        <form onSubmit={handleSubmit} className="mb-8 relative">
            <div className="relative group/input">
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={t('profile.wall.placeholder', 'Escribe algo en este muro...')}
                    maxLength={500}
                    className="w-full bg-black/20 border border-white/5 rounded-2xl p-4 text-sm font-medium text-white placeholder:text-gray-600 focus:outline-none focus:border-(--accent)/30 transition-all min-h-[120px] resize-none scrollbar-thin scrollbar-thumb-white/10"
                    aria-label={t('profile.wall.placeholder', 'Escribe algo en este muro...')}
                />
                <div className="absolute bottom-4 right-4 text-[10px] font-black text-gray-700 bg-black/40 px-2 py-1 rounded-lg backdrop-blur-md">
                    {newComment.length}/500
                </div>
            </div>
            
            <div className="flex justify-end mt-4">
                <button 
                    type="submit" 
                    disabled={!newComment.trim() || isSending}
                    className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-xl text-xs font-black uppercase tracking-widest hover:bg-(--accent) hover:scale-105 active:scale-95 transition-all shadow-lg shadow-black/20 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:bg-white"
                >
                    {isSending ? <Loader minimal /> : <><Send size={16} /> {t('profile.wall.post', 'Publicar')}</>}
                </button>
            </div>
        </form>
    )
}
