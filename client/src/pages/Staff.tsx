import { useState, useEffect, useRef } from 'react';
import anime from 'animejs';
import { FaTwitter, FaDiscord, FaYoutube } from 'react-icons/fa';
import Loader from '../components/UI/Loader';

interface StaffMember {
    id: string | number;
    name: string;
    role: string;
    image: string;
    color: string;
    description: string;
    socials?: {
        twitter?: string;
        discord?: string;
        youtube?: string;
    };
}

const API_URL = import.meta.env.VITE_API_URL;

export default function Staff() {
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [recruitment, setRecruitment] = useState<{ status: string; link: string }>({ status: 'false', link: '' });
    const [loading, setLoading] = useState(true);
    const containerRef = useRef(null);

    useEffect(() => {
        fetch(`${API_URL}/settings`)
            .then(res => {
                if(!res.ok) throw new Error("Fetch failed");
                return res.json();
            })
            .then(data => {
                if(data.staff_cards) {
                    try {
                        const parsed = typeof data.staff_cards === 'string' ? JSON.parse(data.staff_cards) : data.staff_cards;
                        setStaff(Array.isArray(parsed) ? parsed : []);
                    } catch { setStaff([]); }
                }
                setRecruitment({
                    status: data.recruitment_status || 'false',
                    link: data.recruitment_link || ''
                });
            })
            .catch(console.warn)
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (!loading && staff.length > 0) {
            anime({
                targets: '.staff-card',
                opacity: [0, 1],
                translateY: [20, 0],
                delay: anime.stagger(100),
                easing: 'easeOutQuad',
                duration: 800
            });
        }
    }, [loading, staff]);

    if (loading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#080808' }}><Loader /></div>;

    return (
        <div style={{ paddingTop: '6rem', minHeight: '100vh', paddingBottom: '4rem', background: '#080808', color: '#fff' }}>
            <div className="section">
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <h1 style={{ fontSize: '3rem', marginBottom: '1rem', background: 'linear-gradient(45deg, var(--accent), #fff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Nuestro Equipo</h1>
                    <p style={{ color: '#aaa', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>Conoce a las personas que hacen posible CrystalTides.</p>
                    
                    {/* Recruitment Banner */}
                    {recruitment.status === 'true' && (
                        <div className="animate-pop" style={{ marginTop: '2rem', display: 'inline-block' }}>
                             <a 
                                href={recruitment.link || '#'} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="btn-primary"
                                style={{ 
                                    background: 'linear-gradient(45deg, #10b981, #059669)', 
                                    border: 'none', 
                                    padding: '0.8rem 2rem', 
                                    fontSize: '1.1rem',
                                    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px'
                                }}
                             >
                                🔍 ¡Estamos contratando! Postúlate aquí
                             </a>
                        </div>
                    )}
                </div>

                <div 
                    ref={containerRef}
                    style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
                        gap: '2rem',
                        maxWidth: '1200px',
                        margin: '0 auto',
                        padding: '0 1rem'
                    }}
                >
                    {staff.map((member) => (
                        <div key={member.id} className="staff-card" style={{ 
                            background: 'rgba(255,255,255,0.03)', 
                            borderRadius: '16px', 
                            padding: '2rem',
                            border: '1px solid rgba(255,255,255,0.05)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center',
                            position: 'relative',
                            overflow: 'hidden',
                            transition: 'transform 0.3s, box-shadow 0.3s'
                        }}
                        onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                            e.currentTarget.style.transform = 'translateY(-10px)';
                            e.currentTarget.style.boxShadow = `0 10px 30px ${member.color}20`;
                            e.currentTarget.style.borderColor = member.color;
                        }}
                        onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                        }}
                        >
                            {/* Role Badge */}
                            <div style={{ 
                                position: 'absolute', 
                                top: 0, 
                                left: 0, 
                                width: '100%', 
                                height: '4px', 
                                background: member.color,
                                boxShadow: `0 0 10px ${member.color}`
                            }}></div>

                            <div style={{ 
                                width: '120px', 
                                height: '120px', 
                                marginBottom: '1.5rem', 
                                borderRadius: '50%', 
                                padding: '4px',
                                background: `linear-gradient(135deg, ${member.color}, rgba(0,0,0,0))`,
                                position: 'relative'
                            }}>
                                <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', background: '#000' }}>
                                    <img 
                                        src={member.image?.startsWith('http') ? member.image : `https://mc-heads.net/avatar/${member.image || member.name}/120`} 
                                        alt={member.name} 
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                    />
                                </div>
                            </div>

                            <h3 style={{ fontSize: '1.5rem', margin: '0 0 0.5rem 0' }}>{member.name}</h3>
                            <span style={{ 
                                display: 'inline-block',
                                padding: '4px 12px',
                                borderRadius: '20px',
                                background: `${member.color}20`,
                                color: member.color,
                                fontSize: '0.8rem',
                                fontWeight: 'bold',
                                textTransform: 'uppercase',
                                marginBottom: '1rem',
                                letterSpacing: '1px'
                            }}>
                                {member.role}
                            </span>

                            <p style={{ color: '#aaa', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1.5rem', flex: 1 }}>
                                {member.description}
                            </p>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto' }}>
                                {member.socials?.twitter && (
                                    <a href={member.socials.twitter} target="_blank" rel="noopener noreferrer" style={{ color: '#fff', fontSize: '1.2rem', opacity: 0.7, transition: 'opacity 0.2s' }} onMouseOver={e => e.currentTarget.style.opacity = '1'} onMouseOut={e => e.currentTarget.style.opacity = '0.7'}>
                                        <FaTwitter />
                                    </a>
                                )}
                                {member.socials?.discord && (
                                    <div title={member.socials.discord} style={{ color: '#fff', fontSize: '1.2rem', opacity: 0.7, cursor: 'help' }}>
                                        <FaDiscord />
                                    </div>
                                )}
                                {member.socials?.youtube && (
                                    <a href={member.socials.youtube} target="_blank" rel="noopener noreferrer" style={{ color: '#fff', fontSize: '1.2rem', opacity: 0.7, transition: 'opacity 0.2s' }} onMouseOver={e => e.currentTarget.style.opacity = '1'} onMouseOut={e => e.currentTarget.style.opacity = '0.7'}>
                                        <FaYoutube />
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
