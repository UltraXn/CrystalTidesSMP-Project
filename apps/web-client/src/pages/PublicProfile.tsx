import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { motion } from "framer-motion"
import { User, Medal, Gamepad2, Home } from "lucide-react"
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
    image_url?: string;
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
                <User size={50} style={{ color: '#ff4444', opacity: 0.8 }} />
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
                <style>{`
                 /* Layout */
                .profile-content {
                    width: 100%;
                    max-width: 1200px;
                    padding: 0 1.5rem;
                    display: grid;
                    grid-template-columns: 350px 1fr;
                    gap: 2rem;
                    margin: 0 auto;
                }
                .profile-main {
                    display: flex;
                    flex-direction: column;
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
                                    {profile.social_discord && <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 640 512" height="20" width="20" xmlns="http://www.w3.org/2000/svg" style={{ color: '#5865F2' }}><title>{profile.social_discord}</title><path d="M524.531,69.836a1.5,1.5,0,0,0-.764-.7A485.065,485.065,0,0,0,404.081,32.03a1.816,1.816,0,0,0-1.923.91,337.461,337.461,0,0,0-14.9,30.6,447.848,447.848,0,0,0-134.426,0,309.541,309.541,0,0,0-15.135-30.6,1.89,1.89,0,0,0-1.924-.91A483.689,483.689,0,0,0,116.085,69.137a1.712,1.712,0,0,0-.788.676C39.068,183.651,18.186,294.69,28.43,404.354a2.016,2.016,0,0,0,.765,1.375A487.666,487.666,0,0,0,176.02,479.918a1.9,1.9,0,0,0,2.063-.676A348.2,348.2,0,0,0,208.12,430.4a1.86,1.86,0,0,0-1.019-2.588,321.173,321.173,0,0,1-45.868-21.853,1.885,1.885,0,0,1-.185-3.126c3.082-2.309,6.166-4.711,9.109-7.137a1.819,1.819,0,0,1,1.9-.256c96.229,43.917,200.41,43.917,295.5,0a1.812,1.812,0,0,1,1.924.233c2.944,2.426,6.027,4.851,9.132,7.16a1.884,1.884,0,0,1-.162,3.126,301.407,301.407,0,0,1-45.89,21.83,1.875,1.875,0,0,0-1,2.611,391.055,391.055,0,0,0,30.014,48.815,1.864,1.864,0,0,0,2.063.7A486.048,486.048,0,0,0,610.7,405.729a1.882,1.882,0,0,0,.765-1.352C623.729,277.594,590.8,167.234,524.531,69.836ZM222.491,337.58c-28.972,0-52.844-26.587-52.844-59.239S193.056,219.1,222.491,219.1c29.665,0,53.306,26.82,52.843,59.239C275.334,310.993,251.924,337.58,222.491,337.58Zm195.38,0c-28.971,0-52.843-26.587-52.843-59.239S388.437,219.1,417.871,219.1c29.667,0,53.307,26.82,52.844,59.239C470.715,310.993,447.538,337.58,417.871,337.58Z"></path></svg>}
                                    {profile.social_twitter && <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="20" width="20" xmlns="http://www.w3.org/2000/svg" style={{ color: '#1d9bf0' }}><title>{profile.social_twitter}</title><path d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z"></path></svg>}
                                    {profile.social_twitch && <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="20" width="20" xmlns="http://www.w3.org/2000/svg" style={{ color: '#9146FF' }}><title>{profile.social_twitch}</title><path d="M80 32l-32 32v304h96v96h96l64-64h64l112-112V32H80zm56 256V80h320v192l-56 56h-88l-48 48v-48h-72v-40h-56zM280 144h48v112h-48V144zm80 0h48v112h-48V144z"></path></svg>}
                                    {profile.social_youtube && <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 576 512" height="20" width="20" xmlns="http://www.w3.org/2000/svg" style={{ color: '#ff0000' }}><title>{profile.social_youtube}</title><path d="M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.503 48.284 47.821C117.22 448 288 448 288 448s170.781 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zm-317.51 213.508V175.185l142.739 81.205-142.739 81.201z"></path></svg>}
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
