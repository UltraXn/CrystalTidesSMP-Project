import { FaTrophy, FaClock, FaSkull, FaHammer } from "react-icons/fa"
import Loader from "../UI/Loader"
import { useTranslation } from "react-i18next"

interface PlayerStats {
    playtime: string;
    kills: number;
    mob_kills: number;
    deaths: number;
    money: string;
    blocks_mined: string;
    blocks_placed: string;
}

interface PlayerStatsGridProps {
    stats: PlayerStats | null;
    loading: boolean;
    isPublic: boolean;
    isAdmin: boolean;
}

export default function PlayerStatsGrid({ stats, loading, isPublic, isAdmin }: PlayerStatsGridProps) {
    const { t } = useTranslation()

    return (
        <div className="premium-card">
            <style>{`
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
                 .stat-grid-premium {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 1rem;
                }
                .stat-item-premium {
                    background: rgba(255,255,255,0.02);
                    padding: 1.2rem;
                    border-radius: 16px;
                    border: 1px solid rgba(255,255,255,0.04);
                    transition: transform 0.2s;
                }
                .stat-item-premium:hover {
                    background: rgba(255,255,255,0.04);
                    transform: translateY(-4px);
                }
                .stat-icon {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 0.8rem;
                    font-size: 0.9rem;
                }
            `}</style>
            <h3><FaTrophy /> {t('profile.stats', 'Estadísticas')}</h3>
            {(isPublic || isAdmin) ? (
                <div className="stat-grid-premium">
                    {loading ? (
                        <Loader text="..." />
                    ) : stats ? (
                        <>
                            <div className="stat-item-premium">
                                <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}><FaClock /></div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{stats?.playtime || '0h'}</div>
                                <div style={{ fontSize: '0.7rem', color: '#666' }}>{t('profile.time', 'Tiempo Jugado')}</div>
                            </div>
                            <div className="stat-item-premium">
                                <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}><FaSkull /></div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{stats?.deaths || 0}</div>
                                <div style={{ fontSize: '0.7rem', color: '#666' }}>{t('profile.deaths', 'Muertes')}</div>
                            </div>
                            <div className="stat-item-premium" style={{ position: 'relative', overflow: 'hidden' }}>
                                <div className="stat-icon" style={{ background: 'rgba(234, 179, 8, 0.1)', color: '#eab308' }}>
                                    <img src="/images/killucoin.webp" alt="K" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
                                </div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{stats?.money || 0}</div>
                                <div style={{ fontSize: '0.7rem', color: '#666' }}>{t('profile.killucoins', 'Killucoins')}</div>
                            </div>
                            <div className="stat-item-premium">
                                <div className="stat-icon" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}><FaHammer /></div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{stats?.blocks_mined || 0}</div>
                                <div style={{ fontSize: '0.7rem', color: '#666' }}>{t('profile.mined', 'Bloques Minados')}</div>
                            </div>
                        </>
                    ) : <p>Error</p>}
                </div>
            ) : <p>{t('profile.private_stats')}</p>}
        </div>
    )
}
