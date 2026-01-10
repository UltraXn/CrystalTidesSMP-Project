import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Users, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Section from '../Layout/Section';
import Loader from '../UI/Loader';
import MinecraftAvatar from '../UI/MinecraftAvatar';

// Pixel Art Bubble SVG Data URI
const BUBBLE_SVG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'%3E%3Cpath d='M2 0h4v1H2zM1 1h1v1H1zM6 1h1v1H6zM0 2h1v4H0zM7 2h1v4H7zM1 6h1v1H1zM6 6h1v1H6zM2 7h4v1H2z'/%3E%3C/svg%3E";
const HIGHLIGHT_SVG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'%3E%3Cpath d='M2 2h2v1H2zM2 3h1v1H2z'/%3E%3C/svg%3E";

const CardBubbles = ({ color }: { color: string }) => {
    // Generate random bubbles with stable IDs
    const [bubbles] = useState(() => Array.from({ length: 5 }).map((_, i) => ({
        id: i,
        size: Math.random() * 10 + 10, // 10-20px
        left: Math.random() * 80 + 10, // 10-90%
        delay: Math.random() * 5,
        duration: Math.random() * 5 + 8 // 8-13s
    })));

    return (
        <div style={{ 
            position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: '20px', 
            pointerEvents: 'none', zIndex: 0 
        }}>
            {bubbles.map(b => (
                <div key={b.id} style={{
                    position: 'absolute',
                    left: `${b.left}%`,
                    bottom: '-20%',
                    width: `${b.size}px`,
                    height: `${b.size}px`,
                    animation: `card-float ${b.duration}s linear infinite`,
                    animationDelay: `${b.delay}s`,
                    opacity: 0
                }}>
                    {/* Colored Body */}
                    <div style={{
                        position: 'absolute', inset: 0,
                        backgroundColor: color,
                        maskImage: `url("${BUBBLE_SVG}")`,
                        maskSize: 'contain',
                        maskRepeat: 'no-repeat',
                        WebkitMaskImage: `url("${BUBBLE_SVG}")`,
                        WebkitMaskSize: 'contain',
                        WebkitMaskRepeat: 'no-repeat',
                        opacity: 0.2
                    }} />
                    {/* White Highlight */}
                    <div style={{
                        position: 'absolute', inset: 0,
                        backgroundColor: 'white',
                        maskImage: `url("${HIGHLIGHT_SVG}")`,
                        maskSize: 'contain',
                        maskRepeat: 'no-repeat',
                        WebkitMaskImage: `url("${HIGHLIGHT_SVG}")`,
                        WebkitMaskSize: 'contain',
                        WebkitMaskRepeat: 'no-repeat',
                        opacity: 0.4
                    }} />
                </div>
            ))}
        </div>
    );
};

interface StaffMember {
    id: string | number;
    name: string;
    mc_nickname?: string; // Added field
    role: string;
    role_en?: string;
    image: string;
    color: string;
    description: string;
    description_en?: string;
    socials?: {
        twitter?: string;
        discord?: string;
        youtube?: string;
        twitch?: string;
    };
}

const API_URL = import.meta.env.VITE_API_URL || '/api';

const RANK_BADGES: Record<string, string> = {
    'Neroferno': '/ranks/rank-neroferno.png',
    'Killuwu': '/ranks/rank-killu.png',
    'Developer': '/ranks/developer.png',
    'Admin': '/ranks/admin.png',
    'Moderator': '/ranks/moderator.png',
    'Helper': '/ranks/helper.png',
    'Usuario': '/ranks/user.png',
    'Staff': '/ranks/staff.png'
};

interface StaffShowcaseProps {
    mockStaff?: StaffMember[];
    mockOnlineStatus?: Record<string, { mc: string, discord: string }>;
    mockRecruitment?: { status: string; link: string };
}

export default function StaffShowcase({ mockStaff, mockOnlineStatus, mockRecruitment }: StaffShowcaseProps) {
    const { t, i18n } = useTranslation();
    const [staff, setStaff] = useState<StaffMember[]>(mockStaff || []);
    
    // Helper to get badge
    const getBadge = (role: string) => {
        if (!role) return null;
        const key = Object.keys(RANK_BADGES).find(k => k.toLowerCase() === role.toLowerCase());
        return key ? RANK_BADGES[key] : null;
    };
    const [recruitment, setRecruitment] = useState<{ status: string; link: string }>(mockRecruitment || { status: 'false', link: '' });
    const [loading, setLoading] = useState(!mockStaff);
    // Store separated statuses
    const [onlineStaff, setOnlineStaff] = useState<Record<string, { mc: string, discord: string }>>(mockOnlineStatus || {});
    const [hoveredDiscord, setHoveredDiscord] = useState<string | null>(null);

    const resolveUrl = (url: string, platform: 'twitter' | 'youtube' | 'twitch') => {
        if (!url) return '#';
        if (url.startsWith('http')) return url;
        if (platform === 'twitter') return `https://x.com/${url.replace('@', '')}`;
        if (platform === 'youtube') return `https://youtube.com/@${url}`;
        if (platform === 'twitch') return `https://twitch.tv/${url}`;
        return url;
    };

    useEffect(() => {
        if (mockStaff) return;

        // Fetch Settings (Staff Cards & Recruitment)
        fetch(`${API_URL}/settings?t=${new Date().getTime()}`)
            .then(res => {
                if(!res.ok) throw new Error(`Fetch settings failed with status: ${res.status}`);
                return res.json();
            })
            .then(data => {
                if(data && data.staff_cards) {
                    try {
                        const parsed = typeof data.staff_cards === 'string' ? JSON.parse(data.staff_cards) : data.staff_cards;
                        setStaff(Array.isArray(parsed) ? parsed : []);
                    } catch { setStaff([]); }
                }
                if (data) {
                    setRecruitment({
                        status: data.recruitment_status || 'false',
                        link: data.recruitment_link || ''
                    });
                }
            })
            .catch(err => {
                console.warn("StaffShowcase: Settings fetch error:", err.message);
                setStaff([]);
            })
            .finally(() => setLoading(false));

        // Fetch Online Staff
        const fetchStatus = () => {
            fetch(`${API_URL}/server/staff`)
                .then(res => res.ok ? res.json() : [])
                .then(data => {
                    if(Array.isArray(data)) {
                        const statusMap: Record<string, { mc: string, discord: string }> = {};
                        data.forEach((u: { username: string; mc_status?: string; discord_status?: string }) => {
                             statusMap[u.username.toLowerCase()] = {
                                 mc: u.mc_status || 'offline',
                                 discord: u.discord_status || 'offline'
                             };
                        });
                        setOnlineStaff(statusMap);
                    }
                })
                .catch(() => {});
        };

        if (!mockStaff) fetchStatus();
        const interval = setInterval(fetchStatus, 30000); // 30s refresh
        return () => clearInterval(interval);
    }, [mockStaff]);

    if (loading) return (
        <Section><div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}><Loader /></div></Section>
    );

    if (staff.length === 0) return (
        <Section title="Debug Staff">
            <div style={{ color: '#fff', textAlign: 'center', padding: '2rem' }}>
                {t('staff.no_data', 'No staff data found. Please check settings or save again from the panel.')}
            </div>
        </Section>
    );

    const getStatusColor = (status: string) => {
        switch(status) {
            case 'online': return '#22c55e'; // Green
            case 'dnd': return '#ef4444';    // Red
            case 'idle': return '#eab308';   // Yellow
            default: return '#52525b';       // Gray
        }
    };

    return (
        <Section title={
            <div className="flex items-center justify-center gap-3">
                <Users className="text-(--accent) text-3xl" /> 
                <span className="uppercase tracking-widest">{t('staff.title', 'Nuestro Equipo')}</span>
            </div>
        }>
            
            {/* Recruitment Banner */}
            <AnimatePresence>
                {recruitment.status === 'true' && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <a 
                            href={recruitment.link || '#'} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 px-8 py-3 rounded-full text-emerald-400 no-underline font-bold transition-all hover:bg-emerald-500/20 hover:scale-105"
                        >
                            <Briefcase size={18} /> {t('staff.hiring_title', '¿Quieres unirte?')} - {t('staff.hiring_action', '¡Estamos buscando staff!')}
                        </a>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 px-4">
                {staff.map((member) => {
                    const status = onlineStaff[(member.mc_nickname || member.name).toLowerCase()] || { mc: 'offline', discord: 'offline' };
                    const discordColor = getStatusColor(status.discord);
                    
                    return (
                        <motion.div 
                            key={member.id} 
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="group relative p-8 rounded-2xl flex flex-col items-center text-center transition-all bg-white/5 border border-white/5 hover:bg-white/10 hover:-translate-y-2 hover:shadow-2xl hover:shadow-black/50"
                            style={{ 
                                borderTop: `4px solid ${member.color}`,
                            }}
                        >
                            {/* Internal Bubbles */}
                            <CardBubbles color={member.color} />

                            <div className="relative mb-6 z-10">
                                <div 
                                    className="w-24 h-24 rounded-full overflow-hidden border-4 shadow-2xl transition-transform group-hover:scale-110"
                                    style={{ 
                                        borderColor: member.color,
                                        boxShadow: `0 0 20px ${member.color}40`
                                    }}
                                >
                                    <MinecraftAvatar 
                                        src={member.image || member.mc_nickname || member.name} 
                                        alt={member.name} 
                                        size={120} 
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                 {/* Status Stack - Bottom Right */}
                                 <div className="absolute -bottom-1 -right-1 flex flex-col-reverse gap-1.5 z-20">
                                    {status.mc === 'online' && (
                                        <div 
                                            title="Jugando en Minecraft"
                                            className="w-6 h-6 rounded-full bg-[#18181b] border-2 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] flex items-center justify-center overflow-hidden"
                                        >
                                            <img src="/images/ui/minecraft_logo_icon_168974.png" alt="MC" className="w-3.5 h-3.5" />
                                        </div>
                                     )}

                                    <div 
                                        title={`Discord: ${status.discord.toUpperCase()}`}
                                        className="w-6 h-6 rounded-full bg-[#5865F2] flex items-center justify-center border-2 shadow-lg"
                                        style={{ 
                                            borderColor: discordColor,
                                            boxShadow: `0 0 10px ${discordColor}80`
                                        }}
                                    >
                                        <svg viewBox="0 0 24 24" fill="currentColor" width="10" height="10" className="text-white"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.125-.094.249-.192.37-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.37.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg> 
                                    </div>
                                 </div>
                            </div>

                            <h3 className="text-xl font-black text-white mb-2 group-hover:text-(--accent) transition-colors">{member.name}</h3>
                            
                            {getBadge(member.role) ? (
                                <img src={getBadge(member.role)!} alt={member.role} className="w-auto h-auto max-h-8 max-w-[150px] mb-4 object-contain" />
                            ) : (
                                <span 
                                    className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-4 border"
                                    style={{ 
                                        color: member.color, 
                                        backgroundColor: `${member.color}10`,
                                        borderColor: `${member.color}30`
                                    }}
                                >
                                    {i18n.language === 'en' && member.role_en ? member.role_en : member.role}
                                </span>
                            )}

                            <p className="text-gray-400 text-sm leading-relaxed mb-6 flex-1 italic opacity-80 group-hover:opacity-100 transition-opacity">
                                {(() => {
                                    const desc = i18n.language === 'en' && member.description_en ? member.description_en : member.description;
                                    return (desc || '').replace(/outrageous(ness|ly)?/gi, 'ultroso');
                                })()}
                            </p>

                             <div className="flex gap-4 mt-auto relative z-20">
                                {member.socials?.twitter && (
                                    <a href={resolveUrl(member.socials.twitter, 'twitter')} target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-[#1DA1F2] transition-all hover:scale-125">
                                        <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M23.953 4.57a10 10 0 0 1-2.825.775 4.958 4.958 0 0 0 2.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 0 0-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 0 0-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 0 1-2.228-.616v.06a4.923 4.923 0 0 0 3.946 4.827 4.996 4.996 0 0 1-2.212.085 4.936 4.936 0 0 0 4.604 3.417 9.867 9.867 0 0 1-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 0 0 7.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0 0 24 4.59z"/></svg>
                                    </a>
                                )}
                                
                                {member.socials?.discord && (
                                    <div 
                                        className="relative flex items-center"
                                        onMouseEnter={() => setHoveredDiscord(String(member.id))}
                                        onMouseLeave={() => setHoveredDiscord(null)}
                                    >
                                        <div className="text-white/40 hover:text-[#5865F2] cursor-help relative hover:scale-125 transition-all">
                                            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.125-.094.249-.192.37-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.37.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
                                            {status.discord !== 'offline' && (
                                                <CheckCircle2 
                                                    size={10} 
                                                    className="absolute -bottom-1 -right-1 bg-[#18181b] rounded-full border border-[#18181b]"
                                                    style={{ color: discordColor }} 
                                                />
                                            )}
                                        </div>
                                        <AnimatePresence>
                                            {hoveredDiscord === String(member.id) && member.socials?.discord && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.9, y: 10, x: '-50%' }}
                                                    animate={{ opacity: 1, scale: 1, y: 0, x: '-50%' }}
                                                    exit={{ opacity: 0, scale: 0.9, y: 10, x: '-50%' }}
                                                    className="absolute bottom-full left-1/2 mb-3 bg-[#18181b] border border-white/10 px-3 py-1.5 rounded-lg shadow-2xl z-50 pointer-events-none"
                                                >
                                                    <span className="text-xs font-bold text-white whitespace-nowrap">{member.socials.discord.split(',')[0].trim()}</span>
                                                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-[#18181b] border-r border-b border-white/10 rotate-45 -mt-1"></div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                )}
 
                                {member.socials?.twitch && (
                                    <a href={resolveUrl(member.socials.twitch, 'twitch')} target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-[#9146FF] relative hover:scale-125 transition-all">
                                        <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/></svg>
                                        {onlineStaff[member.name.toLowerCase()]?.mc === 'online' && (
                                            <CheckCircle2 
                                                size={10} 
                                                className="absolute -bottom-1 -right-1 text-emerald-500 bg-[#18181b] rounded-full border border-[#18181b]"
                                            />
                                        )}
                                    </a>
                                )}
                                
                                {member.socials?.youtube && (
                                    <a href={resolveUrl(member.socials.youtube, 'youtube')} target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-[#FF0000] hover:scale-125 transition-all">
                                        <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                                    </a>
                                )}
                             </div>
                        </motion.div>
                    );
                })}
            </div>
            <style>{`
                @keyframes card-float {
                    0% { transform: translateY(0) translateX(0); opacity: 0; }
                    20% { opacity: 1; }
                    50% { transform: translateY(-150px) translateX(10px); }
                    100% { transform: translateY(-300px) translateX(-10px); opacity: 0; }
                }
            `}</style>
        </Section>
    );
}

