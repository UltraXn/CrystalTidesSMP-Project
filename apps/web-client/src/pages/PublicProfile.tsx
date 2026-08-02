import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useParams, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { m as motion } from "framer-motion"
import { User, Medal, Gamepad2, Home, Twitter, Twitch, Youtube } from "lucide-react"
import Loader from "../components/UI/Loader"
import { MEDAL_ICONS } from "../utils/MedalIcons"
import MarkdownRenderer from "../components/UI/MarkdownRenderer"
import ProfileWall from "../components/User/ProfileWall"
import SkinViewer from "../components/User/SkinViewer"
import { useAuth } from "../context/AuthContext"
import { isAdmin as checkIsAdmin } from "../utils/roleUtils"
import { supabase } from "../services/supabaseClient"
import Toast, { ToastType } from "../components/UI/Toast"
import ProfileHeader from "../components/User/ProfileHeader"
import PlayerStatsGrid from "../components/User/PlayerStatsGrid"
import "../styles/pages/public_profile.css"

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface MedalDefinition {
    id: string | number;
    name: string;
    description: string;
    icon: string;
    color: string;
    image_url?: string;
    name_en?: string;
    description_en?: string;
}

interface Profile {
    id: string;
    username: string;
    avatar_url?: string;
    profile_banner_url?: string;
    role: string;
    created_at: string;
    medals?: (string | number)[];
    public_stats: boolean;
    bio?: string;
    social_discord?: string;
    social_twitter?: string;
    social_twitch?: string;
    social_youtube?: string;
    minecraft_uuid?: string;
    minecraft_nick?: string;
    original_username?: string;
    avatar_preference?: 'minecraft' | 'social';
    reputation?: number;
    status_message?: string;
    full_name?: string;
}

export interface PlayerStats {
    playtime: string;
    kills: number;
    mob_kills: number;
    deaths: number;
    money: string;
    blocks_mined: string;
    blocks_placed: string;
}

// LinkDiscordForm was here, removed as it belongs more to Account settings.

export default function PublicProfile() {
    const { username } = useParams()
    const navigate = useNavigate()
    const { t, i18n } = useTranslation()
    const { user: currentUser } = useAuth()
    
    
    const isAdmin = checkIsAdmin(currentUser)

    
    const [overrideProfile, setProfile] = useState<Profile | null>(null)
    const [givingKarma, setGivingKarma] = useState(false)
    const [toast, setToast] = useState<{ visible: boolean; message: string; type: ToastType }>({
        visible: false,
        message: '',
        type: 'info'
    })

    const showToast = (message: string, type: ToastType = 'info') => {
        setToast({ visible: true, message, type })
    }

    const handleGiveKarma = async () => {
        if (!currentUser || !profile) return;
        if (currentUser.id === profile.id) return;
        
        setGivingKarma(true);
        try {
            const res = await fetch(`${API_URL}/users/${profile.id}/karma`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
                }
            });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || `Error ${res.status}`);
            }

            const contentType = res.headers.get("content-type");
            let data;
            if (contentType && contentType.includes("application/json")) {
                data = await res.json();
            } else {
                throw new Error("Invalid response from server");
            }
            
            if (res.ok) {
                setProfile(prev => prev ? ({ ...prev, reputation: data.newReputation }) : null);
                showToast(t('profile.karma_success'), "success");
            } else {
                showToast(data.error || t('profile.karma_error'), "error");
            }
        } catch (e) { 
            console.error(e); 
            showToast(t('profile.karma_conn_error'), "error");
        }
        finally { setGivingKarma(false); }
    };

    const { data: profileQueryData, isLoading: queryLoading, error: queryError } = useQuery({
        queryKey: ['publicProfile', username],
        queryFn: async () => {
            if (!username) return null;
            const resUser = await fetch(`${API_URL}/users/profile/${username}`);
            if (!resUser.ok) {
                if (resUser.status === 404) throw new Error(t('profile.not_found', 'Usuario no encontrado'));
                throw new Error("Error loading profile");
            }
            const contentType = resUser.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error("Invalid response format from server");
            }
            const response = await resUser.json();
            if (!response.success || !response.data) throw new Error("Invalid response format");
            
            const userData = response.data;
            let medalDefs: MedalDefinition[] = [];
            if (userData.medals && userData.medals.length > 0) {
                const resSettings = await fetch(`${API_URL}/settings`);
                if (resSettings.ok) {
                    const cType = resSettings.headers.get("content-type");
                    if (cType && cType.includes("application/json")) {
                        const settings = await resSettings.json();
                        if (settings.medal_definitions) {
                            try {
                                const parsed = typeof settings.medal_definitions === 'string'
                                    ? JSON.parse(settings.medal_definitions)
                                    : settings.medal_definitions;
                                medalDefs = Array.isArray(parsed) ? parsed : [];
                            } catch (e) {
                                console.warn("Failed to parse medals", e);
                            }
                        }
                    }
                }
            }
            return { profile: userData, medalDefinitions: medalDefs };
        },
        enabled: Boolean(username),
        staleTime: 30_000,
    });

    const profile = profileQueryData?.profile ?? overrideProfile;
    const medalDefinitions = profileQueryData?.medalDefinitions ?? [];
    const loading = queryLoading;
    const error = queryError ? (queryError as Error).message : null;

    const statsIdentifier = profile?.public_stats ? (profile.minecraft_uuid || profile.minecraft_nick || profile.original_username || username) : null;

    const { data: playerStats = null, isLoading: statsLoading } = useQuery({
        queryKey: ['publicProfileStats', statsIdentifier, API_URL],
        queryFn: async () => {
            if (!statsIdentifier) return null;
            const resStats = await fetch(`${API_URL}/player-stats/${statsIdentifier}`);
            if (resStats.ok) {
                const contentType = resStats.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                    const response = await resStats.json();
                    return response.success && response.data ? response.data : response;
                }
            }
            return null;
        },
        enabled: Boolean(statsIdentifier && profile?.public_stats),
        staleTime: 30_000,
    });

    if (loading) return <div className="layout-center"><Loader /></div>
    
    if (error) return (
        <div style={{ 
            display: 'flex',
            flexDirection: 'column', 
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2rem', 
            minHeight: '80vh',
            textAlign: 'center',
            padding: '2rem',
            width: '100%'
        }}>
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                    width: '120px',
                    height: '120px',
                    background: 'rgba(255, 68, 68, 0.1)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(255, 68, 68, 0.2)',
                    marginBottom: '1rem',
                    boxShadow: '0 0 40px rgba(255, 68, 68, 0.1)'
                }}
            >
                <User size={50} style={{ color: '#ff4444', opacity: 0.8 }} />
            </motion.div>
            
            <div style={{ maxWidth: '450px' }}>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem', background: 'linear-gradient(to bottom, #fff, #888)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {t('profile.not_found_title', '¿A dónde se fue?')}
                </h2>
                <p style={{ color: 'var(--muted)', fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '2.5rem' }}>
                    {t('profile.not_found_desc', 'No hemos podido encontrar a ningún usuario con ese nombre. Quizás se ha perdido en el mar o nunca existió.')}
                </p>
                
                <button type="button" 
                    className="nav-btn primary" 
                    onClick={() => navigate('/')}
                    style={{ 
                        padding: '1rem 2.5rem', 
                        fontSize: '1rem', 
                        borderRadius: '12px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.8rem'
                    }}
                >
                    <Home size={18} /> {t('common.back_home', 'Volver al Inicio')}
                </button>
            </div>
        </div>
    )

    if (!profile) return null

    return (
        <div className="public-profile-container fade-in">
            {/* Premium Header */}
            <ProfileHeader 
                profile={profile} 
                currentUser={currentUser} 
                onGiveKarma={handleGiveKarma} 
                givingKarma={givingKarma} 
            />
            
            <div className="profile-content">
                {/* Left Column: Stats & Skin */}
                <div className="profile-sidebar">
                     {/* Skin Showcase */}
                     <div className="premium-card">
                        <h3><Gamepad2 size={18} /> {t('profile.skin_title')}</h3>
                        <div className="skin-preview-premium">
                            <SkinViewer username={profile.username} height={380} width={280} />
                        </div>
                    </div>

                    {/* Stats Showcase */}
                    <PlayerStatsGrid 
                        stats={playerStats} 
                        loading={statsLoading} 
                        isPublic={!!profile.public_stats} 
                        isAdmin={isAdmin} 
                    />
                </div>

                {/* Right Column: Bio, Medals & Wall */}
                <div className="profile-main">
                    {/* Bio & Social */}
                    <div className="premium-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                            <div style={{ flex: 1, minWidth: '300px' }}>
                                <h3><User size={18} /> {t('profile.about_me')}</h3>
                                <div style={{ color: '#aaa', lineHeight: 1.8 }}>
                                    {profile.bio ? <MarkdownRenderer content={profile.bio} /> : <p style={{ fontStyle: 'italic' }}>{t('profile.no_bio')}</p>}
                                </div>
                            </div>
                            
                            <div style={{ width: '200px' }}>
                                <h4 style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#444', letterSpacing: '1px', marginBottom: '1rem' }}>Social</h4>
                                <div style={{ display: 'flex', gap: '0.8rem' }}>
                                    {profile.social_discord && (
                                        <motion.div 
                                            whileHover={{ scale: 1.1 }} 
                                            whileTap={{ scale: 0.95 }} 
                                            role="button"
                                            tabIndex={0}
                                            style={{ cursor: 'pointer' }} 
                                            onClick={() => {
                                                navigator.clipboard.writeText(profile.social_discord!);
                                                showToast(t('common.copied', 'Copiado al portapapeles'), 'success');
                                            }} 
                                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigator.clipboard.writeText(profile.social_discord!); showToast(t('common.copied', 'Copiado al portapapeles'), 'success'); } }}
                                            title={profile.social_discord}
                                        >
                                            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 640 512" height="20" width="20" xmlns="http://www.w3.org/2000/svg" style={{ color: '#5865F2' }}>
                                                <title>{profile.social_discord}</title>
                                                <path d="M524.531,69.836a1.5,1.5,0,0,0-.764-.7A485.065,485.065,0,0,0,404.081,32.03a1.816,1.816,0,0,0-1.923.91,337.461,337.461,0,0,0-14.9,30.6,447.848,447.848,0,0,0-134.426,0,309.541,309.541,0,0,0-15.135-30.6,1.89,1.89,0,0,0-1.924-.91A483.689,483.689,0,0,0,116.085,69.137a1.712,1.712,0,0,0-.788.676C39.068,183.651,18.186,294.69,28.43,404.354a2.016,2.016,0,0,0,.765,1.375A487.666,487.666,0,0,0,176.02,479.918a1.9,1.9,0,0,0,2.063-.676A348.2,348.2,0,0,0,208.12,430.4a1.86,1.86,0,0,0-1.019-2.588,321.173,321.173,0,0,1-45.868-21.853,1.885,1.885,0,0,1-.185-3.126c3.082-2.309,6.166-4.711,9.109-7.137a1.819,1.819,0,0,1,1.9-.256c96.229,43.917,200.41,43.917,295.5,0a1.812,1.812,0,0,1,1.924.233c2.944,2.426,6.027,4.851,9.132,7.16a1.884,1.884,0,0,1-.162,3.126,301.407,301.407,0,0,1-45.89,21.83,1.875,1.875,0,0,0-1,2.611,391.055,391.055,0,0,0,30.014,48.815,1.864,1.864,0,0,0,2.063.7A486.048,486.048,0,0,0,610.7,405.729a1.882,1.882,0,0,0,.765-1.352C623.729,277.594,590.8,167.234,524.531,69.836ZM222.491,337.58c-28.972,0-52.844-26.587-52.844-59.239S193.056,219.1,222.491,219.1c29.665,0,53.306,26.82,52.843,59.239C275.334,310.993,251.924,337.58,222.491,337.58Zm195.38,0c-28.971,0-52.843-26.587-52.843-59.239S388.437,219.1,417.871,219.1c29.667,0,53.307,26.82,52.844,59.239C470.715,310.993,447.538,337.58,417.871,337.58Z" />
                                            </svg>
                                        </motion.div>
                                    )}
                                    {profile.social_twitter && (
                                        <motion.a 
                                            whileHover={{ scale: 1.1 }} 
                                            whileTap={{ scale: 0.95 }} 
                                            href={profile.social_twitter.startsWith('http') ? profile.social_twitter : `https://twitter.com/${profile.social_twitter}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            style={{ color: '#1d9bf0' }}
                                            title={t('profile.visit_twitter', 'Visitar Twitter')}
                                        >
                                            <Twitter size={20} />
                                        </motion.a>
                                    )}
                                    {profile.social_twitch && (
                                        <motion.a 
                                            whileHover={{ scale: 1.1 }} 
                                            whileTap={{ scale: 0.95 }}
                                            href={profile.social_twitch.startsWith('http') ? profile.social_twitch : `https://twitch.tv/${profile.social_twitch}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            style={{ color: '#9146FF' }}
                                            title={t('profile.visit_twitch', 'Visitar Twitch')}
                                        >
                                            <Twitch size={20} />
                                        </motion.a>
                                    )}
                                    {profile.social_youtube && (
                                        <motion.a 
                                            whileHover={{ scale: 1.1 }} 
                                            whileTap={{ scale: 0.95 }}
                                            href={profile.social_youtube.startsWith('http') ? profile.social_youtube : `https://youtube.com/@${profile.social_youtube}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            style={{ color: '#ff0000' }}
                                            title={t('profile.visit_youtube', 'Visitar YouTube')}
                                        >
                                            <Youtube size={20} />
                                        </motion.a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Medals Showcase */}
                    {profile.medals && profile.medals.length > 0 && (
                        <div className="premium-card">
                            <h3><Medal size={18} /> {t('profile.medals')}</h3>
                            <div className="medal-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
                                {profile.medals.map((medalId: string | number) => {
                                    const def = medalDefinitions.find((m: MedalDefinition) => m.id === medalId)
                                    if (!def) return null
                                    const Icon = MEDAL_ICONS[def.icon as keyof typeof MEDAL_ICONS] || Medal
                                    return (
                                        <motion.div 
                                            key={medalId}
                                            whileHover={{ scale: 1.1, rotate: 5 }}
                                            style={{ 
                                                padding: '0.8rem', 
                                                background: 'rgba(255,255,255,0.03)', 
                                                borderRadius: '12px',
                                                border: `1px solid ${def.color}33`,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.8rem'
                                            }}
                                            title={def.description}
                                        >
                                            {def.image_url ? (
                                                <img 
                                                    src={def.image_url} 
                                                    alt={def.name} 
                                                    style={{ width: '1.5rem', height: '1.5rem', objectFit: 'contain' }} 
                                                />
                                            ) : (
                                                <Icon style={{ color: def.color, fontSize: '1.2rem' }} />
                                            )}
                                            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                                                {(() => {
                                                    // Check for English dynamic content
                                                    if (i18n.language.startsWith('en') && def.name_en) return def.name_en;
                                                    return t(`account.medals.items.${medalId}.title`, def.name) as string;
                                                })()}
                                            </span>
                                        </motion.div>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* Profile Wall */}
                    <div className="premium-card" style={{ padding: 0, background: 'transparent', border: 'none', backdropFilter: 'none' }}>
                         <ProfileWall profileId={profile.id} isAdmin={isAdmin} />
                    </div>
                </div>
            </div>

            {/* Toast Notifications */}
            <Toast 
                message={toast.message} 
                type={toast.type} 
                isVisible={toast.visible}
                onClose={() => setToast(prev => ({ ...prev, visible: false }))} 
            />
        </div>
    )
}
