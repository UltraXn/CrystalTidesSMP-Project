import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { motion as Motion, AnimatePresence } from 'framer-motion'
import { FaUser, FaSignOutAlt, FaGamepad, FaClock, FaCoins, FaTrophy, FaServer, FaCamera, FaPen, FaThumbtack, FaComment, FaShieldAlt, FaMedal, FaLink, FaDiscord, FaTwitch, FaCog } from 'react-icons/fa'
import { useAuth } from '@/context/AuthContext'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/services/supabaseClient'
import { compressImage } from '@/utils/imageOptimizer'
import { useTranslation } from 'react-i18next'
import '@/dashboard.css'
import Loader from "@/components/UI/Loader"
import RoleBadge from "@/components/User/RoleBadge"
import ConfirmationModal from "@/components/UI/ConfirmationModal"
import PlayerStats from "@/components/Widgets/PlayerStats"

// Achievement Card Component
const AchievementCard = ({ title, description, icon, unlocked, criteria }) => (
    <div className={`achievement-card ${unlocked ? 'unlocked' : 'locked'}`} style={{
        background: unlocked ? 'linear-gradient(145deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))' : 'rgba(0,0,0,0.2)',
        border: unlocked ? '1px solid rgba(76, 175, 80, 0.3)' : '1px solid rgba(255,255,255,0.05)',
        borderRadius: '12px',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: '0.8rem',
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.2s, box-shadow 0.2s'
    }}
    onMouseEnter={(e) => {
        if (unlocked) {
            e.currentTarget.style.transform = 'translateY(-5px)'
            e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.3)'
        }
    }}
    onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
    }}
    >
        {unlocked && <div style={{ position: 'absolute', top: '10px', right: '10px', color: '#4CAF50' }}><FaMedal /></div>}
        
        <div className="card-icon" style={{ 
            fontSize: '2.5rem', 
            opacity: unlocked ? 1 : 0.3, 
            filter: unlocked ? 'none' : 'grayscale(100%)',
            background: unlocked ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255,255,255,0.05)',
            width: '60px',
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%'
        }}>
            {icon}
        </div>
        
        <div>
            <h3 style={{ color: unlocked ? '#fff' : '#888', marginBottom: '0.3rem', fontSize: '1.1rem' }}>{title}</h3>
            <p style={{ color: '#aaa', fontSize: '0.85rem', lineHeight: '1.4' }}>{description}</p>
            {!unlocked && <p style={{ color: '#666', fontSize: '0.75rem', marginTop: '0.5rem', fontStyle: 'italic' }}>Requisito: {criteria}</p>}
        </div>
    </div>
)

// Nav Button Component
const NavButton = ({ active, onClick, icon, label }) => (
    <button 
        onClick={onClick}
        className={`nav-btn ${active ? 'active' : ''}`}
        style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            width: '100%',
            padding: '12px 16px',
            border: 'none',
            background: active ? 'rgba(109, 165, 192, 0.1)' : 'transparent',
            color: active ? '#fff' : '#ccc',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem',
            textAlign: 'left',
            transition: 'all 0.2s',
            borderLeft: active ? '3px solid var(--accent)' : '3px solid transparent'
        }}
    >
        <span style={{ color: active ? 'var(--accent)' : '#666' }}>{icon}</span>
        {label}
    </button>
)

export default function Account() {
    const { t } = useTranslation()
    const { user, logout, loading, updateUser } = useAuth()
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams()
    
    // Initialize activeTab from URL, fallback to 'overview'
    const [activeTab, setActiveTabInternal] = useState(searchParams.get('tab') || 'overview')

    // Sync state when URL changes
    useEffect(() => {
        const tab = searchParams.get('tab')
        if (tab && tab !== activeTab) {
            setActiveTabInternal(tab)
        }
    }, [searchParams, activeTab])

    const setActiveTab = (tab) => {
        setActiveTabInternal(tab)
        setSearchParams({ tab })
    }

    const [uploading, setUploading] = useState(false)
    const [userThreads, setUserThreads] = useState([])
    const [loadingThreads, setLoadingThreads] = useState(false)
    const [isEditingName, setIsEditingName] = useState(false)
    const [newName, setNewName] = useState("")
    const [isUnlinkModalOpen, setIsUnlinkModalOpen] = useState(false)
    const [identityToUnlink, setIdentityToUnlink] = useState(null)
    const [linkCode, setLinkCode] = useState(null)
    const [linkLoading, setLinkLoading] = useState(false)
    const fileInputRef = useRef(null)

    const API_URL = import.meta.env.VITE_API_URL

    // Auth Check
    useEffect(() => {
        if (!loading && !user) {
            navigate('/login')
        }
    }, [user, loading, navigate])

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

    // Generate Link Code (Web-First)
    const handleGenerateCode = async () => {
        setLinkLoading(true)
        try {
            const res = await fetch(`${API_URL}/minecraft/link/init`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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

    // Polling for Link Status
    useEffect(() => {
        let interval;
        const uuid = user?.user_metadata?.minecraft_uuid
        const linked = !!uuid
        
        if (linkCode && !linked) {
            interval = setInterval(async () => {
                try {
                    const res = await fetch(`${API_URL}/minecraft/link/check?userId=${user.id}`)
                    const data = await res.json()
                    if (data.linked) {
                        clearInterval(interval)
                        await supabase.auth.refreshSession()
                        alert(t('account.connections.success_link', "¡Cuenta vinculada exitosamente!"))
                        window.location.reload()
                    }
                } catch (e) {
                    console.error("Polling error", e)
                }
            }, 3000)
        }
        return () => clearInterval(interval)
    }, [linkCode, user, API_URL, t])

    const handleLogout = async () => {
        await logout()
        navigate('/')
    }

    const handleAvatarClick = () => {
        fileInputRef.current.click()
    }

    const handleAvatarUpload = async (event) => {
        try {
            setUploading(true)
            if (!event.target.files || event.target.files.length === 0) {
                throw new Error(t('account.avatar.error_select'))
            }

            const file = event.target.files[0]
            const compressedBlob = await compressImage(file)
            const fileExt = 'webp'
            const fileName = `${user.id}/${Date.now()}.${fileExt}`
            const filePath = `${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, compressedBlob, {
                    contentType: 'image/webp',
                    upsert: true
                })

            if (uploadError) throw uploadError

            const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
            await updateUser({ avatar_url: data.publicUrl })

        } catch (error) {
            alert(t('account.avatar.error_update') + error.message)
        } finally {
            setUploading(false)
        }
    }

    const handleNameUpdate = async () => {
        if (!newName.trim()) return setIsEditingName(false)
        try {
            await updateUser({ 
                full_name: newName.trim(), 
                username: newName.trim()
            })
            setIsEditingName(false)
        } catch {
            alert(t('account.name.error_update'))
        }
    }

    const handleLinkProvider = async (provider) => {
        try {
            const { data, error } = await supabase.auth.linkIdentity({
                provider: provider,
                options: {
                    redirectTo: window.location.href,
                }
            })
            if (error) throw error
            if (data?.url) window.location.href = data.url
        } catch (error) {
            console.error("Error linking provider:", error)
            alert("Error: " + error.message)
        }
    }

    const handleUnlinkProvider = (identityId) => {
        setIdentityToUnlink(identityId)
        setIsUnlinkModalOpen(true)
    }

    const confirmUnlink = async () => {
        if (!identityToUnlink) return
        try {
            const { error } = await supabase.auth.unlinkIdentity(identityToUnlink)
            if (error) throw error
            setIsUnlinkModalOpen(false)
            setIdentityToUnlink(null)
            location.reload()
        } catch (error) {
            console.error("Error unlinking provider:", error)
            alert("Error unlinking account: " + error.message)
            setIsUnlinkModalOpen(false)
        }
    }

    // Stats Logic
    const [statsData, setStatsData] = useState(null)
    const [loadingStats, setLoadingStats] = useState(false)
    const [statsError, setStatsError] = useState(false)

    const mcUUID = user?.user_metadata?.minecraft_uuid
    const isLinked = !!mcUUID
    const mcUsername = isLinked ? (user?.user_metadata?.minecraft_nick || user?.user_metadata?.username) : t('account.minecraft.not_linked')
    const statsQueryParam = mcUUID

    const isAdmin = user?.user_metadata?.role === 'admin' || user?.user_metadata?.role === 'owner'
    
    const identities = user?.identities || []
    const discordIdentity = identities.find(id => id.provider === 'discord')
    const twitchIdentity = identities.find(id => id.provider === 'twitch')

    // Settings Logic
    const [passwords, setPasswords] = useState({ new: '', confirm: '' })
    const [publicStats, setPublicStats] = useState(user?.user_metadata?.public_stats !== false)

    const handleUpdatePassword = async () => {
        if(passwords.new !== passwords.confirm) return alert("Las contraseñas no coinciden")
        if(passwords.new.length < 6) return alert("Mínimo 6 caracteres")
        try {
            const { error } = await supabase.auth.updateUser({ password: passwords.new })
            if(error) throw error
            alert(t('account.settings.success_password', '¡Contraseña actualizada!'))
            setPasswords({ new: '', confirm: '' })
        } catch(e) {
            alert("Error: " + e.message)
        }
    }

    const handlePrivacyToggle = async () => {
         const newVal = !publicStats
         setPublicStats(newVal)
         await updateUser({ public_stats: newVal })
    }

    useEffect(() => {
        if (activeTab === 'overview' && isLinked) {
            setLoadingStats(true)
            fetch(`${API_URL}/player-stats/${statsQueryParam}`)
                .then(res => {
                    if (!res.ok) throw new Error("Failed to fetch stats")
                    return res.json()
                })
                .then(data => {
                    setStatsData(data)
                    setStatsError(false)
                })
                .catch(err => {
                    console.error(err)
                    setStatsError(true)
                })
                .finally(() => setLoadingStats(false))
        }
    }, [activeTab, isLinked, statsQueryParam, API_URL])

    if (loading || !user) return <div style={{height:'100vh', display:'flex', alignItems:'center', justifyContent:'center'}}><Loader /></div>

    return (
        <div className="account-page" style={{ paddingTop: '6rem', minHeight: '100vh', paddingBottom: '4rem', background: '#080808' }}>
            <div className="dashboard-container animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '280px 1fr', gap: '2rem', padding: '0 2rem' }}>

                {/* Sidebar */}
                <aside className="dashboard-sidebar" style={{ background: 'rgba(30,30,35,0.6)', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', height: 'fit-content' }}>
                    <div className="user-snippet" style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <div className="user-avatar-large" onClick={handleAvatarClick} title={t('account.avatar.change_photo')} style={{ width: '100px', height: '100px', margin: '0 auto 1rem', borderRadius: '50%', overflow: 'hidden', cursor: 'pointer', position: 'relative', border: '3px solid var(--accent)' }}>
                            {uploading ? (
                                <div style={{ height:'100%', display:'flex', alignItems:'center', justifyContent:'center', background:'#333' }}>...</div>
                            ) : (
                                <img src={user.user_metadata?.avatar_url || (isLinked ? `https://mc-heads.net/avatar/${mcUUID}/100` : "https://ui-avatars.com/api/?name=" + (user.user_metadata?.full_name || "User"))} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            )}
                            <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', background: 'rgba(0,0,0,0.6)', fontSize: '0.7rem', padding: '2px 0' }}><FaCamera /></div>
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} style={{ display: 'none' }} accept="image/*" />
                        
                        {isEditingName ? (
                            <div style={{ display: 'flex', gap: '5px', justifyContent: 'center', marginBottom: '0.5rem' }}>
                                <input 
                                    autoFocus 
                                    value={newName} 
                                    onChange={e => setNewName(e.target.value)}
                                    placeholder={user.user_metadata?.full_name}
                                    style={{ background: '#222', border: '1px solid #444', color: '#fff', padding: '4px', borderRadius: '4px', width: '140px' }}
                                />
                                <button onClick={handleNameUpdate} style={{ background: 'var(--accent)', border: 'none', borderRadius: '4px', cursor:'pointer' }}>💾</button>
                            </div>
                        ) : (
                            <h3 className="user-name" style={{ color: '#fff', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                {user.user_metadata?.full_name || mcUsername}
                                <FaPen size={12} style={{ cursor: 'pointer', color: 'var(--muted)' }} onClick={() => { setNewName(user.user_metadata?.full_name || ""); setIsEditingName(true); }} />
                            </h3>
                        )}
                        <span className="user-email" style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>{user.email}</span>
                        {isAdmin && <Link to="/admin" className="btn-small" style={{ marginTop: '1rem', display: 'inline-block', background: '#e74c3c', padding: '0.3rem 0.8rem', fontSize: '0.8rem', borderRadius: '4px' }}><FaShieldAlt /> {t('account.admin_panel')}</Link>}
                    </div>

                    <nav className="sidebar-nav" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <NavButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<FaServer />} label={t('account.nav.overview')} />
                        <NavButton active={activeTab === 'posts'} onClick={() => setActiveTab('posts')} icon={<FaComment />} label={t('account.nav.posts')} />
                        <NavButton active={activeTab === 'achievements'} onClick={() => setActiveTab('achievements')} icon={<FaTrophy />} label={t('account.nav.achievements')} />
                        <NavButton active={activeTab === 'connections'} onClick={() => setActiveTab('connections')} icon={<FaLink />} label={t('account.nav.connections')} />
                        <NavButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<FaCog />} label={t('account.settings.title', 'Configuración')} />
                        
                        <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '1rem 0' }}></div>
                        
                        <button onClick={handleLogout} style={{ background: 'transparent', border: 'none', color: '#ff6b6b', padding: '0.8rem', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FaSignOutAlt /> {t('account.nav.logout')}
                        </button>
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="dashboard-content">
                    {activeTab === 'overview' && (
                        <div className="fade-in">
                            <h2 style={{ color: '#fff', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>{t('account.overview.stats_title')}</h2>

                            {isLinked ? (
                                <PlayerStats 
                                    username={mcUsername} 
                                    statsData={statsData} 
                                    loading={loadingStats} 
                                    error={statsError} 
                                />
                            ) : (
                                <div className="dashboard-card animate-fade-in" style={{ background: 'rgba(231, 76, 60, 0.1)', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(231, 76, 60, 0.3)', textAlign:'center', marginBottom: '2rem' }}>
                                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔗</div>
                                    <h3 style={{ color: '#ff6b6b', marginBottom: '1rem', fontSize: '1.5rem' }}>{t('account.overview.not_linked_title', '¡Vincula tu cuenta!')}</h3>
                                    <p style={{ color: '#ccc', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                                        {t('account.overview.not_linked_msg', 'Para ver tus estadísticas en tiempo real (dinero, tiempo de juego, KDR), necesitas verificar que eres el dueño de la cuenta de Minecraft.')}
                                    </p>
                                    <button 
                                        onClick={() => setActiveTab('connections')}
                                        style={{ background: 'var(--accent)', border: 'none', padding: '0.8rem 2rem', cursor: 'pointer', borderRadius: '50px', color: '#000', fontWeight: 'bold', fontSize: '1rem', boxShadow: '0 4px 15px rgba(109, 165, 192, 0.4)' }}
                                    >
                                        {t('account.overview.verify_btn', 'Verificar Ahora')}
                                    </button>
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

                    {activeTab === 'achievements' && (
                        <div key="achievements" className="fade-in">
                            <h2 style={{ color: '#fff', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>{t('account.achievements.title')}</h2>
                            
                            {(() => {
                                const hoursPlayed = statsData?.raw_playtime ? (Number(statsData.raw_playtime) / 1000 / 60 / 60) : 0;
                                const isVeteran = hoursPlayed > 50; 
                                const isHunter = (statsData?.raw_kills || 0) > 50;
                                const isMiner = (statsData?.raw_blocks_mined || 0) > 1000;
                                
                                const rank = (statsData?.raw_rank || "").toLowerCase();
                                const isDonor = rank.includes('vip') || rank.includes('mvp') || rank.includes('donador') || rank.includes('founder') || rank.includes('owner') || rank.includes('killu') || rank.includes('nero');

                                return (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
                                        <AchievementCard 
                                            title={t('account.achievements.items.welcome')} 
                                            icon="👋" 
                                            unlocked={true} 
                                            description="Te has unido a nuestra comunidad."
                                        />
                                        <AchievementCard 
                                            title={t('account.achievements.items.first_post')} 
                                            icon="📝" 
                                            unlocked={userThreads.length > 0} 
                                            description="Tu voz ha sido escuchada por primera vez en el foro."
                                            criteria="Publicar 1 tema"
                                        />
                                        <AchievementCard 
                                            title={t('account.achievements.items.veteran', 'Veterano')} 
                                            icon="⚔️" 
                                            unlocked={isVeteran} 
                                            description="Has demostrado lealtad con horas de servicio."
                                            criteria="+50 horas de juego"
                                        />
                                        <AchievementCard 
                                            title={t('account.achievements.items.donor', 'Donador')} 
                                            icon="💎" 
                                            unlocked={isDonor} 
                                            description="Gracias por contribuir al crecimiento del servidor."
                                            criteria="Rango VIP o superior"
                                        />
                                        <AchievementCard 
                                            title={t('account.achievements.items.hunter', 'Cazador')} 
                                            icon="🏹" 
                                            unlocked={isHunter} 
                                            description="Un depredador letal en el campo de batalla."
                                            criteria="+50 Kills"
                                        />
                                        <AchievementCard 
                                            title="Minero" 
                                            icon="⛏️" 
                                            unlocked={isMiner} 
                                            description="La base de nuestra economía está en tus manos."
                                            criteria="+1000 Bloques minados"
                                        />
                                    </div>
                                )
                            })()}
                        </div>
                    )}

                    {activeTab === 'connections' && (
                        <div key="connections" className="fade-in">
                            <h2 style={{ color: '#fff', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>{t('account.connections.title')}</h2>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                                {/* Minecraft Card */}
                                <div className="connection-card" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                        <div style={{ background: '#44bd32', padding: '10px', borderRadius: '50%', color: '#fff' }}><FaGamepad /></div>
                                        <div>
                                            <h3 style={{ margin: 0, color: '#fff' }}>Minecraft</h3>
                                            <p style={{ margin: 0, color: '#888', fontSize: '0.9rem' }}>{isLinked ? 'Vinculado' : 'No vinculado'}</p>
                                        </div>
                                    </div>
                                    
                                    {isLinked ? (
                                        <div style={{ background: 'rgba(76, 175, 80, 0.1)', color: '#4CAF50', padding: '1rem', borderRadius: '8px', textAlign: 'center', fontWeight: 'bold' }}>
                                            ✓ {mcUsername}
                                        </div>
                                    ) : (
                                        <div>
                                            <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '1rem' }}>
                                                Vincula tu cuenta de Minecraft para acceder a estadísticas y sincronizar tu rango.
                                            </p>
                                            
                                            {!linkCode ? (
                                                <button 
                                                    onClick={handleGenerateCode} 
                                                    disabled={linkLoading}
                                                    style={{ width: '100%', background: 'var(--accent)', border: 'none', padding: '10px', borderRadius: '6px', color: '#fff', fontWeight: 'bold', cursor: 'pointer', opacity: linkLoading ? 0.7 : 1 }}
                                                >
                                                    {linkLoading ? 'Generando...' : 'Obtener Código de Vinculación'}
                                                </button>
                                            ) : (
                                                <div className="link-code-box animate-pop" style={{ background: '#222', border: '2px dashed var(--accent)', padding: '1.5rem', borderRadius: '8px', textAlign: 'center' }}>
                                                    <p style={{ color: '#ccc', marginBottom: '0.5rem' }}>Entra al servidor y escribe:</p>
                                                    <code style={{ display: 'block', background: '#000', color: 'var(--accent)', padding: '0.8rem', borderRadius: '4px', fontSize: '1.2rem', fontWeight: 'bold', letterSpacing: '2px', marginBottom: '1rem' }}>/link {linkCode}</code>
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                                        <Loader size="small" />
                                                        <span style={{ fontSize: '0.8rem', color: '#888' }}>Esperando confirmación...</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Discord Card */}
                                <div className="connection-card" style={{ background: 'rgba(88, 101, 242, 0.1)', border: '1px solid rgba(88, 101, 242, 0.3)', borderRadius: '12px', padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                        <div style={{ background: '#5865F2', padding: '10px', borderRadius: '50%', color: '#fff' }}><FaDiscord /></div>
                                        <div>
                                            <h3 style={{ margin: 0, color: '#fff' }}>Discord</h3>
                                            <p style={{ margin: 0, color: '#888', fontSize: '0.9rem' }}>{discordIdentity ? 'Conectado' : 'Desconectado'}</p>
                                        </div>
                                    </div>
                                    
                                    {discordIdentity ? (
                                        <button 
                                            onClick={() => handleUnlinkProvider(discordIdentity.id)}
                                            style={{ width: '100%', background: 'rgba(231, 76, 60, 0.2)', border: '1px solid rgba(231, 76, 60, 0.5)', color: '#ff6b6b', padding: '8px', borderRadius: '6px', cursor: 'pointer' }}
                                        >
                                            Desvincular
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => handleLinkProvider('discord')}
                                            style={{ width: '100%', background: '#5865F2', border: 'none', color: '#fff', padding: '8px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
                                        >
                                            Conectar Discord
                                        </button>
                                    )}
                                </div>

                                {/* Twitch Card */}
                                <div className="connection-card" style={{ background: 'rgba(145, 70, 255, 0.1)', border: '1px solid rgba(145, 70, 255, 0.3)', borderRadius: '12px', padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                        <div style={{ background: '#9146FF', padding: '10px', borderRadius: '50%', color: '#fff' }}><FaTwitch /></div>
                                        <div>
                                            <h3 style={{ margin: 0, color: '#fff' }}>Twitch</h3>
                                            <p style={{ margin: 0, color: '#888', fontSize: '0.9rem' }}>{twitchIdentity ? 'Conectado' : 'Desconectado'}</p>
                                        </div>
                                    </div>
                                    
                                    {twitchIdentity ? (
                                        <button 
                                            onClick={() => handleUnlinkProvider(twitchIdentity.id)}
                                            style={{ width: '100%', background: 'rgba(231, 76, 60, 0.2)', border: '1px solid rgba(231, 76, 60, 0.5)', color: '#ff6b6b', padding: '8px', borderRadius: '6px', cursor: 'pointer' }}
                                        >
                                            Desvincular
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => handleLinkProvider('twitch')}
                                            style={{ width: '100%', background: '#9146FF', border: 'none', color: '#fff', padding: '8px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
                                        >
                                            Conectar Twitch
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                    {activeTab === 'settings' && (
                        <div key="settings" className="fade-in">
                            <h2 style={{ color: '#fff', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>{t('account.settings.title', 'Configuración')}</h2>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                                {/* Privacy Card */}
                                <div className="dashboard-card" style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <h3 style={{ color: '#fff', marginBottom: '1rem', display:'flex', alignItems:'center', gap:'10px' }}><FaShieldAlt /> {t('account.settings.privacy', 'Privacidad')}</h3>
                                    
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <p style={{ color: '#fff', margin: 0 }}>{t('account.settings.public_stats', 'Mostrar estadísticas públicas')}</p>
                                            <p style={{ color: '#888', fontSize: '0.8rem', margin: 0 }}>{t('account.settings.public_stats_desc', 'Otros usuarios podrán ver tu perfil.')}</p>
                                        </div>
                                        <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '50px', height: '26px' }}>
                                            <input type="checkbox" checked={publicStats} onChange={handlePrivacyToggle} style={{ opacity: 0, width: 0, height: 0 }} />
                                            <span className="slider round" style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: publicStats ? 'var(--accent)' : '#ccc', transition: '.4s', borderRadius: '34px' }}>
                                                <span style={{ position: 'absolute', content: '""', height: '18px', width: '18px', left: publicStats ? '26px' : '4px', bottom: '4px', backgroundColor: 'white', transition: '.4s', borderRadius: '50%' }}></span>
                                            </span>
                                        </label>
                                    </div>
                                </div>

                                {/* Security Card */}
                                <div className="dashboard-card" style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <h3 style={{ color: '#fff', marginBottom: '1rem', display:'flex', alignItems:'center', gap:'10px' }}><FaUser /> {t('account.settings.security', 'Seguridad')}</h3>
                                    
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <div>
                                            <label style={{ display: 'block', color: '#ccc', marginBottom: '5px', fontSize: '0.9rem' }}>{t('account.settings.new_password', 'Nueva Contraseña')}</label>
                                            <input 
                                                type="password" 
                                                value={passwords.new}
                                                onChange={e => setPasswords({...passwords, new: e.target.value})}
                                                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #444', background: '#222', color: '#fff' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', color: '#ccc', marginBottom: '5px', fontSize: '0.9rem' }}>{t('account.settings.confirm_password', 'Confirmar Contraseña')}</label>
                                            <input 
                                                type="password" 
                                                value={passwords.confirm}
                                                onChange={e => setPasswords({...passwords, confirm: e.target.value})}
                                                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #444', background: '#222', color: '#fff' }}
                                            />
                                        </div>
                                        <button 
                                            onClick={handleUpdatePassword}
                                            style={{ background: 'var(--accent)', border: 'none', padding: '10px', borderRadius: '6px', color: '#fff', fontWeight: 'bold', cursor: 'pointer', marginTop: '0.5rem' }}
                                        >
                                            {t('account.settings.update_password', 'Actualizar Contraseña')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
            
            <ConfirmationModal 
                isOpen={isUnlinkModalOpen}
                onClose={() => setIsUnlinkModalOpen(false)}
                onConfirm={confirmUnlink}
                title="Desvincular cuenta"
                message="¿Estás seguro? Podrías perder acceso a ciertas características."
            />
        </div>
    )
}
