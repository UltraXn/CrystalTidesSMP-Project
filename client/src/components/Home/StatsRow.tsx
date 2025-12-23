import { useRef, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaDiscord, FaUserPlus, FaCalendarAlt, FaShieldAlt } from "react-icons/fa";
import { motion as Motion, useInView } from "framer-motion";
import anime from "animejs";

export default function StatsRow() {
    const { t } = useTranslation();
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    const [statsData, setStatsData] = useState({
        discord: 200,
        registered: 0,
        years: 1,
        staff: 0
    });
    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
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
    }, [API_URL]);

    const stats = useMemo(() => [
        {
            id: 1,
            icon: <FaDiscord size={30} color="#5865F2" />,
            value: statsData.discord,
            label: t('home.stats.discord'),
            suffix: "+"
        },
        {
            id: 2,
            icon: <FaUserPlus size={30} color="#89D9D1" />,
            value: statsData.registered,
            label: t('home.stats.registered'),
            suffix: "+"
        },
        {
            id: 3,
            icon: <FaCalendarAlt size={30} color="#FFA726" />,
            value: statsData.years,
            label: t('home.stats.years'),
            suffix: t('home.stats.year_suffix')
        },
        {
            id: 4,
            icon: <FaShieldAlt size={30} color="#EF5350" />,
            value: statsData.staff,
            label: t('home.stats.staff'),
            suffix: ""
        }
    ], [t, statsData]);

    useEffect(() => {
        if (isInView) {
            stats.forEach((stat, index) => {
                const counter = { val: 0 };
                anime({
                    targets: counter,
                    val: stat.value,
                    round: 1,
                    easing: 'easeOutExpo',
                    duration: 2000,
                    delay: index * 200,
                    update: function() {
                        const el = document.getElementById(`stat-counter-${stat.id}`);
                        if (el) el.innerHTML = counter.val + stat.suffix;
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
