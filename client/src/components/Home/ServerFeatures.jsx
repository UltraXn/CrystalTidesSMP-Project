import { FaGem, FaHandshake, FaDungeon } from "react-icons/fa"
import { useTranslation } from 'react-i18next'

export default function ServerFeatures() {
    const { t } = useTranslation()

    const features = [
        {
            icon: <FaGem size={40} color="#b39ddb" />, // Light purple
            title: t('features.economy_title'),
            desc: t('features.economy_desc')
        },
        {
            icon: <FaHandshake size={40} color="#90caf9" />, // Light blue
            title: t('features.protection_title'),
            desc: t('features.protection_desc')
        },
        {
            icon: <FaDungeon size={40} color="#ef9a9a" />, // Light red
            title: t('features.dungeons_title'),
            desc: t('features.dungeons_desc')
        }
    ]

    return (
        <div className="features-grid" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '2rem', 
            marginTop: '3rem' 
        }}>
            {features.map((feature, index) => (
                <div key={index} className="feature-card" style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '16px',
                    padding: '2rem',
                    textAlign: 'center',
                    transition: 'transform 0.3s, background 0.3s',
                    cursor: 'default'
                }}
                onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-10px)'
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'
                }}
                onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'
                }}
                >
                    <div style={{ 
                        background: 'rgba(0,0,0,0.2)', 
                        width: '80px', 
                        height: '80px', 
                        borderRadius: '50%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem auto',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
                    }}>
                        {feature.icon}
                    </div>
                    <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '1rem' }}>{feature.title}</h3>
                    <p style={{ color: 'var(--muted)', lineHeight: '1.6' }}>{feature.desc}</p>
                </div>
            ))}
        </div>
    )
}
