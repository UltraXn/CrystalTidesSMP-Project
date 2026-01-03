import React from 'react';
import { FaMedal } from 'react-icons/fa';

export interface AchievementCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    unlocked: boolean;
    criteria?: string;
}

const AchievementCard = ({ title, description, icon, unlocked, criteria }: AchievementCardProps) => (
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

export default AchievementCard;
