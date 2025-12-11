import { FaComments, FaBullhorn, FaTools, FaCoffee, FaUser, FaClock, FaFire, FaPoll } from 'react-icons/fa'
import { Link } from 'react-router-dom'

const categories = [
    {
        id: 1,
        title: "Anuncios y Noticias",
        description: "Actualizaciones oficiales, notas del parche y eventos importantes.",
        icon: <FaBullhorn />,
        topics: 15,
        posts: 42,
        lastPost: { user: "Admin", date: "Hace 2 horas" }
    },
    {
        id: 2,
        title: "Discusión General",
        description: "Habla sobre cualquier cosa relacionada con CrystalTides SMP.",
        icon: <FaComments />,
        topics: 84,
        posts: 320,
        lastPost: { user: "Steve123", date: "Hace 5 minutos" }
    },
    {
        id: 3,
        title: "Soporte y Ayuda",
        description: "¿Tienes problemas? Pide ayuda a la comunidad o al staff.",
        icon: <FaTools />,
        topics: 22,
        posts: 98,
        lastPost: { user: "CreeperBoy", date: "Hace 1 día" }
    },
    {
        id: 4,
        title: "Off-Topic",
        description: "Zona libre para hablar de otros juegos o temas variados.",
        icon: <FaCoffee />,
        topics: 45,
        posts: 1230,
        lastPost: { user: "GamerGirl", date: "Hace 10 minutos" }
    }
]

import { activePoll } from "@/data/pollData"

export default function Forum() {
    const featuredPoll = activePoll

    return (
        <div className="section" style={{ minHeight: '80vh', paddingTop: '8rem' }}>
            <h2>Foro de la Comunidad</h2>
            <p style={{ color: 'var(--muted)', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem' }}>
                Conéctate con otros jugadores, comparte ideas y mantente al día con lo último de CrystalTides.
            </p>

            {/* Featured Active Poll */}
            <div className="forum-featured-poll" style={{ maxWidth: '900px', margin: '0 auto 3rem auto' }}>
                <div className="section-subtitle" style={{ color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                    <FaFire color="#ff4500" /> <span style={{ color: 'var(--text)' }}>Votación Más Concurrida</span> <span className="status-badge-active">ACTIVA</span>
                </div>

                <div className="poll-card" style={{ border: '1px solid var(--accent)', boxShadow: '0 0 15px rgba(109,165,192,0.1)' }}>
                    <div style={{ marginBottom: '1rem', color: 'var(--accent)', fontSize: '0.9rem', fontWeight: 'bold', textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between' }}>
                        <span><FaPoll style={{ marginRight: '8px', verticalAlign: 'middle' }} />Encuesta Oficial</span>
                        <span style={{ color: '#ff4500', display: 'flex', alignItems: 'center', gap: '5px' }}><FaFire /> HOT TOPIC</span>
                    </div>
                    <h3 className="poll-question" style={{ fontSize: '1.3rem', marginBottom: '1.5rem', color: '#fff' }}>
                        {featuredPoll.question}
                    </h3>

                    <div className="poll-options">
                        {featuredPoll.options.map((opt) => (
                            <div key={opt.id} className="poll-option" style={{ marginBottom: '0.8rem', cursor: 'pointer' }}>
                                <div className="poll-bar-track" style={{ height: '40px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', position: 'relative', overflow: 'hidden' }}>
                                    <div className="poll-bar-fill" style={{ width: `${opt.percent}%`, height: '100%', background: 'var(--accent)', opacity: 0.3, position: 'absolute', top: 0, left: 0 }}></div>
                                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1rem' }}>
                                        <span className="poll-label" style={{ fontWeight: 500, color: '#fff', zIndex: 1 }}>{opt.label}</span>
                                        <span className="poll-percent" style={{ fontWeight: 'bold', color: 'var(--accent)', zIndex: 1 }}>{opt.percent}%</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--muted)', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '2rem' }}>
                        <span>Total de votos: <strong>{featuredPoll.totalVotes}</strong></span>
                        <span>Termina en: <strong style={{ color: '#ff9900' }}>{featuredPoll.closesIn}</strong></span>
                    </div>
                </div>
            </div>

            <div className="forum-categories">
                {categories.map((cat) => (
                    <Link to={`/forum/${cat.id}`} key={cat.id} className="forum-category-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div className="cat-icon-wrapper">
                            {cat.icon}
                        </div>
                        <div className="cat-info">
                            <h3>{cat.title}</h3>
                            <p>{cat.description}</p>
                        </div>
                        <div className="cat-stats">
                            <div className="stat-item">
                                <span>{cat.topics}</span>
                                <small>Temas</small>
                            </div>
                            <div className="stat-item">
                                <span>{cat.posts}</span>
                                <small>Posts</small>
                            </div>
                        </div>
                        <div className="cat-last-post">
                            <div className="last-post-user">
                                <FaUser size={12} style={{ marginRight: '5px' }} /> {cat.lastPost.user}
                            </div>
                            <div className="last-post-date">
                                <FaClock size={12} style={{ marginRight: '5px' }} /> {cat.lastPost.date}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}
