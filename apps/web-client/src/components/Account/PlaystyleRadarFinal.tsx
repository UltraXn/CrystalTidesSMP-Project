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
    }
}

const PlaystyleRadarFinal: React.FC<PlaystyleRadarProps> = ({ stats }) => {
    const { t } = useTranslation();

    // Normalize scores (0-100) based on arbitrary "max" values for a typical active player
    const getScore = (val: number, max: number) => Math.min(100, Math.round((val / max) * 100));

    const scores = [
        {
            subject: t('account.overview.playstyle.constructor', 'Constructor'),
            A: getScore(stats.blocksPlaced + stats.blocksMined, 300000), // 300k blocks
            fullMark: 100,
        },
        {
            subject: t('account.overview.playstyle.fighter', 'Luchador'),
            A: getScore(stats.kills * 10 + stats.mobKills, 5000), // 5k mob kills equivalent
            fullMark: 100,
        },
        {
            subject: t('account.overview.playstyle.explorer', 'Explorador'),
            A: getScore(stats.playtimeHours, 200), // 200h
            fullMark: 100,
        },
        {
            subject: t('account.overview.playstyle.merchant', 'Mercader'),
            A: getScore(stats.money, 1000000), // 1M coins
            fullMark: 100,
        },
        {
            subject: t('account.overview.playstyle.social', 'Social'),
            A: getScore(
                (stats.playtimeHours * 0.2) + (['donador', 'fundador', 'killuwu', 'neroferno', 'developer', 'staff'].some(r => stats.rank.toLowerCase().includes(r)) ? 30 : 0), 
                100
            ),
            fullMark: 100,
        },
    ];

    return (
        <div className="w-full h-[300px] relative">
             <ResponsiveContainer width="100%" height={300}>
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={scores}>
                    <PolarGrid stroke="rgba(255,255,255,0.05)" />
                    <PolarAngleAxis 
                        dataKey="subject" 
                        tick={{ fill: '#666', fontSize: 10, fontWeight: 900, letterSpacing: '1px' }} 
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
        </div>
    );
};

export default PlaystyleRadarFinal;
