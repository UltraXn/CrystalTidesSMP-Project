import { FaCalendarAlt, FaArrowRight, FaTag } from "react-icons/fa"
import { Link } from "react-router-dom"
import Section from "@/components/Layout/Section"


const NEWS = [
    {
        id: 1,
        title: "¡La dimensión del End abre sus puertas!",
        date: "12 Dic 2025",
        category: "Evento",
        excerpt: "Prepárate para la batalla final contra el Dragón. Este fin de semana liberaremos el acceso al End. ¿Estás listo para conseguir tus elytras?",
        image: "/news-end.jpg" // Placeholder fallback via CSS if missing
    },
    {
        id: 2,
        title: "Mantenimiento Programado y Mejoras de Red",
        date: "10 Dic 2025",
        category: "Sistema",
        excerpt: "Realizaremos una optimización en el host para reducir la latencia. El servidor estará offline por aproximadamente 2 horas durante la madrugada.",
        image: "/news-maintenance.jpg"
    },
    {
        id: 3,
        title: "Llega el plugin de Clanes y Tierras",
        date: "05 Dic 2025",
        category: "Update",
        excerpt: "Ahora podrás formar alianzas oficiales, reclamar territorios y declarar guerras controladas. Revisa el comando /clan para empezar.",
        image: "/news-clans.jpg"
    }
]

const NewsCard = ({ article }) => (
    <div className="news-card">
        <div className="news-image">
            {/* If image fails or is missing, the CSS gradient shows. You can add a real <img> tag here later */}
            <div style={{ fontSize: '3rem', color: 'rgba(255,255,255,0.2)' }}>
                {article.category === 'Evento' ? '🐉' : article.category === 'Sistema' ? '⚙️' : '⚔️'}
            </div>
        </div>
        <div className="news-content">
            <div className="news-date">
                <FaCalendarAlt /> {article.date}
                <span style={{ margin: '0 0.5rem' }}>•</span>
                <FaTag /> {article.category}
            </div>
            <h3 className="news-title">{article.title}</h3>
            <p className="news-excerpt">{article.excerpt}</p>
            <a href="#" className="read-more">
                Leer más <FaArrowRight />
            </a>
        </div>
    </div>
)

export default function Blog() {
    return (
        <Section title="noticias y anuncios">
            <Section>
                <div className="news-grid">
                    {NEWS.map(article => (
                        <NewsCard key={article.id} article={article} />
                    ))}
                </div>

                <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                    <Link to="/news" className="btn-secondary">
                        Ver Historial Completo
                    </Link>
                </div>
            </Section>
        </Section>
    )
}
