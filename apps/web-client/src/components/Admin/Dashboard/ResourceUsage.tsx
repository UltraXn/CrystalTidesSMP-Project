import { FaServer, FaMicrochip, FaMemory } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

interface ResourceUsageProps {
    cpu: number;
    memory: { current: number; limit: number };
}

export default function ResourceUsage({ cpu, memory }: ResourceUsageProps) {
    const { t } = useTranslation();

    const memoryPercent = memory.limit > 0 
        ? Math.round((memory.current / memory.limit) * 100) 
        : 0;

    return (
        <div style={{ 
            background: 'rgba(10, 10, 15, 0.6)', 
            backdropFilter: 'blur(20px)', 
            border: '1px solid rgba(255, 255, 255, 0.05)', 
            borderRadius: '24px', 
            padding: '1.5rem',
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column' 
        }}>
            <h3 style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.1rem', fontWeight: '800', color: '#fff' }}>
                    <div style={{ padding: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FaServer style={{ color: 'var(--accent)' }} /> 
                    </div>
                    {t('admin.dashboard.resources.title')}
                </span>
                <small style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('admin.dashboard.resources.updated_now')}</small>
            </h3>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2.5rem', justifyContent: 'center' }}>
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'rgba(255,255,255,0.6)', fontWeight: '600', fontSize: '0.9rem' }}>
                            <FaMicrochip /> {t('admin.dashboard.resources.cpu')}
                        </span>
                        <span style={{ fontWeight: '800', color: '#fff', fontSize: '1.1rem' }}>{cpu}%</span>
                    </div>
                    <div style={{ width: '100%', height: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ width: `${Math.min(cpu, 100)}%`, height: '100%', background: 'linear-gradient(90deg, #f87171, #ef4444)', transition: 'width 1s ease-out', borderRadius: '12px', boxShadow: '0 0 10px rgba(239, 68, 68, 0.3)' }}></div>
                    </div>
                </div>

                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'rgba(255,255,255,0.6)', fontWeight: '600', fontSize: '0.9rem' }}>
                            <FaMemory /> {t('admin.dashboard.resources.ram')}
                        </span>
                        <span style={{ fontWeight: '800', color: '#fff', fontSize: '1.1rem', wordBreak: 'break-all' }}>
                            {memory.current} <span style={{color: '#666', fontSize: '0.9rem'}}>/</span> {memory.limit} <span style={{fontSize: '0.8rem', color: '#888'}}>MB</span>
                        </span>
                    </div>
                    <div style={{ width: '100%', height: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ width: `${memoryPercent}%`, height: '100%', background: 'linear-gradient(90deg, #60a5fa, #3b82f6)', transition: 'width 1s ease-out', borderRadius: '12px', boxShadow: '0 0 10px rgba(59, 130, 246, 0.3)' }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
