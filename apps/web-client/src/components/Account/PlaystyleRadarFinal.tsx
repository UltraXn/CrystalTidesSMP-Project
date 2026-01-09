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
        <div style={{ width: '100%', height: '300px', position: 'relative' }}>
             <ResponsiveContainer width="100%" height={300}>
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={scores}>
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#ccc', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                        name="Playstyle"
                        dataKey="A"
                        stroke="var(--accent)"
                        fill="var(--accent)"
                        fillOpacity={0.4}
                    />
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                        itemStyle={{ color: '#fff' }}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default PlaystyleRadarFinal;
