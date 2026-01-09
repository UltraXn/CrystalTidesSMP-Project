import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { FaMedal, FaInfoCircle } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import { useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient'
import { UserIdentity, Provider } from '@supabase/supabase-js'
import { useTranslation } from 'react-i18next'
import '../dashboard.css'
import Loader from "../components/UI/Loader"
import ConfirmationModal from "../components/UI/ConfirmationModal"
import PlayerStats from "../components/Widgets/PlayerStats"
import { MEDAL_ICONS } from "../utils/MedalIcons"
import Toast, { ToastType } from "../components/UI/Toast"

// Extracted Components
import AccountSidebar from '../components/Account/AccountSidebar'
import AchievementCard from '../components/Account/AchievementCard'
import ConnectionCards from '../components/Account/ConnectionCards'
import ProfileSettings from '../components/Account/ProfileSettings'
import AccountMobileNavbar from '../components/Account/AccountMobileNavbar'
import SuccessModal from '../components/UI/SuccessModal'
import PlaystyleRadar from '../components/Account/PlaystyleRadarFinal'
import ShareableCard from '../components/Account/ShareableCard'


interface Thread {
    id: string | number;
    title: string;
    created_at: string;
    views: number;
    reply_count: number;
}

interface MedalDefinition {
    id: string | number;
    name: string;
    description: string;
    icon: string;
    color: string;
}

interface PlayerStatsData {
    username?: string;
    rank?: string;
    rank_image?: string;
    money: string | number;
    playtime: string;
    member_since: string;
    kills: string | number;
    mob_kills: string | number;
    deaths: string | number;
    blocks_mined: string | number;
    blocks_placed: string | number;
    raw_playtime?: string | number;
    raw_kills?: number;
    raw_blocks_mined?: number;
    raw_blocks_placed?: number;
    raw_rank?: string;
}

export default function Account() {
    const { t } = useTranslation()
    const { user, loading } = useAuth()
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams()
    
    // Initialize activeTab from URL, fallback to 'overview'
    const [activeTab, setActiveTabInternal] = useState(searchParams.get('tab') || 'overview')

    // Mobile Navigation States
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024)
    const [sidebarOpen, setSidebarOpen] = useState(false)

    // Handle Resize
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 1024
            setIsMobile(mobile)
            if (!mobile) setSidebarOpen(true)
            else setSidebarOpen(false)
        }
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    // Lock body scroll when sidebar is open on mobile
    useEffect(() => {
        if (isMobile && sidebarOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => { document.body.style.overflow = 'unset' }
    }, [isMobile, sidebarOpen])

    // Sync state when URL changes
    useEffect(() => {
        const tab = searchParams.get('tab') || 'overview'
        if (tab !== activeTab) {
            setActiveTabInternal(tab)
        }
    }, [searchParams, activeTab])

    const setActiveTab = (tab: string) => {
        setActiveTabInternal(tab)
        setSearchParams({ tab })
    }

    const [userThreads, setUserThreads] = useState<Thread[]>([])
    const [loadingThreads, setLoadingThreads] = useState(false)
    const [isUnlinkModalOpen, setIsUnlinkModalOpen] = useState(false)
    const [identityToUnlink, setIdentityToUnlink] = useState<UserIdentity | null>(null)
    const [unlinkTarget, setUnlinkTarget] = useState<'provider' | 'minecraft' | 'discord' | null>(null)
    const [linkCode, setLinkCode] = useState<string | null>(null)
    const [linkLoading, setLinkLoading] = useState(false)
    const [manualCode, setManualCode] = useState('')
    const [discordManualCode, setDiscordManualCode] = useState('')
    const [isVerifying, setIsVerifying] = useState(false)
    const [isVerifyingDiscord, setIsVerifyingDiscord] = useState(false)
    const [isUnlinking, setIsUnlinking] = useState(false)
    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const [sharingAchievement, setSharingAchievement] = useState<{title: string, description: string, icon: React.ReactNode, unlocked: boolean} | null>(null)


    const API_URL = import.meta.env.VITE_API_URL
    
    // Toast State
    const [toast, setToast] = useState<{ visible: boolean; message: string; type: ToastType }>({
        visible: false,
        message: '',
        type: 'info'
    })

    const showToast = (message: string, type: ToastType = 'info') => {
        setToast({ visible: true, message, type })
    }

    // Auth Check
    useEffect(() => {
        if (!loading && !user) {
            navigate('/login')
        }
    }, [user, loading, navigate])

    // Fetch Medal Definitions
    const [medalDefinitions, setMedalDefinitions] = useState<MedalDefinition[]>([])
    useEffect(() => {
        fetch(`${API_URL}/settings`)
            .then(res => {
                if(!res.ok) throw new Error("Failed to fetch settings");
                return res.json();
            })
            .then(data => {
                if(data.medal_definitions) {
                    try {
                        const parsed = typeof data.medal_definitions === 'string' ? JSON.parse(data.medal_definitions) : data.medal_definitions;
                        setMedalDefinitions(Array.isArray(parsed) ? parsed : []);
                    } catch { setMedalDefinitions([]); }
                }
            })
            .catch(err => console.warn("Medal fetch error:", err)); // warn instead of error to reduce noise
    }, [API_URL]);

    // Fetch Threads
    useEffect(() => {
        if (activeTab === 'posts' && user) {
            setLoadingThreads(true)
            fetch(`${API_URL}/forum/user/${user.id}/threads`)
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        setUserThreads(data)
                    }
                })
                .catch(err => console.error(err))
                .finally(() => setLoadingThreads(false))
        }
    }, [activeTab, user, API_URL])

    const handleGenerateCode = async () => {
        if (!user) return
        setLinkLoading(true)
        try {
            const session = (await supabase.auth.getSession()).data.session;
            const res = await fetch(`${API_URL}/minecraft/link/init`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`
                },
                body: JSON.stringify({ userId: user.id })
            })
            const data = await res.json()
            if (data.code) {
                setLinkCode(data.code)
            } else {
                alert("Info: " + (data.error || data.message || "Error desconocido"))
            }
        } catch (e) {
            console.error(e)
            alert("Error al conectar con el servidor")
        } finally {
            setLinkLoading(false)
        }
    }

    const handleVerifyManualCode = async () => {
        if (!user || !manualCode.trim()) return
        setIsVerifying(true)
        try {
            const session = (await supabase.auth.getSession()).data.session;
            const res = await fetch(`${API_URL}/minecraft/link`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`
                },
                body: JSON.stringify({ 
                    userId: user.id,
                    code: manualCode.trim().toUpperCase()
                })
            })
            
            const data = await res.json()
            if (data.linked || data.success) {
                await supabase.auth.refreshSession()
                setShowSuccessModal(true)
            } else {
                const errorMsg = data.details ? `${data.error}: ${data.details} ${data.sqlError || ''}` : (data.error || t('account.connections.verify_error', "Código inválido o expirado"));
                showToast(errorMsg, 'error')
            }
        } catch (e) {
            console.error(e)
            showToast("Error de conexión con el servidor", 'error')
        } finally {
            setIsVerifying(false)
        }
    }

    const handleVerifyDiscordCode = async () => {
        if (!user || !discordManualCode.trim()) return
        setIsVerifyingDiscord(true)
        try {
            const session = (await supabase.auth.getSession()).data.session;
            const res = await fetch(`${API_URL}/minecraft/link`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`
                },
                body: JSON.stringify({ 
                    userId: user.id,
                    code: discordManualCode.trim().toUpperCase()
                })
            })
            
            const data = await res.json()
            if (data.linked || data.success) {
                await supabase.auth.refreshSession()
                setShowSuccessModal(true)
            } else {
                const errorMsg = data.details ? `${data.error}: ${data.details} ${data.sqlError || ''}` : (data.error || t('account.connections.verify_error', "Código inválido o expirado"));
                showToast(errorMsg, 'error')
            }
        } catch (e) {
            console.error(e)
            showToast("Error de conexión con el servidor", 'error')
        } finally {
            setIsVerifyingDiscord(false)
        }
    }

    // Polling for Link Status
    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        const uuid = user?.user_metadata?.minecraft_uuid
        const linked = !!uuid
        
        if (linkCode && !linked) {
            interval = setInterval(async () => {
                if (!user) return
                try {
                    const session = (await supabase.auth.getSession()).data.session;
                    const res = await fetch(`${API_URL}/minecraft/link/check?userId=${user.id}`, {
                        headers: {
                            'Authorization': `Bearer ${session?.access_token}`
                        }
                    })
                    const data = await res.json()
                    if (data.linked) {
                        clearInterval(interval)
                        await supabase.auth.refreshSession()
                        setShowSuccessModal(true)
                    }
                } catch (e) {
                    console.error("Polling error", e)
                }
            }, 3000)
        }
        return () => { if (interval) clearInterval(interval); }
    }, [linkCode, user, API_URL, t])

    const handleLinkProvider = async (provider: string) => {
        try {
            const { data, error } = await supabase.auth.linkIdentity({
                provider: provider as Provider,
                options: {
                    redirectTo: window.location.href,
                }
            })
            if (error) throw error
            if (data?.url) window.location.href = data.url
        } catch (error) {
            console.error("Error linking provider:", error)
            const message = error instanceof Error ? error.message : String(error)
            alert("Error: " + message)
        }
    }

    const handleUnlinkProvider = (identity: UserIdentity) => {
        setIdentityToUnlink(identity)
        setUnlinkTarget('provider')
        setIsUnlinkModalOpen(true)
    }

    const handleUnlinkMinecraft = () => {
        setUnlinkTarget('minecraft')
        setIsUnlinkModalOpen(true)
    }

    const handleUnlinkDiscord = () => {
        setUnlinkTarget('discord')
        setIsUnlinkModalOpen(true)
    }

    const confirmUnlink = async () => {
        setIsUnlinking(true)
        try {
            if (unlinkTarget === 'provider' && identityToUnlink) {
                // Standard Supabase Unlink
                const { error } = await supabase.auth.unlinkIdentity(identityToUnlink)
                if (error) throw error
                showToast("Cuenta desvinculada correctamente", 'success')
            } 
            else if (unlinkTarget === 'minecraft') {
                // Minecraft Backend Unlink
                try {
                    const session = (await supabase.auth.getSession()).data.session;
                    if (!session) throw new Error("No hay sesión activa");

                    const res = await fetch(`${API_URL}/minecraft/link/unlink`, {
                        method: 'POST',
                        headers: { 
                            'Authorization': `Bearer ${session.access_token}`
                        }
                    })
                    
                    if (!res.ok) {
                        const data = await res.json().catch(() => ({}));
                        console.warn('Backend unlink failed, but proceeding with local cleanup:', data.error);
                    }
                } catch (err) {
                    console.error('Error calling backend unlink:', err);
                }
                
                // CRITICAL: We clear metadata locally NO MATTER WHAT. 
                // This "repairs" the UI state for the user if things got out of sync.
                const { error: metaError } = await supabase.auth.updateUser({
                    data: { minecraft_uuid: null, minecraft_nick: null }
                });

                if (metaError) {
                    console.error('Error clearing local metadata:', metaError);
                    // If even this fails, the session is likely dead
                    if (metaError.message.includes('Invalid refresh token')) {
                        showToast("Sesión expirada. Por favor, re-inicia sesión.", 'error');
                        return;
                    }
                }
                
                showToast("Vínculo eliminado", 'success')
            }
            else if (unlinkTarget === 'discord') {
                // Discord Backend Unlink
                try {
                    const session = (await supabase.auth.getSession()).data.session;
                    if (!session) throw new Error("No hay sesión activa");

                    const res = await fetch(`${API_URL}/minecraft/link/unlink-discord`, {
                        method: 'POST',
                        headers: { 
                            'Authorization': `Bearer ${session.access_token}`
                        }
                    })
                    
                    if (!res.ok) {
                        const data = await res.json().catch(() => ({}));
                        console.warn('Backend discord unlink failed:', data.error);
                    }
                } catch (err) {
                    console.error('Error calling backend discord unlink:', err);
                }
                
                // Clear metadata locally
                await supabase.auth.updateUser({
                    data: { 
                        discord_id: null, 
                        discord_tag: null, 
                        discord_avatar: null,
                        social_discord: null 
                    }
                });
                
                showToast("Discord desvinculado", 'success')
            }

            // Close modal first
            setIsUnlinkModalOpen(false)
            setIdentityToUnlink(null)
            setUnlinkTarget(null)
            
            // Soft refresh session instead of hard reload if possible, otherwise reload after short delay
            await supabase.auth.refreshSession()
            window.location.reload() 

        } catch (error) {
            console.error("Error unlinking:", error)
            const message = error instanceof Error ? error.message : String(error)
            alert("Error: " + message)
            setIsUnlinkModalOpen(false)
        } finally {
            setIsUnlinking(false)
        }
    }

    // Stats Logic
    const [statsData, setStatsData] = useState<PlayerStatsData | null>(null)
    const [loadingStats, setLoadingStats] = useState(false)
    const [statsError, setStatsError] = useState(false)

    const mcUUID = user?.user_metadata?.minecraft_uuid
    const isLinked = !!mcUUID
    const mcUsername = isLinked ? (user?.user_metadata?.minecraft_nick || user?.user_metadata?.username) : t('account.minecraft.not_linked')
    const statsQueryParam = mcUUID
    
    const identities = user?.identities || []
    const discordIdentity = identities.find((id: UserIdentity) => id.provider === 'discord')
    const twitchIdentity = identities.find((id: UserIdentity) => id.provider === 'twitch')

    // Detect manual link via metadata (from bot/manual code)
    const discordMetadata = user?.user_metadata?.discord_id || user?.user_metadata?.discord_name || user?.user_metadata?.discord_tag
    const isDiscordLinked = !!discordIdentity || !!discordMetadata

    // Achievement Calculations
    const hoursPlayed = statsData?.raw_playtime ? (Number(statsData.raw_playtime) / 1000 / 60 / 60) : 0;
    const money = typeof statsData?.money === 'string' ? parseFloat(statsData.money.replace(/[^0-9.-]+/g,"")) : Number(statsData?.money || 0);
    const blocksPlaced = Number(statsData?.raw_blocks_placed || 0);
    const blocksMined = Number(statsData?.raw_blocks_mined || 0);
    const kills = Number(statsData?.raw_kills || 0);
    
    const isDweller = !!user?.app_metadata?.discord_id || !!user?.user_metadata?.discord_id;
    const isMagnate = money >= 5000;
    const isArchitect = blocksPlaced >= 1000;
    const isDeepMiner = blocksMined >= 1000;
    const isGuardian = kills >= 10;
    const isTimeTraveler = hoursPlayed >= 50;

    const rankLower = (statsData?.raw_rank || "").toLowerCase();
    const isPatron = rankLower.includes('donador') || rankLower.includes('fundador') || rankLower.includes('donor') || rankLower.includes('founder') || rankLower.includes('neroferno');

    useEffect(() => {
        if ((activeTab === 'overview' || activeTab === 'connections') && isLinked) {
            setLoadingStats(true)
            fetch(`${API_URL}/player-stats/${statsQueryParam}`)
                .then(res => {
                    if (!res.ok) throw new Error("Failed to fetch stats")
                    return res.json()
                })
                .then(response => {
                    // Handle Standardized Response { success, data }
                    if (response.success && response.data) {
                        setStatsData(response.data)
                    } else if (!response.success && response.data) {
                         // Fallback in case I screwed up and returned data directly (legacy check)
                         setStatsData(response.data)
                    } else {
                        // Unexpected structure
                         setStatsData(response) 
                    }
                    setStatsError(false)
                })
                .catch(err => {
                    console.error(err)
                    setStatsError(true)
                })
                .finally(() => setLoadingStats(false))
        }
    }, [activeTab, isLinked, statsQueryParam, API_URL])

    if (loading || !user) return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display:'flex', 
            flexDirection: 'column',
            alignItems:'center', 
            justifyContent: 'flex-start',
            paddingTop: '20vh', // Start at 20% of screen height
            background: '#080808'
        }}>
            <Loader style={{ height: 'auto', minHeight: 'auto' }} />
        </div>
    )

    return (
        <div className="account-page" style={{ paddingTop: '6rem', minHeight: '100vh', paddingBottom: '4rem', background: '#080808' }}>
            <div className="dashboard-container animate-fade-in" style={{ padding: '0 2rem' }}>

                {/* Mobile Overlay */}
                {isMobile && sidebarOpen && (
                    <div 
                        className="admin-mobile-overlay"
                        style={{ zIndex: 998, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Sidebar */}
                <AccountSidebar 
                    activeTab={activeTab} 
                    setActiveTab={setActiveTab} 
                    user={user}
                    statsData={statsData || undefined}
                    mcUsername={mcUsername}
                    isLinked={isLinked}
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                />

                {/* Main Content Area */}
                <main className="dashboard-content">
                    {activeTab === 'overview' && (
                        <div className="fade-in">
                            <h2 style={{ color: '#fff', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>{t('account.overview.stats_title')}</h2>

                            {isLinked ? (
                                <PlayerStats 
                                    statsData={statsData} 
                                    loading={loadingStats} 
                                    error={statsError} 
                                />
                            ) : (
                                <div className="dashboard-card animate-fade-in" style={{ 
                                    background: 'rgba(231, 76, 60, 0.03)', 
                                    padding: '3rem 2rem', 
                                    borderRadius: '24px', 
                                    border: '1px solid rgba(231, 76, 60, 0.1)', 
                                    textAlign:'center', 
                                    marginBottom: '2rem',
                                    backdropFilter: 'blur(10px)'
                                }}>
                                    <div style={{ fontSize: '3.5rem', marginBottom: '1.5rem', filter: 'drop-shadow(0 0 10px rgba(231, 76, 60, 0.3))' }}>🔗</div>
                                    <h3 style={{ color: '#ff6b6b', marginBottom: '1rem', fontSize: '1.8rem', fontWeight: 800 }}>{t('account.overview.not_linked_title', '¡Vincula tu cuenta!')}</h3>
                                    <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '2rem', lineHeight: '1.8', maxWidth: '500px', margin: '0 auto 2rem' }}>
                                        {t('account.overview.not_linked_msg', 'Para ver tus estadísticas en tiempo real (dinero, tiempo de juego, muertes), necesitas verificar que eres el dueño de la cuenta de Minecraft.')}
                                    </p>
                                    <button 
                                        onClick={() => setActiveTab('connections')}
                                        style={{ 
                                            background: '#ff6b6b', 
                                            border: 'none', 
                                            padding: '1rem 2.5rem', 
                                            cursor: 'pointer', 
                                            borderRadius: '16px', 
                                            color: '#fff', 
                                            fontWeight: 800, 
                                            fontSize: '1rem', 
                                            boxShadow: '0 10px 25px rgba(231, 76, 60, 0.2)',
                                            transition: '0.2s'
                                        }}
                                        onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                                        onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                                    >
                                        {t('account.overview.verify_btn', 'Verificar Ahora')}
                                    </button>
                                </div>
                            )}

                        
                        {isLinked && (
                            <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                                <div className="dashboard-card animate-slide-up" style={{ 
                                    background: 'rgba(255,255,255,0.03)', 
                                    padding: '1.5rem', 
                                    borderRadius: '16px', 
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                                }}>
                                    <h3 style={{ color: '#fff', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
                                        🎯 Estilo de Juego
                                    </h3>
                                    <PlaystyleRadar stats={{
                                        blocksPlaced: Number(statsData?.raw_blocks_placed || 0),
                                        blocksMined: Number(statsData?.raw_blocks_mined || 0),
                                        kills: Number(statsData?.raw_kills || 0),
                                        mobKills: Number(statsData?.mob_kills || 0),
                                        playtimeHours: statsData?.playtime ? (parseInt(statsData.playtime.match(/(\d+)h/)?.[1] || '0') + (parseInt(statsData.playtime.match(/(\d+)m/)?.[1] || '0')/60)) : 0,
                                        money: typeof statsData?.money === 'string' ? parseFloat(statsData.money.replace(/[^0-9.-]+/g,"")) : 0,
                                        rank: statsData?.raw_rank || 'default'
                                    }}/>
                                </div>
                                <div className="dashboard-card animate-slide-up" style={{ 
                                    background: 'linear-gradient(135deg, rgba(88, 101, 242, 0.1), rgba(0,0,0,0))', 
                                    padding: '2rem', 
                                    borderRadius: '16px', 
                                    border: '1px solid rgba(88, 101, 242, 0.2)', 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    justifyContent: 'center' 
                                }}>
                                    <h3 style={{ color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <FaInfoCircle color="var(--accent)" /> Métricas de Estilo
                                    </h3>
                                    
                                    <div style={{ overflowX: 'auto', fontSize: '0.85rem' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', color: '#bbb' }}>
                                            <thead>
                                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
                                                    <th style={{ padding: '6px 0', color: 'var(--accent)' }}>Estilo</th>
                                                    <th style={{ padding: '6px 0', color: 'var(--accent)' }}>Meta (100%)</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                    <td style={{ padding: '6px 0', display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{color:'#e67e22'}}>🛠️</span> Constructor</td>
                                                    <td style={{ padding: '6px 0' }}>300,000 bloques</td>
                                                </tr>
                                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                    <td style={{ padding: '6px 0', display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{color:'#e74c3c'}}>⚔️</span> Luchador</td>
                                                    <td style={{ padding: '6px 0' }}>5,000 pts (Kill x10)</td>
                                                </tr>
                                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                    <td style={{ padding: '6px 0', display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{color:'#3498db'}}>🗺️</span> Explorador</td>
                                                    <td style={{ padding: '6px 0' }}>200 horas</td>
                                                </tr>
                                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                    <td style={{ padding: '6px 0', display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{color:'#f1c40f'}}>💰</span> Mercader</td>
                                                    <td style={{ padding: '6px 0' }}>$1,000,000</td>
                                                </tr>
                                                <tr>
                                                    <td style={{ padding: '6px 0', display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{color:'#9b59b6'}}>👥</span> Social</td>
                                                    <td style={{ padding: '6px 0' }}>100 pts (H x0.2 + Rango)</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                        <div style={{ marginTop: '10px', fontSize: '0.75rem', color: '#666', fontStyle: 'italic' }}>
                                            * Social: +30 pts por rango Donador, Fundador, Killuwu, Neroferno, Developer o Staff.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    )}

                    {activeTab === 'posts' && (
                        <div key="posts" className="fade-in">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                                <h2 style={{ color: '#fff', margin: 0 }}>{t('account.posts.title')}</h2>
                                <Link to="/forum" style={{ background: 'var(--accent)', color: '#fff', padding: '6px 12px', borderRadius: '4px', fontSize: '0.9rem', textDecoration: 'none', fontWeight: 'bold' }}>
                                    + {t('forum.create_topic', 'Crear Tema')}
                                </Link>
                            </div>
                            
                            {loadingThreads ? <Loader text={t('account.posts.loading')} /> : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {userThreads.length === 0 ? (
                                        <div style={{ textAlign: 'center', padding: '2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                                            <p style={{ color: 'var(--muted)', marginBottom: '1rem' }}>{t('account.posts.empty')}</p>
                                            <Link to="/forum" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>Ir al Foro</Link>
                                        </div>
                                    ) : (
                                        userThreads.map(thread => (
                                            <Link to={`/forum/thread/topic/${thread.id}`} key={thread.id} style={{ textDecoration: 'none' }}>
                                                <div className="thread-card-mini" style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}>
                                                    <div>
                                                        <h4 style={{ color: '#fff', margin: '0 0 0.3rem 0' }}>{thread.title}</h4>
                                                        <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{new Date(thread.created_at).toLocaleDateString()}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '1rem', color: 'var(--muted)', fontSize: '0.9rem' }}>
                                                        <span>{thread.views} {t('account.posts.views')}</span>
                                                        <span>{thread.reply_count} {t('account.posts.replies')}</span>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'medals' && (
                        <div key="medals" className="fade-in">
                            <h2 style={{ color: '#fff', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>Mis Medallas</h2>
                            {(!user.user_metadata?.medals || user.user_metadata.medals.length === 0) ? (
                                <div style={{ textAlign: 'center', padding: '3rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                                    <FaMedal size={48} style={{ color: '#333', marginBottom: '1rem' }} />
                                    <p style={{ color: '#888' }}>Aún no tienes medallas especiales.</p>
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
                                    {user.user_metadata.medals.map((medalId: string) => {
                                        const def = medalDefinitions.find(m => m.id === medalId);
                                        if (!def) return null;
                                        const Icon = MEDAL_ICONS[def.icon as keyof typeof MEDAL_ICONS] || FaMedal;
                                        return (
                                            <div key={medalId} className="medal-card animate-pop" style={{ 
                                                background: `linear-gradient(145deg, ${def.color}10, rgba(0,0,0,0.4))`,
                                                border: `1px solid ${def.color}40`,
                                                borderRadius: '12px',
                                                padding: '1.5rem',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                textAlign: 'center',
                                                position: 'relative',
                                                overflow: 'hidden'
                                            }}>
                                                <div style={{ 
                                                    fontSize: '2.5rem', 
                                                    color: def.color, 
                                                    marginBottom: '1rem',
                                                    filter: `drop-shadow(0 0 10px ${def.color}60)`
                                                }}>
                                                    <Icon /> 
                                                </div>
                                                <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '0.5rem' }}>{def.name}</h3>
                                                <p style={{ color: '#ccc', fontSize: '0.85rem' }}>{def.description}</p>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'achievements' && (
                        <div key="achievements" className="fade-in">
                    <h2 style={{ color: '#fff', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>{t('account.achievements.title')}</h2>
                    
                    {sharingAchievement && (
                        <ShareableCard 
                            achievement={sharingAchievement} 
                            username={statsData?.username || user.user_metadata.full_name || 'Jugador'} 
                            onClose={() => setSharingAchievement(null)} 
                        />
                    )}

                    {/* Season Timeline */}
                    <div style={{ marginBottom: '2.5rem', background: 'rgba(255,255,255,0.02)', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                         <h3 style={{ color: 'var(--accent)', marginBottom: '1.5rem', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>
                            📅 Tu Travesía en CrystalTides
                         </h3>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '0', position: 'relative', overflowX: 'auto', padding: '1rem 0' }}>
                            {/* Line Background */}
                            <div style={{ position: 'absolute', top: '24px', left: '50px', right: '50px', height: '2px', background: 'rgba(255,255,255,0.1)', zIndex: 0 }} />

                            {/* Nodes */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '140px', position: 'relative', zIndex: 1 }}>
                                <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'var(--accent)', marginBottom: '12px', boxShadow: '0 0 15px var(--accent)' }} />
                                <span style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 'bold' }}>Llegada</span>
                                <span style={{ color: '#666', fontSize: '0.8rem', marginTop: '4px' }}>{statsData?.member_since || '???'}</span>
                            </div>

                             {statsData?.raw_rank && !['default'].includes(statsData.raw_rank.toLowerCase()) && (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '140px', position: 'relative', zIndex: 1, marginLeft: 'auto', marginRight: 'auto' }}>
                                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#fff', marginBottom: '12px' }} />
                                    <span style={{ color: '#fff', fontSize: '0.9rem' }}>Ascenso</span>
                                    <span style={{ color: 'var(--accent)', fontSize: '0.8rem', marginTop: '4px', textTransform: 'capitalize' }}>{statsData.raw_rank}</span>
                                </div>
                             )}

                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '140px', position: 'relative', zIndex: 1, marginLeft: 'auto' }}>
                                <div style={{ width: '16px', height: '16px', transform: 'rotate(45deg)', background: '#4CAF50', marginBottom: '12px', boxShadow: '0 0 15px #4CAF50' }} />
                                <span style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 'bold' }}>Hoy</span>
                                <span style={{ color: '#888', fontSize: '0.8rem', marginTop: '4px' }}>{(statsData?.playtime ? (parseInt(statsData.playtime.match(/(\d+)h/)?.[1] || '0') + (parseInt(statsData.playtime.match(/(\d+)m/)?.[1] || '0')/60)) : 0).toFixed(1)}h jugadas</span>
                            </div>
                         </div>
                    </div>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
                                <AchievementCard 
                                    title={t('account.achievements.items.dweller')} 
                                    icon="🌊" 
                                    unlocked={isDweller} 
                                    description={t('account.achievements.items.dweller_desc')}
                                    criteria={t('account.achievements.items.dweller_criteria')}
                                    onShare={() => setSharingAchievement({
                                        title: t('account.achievements.items.dweller'),
                                        description: t('account.achievements.items.dweller_desc'),
                                        icon: "🌊",
                                        unlocked: true
                                    })}
                                />
                                <AchievementCard 
                                    title={t('account.achievements.items.magnate')} 
                                    icon="💎" 
                                    unlocked={isMagnate} 
                                    description={t('account.achievements.items.magnate_desc')}
                                    criteria={t('account.achievements.items.magnate_criteria')}
                                    onShare={() => setSharingAchievement({
                                        title: t('account.achievements.items.magnate'),
                                        description: t('account.achievements.items.magnate_desc'),
                                        icon: "💎",
                                        unlocked: true
                                    })}
                                />
                                <AchievementCard 
                                    title={t('account.achievements.items.architect')} 
                                    icon="🏗️" 
                                    unlocked={isArchitect} 
                                    description={t('account.achievements.items.architect_desc')}
                                    criteria={t('account.achievements.items.architect_criteria')}
                                    onShare={() => setSharingAchievement({
                                        title: t('account.achievements.items.architect'),
                                        description: t('account.achievements.items.architect_desc'),
                                        icon: "🏗️",
                                        unlocked: true
                                    })}
                                />
                                <AchievementCard 
                                    title={t('account.achievements.items.deep_miner')} 
                                    icon="⛏️" 
                                    unlocked={isDeepMiner} 
                                    description={t('account.achievements.items.deep_miner_desc')}
                                    criteria={t('account.achievements.items.deep_miner_criteria')}
                                    onShare={() => setSharingAchievement({
                                        title: t('account.achievements.items.deep_miner'),
                                        description: t('account.achievements.items.deep_miner_desc'),
                                        icon: "⛏️",
                                        unlocked: true
                                    })}
                                />
                                <AchievementCard 
                                    title={t('account.achievements.items.guardian')} 
                                    icon="⚔️" 
                                    unlocked={isGuardian} 
                                    description={t('account.achievements.items.guardian_desc')}
                                    criteria={t('account.achievements.items.guardian_criteria')}
                                    onShare={() => setSharingAchievement({
                                        title: t('account.achievements.items.guardian'),
                                        description: t('account.achievements.items.guardian_desc'),
                                        icon: "⚔️",
                                        unlocked: true
                                    })}
                                />
                                <AchievementCard 
                                    title={t('account.achievements.items.time_traveler')} 
                                    icon="⏳" 
                                    unlocked={isTimeTraveler} 
                                    description={t('account.achievements.items.time_traveler_desc')}
                                    criteria={t('account.achievements.items.time_traveler_criteria')}
                                    onShare={() => setSharingAchievement({
                                        title: t('account.achievements.items.time_traveler'),
                                        description: t('account.achievements.items.time_traveler_desc'),
                                        icon: "⏳",
                                        unlocked: true
                                    })}
                                />
                                <AchievementCard 
                                    title={t('account.achievements.items.patron')} 
                                    icon="👑" 
                                    unlocked={isPatron} 
                                    description={t('account.achievements.items.patron_desc')}
                                    criteria={t('account.achievements.items.patron_criteria')}
                                    onShare={() => setSharingAchievement({
                                        title: t('account.achievements.items.patron'),
                                        description: t('account.achievements.items.patron_desc'),
                                        icon: "👑",
                                        unlocked: true
                                    })}
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'connections' && (
                        <div key="connections" className="fade-in">
                            <h2 style={{ color: '#fff', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>{t('account.connections.title')}</h2>
                            
                            <ConnectionCards
                                isLinked={isLinked}
                                mcUsername={mcUsername}
                                statsDataUsername={statsData?.username}
                                linkCode={linkCode}
                                linkLoading={linkLoading}
                                onGenerateCode={handleGenerateCode}
                                discordIdentity={discordIdentity}
                                isDiscordLinked={isDiscordLinked}
                                discordMetadataName={user?.user_metadata?.discord_tag || user?.user_metadata?.discord_name || user?.user_metadata?.social_discord}
                                discordMetadataAvatar={user?.user_metadata?.discord_avatar}
                                twitchIdentity={twitchIdentity}
                                onLinkProvider={handleLinkProvider}
                                onUnlinkProvider={handleUnlinkProvider}
                                onUnlinkMinecraft={handleUnlinkMinecraft}
                                onUnlinkDiscord={handleUnlinkDiscord}
                                manualCode={manualCode}
                                onManualCodeChange={setManualCode}
                                onVerifyCode={handleVerifyManualCode}
                                isVerifying={isVerifying}
                                discordManualCode={discordManualCode}
                                onDiscordManualCodeChange={setDiscordManualCode}
                                onVerifyDiscordCode={handleVerifyDiscordCode}
                                isVerifyingDiscord={isVerifyingDiscord}
                            />
                        </div>
                    )}
                    
                    {activeTab === 'settings' && (
                        <ProfileSettings 
                            user={user}
                            mcUsername={mcUsername}
                            discordIdentity={discordIdentity}
                            twitchIdentity={twitchIdentity}
                            showToast={showToast}
                        />
                    )}
                </main>
            </div>
            
            

            <ConfirmationModal 
                isOpen={isUnlinkModalOpen}
                onClose={() => !isUnlinking && setIsUnlinkModalOpen(false)}
                onConfirm={confirmUnlink}
                isLoading={isUnlinking}
                title="Desvincular cuenta"
                message="¿Estás seguro? Podrías perder acceso a ciertas características."
            />
            
            <Toast 
                isVisible={toast.visible}
                message={toast.message}
                type={toast.type}
                onClose={() => setToast(prev => ({ ...prev, visible: false }))}
            />

            <SuccessModal 
                isOpen={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                onAction={() => window.location.reload()}
                title={t('account.connections.verify_success', "¡VINCULACIÓN EXITOSA!")}
                message={t('account.connections.success_link_desc', "Tu cuenta de Minecraft ha sido conectada correctamente a CrystalTides SMP. Ahora tus estadísticas y rangos están sincronizados.")}
                buttonText={t('common.accept', "GENIAL")}
            />

            {/* Mobile Bottom Navbar */}
            {isMobile && (
                <AccountMobileNavbar 
                    activeTab={activeTab} 
                    setActiveTab={setActiveTab} 
                    sidebarOpen={sidebarOpen} 
                    setSidebarOpen={setSidebarOpen} 
                />
            )}
        </div>
    )
}
