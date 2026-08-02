import { m as motion } from "framer-motion"
import { Heart, Plus } from "lucide-react"
import RoleBadge from "./RoleBadge"
import { useTranslation } from "react-i18next"
import "../../styles/widgets/profile_header.css"

interface Profile {
    id: string;
    username: string;
    avatar_url?: string;
    profile_banner_url?: string;
    role: string;
    reputation?: number;
    avatar_preference?: 'minecraft' | 'social';
    status_message?: string;
    full_name?: string;
    social_avatar_url?: string;
    minecraft_nick?: string;
}

interface User {
    id: string;
    user_metadata?: {
        full_name?: string;
        username?: string;
        status_message?: string;
    };
}

interface ProfileHeaderProps {
    profile: Profile;
    currentUser: User | null;
    onGiveKarma: () => void;
    givingKarma: boolean;
}

export default function ProfileHeader({ profile, currentUser, onGiveKarma, givingKarma }: ProfileHeaderProps) {
    const { t } = useTranslation()

    // Determine display name
    // 1. If viewing own profile, verify local metadata to ensure freshness
    // 2. If viewing others, rely on profile data
    // 3. Logic: If preference is Social and full_name exists, use it. Else Username.
    const displayName = (() => {
        const pref = profile.avatar_preference || 'minecraft';
        const useMinecraft = pref === 'minecraft';
        const mcNick = profile.minecraft_nick || profile.username;

        if (useMinecraft) return mcNick;
        return profile.full_name || profile.username;
    })();

    return (
        <div className="profile-header-premium">
            {profile.profile_banner_url ? (
                <img src={profile.profile_banner_url} alt="Banner" className="profile-banner" />
            ) : (
                <div className="profile-banner-placeholder" />
            )}
            
            <div className="profile-header-content">
                <div className="profile-avatar-wrapper">
                    <img 
                        src={
                            (profile.avatar_preference === 'social') 
                                ? (profile.social_avatar_url || profile.avatar_url || `https://ui-avatars.com/api/?name=${displayName}`) 
                                : `https://mc-heads.net/avatar/${profile.username}/180`
                        } 
                        alt={profile.username}
                        className="profile-avatar-premium"
                    />
                </div>
                <div className="profile-info-floating">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <RoleBadge role={profile.role} username={profile.username} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                            <h1>{displayName}</h1>
                            <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '0.5rem', 
                                background: 'rgba(255,255,255,0.05)',
                                padding: '0.4rem 0.8rem',
                                borderRadius: '12px',
                                border: '1px solid rgba(255,255,255,0.1)',
                                backdropFilter: 'blur(10px)'
                            }}>
                                <Heart style={{ color: '#ff4444' }} size={16} />
                                <span style={{ fontWeight: 800 }}>{profile.reputation || 0}</span>
                                {currentUser && currentUser.id !== profile.id && (
                                    <button aria-label="Action" type="button" 
                                        onClick={onGiveKarma}
                                        disabled={givingKarma}
                                        style={{ 
                                            background: 'none', 
                                            border: 'none', 
                                            color: '#ff4444', 
                                            cursor: 'pointer',
                                            padding: '0.2rem',
                                            display: 'flex',
                                            opacity: givingKarma ? 0.5 : 1
                                        }}
                                        title={t('profile.give_karma')}
                                    >
                                        <Plus size={14} />
                                    </button>
                                )}
                            </div>
                        </div>
                        
						{(() => {
                             // Status Message Logic
                             const statusMsg = currentUser?.id === profile.id 
                                ? (currentUser.user_metadata?.status_message || profile.status_message)
                                : profile.status_message;

                             if (!statusMsg) return null;

                             return (
                                <motion.div 
                                    initial={{ opacity: 0, y: 5, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                    className="mt-3 inline-flex relative"
                                >
                                    <div className="bg-[#111] border border-white/10 px-4 py-2.5 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.5)] backdrop-blur-md">
                                        <p className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]" />
                                            "{statusMsg}"
                                        </p>
                                    </div>
                                </motion.div>
                             );
                        })()}
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
