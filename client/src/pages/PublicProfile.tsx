import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { FaUser, FaMedal, FaGamepad, FaTrophy } from "react-icons/fa"
import RoleBadge from "../components/User/RoleBadge"
import Loader from "../components/UI/Loader"
import { MEDAL_ICONS } from "../utils/MedalIcons"

interface MedalDefinition {
    id: string | number;
    name: string;
    description: string;
    icon: string;
    color: string;
}

interface Profile {
    username: string;
    avatar_url?: string;
    role: string;
    created_at: string;
    medals?: (string | number)[];
    public_stats: boolean;
}

const API_URL = import.meta.env.VITE_API_URL

export default function PublicProfile() {
    const { username } = useParams()
    const navigate = useNavigate()
    const { t } = useTranslation()
    
    const [profile, setProfile] = useState<Profile | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [medalDefinitions, setMedalDefinitions] = useState<MedalDefinition[]>([])

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
                const userData = await resUser.json()
                setProfile(userData)

                // 2. Fetch Medals Definitions (if user has medals)
                if (userData.medals && userData.medals.length > 0) {
                    const resSettings = await fetch(`${API_URL}/settings`)
                    if (resSettings.ok) {
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
        <div className="layout-center" style={{ flexDirection: 'column', gap: '1rem', color: '#ff4444' }}>
            <FaUser size={48} />
            <h2>{error}</h2>
            <button className="btn-secondary" onClick={() => navigate('/')}>Volver al Inicio</button>
        </div>
    )

    if (!profile) return null

    return (
        <div className="public-profile-container fade-in">
            <style>{`
                .public-profile-container {
                    padding-top: 6rem;
                    padding-bottom: 4rem;
                    min-height: 100vh;
                    background: #0a0a0a;
                    color: #fff;
                    display: flex;
                    justify-content: center;
                }
                .profile-content {
                    width: 100%;
                    max-width: 1000px;
                    padding: 0 1rem;
                    display: grid;
                    grid-template-columns: 300px 1fr;
                    gap: 2rem;
                }
                .profile-sidebar {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }
                .profile-card {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 16px;
                    padding: 2rem;
                    text-align: center;
                    position: relative;
                    overflow: hidden;
                }
                .profile-main {
                    display: flex;
                    flex-direction: column;
                    gap: 2rem;
                }
                .skin-preview {
                    height: 400px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 70%);
                }
                @media (max-width: 800px) {
                    .profile-content {
                        grid-template-columns: 1fr;
                    }
                    .skin-preview {
                        height: 300px;
                    }
                }
                .stat-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
                    gap: 1rem;
                }
                .stat-box {
                    background: rgba(255,255,255,0.03);
                    padding: 1.5rem;
                    border-radius: 12px;
                    border: 1px solid rgba(255,255,255,0.05);
                    text-align: center;
                }
                .stat-value {
                    font-size: 1.8rem;
                    font-weight: bold;
                    color: var(--accent);
                    margin-bottom: 0.2rem;
                }
                .stat-label {
                    font-size: 0.8rem;
                    color: #888;
                    text-transform: uppercase;
                }
                .medal-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
                    gap: 1rem;
                }
                .mini-medal {
                    background: rgba(255,255,255,0.02);
                    border: 1px solid rgba(255,255,255,0.05);
                    border-radius: 8px;
                    padding: 1rem;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.5rem;
                    transition: transform 0.2s;
                }
                .mini-medal:hover {
                    transform: translateY(-5px);
                    background: rgba(255,255,255,0.05);
                }
            `}</style>
            
            <div className="profile-content">
                {/* Left Column: Avatar & Basic Info */}
                <div className="profile-sidebar">
                    <div className="profile-card">
                        <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
                            <img 
                                src={profile.avatar_url || `https://mc-heads.net/avatar/${profile.username}/128`} 
                                alt={profile.username}
                                style={{ 
                                    width: '128px', 
                                    height: '128px', 
                                    borderRadius: '50%',
                                    border: '4px solid rgba(255,255,255,0.1)',
                                    boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
                                }}
                            />
                            {/* Role Badge integrated */}
                            <div style={{ marginTop: '1rem' }}>
                                <RoleBadge role={profile.role} username={profile.username} />
                            </div>
                        </div>

                        <h1 style={{ fontSize: '1.8rem', margin: '0.5rem 0', wordBreak: 'break-all' }}>{profile.username}</h1>
                        <p style={{ color: '#888', fontSize: '0.9rem' }}>
                            Miembro desde {new Date(profile.created_at).toLocaleDateString()}
                        </p>
                    </div>

                    {/* Social / Connections could go here */}
                </div>

                {/* Right Column: Content */}
                <div className="profile-main">
                    
                    {/* Medals Showcase */}
                    <div className="admin-card">
                         <h3 style={{ marginBottom: '1.5rem', display:'flex', alignItems:'center', gap:'0.5rem', borderBottom:'1px solid rgba(255,255,255,0.1)', paddingBottom:'1rem' }}>
                            <FaMedal style={{ color: '#fbbf24' }} /> Medallas
                        </h3>
                        
                        {(!profile.medals || profile.medals.length === 0) ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: '#666', fontStyle: 'italic' }}>
                                Este usuario aún no tiene medallas.
                            </div>
                        ) : (
                            <div className="medal-grid">
                                {profile.medals.map((medalId: string | number) => {
                                    const def = medalDefinitions.find((m: MedalDefinition) => m.id === medalId)
                                    if (!def) return null
                                    const Icon = MEDAL_ICONS[def.icon as keyof typeof MEDAL_ICONS] || FaMedal
                                    return (
                                        <div key={medalId} className="mini-medal" title={def.name + ": " + def.description}>
                                            <div style={{ fontSize: '2rem', color: def.color, filter: `drop-shadow(0 0 5px ${def.color}40)` }}>
                                                <Icon />
                                            </div>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#ccc', textAlign: 'center' }}>{def.name}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                     {/* Stats Showcase (Requires Public Stats Enabled) */}
                    <div className="admin-card">
                         <h3 style={{ marginBottom: '1.5rem', display:'flex', alignItems:'center', gap:'0.5rem', borderBottom:'1px solid rgba(255,255,255,0.1)', paddingBottom:'1rem' }}>
                            <FaTrophy style={{ color: '#fbbf24' }} /> Estadísticas
                        </h3>
                        
                        {/* We use PlayerStats component, but it expects a 'user' object. 
                            If public stats are enabled, we might need a modified PlayerStats 
                            or just manually render basics. 
                            For now, lets use simple layout.
                        */}
                        
                        {/* 
                            TODO: Check access. 
                            Currently userService getPublicProfile returns public_stats boolean.
                        */}
                        
                        {profile.public_stats ? (
                             <div className="stat-grid">
                                {/* Placeholder stats - in real implementation we fetch from /api/player-stats needs adjustment to accept username */}
                                <div className="stat-box">
                                     <div className="stat-value">?</div>
                                     <div className="stat-label">Tiempo Jugeado</div>
                                </div>
                                <div className="stat-box">
                                     <div className="stat-value">?</div>
                                     <div className="stat-label">Muertes</div>
                                </div>
                                {/* 
                                    Since PlayerStats.jsx relies on linking account, 
                                    we need to know if this profile is linked.
                                    For now, we just show message.
                                */}
                                <div style={{width:'100%', gridColumn:'1/-1', padding:'2rem', color:'#888'}}>
                                    Las estadísticas en vivo no están disponibles en este perfil todavía.
                                </div>
                             </div>
                        ) : (
                            <div style={{ padding: '2rem', textAlign: 'center', color: '#666', fontStyle: 'italic', background: 'rgba(255,255,255,0.02)', borderRadius:'8px' }}>
                                <FaGamepad size={32} style={{ marginBottom:'1rem', opacity:0.5 }} />
                                <p>Las estadísticas de este jugador son privadas.</p>
                            </div>
                        )}
                    </div>

                    {/* Skin Body Preview */}
                    <div className="admin-card" style={{ textAlign: 'center' }}>
                        <h3 style={{ marginBottom: '1rem', textAlign:'left' }}>Skin</h3>
                        <div className="skin-preview">
                            <img 
                                src={`https://mc-heads.net/body/${profile.username}/300`} 
                                alt="Skin Body" 
                                style={{ filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))' }}
                            />
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}
