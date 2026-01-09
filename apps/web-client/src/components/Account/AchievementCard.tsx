import React from 'react';
import { FaMedal, FaLock, FaShareAlt } from 'react-icons/fa';

export interface AchievementCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    unlocked: boolean;
    criteria?: string;
    onShare?: () => void;
}

const AchievementCard = ({ title, description, icon, unlocked, criteria, onShare }: AchievementCardProps) => (
    <div className={`achievement-card ${unlocked ? 'unlocked' : 'locked'}`} style={{
        background: unlocked ? 'linear-gradient(145deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))' : 'transparent',
        border: unlocked ? '1px solid rgba(76, 175, 80, 0.3)' : '1px dashed rgba(255,255,255,0.15)',
        borderRadius: '12px',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: '0.8rem',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        cursor: unlocked ? 'default' : 'help'
    }}
    onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-5px)'
        e.currentTarget.style.boxShadow = unlocked 
            ? '0 10px 20px rgba(76, 175, 80, 0.1)' 
            : '0 5px 15px rgba(0,0,0,0.3)'
        
        if (!unlocked) {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
        }
    }}
    onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
        if (!unlocked) {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
        }
    }}
    >
        {unlocked ? (
            <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '8px' }}>
                 {onShare && (
                    <button 
                        onClick={(e) => { e.stopPropagation(); onShare(); }}
                        style={{ color: 'rgba(255,255,255,0.5)', background: 'none', border: 'none', cursor: 'pointer', transition: '0.2s' }}
                        onMouseOver={e => e.currentTarget.style.color = '#fff'}
                        onMouseOut={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
                        title="Compartir Logro"
                    >
                        <FaShareAlt size={14} />
                    </button>
                 )}
                <div style={{ color: '#4CAF50', filter: 'drop-shadow(0 0 5px rgba(76,175,80,0.5))' }}>
                    <FaMedal />
                </div>
            </div>
        ) : (
            <div style={{ position: 'absolute', top: '10px', right: '10px', color: 'rgba(255,255,255,0.2)' }}>
                <FaLock size={12} />
            </div>
        )}
        
        <div className="card-icon" style={{ 
            fontSize: '2.5rem', 
            opacity: unlocked ? 1 : 0.4, 
            filter: unlocked ? 'none' : 'grayscale(100%)',
            background: unlocked ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255,255,255,0.03)',
            width: '60px',
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            marginBottom: '0.5rem',
            border: unlocked ? '1px solid rgba(76, 175, 80, 0.2)' : '1px solid rgba(255,255,255,0.05)'
        }}>
            {icon}
        </div>
        
        <div>
            <h3 style={{ 
                color: unlocked ? '#fff' : '#aaa', 
                marginBottom: '0.5rem', 
                fontSize: '1.1rem',
                fontWeight: unlocked ? '700' : '600'
            }}>
                {title}
            </h3>
            <p style={{ color: unlocked ? '#ccc' : '#666', fontSize: '0.85rem', lineHeight: '1.4' }}>{description}</p>
            {!unlocked && (
                <div style={{ 
                    marginTop: '0.8rem', 
                    background: 'rgba(0,0,0,0.2)', 
                    padding: '4px 8px', 
                    borderRadius: '4px',
                    display: 'inline-block'
                }}>
                    <p style={{ color: '#888', fontSize: '0.7rem', margin: 0, fontStyle: 'italic' }}>
                        🔒 {criteria}
                    </p>
                </div>
            )}
        </div>
    </div>
)

export default AchievementCard;
