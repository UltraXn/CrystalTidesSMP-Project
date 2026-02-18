import { Trash2, MessageCircle } from "lucide-react"
import { m } from "framer-motion"
import { ProfileComment } from "../../services/profileCommentService"
import { useTranslation } from "react-i18next"
import { User as SupabaseUser } from "@supabase/supabase-js"

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

interface ProfileCommentItemProps {
    comment: ProfileComment;
    currentUser: SupabaseUser | null;
    profileOwnerId: string;
    isAdmin?: boolean;
    onDelete: (id: number) => void;
}

export default function ProfileCommentItem({ comment, currentUser, profileOwnerId, isAdmin, onDelete }: ProfileCommentItemProps) {
    const { t } = useTranslation()
    
    // Use local user data if it's my own comment (to ensure settings are up-to-date)
    const isMe = currentUser?.id === comment.author_id;
    
    interface AuthorMetadata {
        avatar_preference?: string;
        minecraft_nick?: string;
        status_message?: string;
        full_name?: string;
        username?: string;
        discord_tag?: string;
    }

    const authorMetadata = (isMe 
        ? currentUser?.user_metadata 
        : comment.author) as AuthorMetadata | undefined;
    
    const pref = (authorMetadata?.avatar_preference as string) || 'minecraft';
    const mcNick = (authorMetadata?.minecraft_nick as string) || '';
    const statusMessage = (authorMetadata?.status_message as string) || '';
    const discordTag = (authorMetadata?.discord_tag as string) || '';

    const useMinecraft = pref === 'minecraft' && mcNick;

    const displayAvatar = useMinecraft 
        ? `https://mc-heads.net/avatar/${mcNick}/128`
        : (isMe 
            ? ((currentUser?.user_metadata?.picture || currentUser?.user_metadata?.avatar_url || comment.author?.avatar_url) as string)
            : ((comment.author?.social_avatar_url || comment.author?.avatar_url) as string));

    const displayName = String((useMinecraft && mcNick)
        ? mcNick 
        : (authorMetadata?.full_name || authorMetadata?.username || comment.author?.username || t('common.anonymous')));

    const roleRaw = isMe ? currentUser?.user_metadata?.role : comment.author?.role;
    const role = String(roleRaw || 'user').toLowerCase();
    const roleImage = RANK_IMAGES[role] || (role.includes('donador') ? RANK_IMAGES['donador'] : RANK_IMAGES['user']);

    const canDelete = isAdmin || currentUser?.id === comment.author_id || currentUser?.id === profileOwnerId;

    return (
        <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-black/20 border border-white/5 rounded-2xl p-6 hover:bg-black/30 transition-colors group"
        >
            <div className="flex gap-4">
                {/* Author Avatar & Info with Tooltip */}
                <div 
                    className="shrink-0 group/author relative"
                    tabIndex={0}
                    role="button"
                    aria-label={t('profile.wall.view_profile', 'Ver perfil de {{name}}', { name: displayName })}
                >
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

                    {/* Tooltip implementation */}
                    <div className="absolute bottom-full left-0 mb-3 opacity-0 group-hover/author:opacity-100 transition-opacity duration-200 pointer-events-none z-50 w-64 bg-[#0a0a0a]/95 border border-white/10 rounded-xl shadow-2xl backdrop-blur-xl p-4 translate-y-2 group-hover/author:translate-y-0">
                        <div className="flex items-center gap-3 mb-3 border-b border-white/5 pb-3">
                            <img src={displayAvatar || `https://ui-avatars.com/api/?name=${displayName}`} className="w-10 h-10 rounded-lg shadow-inner" alt={t('common.avatar', 'Avatar')} />
                            <div>
                                <p className="font-bold text-white text-sm leading-tight">{displayName}</p>
                                {statusMessage && (
                                    <p className="text-[10px] text-gray-400 italic mt-0.5 line-clamp-2">"{statusMessage}"</p>
                                )}
                                <img src={roleImage} alt={role} className="h-4 mt-1 object-contain object-left" />
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
                            <span 
                                className="font-black text-white text-sm tracking-wide hover:text-(--accent) cursor-pointer transition-colors"
                                tabIndex={0}
                                role="link"
                            >
                                {displayName}
                            </span>
                            <img 
                                src={roleImage} 
                                alt={role} 
                                className="h-5 object-contain select-none"
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

            {/* Actions */}
            {canDelete && (
                <button 
                    onClick={() => onDelete(comment.id)}
                    className="absolute top-4 right-4 p-2 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    title={t('common.delete', 'Eliminar')}
                    aria-label={t('common.delete', 'Eliminar comentario')}
                >
                    <Trash2 size={12} />
                </button>
            )}
        </m.div>
    );
}
