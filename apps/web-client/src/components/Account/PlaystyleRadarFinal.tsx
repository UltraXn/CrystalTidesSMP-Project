import React from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';
import { useTranslation } from 'react-i18next';

interface PlaystyleRadarProps {
    stats: {
        blocksPlaced: number;
        blocksMined: number;
        kills: number;
        mobKills: number;
        playtimeHours: number;
        money: number;
        rank: string;
        streakDays?: number;
        distanceKm?: number;
        isTop1Constructor?: boolean;
        isTop1Luchador?: boolean;
        isTop1Mercader?: boolean;
        isTop1Constancia?: boolean;
        isTop1Explorador?: boolean;
        top1ConstructorScore?: number;
        top1LuchadorScore?: number;
        top1MercaderScore?: number;
        top1ConstanciaScore?: number;
        top1ExploradorScore?: number;
    }
}

// El 100% (borde máximo del pentágono) se reserva para el Top 1 del servidor en esa categoría
const getTopRelativeScore = (val: number, top1Val?: number, isTop1?: boolean) => {
    if (isTop1) return 100;
    const benchmark = Math.max(top1Val || 100000, 100);
    return Math.min(99, Math.max(10, Math.round((val / benchmark) * 100)));
};

const PlaystyleRadarFinal: React.FC<PlaystyleRadarProps> = ({ stats }) => {
    const { t } = useTranslation();

    // 1. Constructor: Bloques Minados + Colocados
    const blocksTotal = (stats.blocksPlaced || 0) + (stats.blocksMined || 0);
    const scoreConstructor = getTopRelativeScore(blocksTotal, stats.top1ConstructorScore || 100000, stats.isTop1Constructor);

    // 2. Luchador: (15 * Kills PvP) + (1 * Kills Mobs)
    const combatPoints = (stats.kills || 0) * 15 + (stats.mobKills || 0);
    const scoreLuchador = getTopRelativeScore(combatPoints, stats.top1LuchadorScore || 5000, stats.isTop1Luchador);

    // 3. Mercader: Escala Logarítmica 100 * log10(KC + 1)
    const moneyVal = Math.max(1, stats.money || 0);
    const merchantLogPoints = Math.round(100 * Math.log10(moneyVal));
    const scoreMercader = getTopRelativeScore(merchantLogPoints, stats.top1MercaderScore || 500, stats.isTop1Mercader);

    // 4. Constancia: Exponencial (Días de Racha)^2
    const streakDays = Math.max(1, stats.streakDays || 1);
    const streakPoints = Math.pow(streakDays, 2);
    const scoreConstancia = getTopRelativeScore(streakPoints, stats.top1ConstanciaScore || 900, stats.isTop1Constancia);

    // 5. Explorador: (Horas * 10) + (Km Recorridos)
    const kmTraveled = stats.distanceKm || (stats.playtimeHours * 35);
    const explorerPoints = (stats.playtimeHours * 10) + kmTraveled;
    const scoreExplorador = getTopRelativeScore(explorerPoints, stats.top1ExploradorScore || 3000, stats.isTop1Explorador);

    const scores = [
        {
            subject: t('about.roles.radar.builder', 'Constructor'),
            A: scoreConstructor,
            fullMark: 100,
            rawPoints: blocksTotal,
            color: "#38BDF8",
            icon: "https://minecraft.wiki/w/Special:Redirect/file/Crafting_Table.png",
        },
        {
            subject: t('about.roles.radar.fighter', 'Luchador'),
            A: scoreLuchador,
            fullMark: 100,
            rawPoints: combatPoints,
            color: "#F43F5E",
            icon: "https://minecraft.wiki/w/Special:Redirect/file/Diamond_Sword.png",
        },
        {
            subject: t('about.roles.radar.merchant', 'Mercader'),
            A: scoreMercader,
            fullMark: 100,
            rawPoints: Math.round(100 * Math.log10(moneyVal)),
            color: "#F59E0B",
            icon: "/images/killucoins/coin_oro.webp",
        },
        {
            subject: t('about.roles.radar.constancy', 'Constancia'),
            A: scoreConstancia,
            fullMark: 100,
            rawPoints: Math.pow(streakDays, 2),
            color: "#E879F9",
            icon: "https://minecraft.wiki/w/Special:Redirect/file/Totem_of_Undying.png",
        },
        {
            subject: t('about.roles.radar.explorer', 'Explorador'),
            A: scoreExplorador,
            fullMark: 100,
            rawPoints: Math.round(explorerPoints),
            color: "#10B981",
            icon: "https://minecraft.wiki/w/Special:Redirect/file/Compass.png",
        },
    ];

    return (
        <div className="w-full relative flex flex-col min-w-0">
            <ResponsiveContainer width="100%" height={260} minWidth={0} minHeight={200}>
                <RadarChart cx="50%" cy="50%" outerRadius="65%" data={scores}>
                    <PolarGrid stroke="rgba(255,255,255,0.05)" />
                    <PolarAngleAxis 
                        dataKey="subject" 
                        tick={{ fill: '#666', fontSize: 11, fontWeight: 800, letterSpacing: '0.5px' }} 
                    />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                        name="Playstyle"
                        dataKey="A"
                        stroke="var(--accent)"
                        fill="var(--accent)"
                        fillOpacity={0.2}
                        animationBegin={500}
                        animationDuration={1500}
                    />
                    <Tooltip 
                        contentStyle={{ 
                            backgroundColor: '#0a0a0a', 
                            border: '1px solid rgba(255,255,255,0.1)', 
                            borderRadius: '16px',
                            padding: '12px',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                        }}
                        itemStyle={{ color: '#fff', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase' }}
                        cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
                    />
                </RadarChart>
            </ResponsiveContainer>

            {/* Puntaje Real por Rama (Grid 2 Columnas Despejado) */}
            <div className="mt-3 grid grid-cols-2 gap-2.5 w-full">
                {scores.map((item, idx) => (
                    <div 
                        key={item.subject}
                        className={`bg-black/40 border rounded-xl p-2.5 flex items-center justify-between transition-colors hover:bg-black/60 ${idx === 4 ? 'col-span-2' : ''}`}
                        style={{ borderColor: `${item.color}30` }}
                    >
                        <div className="flex items-center gap-2 text-xs font-bold" style={{ color: item.color }}>
                            <img src={item.icon} className="w-4 h-4 object-contain shrink-0" alt={item.subject} />
                            <span className="truncate">{item.subject}</span>
                        </div>
                        <div className="text-xs font-black text-white">
                            {item.rawPoints.toLocaleString()} <span className="text-[10px] font-normal text-gray-400">pts</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PlaystyleRadarFinal;
