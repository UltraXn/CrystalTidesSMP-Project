import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Users, CheckCircle2, MessageSquare, Sparkles, Hash, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Section from '../Layout/Section';
import Loader from '../UI/Loader';
import MinecraftAvatar from '../UI/MinecraftAvatar';

// Pixel Art Bubble SVG Data URI
const BUBBLE_SVG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'%3E%3Cpath d='M2 0h4v1H2zM1 1h1v1H1zM6 1h1v1H6zM0 2h1v4H0zM7 2h1v4H7zM1 6h1v1H1zM6 6h1v1H6zM2 7h4v1H2z'/%3E%3C/svg%3E";
const HIGHLIGHT_SVG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'%3E%3Cpath d='M2 2h2v1H2zM2 3h1v1H2z'/%3E%3C/svg%3E";

const CardBubbles = ({ color }: Readonly<{ color: string }>) => {
    const [bubbles] = useState(() => Array.from({ length: 5 }).map((_, i) => ({
        id: i,
        size: ((i * 37) % 10) + 10,
        left: ((i * 53) % 80) + 10,
        delay: (i * 1.3) % 5,
        duration: ((i * 2.7) % 5) + 8
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
    mc_nickname?: string;
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

const FALLBACK_STAFF: StaffMember[] = [
    {
        id: 'killu',
        name: 'KillubysmaliVT',
        role: 'Killuwu',
        color: '#00637c',
        image: '/skins/killu.png',
        mc_nickname: 'KillubysmaliVT',
        description: 'Creadora, streamer y líder comunitaria. Mantiene la armonía del servidor, organiza eventos y es el corazón de la Pecerita.',
        socials: { twitter: 'KilluBysmali', discord: 'killubysmalivt', twitch: 'killubysmalivt' }
    },
    {
        id: 'nero',
        name: 'Neroferno ultranix',
        role: 'Neroferno',
        color: '#ff00b7',
        image: 'https://minotar.net/skin/344af588-8a7e-4053-9f03-92d68d96b86c',
        mc_nickname: 'Neroferno',
        description: 'Co-fundador y desarrollador Lead. Inyectado de café y euforia, programa plugins custom, máquinas dedicadas, MySQL/Redis y mata los bugs en producción.',
        socials: { twitter: 'Neroferno', discord: 'neroferno' }
    },
    {
        id: 'xurlito',
        name: 'Xurlito',
        role: 'Developer',
        color: '#00aeef',
        image: '/skins/churly.png',
        mc_nickname: 'Xurlito',
        description: 'Artista principal y consultor de diseño visual. Mantiene la estética pulida, las interfaces y la experiencia visual limpia de CrystalTides.',
        socials: { discord: 'churlito' }
    },
    {
        id: 'japa',
        name: 'JAPA325',
        role: 'Developer',
        color: '#1d4ed8',
        image: 'JAPA325',
        mc_nickname: 'JAPA325',
        description: 'Consultor de niveles, experiencia de juego y BetaTester oficial. El agente del caos constructivo que busca romper las mecánicas para dejarlas a prueba de fallos.',
        socials: { discord: 'mocaccino25' }
    }
];

// Discord channels mapping
const DISCORD_CHANNELS = [
    { name: "𝖢𝗁𝖺𝗋𝗅𝖺-𝗀𝖾𝗇𝖾𝗋𝖺𝗅🦑", desc: "El centro de conversación y bienvenida diaria de la comunidad." },
    { name: "𝖢𝗈𝗆𝗉-𝖺𝗋𝗍𝖾✨", desc: "Espacio para compartir ilustraciones, diseños y creaciones del staff y miembros." },
    { name: "minecraft-and-chill", desc: "Charlas sobre el survival, capturas del juego y proyectos en el servidor." },
    { name: "actualizacion-del-server", desc: "Registro oficial de parches, parches del launcher e infraestructura técnica." },
    { name: "anuncios-minecraft", desc: "Anuncios importantes, apertura de puertas, mantenimiento y notas de la versión." },
    { name: "sos🙀ඞ", desc: "Canal rápido para alertas, asistencia y tickets de soporte directo." }
];

interface StaffShowcaseProps {
    mockStaff?: StaffMember[];
    mockOnlineStatus?: Record<string, { mc: string, discord: string }>;
    mockRecruitment?: { status: string; link: string };
}

const getBadge = (role: string) => {
    if (!role) return null;
    const key = Object.keys(RANK_BADGES).find(k => k.toLowerCase() === role.toLowerCase());
    return key ? RANK_BADGES[key] : null;
};

const resolveUrl = (url: string, platform: 'twitter' | 'youtube' | 'twitch') => {
    if (!url) return '#';
    if (url.startsWith('http')) return url;
    if (platform === 'twitter') return `https://x.com/${url.replace('@', '')}`;
    if (platform === 'youtube') return `https://youtube.com/@${url}`;
    if (platform === 'twitch') return `https://twitch.tv/${url}`;
    return url;
};

const getStatusColor = (status: string) => {
    switch(status) {
        case 'online': return '#22c55e';
        case 'dnd': return '#ef4444';
        case 'idle': return '#eab308';
        default: return '#52525b';
    }
};

export default function StaffShowcase({ mockStaff, mockOnlineStatus, mockRecruitment }: Readonly<StaffShowcaseProps>) {
    const { t, i18n } = useTranslation();
    const [activeChannelIdx, setActiveChannelIdx] = useState<number>(0);
    const [hoveredDiscord, setHoveredDiscord] = useState<string | null>(null);

    // Fetch settings (staff cards + recruitment) via useQuery
    const { data: settingsData, isLoading: loading } = useQuery({
        queryKey: ['staffShowcaseSettings'],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/settings?t=${Date.now()}`);
            if (!res.ok) throw new Error(`Fetch settings failed with status: ${res.status}`);
            return res.json();
        },
        enabled: !mockStaff,
        staleTime: 60_000,
    });

    const staff: StaffMember[] = (() => {
        if (mockStaff) return mockStaff;
        if (!settingsData) return FALLBACK_STAFF;
        if (settingsData.staff_cards) {
            try {
                const parsed = typeof settingsData.staff_cards === 'string'
                    ? JSON.parse(settingsData.staff_cards)
                    : settingsData.staff_cards;
                return Array.isArray(parsed) && parsed.length > 0 ? parsed : FALLBACK_STAFF;
            } catch { return FALLBACK_STAFF; }
        }
        return FALLBACK_STAFF;
    })();

    const recruitment: { status: string; link: string } = mockRecruitment
        ?? { status: settingsData?.recruitment_status || 'false', link: settingsData?.recruitment_link || '' };

    const { data: onlineStaff = {} } = useQuery<Record<string, { mc: string; discord: string }>>({
        queryKey: ['staffOnlineStatus'],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/server/staff`);
            if (!res.ok) return {};
            const data = await res.json();
            if (!Array.isArray(data)) return {};
            const statusMap: Record<string, { mc: string; discord: string }> = {};
            data.forEach((u: { username: string; mc_status?: string; discord_status?: string }) => {
                statusMap[u.username.toLowerCase()] = {
                    mc: u.mc_status || 'offline',
                    discord: u.discord_status || 'offline'
                };
            });
            return statusMap;
        },
        enabled: !mockStaff,
        refetchInterval: 30000,
        initialData: mockOnlineStatus
    });

    if (loading) return (
        <Section><div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}><Loader /></div></Section>
    );

    return (
        <Section title={
            <div className="flex items-center justify-center gap-3">
                <Users className="text-(--accent) text-3xl" /> 
                <span className="uppercase tracking-widest">{t('staff.title', 'Nuestro Equipo')}</span>
            </div>
        }>
            {/* Team Description Subtitle */}
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed font-medium max-w-3xl mx-auto mb-10 text-center opacity-90">
                {t('staff.subtitle', 'Un equipo de 4 personas unidas por la pasión, el código, el arte y el caos controlado: la voz y comunidad de Killu, la infraestructura eufórica de Nero, la estética limpia de Churly y el testing implacable de Japa.')}
            </p>

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
                            className="inline-flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 px-8 py-3 rounded-full text-emerald-400 no-underline font-bold transition-colors hover:bg-emerald-500/20 hover:scale-105"
                        >
                            <Briefcase size={18} /> {t('staff.hiring_title', '¿Quieres unirte?')} - {t('staff.hiring_action', '¡Estamos buscando staff!')}
                        </a>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Staff Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 px-4 max-w-7xl mx-auto">
                {staff.map((member) => {
                    const status = onlineStaff[(member.mc_nickname || member.name).toLowerCase()] || { mc: 'offline', discord: 'offline' };
                    const discordColor = getStatusColor(status.discord);
                    
                    return (
                        <motion.div 
                            key={member.id} 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className="group relative p-8 rounded-2xl flex flex-col items-center text-center transition-colors bg-white/5 border border-white/5 hover:bg-white/10 hover:-translate-y-2 hover:shadow-2xl hover:shadow-black/50"
                            style={{ 
                                borderTop: `4px solid ${member.color}`,
                            }}
                        >
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

                                <div className="absolute -bottom-1 -right-1 flex flex-col-reverse gap-1.5 z-20">
                                    {status.mc === 'online' && (
                                        <div 
                                            role="img"
                                            aria-label="Jugando en Minecraft"
                                            title="Jugando en Minecraft"
                                            className="w-6 h-6 rounded-full bg-[#18181b] border-2 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] flex items-center justify-center overflow-hidden"
                                        >
                                            <img src="/images/ui/minecraft_logo_icon_168974.png" alt="MC" className="w-3.5 h-3.5" aria-hidden="true" />
                                        </div>
                                     )}

                                    <div 
                                        role="img"
                                        aria-label={`Discord: ${status.discord.toUpperCase()}`}
                                        title={`Discord: ${status.discord.toUpperCase()}`}
                                        className="w-6 h-6 rounded-full bg-[#5865F2] flex items-center justify-center border-2 shadow-lg"
                                        style={{ 
                                            borderColor: discordColor,
                                            boxShadow: `0 0 10px ${discordColor}80`
                                        }}
                                    >
                                        <svg viewBox="0 0 24 24" fill="currentColor" width="10" height="10" className="text-white" aria-hidden="true"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.125-.094.249-.192.37-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.37.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg> 
                                     </div>
                                 </div>
                            </div>

                            <h3 className="text-xl font-black text-white mb-2 group-hover:text-(--accent) transition-colors">{member.name}</h3>
                            
                            {getBadge(member.role) ? (
                                <img src={getBadge(member.role)!} alt={member.role} className="w-auto h-auto max-h-8 max-w-36 mb-4 object-contain" />
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
                                    <a href={resolveUrl(member.socials.twitter, 'twitter')} target="_blank" rel="noopener noreferrer" aria-label={`Twitter de ${member.name}`} className="text-white/40 hover:text-[#1DA1F2] transition-colors hover:scale-125">
                                        <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true"><path d="M23.953 4.57a10 10 0 0 1-2.825.775 4.958 4.958 0 0 0 2.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 0 0-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 0 0-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 0 1-2.228-.616v.06a4.923 4.923 0 0 0 3.946 4.827 4.996 4.996 0 0 1-2.212.085 4.936 4.936 0 0 0 4.604 3.417 9.867 9.867 0 0 1-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 0 0 7.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0 0 24 4.59z"/></svg>
                                    </a>
                                )}
                                
                                {member.socials?.discord && (
                                    <div 
                                        className="relative flex items-center"
                                        onMouseEnter={() => setHoveredDiscord(String(member.id))}
                                        onMouseLeave={() => setHoveredDiscord(null)}
                                        onFocus={() => setHoveredDiscord(String(member.id))}
                                        onBlur={() => setHoveredDiscord(null)}
                                    >
                                        <button 
                                            type="button"
                                            aria-label={`Discord de ${member.name}`}
                                            className="text-white/40 hover:text-[#5865F2] cursor-help relative hover:scale-125 transition-colors bg-transparent border-0 p-0"
                                        >
                                            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.125-.094.249-.192.37-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.37.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>  
                                             {status.discord !== 'offline' && (
                                                 <CheckCircle2 
                                                     size={10} 
                                                     className="absolute -bottom-1 -right-1 bg-[#18181b] rounded-full border border-[#18181b]"
                                                     style={{ color: discordColor }} 
                                                     aria-hidden="true"
                                                 />
                                             )}
                                         </button>
                                            {hoveredDiscord === String(member.id) && (
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
                                     </div>
                                 )}

                                {member.socials?.twitch && (
                                    <a href={resolveUrl(member.socials.twitch, 'twitch')} target="_blank" rel="noopener noreferrer" aria-label={`Twitch de ${member.name}`} className="text-white/40 hover:text-[#9146FF] relative hover:scale-125 transition-colors">
                                        <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/></svg>
                                        {onlineStaff[member.name.toLowerCase()]?.mc === 'online' && (
                                            <CheckCircle2 
                                                size={10} 
                                                className="absolute -bottom-1 -right-1 text-emerald-500 bg-[#18181b] rounded-full border border-[#18181b]"
                                                aria-hidden="true"
                                            />
                                        )}
                                    </a>
                                )}
                                
                                {member.socials?.youtube && (
                                    <a href={resolveUrl(member.socials.youtube, 'youtube')} target="_blank" rel="noopener noreferrer" aria-label={`YouTube de ${member.name}`} className="text-white/40 hover:text-[#FF0000] hover:scale-125 transition-colors">
                                        <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                                    </a>
                                )}
                             </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Live Discord Community Showcase Banner & Channels Tab (Side by Side) */}
            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mt-16 max-w-6xl mx-auto p-8 rounded-3xl bg-linear-to-r from-[#5865F2]/20 via-slate-900/90 to-[#5865F2]/10 border border-[#5865F2]/30 shadow-2xl relative overflow-hidden backdrop-blur-2xl text-left"
            >
                <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#5865F2]/30 blur-3xl pointer-events-none rounded-full" />
                
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
                    {/* Left Column: Discord Info & Direct Button */}
                    <div className="lg:col-span-6 space-y-4">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#5865F2]/20 border border-[#5865F2]/40 text-xs font-black uppercase tracking-widest text-[#7289da]">
                            <MessageSquare className="w-3.5 h-3.5" />
                            Comunidad Oficial de Discord
                        </div>

                        <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                            La Pecerita de los Killufishies <Sparkles className="w-5 h-5 text-amber-400" />
                        </h3>

                        <p className="text-gray-300 text-sm leading-relaxed">
                            Forma parte del servidor de Discord de <strong>CrystalTides SMP</strong>: conversa en vivo con el staff, revisa notas de parches, solicita soporte técnico y comparte tus creaciones artísticas.
                        </p>

                        <div className="flex items-center gap-3 pt-2">
                            <div className="flex items-center gap-2 bg-black/60 border border-white/10 px-4 py-2 rounded-xl">
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
                                <span className="text-xs font-bold text-white">Comunidad Activa & Soporte 24/7</span>
                            </div>
                        </div>

                        <div className="pt-2">
                            <a 
                                href="https://discord.com/invite/TDmwYNnvyT" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-black uppercase tracking-widest text-xs transition-colors duration-300 hover:scale-105 shadow-xl shadow-[#5865F2]/25 cursor-pointer no-underline"
                            >
                                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.125-.094.249-.192.37-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.37.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
                                Unirme al Discord Oficial <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                        </div>
                    </div>

                    {/* Right Column: Interactive Real Discord Channels Tab Widget */}
                    <div className="lg:col-span-6 bg-black/50 border border-white/10 rounded-2xl p-5 backdrop-blur-xl">
                        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                            <span className="text-xs font-black text-gray-300 uppercase tracking-wider flex items-center gap-2">
                                <Hash className="w-3.5 h-3.5 text-[#5865F2]" /> Canales Destacados en Vivo
                            </span>
                            <span className="text-[10px] font-bold text-[#7289da] bg-[#5865F2]/20 border border-[#5865F2]/30 px-2 py-0.5 rounded-md">
                                #discord.gg/crystaltides
                            </span>
                        </div>

                        {/* Channels Grid Tabs */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                            {DISCORD_CHANNELS.map((ch, idx) => (
                                <button aria-label="Action" type="button"
                                    key={ch.name}
                                    onClick={() => setActiveChannelIdx(idx)}
                                    className={`px-3 py-2 rounded-xl text-xs font-mono font-bold text-left transition-colors cursor-pointer flex items-center gap-1.5 truncate border ${
                                        activeChannelIdx === idx
                                        ? "bg-[#5865F2] text-white border-[#5865F2] shadow-lg shadow-[#5865F2]/30 scale-[1.02]"
                                        : "bg-white/5 text-gray-300 border-white/5 hover:bg-white/10 hover:text-white"
                                    }`}
                                >
                                    <span className="text-gray-400">#</span>
                                    <span className="truncate">{ch.name}</span>
                                </button>
                            ))}
                        </div>

                        {/* Active Channel Details Box */}
                        <div className="p-4 rounded-xl bg-slate-950/80 border border-white/10 flex flex-col gap-1.5">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-black text-[#7289da] font-mono">
                                    #{DISCORD_CHANNELS[activeChannelIdx].name}
                                </span>
                            </div>
                            <p className="text-xs text-gray-300 leading-relaxed italic">
                                "{DISCORD_CHANNELS[activeChannelIdx].desc}"
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>

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
