import { motion as Motion } from 'framer-motion'
import { FaSkull, FaCrosshairs, FaHeart, FaBriefcase, FaCube, FaLayerGroup, FaTrophy, FaClock, FaCalendarAlt, FaDragon } from 'react-icons/fa'
import { useTranslation } from 'react-i18next'
import './PlayerStats.css'

export default function PlayerStats({ statsData, loading, error }) {
    const { t } = useTranslation()

    if (error) {
        return (
            <div className="player-stats-error">
                <p>⚠️ {t('account.stats.error')}</p>
            </div>
        )
    }

    if (loading || !statsData) {
        return (
            <div className="player-stats-loading">
                <div className="minecraft-loader"></div>
                <p>{t('account.stats.loading')}</p>
            </div>
        )
    }

    return (
        <div className="player-stats-container">
            <h3 className="stats-header">
                <span className="pixel-icon">📊</span> {t('account.stats.title')}
            </h3>
            
            <div className="stats-grid">
                {/* Nuevas Estadísticas Principales */}
                <StatItem 
                    icon={<FaTrophy />} 
                    label={t('account.overview.rank')} 
                    value={(() => {
                        const r = statsData.rank?.toLowerCase() || '';
                        const imgStyle = { height: '45px', maxWidth: '100%', objectFit: 'contain', imageRendering: 'pixelated' };
                        
                        if (r.includes('miembro') || r.includes('default')) return <img src="/ranks/user.png" alt="Miembro" style={imgStyle} />;
                        if (r.includes('donador')) return <img src="/ranks/donador.png" alt="Donador" style={imgStyle} />;
                        if (r.includes('fundador')) return <img src="/ranks/rank-fundador.png" alt="Fundador" style={imgStyle} />;
                        if (r.includes('killuwu')) return <img src="/ranks/rank-killu.png" alt="Killuwu" style={imgStyle} />;
                        if (r.includes('neroferno')) return <img src="/ranks/rank-neroferno.png" alt="Neroferno" style={imgStyle} />;
                        if (r.includes('developer')) return <img src="/ranks/developer.png" alt="Developer" style={imgStyle} />;
                        // Fallback text if no image matches (e.g. Developer if no image exists)
                        return <span className="rank-text">{statsData.rank}</span>;
                    })()}
                    color="#f1c40f" 
                />
                 <StatItem 
                    icon={<img src="/images/killucoin.png" alt="Coin" style={{width:'32px', height:'32px', objectFit:'contain', imageRendering: 'pixelated'}} />} 
                    label={t('account.overview.coins')} 
                    value={statsData.money} 
                    color="#f1c40f"
                />
                <StatItem 
                    icon={<FaClock />} 
                    label={t('account.overview.playtime')} 
                    value={statsData.playtime} 
                    color="#3498db" 
                />
                <StatItem 
                    icon={<FaCalendarAlt />} 
                    label={t('account.stats.member_since')} 
                    value={statsData.member_since} 
                    color="#9b59b6" 
                />

                {/* Estadísticas de Combate y Trabajo */}
                <StatItem 
                    icon={<FaCrosshairs />} 
                    label={t('account.stats.kills')} 
                    value={statsData.kills} 
                    color="#e74c3c" 
                />
                 <StatItem 
                    icon={<FaDragon />} 
                    label={t('account.stats.mob_kills')} 
                    value={statsData.mob_kills} 
                    color="#e67e22" 
                />
                <StatItem 
                    icon={<FaSkull />} 
                    label={t('account.stats.deaths')} 
                    value={statsData.deaths} 
                    color="#7f8c8d" 
                />
                <StatItem 
                    icon={<FaCube />} 
                    label={t('account.stats.mined')} 
                    value={statsData.blocks_mined} 
                    color="#8e44ad" 
                />
                <StatItem 
                    icon={<FaLayerGroup />} 
                    label={t('account.stats.placed')} 
                    value={statsData.blocks_placed} 
                    color="#2ecc71" 
                />
            </div>
        </div>
    )
}

function StatItem({ icon, label, value, color, fullWidth }) {
    return (
        <Motion.div 
            className={`stat-item ${fullWidth ? 'full-width' : ''}`}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
        >
            <div className="stat-icon" style={{ color: color }}>
                {icon}
            </div>
            <div className="stat-info">
                <span className="stat-value">{value}</span>
                <span className="stat-label">{label}</span>
            </div>
        </Motion.div>
    )
}
