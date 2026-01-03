import { motion } from "framer-motion"
import { FaHeart, FaPlus } from "react-icons/fa"
import RoleBadge from "./RoleBadge"
import { useTranslation } from "react-i18next"

interface Profile {
    id: string;
    username: string;
    avatar_url?: string;
    profile_banner_url?: string;
    role: string;
    reputation?: number;
    avatar_preference?: 'minecraft' | 'social';
}

interface User {
    id: string;
}

interface ProfileHeaderProps {
    profile: Profile;
    currentUser: User | null;
    onGiveKarma: () => void;
    givingKarma: boolean;
}

export default function ProfileHeader({ profile, currentUser, onGiveKarma, givingKarma }: ProfileHeaderProps) {
    return (
        <div className="profile-header-premium">
             <style>{`
                /* Premium Header & Banner */
                .profile-header-premium {
                    width: 100%;
                    height: 350px;
                    position: relative;
                    overflow: visible;
                    background: #0a0a0a;
                    margin-bottom: 4rem;
                }
                .profile-banner {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    mask-image: linear-gradient(to bottom, rgba(0,0,0,1) 70%, rgba(0,0,0,0));
                    opacity: 0.6;
                }
                .profile-banner-placeholder {
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(45deg, #111 25%, #1a1a1a 50%, #111 75%);
                    background-size: 200% 200%;
                    animation: gradient-shift 10s ease infinite;
                    mask-image: linear-gradient(to bottom, rgba(0,0,0,1) 70%, rgba(0,0,0,0));
                }
                @keyframes gradient-shift {
                    0% { background-position: 0% 50% }
                    50% { background-position: 100% 50% }
                    100% { background-position: 0% 50% }
                }

                /* Floating Avatar Info */
                .profile-header-content {
                    position: absolute;
                    bottom: -30px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 100%;
                    max-width: 1200px;
                    padding: 0 2rem;
                    display: flex;
                    align-items: flex-end;
                    gap: 2rem;
                }
                .profile-avatar-wrapper {
                    position: relative;
                    flex-shrink: 0;
                }
                .profile-avatar-premium {
                    width: 180px;
                    height: 180px;
                    border-radius: 50%;
                    border: 6px solid #050505;
                    background: #111;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.6);
                    object-fit: cover;
                }
                .profile-info-floating {
                    padding-bottom: 20px;
                }
                .profile-info-floating h1 {
                    font-size: 3rem;
                    font-weight: 900;
                    margin: 0;
                    letter-spacing: -1px;
                    text-shadow: 0 4px 20px rgba(0,0,0,0.8);
                }

                 @media (max-width: 900px) {
                    .profile-header-content {
                        flex-direction: column;
                        align-items: center;
                        text-align: center;
                        bottom: -150px;
                    }
                    .profile-header-premium {
                        margin-bottom: 11rem;
                    }
                    .profile-info-floating h1 {
                        font-size: 2.2rem;
                    }
                }
            `}</style>
            
            {profile.profile_banner_url ? (
                <img src={profile.profile_banner_url} alt="Banner" className="profile-banner" />
            ) : (
                <div className="profile-banner-placeholder" />
            )}
            
            <div className="profile-header-content">
                <div className="profile-avatar-wrapper">
                    <img 
                        src={
                            (profile.avatar_preference === 'social' && profile.avatar_url) 
                                ? profile.avatar_url 
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
                            <h1>{profile.username}</h1>
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
                                <FaHeart style={{ color: '#ff4444' }} />
                                <span style={{ fontWeight: 800 }}>{profile.reputation || 0}</span>
                                {currentUser && currentUser.id !== profile.id && (
                                    <button 
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
                                        title="Dar Karma"
                                    >
                                        <FaPlus />
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
