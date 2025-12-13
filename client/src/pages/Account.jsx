import { useNavigate } from 'react-router-dom'
import { FaUser, FaSignOutAlt, FaGamepad, FaClock, FaCoins, FaTrophy, FaServer, FaCamera } from 'react-icons/fa'
import { useAuth } from '@/context/AuthContext'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/services/supabaseClient'
import { compressImage } from '@/utils/imageOptimizer'
import '@/dashboard.css'

export default function Account() {
    const { user, logout, loading, updateUser } = useAuth()
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('overview')
    const [uploading, setUploading] = useState(false)
    const fileInputRef = useRef(null)

    useEffect(() => {
        if (!loading && !user) {
            navigate('/login')
        }
    }, [user, loading, navigate])

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
                throw new Error('Debes seleccionar una imagen para subir.')
            }

            const file = event.target.files[0]

            // Optimizar imagen (Client-Side) -> WebP
            const compressedBlob = await compressImage(file)

            const fileExt = 'webp'
            const fileName = `${user.id}/${Date.now()}.${fileExt}`
            const filePath = `${fileName}`

            // 1. Subir a Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, compressedBlob, {
                    contentType: 'image/webp',
                    upsert: true
                })

            if (uploadError) {
                if (uploadError.message.includes("Bucket not found")) {
                    throw new Error("El bucket 'avatars' no existe. Créalo en Supabase > Storage.")
                }
                throw uploadError
            }

            // 2. Obtener URL pública
            const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)

            // 3. Actualizar perfil de usuario
            await updateUser({ avatar_url: data.publicUrl })

            alert('¡Avatar actualizado!')
        } catch (error) {
            alert('Error actualizando avatar: ' + error.message)
        } finally {
            setUploading(false)
        }
    }

    if (loading || !user) return null

    // Datos simulados (pronto vendrán de Supabase)
    const userStats = {
        playtime: "0h",
        coins: 0,
        rank: "Aventurero",
        joined: new Date(user.created_at).toLocaleDateString()
    }

    const mcUsername = user.user_metadata?.username || "Sin vincular"

    return (
        <div className="account-page">
            <div className="dashboard-container animate-pop-up">

                {/* Sidebar */}
                <aside className="dashboard-sidebar">
                    <div className="user-snippet">
                        <div className="user-avatar-large" onClick={handleAvatarClick} title="Cambiar foto">
                            {uploading ? (
                                <div style={{ fontSize: '0.8rem' }}>...</div>
                            ) : (
                                user.user_metadata?.avatar_url ?
                                    <img src={user.user_metadata.avatar_url} alt="Avatar" className="user-avatar-img" />
                                    : <FaUser />
                            )}
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleAvatarUpload}
                            style={{ display: 'none' }}
                            accept="image/*"
                        />
                        <h3 className="user-name">{user.user_metadata?.full_name || mcUsername}</h3>
                        <span className="user-email">{user.email}</span>
                    </div>

                    <nav className="sidebar-nav">
                        <button
                            className={`sidebar-btn ${activeTab === 'overview' ? 'active' : ''}`}
                            onClick={() => setActiveTab('overview')}
                        >
                            <FaServer /> Resumen
                        </button>
                        <button
                            className={`sidebar-btn ${activeTab === 'minecraft' ? 'active' : ''}`}
                            onClick={() => setActiveTab('minecraft')}
                        >
                            <FaGamepad /> Cuenta Minecraft
                        </button>
                        <button
                            className="sidebar-btn"
                            onClick={handleLogout}
                            style={{ marginTop: '1rem', color: '#ff6b6b' }}
                        >
                            <FaSignOutAlt /> Cerrar Sesión
                        </button>
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="dashboard-content">

                    {activeTab === 'overview' && (
                        <>
                            <div className="dashboard-card">
                                <div className="card-title">
                                    <span>Estadísticas Globales</span>
                                    <FaTrophy style={{ color: 'gold' }} />
                                </div>
                                <div className="stat-grid">
                                    <div className="stat-box">
                                        <div className="stat-value">{userStats.rank}</div>
                                        <div className="stat-label">Rango Actual</div>
                                    </div>
                                    <div className="stat-box">
                                        <div className="stat-value">{userStats.coins}</div>
                                        <div className="stat-label"><FaCoins /> Monedas</div>
                                    </div>
                                    <div className="stat-box">
                                        <div className="stat-value">{userStats.playtime}</div>
                                        <div className="stat-label"><FaClock /> Tiempo Jugado</div>
                                    </div>
                                </div>
                            </div>

                            <div className="dashboard-card">
                                <h3 style={{ marginBottom: '1rem', color: '#fff' }}>Últimas Novedades</h3>
                                <p style={{ color: 'var(--muted)' }}>No hay notificaciones recientes para ti.</p>
                            </div>
                        </>
                    )}

                    {activeTab === 'minecraft' && (
                        <div className="dashboard-card">
                            <div className="card-title">Vincular Minecraft</div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', textAlign: 'center' }}>
                                <div className="minecraft-skin-preview">
                                    <img src={`https://minotar.net/body/${mcUsername !== "Sin vincular" ? mcUsername : "Steve"}/150.png`} alt="Skin Preview" />
                                </div>
                                <p style={{ color: 'var(--muted)' }}>Usuario actual: <strong style={{ color: '#fff' }}>{mcUsername}</strong></p>
                                {mcUsername === "Sin vincular" && (
                                    <button className="btn-submit" style={{ maxWidth: '200px' }}>Vincular Cuenta</button>
                                )}
                            </div>
                        </div>
                    )}

                </main>

            </div>
        </div>
    )
}
