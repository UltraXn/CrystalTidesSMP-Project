import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { motion } from "framer-motion"
import { FaUser, FaMedal, FaGamepad, FaTwitter, FaDiscord, FaTwitch, FaYoutube, FaHome } from "react-icons/fa"
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

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface MedalDefinition {
    id: string | number;
    name: string;
    description: string;
    icon: string;
    color: string;
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
    avatar_preference?: 'minecraft' | 'social';
    reputation?: number;
}

interface PlayerStats {
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
    const { t } = useTranslation()
    const { user: currentUser } = useAuth()
    
    
    const isAdmin = checkIsAdmin(currentUser)

    
    const [profile, setProfile] = useState<Profile | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [medalDefinitions, setMedalDefinitions] = useState<MedalDefinition[]>([])
    const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null)
    const [statsLoading, setStatsLoading] = useState(false)
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
                showToast("¡Karma entregado!", "success");
            } else {
                showToast(data.error || "Error al dar karma", "error");
            }
        } catch (e) { 
            console.error(e); 
            showToast("Error de conexión", "error");
        }
        finally { setGivingKarma(false); }
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            setError(null)
            try {
                // 1. Fetch Profile
                const resUser = await fetch(`${API_URL}/users/profile/${username}`)
                if (!resUser.ok) {
                    if(resUser.status === 404) throw new Error(t('profile.not_found', 'Usuario no encontrado'))
                    throw new Error("Error loading profile")
                }
                
                const contentType = resUser.headers.get("content-type");
                let response;
                if (contentType && contentType.includes("application/json")) {
                    response = await resUser.json()
                } else {
                    throw new Error("Invalid response format from server")
                }
                if (!response.success || !response.data) throw new Error("Invalid response format")
                const userData = response.data
                setProfile(userData)

                // 2. Fetch Medals Definitions (if user has medals)
                if (userData.medals && userData.medals.length > 0) {
                    const resSettings = await fetch(`${API_URL}/settings`)
                    if (resSettings.ok) {
                        const contentType = resSettings.headers.get("content-type");
                        if (contentType && contentType.includes("application/json")) {
                            const settings = await resSettings.json()
                            if (settings.medal_definitions) {
                                try {
                                    const parsed = typeof settings.medal_definitions === 'string' 
                                        ? JSON.parse(settings.medal_definitions) 
                                        : settings.medal_definitions
                                    setMedalDefinitions(Array.isArray(parsed) ? parsed : [])
                                } catch (e) {
                                    console.warn("Failed to parse medals", e)
                                }
                            }
                        }
                    }
                }

                if (userData.public_stats) {
                    setStatsLoading(true)
                    try {
                        const resStats = await fetch(`${API_URL}/player-stats/${username}`)
                        if (resStats.ok) {
                            const contentType = resStats.headers.get("content-type");
                            if (contentType && contentType.includes("application/json")) {
                                const response = await resStats.json()
                                if (response.success && response.data) {
                                    setPlayerStats(response.data)
                                } else {
                                    setPlayerStats(response)
                                }
                            }
                        }
                    } catch (e) { console.warn("Failed to fetch stats", e) }
                    finally { setStatsLoading(false) }
                }
            } catch (err) {
                console.error(err)
                setError(err instanceof Error ? err.message : "Unknown error")
            } finally {
                setLoading(false)
            }
        }

        if (username) fetchData()
    }, [username, t])

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
                <FaUser size={50} style={{ color: '#ff4444', opacity: 0.8 }} />
            </motion.div>
            
            <div style={{ maxWidth: '450px' }}>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem', background: 'linear-gradient(to bottom, #fff, #888)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {t('profile.not_found_title', '¿A dónde se fue?')}
                </h2>
                <p style={{ color: 'var(--muted)', fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '2.5rem' }}>
                    {t('profile.not_found_desc', 'No hemos podido encontrar a ningún usuario con ese nombre. Quizás se ha perdido en el mar o nunca existió.')}
                </p>
                
                <button 
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
                    <FaHome /> {t('common.back_home', 'Volver al Inicio')}
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
                <style>{`
                 /* Layout */
                .profile-content {
                    width: 100%;
                    max-width: 1200px;
                    padding: 0 1.5rem;
                    display: grid;
                    grid-template-columns: 320px 1fr;
                    gap: 2rem;
                }
                .profile-sidebar {
                    display: flex;
                    flex-direction: column;
                    gap: 2rem;
                }
                 @media (max-width: 900px) {
                    .profile-content {
                        grid-template-columns: 1fr;
                    }
                }
                
                /* Glassmorphism Cards (Still needed for SkinViewer wrapper) */
                .premium-card {
                    background: rgba(255, 255, 255, 0.03);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.06);
                    border-radius: 24px;
                    padding: 2rem;
                    position: relative;
                    transition: all 0.3s ease;
                }
                .premium-card:hover {
                    border-color: rgba(255, 255, 255, 0.12);
                    box-shadow: 0 15px 35px rgba(0,0,0,0.2);
                }
                .premium-card h3 {
                    font-size: 0.9rem;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    color: rgba(255,255,255,0.4);
                    margin-bottom: 1.5rem;
                    display: flex;
                    align-items: center;
                    gap: 0.8rem;
                }
                 .skin-preview-premium {
                    width: 100%;
                    aspect-ratio: 3/4;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                }
                `}</style>

                {/* Left Column: Stats & Skin */}
                <div className="profile-sidebar">
                     {/* Skin Showcase */}
                     <div className="premium-card">
                        <h3><FaGamepad /> {t('profile.skin', 'Avatar 3D')}</h3>
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
                                <h3><FaUser /> {t('profile.about_me')}</h3>
                                <div style={{ color: '#aaa', lineHeight: 1.8 }}>
                                    {profile.bio ? <MarkdownRenderer content={profile.bio} /> : <p style={{ fontStyle: 'italic' }}>{t('profile.no_bio', 'Este usuario prefiere mantener el misterio.')}</p>}
                                </div>
                            </div>
                            
                            <div style={{ width: '200px' }}>
                                <h4 style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#444', letterSpacing: '1px', marginBottom: '1rem' }}>Social</h4>
                                <div style={{ display: 'flex', gap: '0.8rem' }}>
                                    {profile.social_discord && <FaDiscord size={20} style={{ color: '#5865F2' }} title={profile.social_discord} />}
                                    {profile.social_twitter && <FaTwitter size={20} style={{ color: '#1d9bf0' }} />}
                                    {profile.social_twitch && <FaTwitch size={20} style={{ color: '#9146FF' }} />}
                                    {profile.social_youtube && <FaYoutube size={20} style={{ color: '#ff0000' }} />}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Medals Showcase */}
                    {profile.medals && profile.medals.length > 0 && (
                        <div className="premium-card">
                            <h3><FaMedal /> {t('profile.medals')}</h3>
                            <div className="medal-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
                                {profile.medals.map((medalId: string | number) => {
                                    const def = medalDefinitions.find((m: MedalDefinition) => m.id === medalId)
                                    if (!def) return null
                                    const Icon = MEDAL_ICONS[def.icon as keyof typeof MEDAL_ICONS] || FaMedal
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
                                            <Icon style={{ color: def.color, fontSize: '1.2rem' }} />
                                            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{def.name}</span>
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
