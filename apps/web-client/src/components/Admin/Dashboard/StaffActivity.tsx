import { FaUsers, FaDiscord, FaClock } from 'react-icons/fa';
import MinecraftAvatar from '../../UI/MinecraftAvatar';
import { useTranslation } from 'react-i18next';

export interface StaffMember {
    username: string;
    avatar: string;
    role: string;
    role_image?: string;
    login_time: number | null;
    mc_status: string;
    discord_status: string;
}

interface StaffActivityProps {
    staffOnline: StaffMember[];
    serverOnline: boolean;
}

const getRoleImage = (role: string) => {
    const r = role.toLowerCase();
    if (r.includes('developer')) return '/ranks/developer.png';
    if (r.includes('killuwu')) return '/ranks/rank-killu.png';
    if (r.includes('neroferno')) return '/ranks/rank-neroferno.png';
    if (r.includes('founder') || r.includes('fundador')) return '/ranks/rank-fundador.png'; 
    if (r.includes('admin')) return '/ranks/admin.png';
    if (r.includes('mod')) return '/ranks/moderator.png';
    if (r.includes('helper')) return '/ranks/helper.png';
    if (r.includes('staff')) return '/ranks/staff.png';
    return null;
};

const getStatusColor = (status: string) => {
    switch(status) {
        case 'online': return '#22c55e';
        case 'dnd': return '#ef4444';
        case 'idle': return '#eab308';
        default: return '#52525b';
    }
};

export default function StaffActivity({ staffOnline, serverOnline }: StaffActivityProps) {
    const { t } = useTranslation();

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
            <h3 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ padding: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FaUsers style={{ color: 'var(--accent)' }} /> 
                </div>
                <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#fff' }}>{t('admin.dashboard.staff.title')}</span>
                {staffOnline.length > 0 && <span style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', border: '1px solid rgba(34, 197, 94, 0.3)', fontSize: '0.7rem', fontWeight: '800', padding: '4px 10px', borderRadius: '8px', marginLeft: 'auto', letterSpacing: '0.5px' }}>{staffOnline.length} ON</span>}
            </h3>
            
            <div style={{ flex: 1 }}>
                {(serverOnline || staffOnline.length > 0) ? (
                    <div style={{ maxHeight: '350px', overflowY: 'auto', paddingRight: '5px' }} className="custom-scrollbar">
                        {staffOnline.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                {staffOnline.map((staff, idx) => {
                                    const discordColor = getStatusColor(staff.discord_status);
                                    return (
                                    <div key={idx} className="hover-lift" style={{ 
                                        display: 'grid', 
                                        gridTemplateColumns: 'auto 1fr auto', 
                                        gap: '1rem', 
                                        background: 'rgba(255,255,255,0.02)', 
                                        padding: '0.8rem', 
                                        borderRadius: '16px', 
                                        border: '1px solid rgba(255,255,255,0.03)', 
                                        transition: 'all 0.2s', 
                                        alignItems: 'center',
                                        cursor: 'default' 
                                    }}>
                                        <div style={{ position: 'relative' }}>
                                            <MinecraftAvatar 
                                                src={staff.avatar} 
                                                alt={staff.username} 
                                                size={64}
                                                style={{ width: '40px', height: '40px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.3)', display: 'block' }} 
                                            />
                                            
                                            {/* Status stack logic */}
                                            <div style={{ 
                                                position: 'absolute', 
                                                bottom: -4, 
                                                right: -4, 
                                                display: 'flex', 
                                                flexDirection: 'column-reverse', 
                                                gap: '2px',
                                                zIndex: 10
                                            }}>
                                                {staff.mc_status === 'online' && (
                                                    <div 
                                                        title="Jugando en Minecraft"
                                                        style={{ 
                                                            width: '16px', height: '16px', 
                                                            borderRadius: '50%',
                                                            background: '#18181b', 
                                                            border: '2px solid #18181b',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            boxShadow: '0 2px 5px rgba(0,0,0,0.5)'
                                                        }} 
                                                    >
                                                        <img src="/images/ui/minecraft_logo_icon_168974.png" alt="MC" style={{ width: '10px', height: '10px' }} />
                                                    </div>
                                                )}

                                                <div 
                                                    title={`Discord: ${staff.discord_status}`}
                                                    style={{ 
                                                        width: '16px', height: '16px', 
                                                        borderRadius: '50%',
                                                        background: '#18181b',
                                                        border: `2px solid ${discordColor}`, 
                                                        boxShadow: '0 2px 5px rgba(0,0,0,0.5)',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                    }} 
                                                >
                                                    <FaDiscord size={8} color="#fff" />
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ minWidth: 0 }}>
                                            <div style={{ fontWeight: '800', fontSize: '0.9rem', color: '#fff', letterSpacing: '0.3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{staff.username}</div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                                {getRoleImage(staff.role) || staff.role_image ? (
                                                    <img src={getRoleImage(staff.role) || staff.role_image} alt={staff.role} style={{ height: '14px', width: 'auto', maxWidth: '100%', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
                                                ) : (
                                                    <span style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.08)', padding: '2px 6px', borderRadius: '4px', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>{staff.role}</span>
                                                )}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                            <div style={{ fontSize: '0.75rem', color: discordColor, textAlign: 'right', fontWeight: 800, textShadow: `0 0 10px ${discordColor}40` }}>
                                                {staff.mc_status !== 'online' ? (
                                                    <small>{staff.discord_status === 'dnd' ? 'NO MOLESTAR' : staff.discord_status.toUpperCase()}</small>
                                                ) : (
                                                    <small style={{ color: '#4ade80' }}>JUGANDO</small>
                                                )}
                                            </div>
                                            {(staff.login_time && staff.mc_status === 'online') && (
                                                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                                                    <FaClock size={10} />
                                                    {(() => {
                                                        const loginTime = new Date(staff.login_time).getTime();
                                                        const diff = Math.max(0, Date.now() - loginTime);
                                                        const hours = Math.floor(diff / 3600000);
                                                        const mins = Math.floor((diff % 3600000) / 60000);
                                                        return `${hours}h ${mins}m`;
                                                    })()}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 0', opacity: 0.5 }}>
                                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                                    <FaUsers size={24} style={{ color: 'rgba(255,255,255,0.4)' }} />
                                </div>
                                <p style={{ margin: 0, fontStyle: 'italic', color: 'rgba(255,255,255,0.4)', fontWeight: '500' }}>{t('admin.dashboard.staff.no_staff')}</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <p style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', fontWeight: '500' }}>{t('admin.dashboard.staff.offline_msg')}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
