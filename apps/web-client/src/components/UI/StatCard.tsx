import React from 'react';

export interface StatCardProps {
    title: string;
    value: React.ReactNode;
    percent: string;
    color?: string;
    icon: React.ReactNode;
}

export function StatCard({ title, value, percent, color = 'var(--accent)', icon }: StatCardProps) {
    return (
        <div style={{ 
            background: 'rgba(10, 10, 15, 0.6)', 
            backdropFilter: 'blur(20px)', 
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '24px',
            padding: '1.75rem',
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'start',
            transition: 'transform 0.2s',
            position: 'relative',
            overflow: 'hidden'
        }} className="hover-lift">
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, ${color}, transparent)` }}></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <h4 style={{ margin: 0, color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '800' }}>{title}</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <span style={{ fontSize: '1.8rem', fontWeight: '900', color: '#fff', lineHeight: 1 }}>{value}</span>
                    <span style={{ color: color, fontSize: '0.8rem', opacity: 0.9, fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {percent}
                    </span>
                </div>
            </div>
            <div style={{
                background: `rgba(${parseInt(color.slice(1,3), 16)}, ${parseInt(color.slice(3,5), 16)}, ${parseInt(color.slice(5,7), 16)}, 0.1)`,
                width: '56px', height: '56px',
                borderRadius: '16px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: color, fontSize: '1.5rem',
                border: `1px solid ${color}20`,
                boxShadow: `0 8px 20px -5px ${color}30`
            }}>
                {icon}
            </div>
        </div>
    )
}

export default StatCard;
