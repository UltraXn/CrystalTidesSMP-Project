import React from 'react';
import { FaMedal, FaLock, FaShareAlt } from 'react-icons/fa';

export interface AchievementCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    unlocked: boolean;
    criteria?: string;
    onShare?: () => void;
    color?: string;
}

const AchievementCard = ({ title, description, icon, unlocked, criteria, onShare, color = '#4CAF50' }: AchievementCardProps) => (
    <div className={`achievement-card ${unlocked ? 'unlocked' : 'locked'}`} style={{
        background: unlocked ? 'linear-gradient(145deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))' : 'transparent',
        border: unlocked ? `1px solid ${color}4d` : '1px dashed rgba(255,255,255,0.15)',
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
            ? `0 10px 20px ${color}1a` 
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
                        style={{ 
                            color: '#fff', 
                            background: 'rgba(255,255,255,0.1)', 
                            border: '1px solid rgba(255,255,255,0.1)', 
                            borderRadius: '50%',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer', 
                            transition: 'all 0.3s ease',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.background = `${color}33`;
                            e.currentTarget.style.borderColor = color;
                            e.currentTarget.style.boxShadow = `0 0 15px ${color}66`;
                            e.currentTarget.style.transform = 'scale(1.1)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                            e.currentTarget.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
                            e.currentTarget.style.transform = 'scale(1)';
                        }}
                        title="Compartir Logro"
                    >
                        <FaShareAlt size={14} />
                    </button>
                 )}
                <div style={{ color: color, filter: `drop-shadow(0 0 5px ${color}80)` }}>
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
            background: unlocked ? `${color}1a` : 'rgba(255,255,255,0.03)',
            width: '60px',
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            marginBottom: '0.5rem',
            border: unlocked ? `1px solid ${color}33` : '1px solid rgba(255,255,255,0.05)'
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
