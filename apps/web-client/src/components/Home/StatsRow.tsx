import { useRef, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { UserPlus, Calendar, Shield } from "lucide-react";
import { motion as Motion, useInView } from "framer-motion";
import { gsap } from "gsap";

interface StatsRowProps {
    mockStats?: {
        discord: number;
        registered: number;
        years: number;
        staff: number;
    };
}

export default function StatsRow({ mockStats }: StatsRowProps) {
    const { t } = useTranslation();
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    const [statsData, setStatsData] = useState(mockStats || {
        discord: 200,
        registered: 0,
        years: 1,
        staff: 0
    });
    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        if (mockStats) return;

        const fetchStats = async () => {
            try {
                // Fetch Minecraft Status (Players Online)
                // Note: The previous Hero.jsx used /minecraft/status, let's use that for online or registered if available
                // Actually serverRoutes.js has /resources which returns total_players (registered)
                // Let's try to fetch resources for registered count
                const resResources = await fetch(`${API_URL}/server/resources`);
                const dataResources = await resResources.json();
                
                // Fetch Discord Count (using public invite API)
                try {
                    const resDiscord = await fetch('https://discord.com/api/v9/invites/TDmwYNnvyT?with_counts=true');
                    const dataDiscord = await resDiscord.json();
                    if (dataDiscord.approximate_member_count) {
                        setStatsData(prev => ({ ...prev, discord: dataDiscord.approximate_member_count }));
                    }
                } catch (err) {
                    console.error("Error fetching Discord stats:", err);
                }

                // Fetch Staff
                const resStaff = await fetch(`${API_URL}/server/staff`);
                const dataStaff = await resStaff.json();

                setStatsData(prev => ({
                    ...prev,
                    registered: dataResources.total_players || prev.registered,
                    staff: Array.isArray(dataStaff) ? dataStaff.length : prev.staff
                    // Years remains static for now
                }));
            } catch (error) {
                console.error("Error fetching stats:", error);
            }
        };

        fetchStats();
    }, [API_URL, mockStats]);

    const stats = useMemo(() => [
        {
            id: 1,
            icon: <svg width="30" height="30" viewBox="0 0 24 24" fill="#5865F2" xmlns="http://www.w3.org/2000/svg">
                <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.419-2.1568 2.419zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.419-2.1568 2.419z"/>
            </svg>,
            value: statsData.discord,
            label: t('home.stats.discord'),
            suffix: "+"
        },
        {
            id: 2,
            icon: <UserPlus size={30} color="#89D9D1" />,
            value: statsData.registered,
            label: t('home.stats.registered'),
            suffix: "+"
        },
        {
            id: 3,
            icon: <Calendar size={30} color="#FFA726" />,
            value: statsData.years,
            label: t('home.stats.years'),
            suffix: t('home.stats.year_suffix')
        },
        {
            id: 4,
            icon: <Shield size={30} color="#EF5350" />,
            value: statsData.staff,
            label: t('home.stats.staff'),
            suffix: ""
        }
    ], [t, statsData]);

    useEffect(() => {
        if (isInView) {
            stats.forEach((stat, index) => {
                const counter = { val: 0 };
                gsap.to(counter, {
                    val: stat.value,
                    duration: 2,
                    delay: index * 0.2,
                    ease: "power2.out",
                    onUpdate: () => {
                        const el = document.getElementById(`stat-counter-${stat.id}`);
                        if (el) el.innerHTML = Math.floor(counter.val) + stat.suffix;
                    }
                });
            });
        }
    }, [isInView, stats]);

    return (
        <div 
            ref={ref}
            className="stats-grid" 
            style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '1.5rem', 
                marginBottom: '4rem',
                marginTop: '2rem'
            }}
        >
            {stats.map((stat, index) => (
                <Motion.div
                    key={stat.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    style={{
                        background: 'rgba(11, 12, 16, 0.6)',
                        border: '1px solid rgba(137, 217, 209, 0.1)',
                        backdropFilter: 'blur(8px)',
                        padding: '1.5rem',
                        borderRadius: '16px',
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '1rem',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
                    }}
                    whileHover={{ translateY: -5, borderColor: 'rgba(137, 217, 209, 0.4)' }}
                >
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        padding: '12px',
                        borderRadius: '50%',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                    }}>
                        {stat.icon}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        <span 
                            id={`stat-counter-${stat.id}`}
                            style={{ 
                                fontSize: '2rem', 
                                fontWeight: '800', 
                                color: '#ffffff',
                                fontFamily: 'Inter, sans-serif'
                            }}
                        >
                            0
                        </span>
                        <span style={{ color: 'var(--muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            {stat.label}
                        </span>
                    </div>
                </Motion.div>
            ))}
        </div>
    );
}
