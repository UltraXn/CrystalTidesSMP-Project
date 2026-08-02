import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'

interface AboutRolesRadarProps {
    data: Array<{ subject: string; A: number; fullMark?: number }>;
    colorHex: string;
}

export default function AboutRolesRadar({ data, colorHex }: AboutRolesRadarProps) {
    return (
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={140}>
            <RadarChart cx="50%" cy="55%" outerRadius="68%" data={data}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis 
                    dataKey="subject" 
                    tick={{ fill: '#888', fontSize: 9, fontWeight: 800 }} 
                />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                    name="Stats"
                    dataKey="A"
                    stroke={colorHex}
                    fill={colorHex}
                    fillOpacity={0.4}
                    animationDuration={500}
                />
            </RadarChart>
        </ResponsiveContainer>
    );
}
