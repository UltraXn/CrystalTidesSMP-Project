import { useState } from "react"
import { FaCalendarAlt, FaTag, FaSearch, FaArrowRight } from "react-icons/fa"
import Section from "@/components/Layout/Section"

// Mock Data
const ALL_NEWS = [
    {
        id: 1,
        title: "¡La dimensión del End abre sus puertas!",
        date: "12 Dic 2025",
        category: "Evento",
        epigraph: "La espera ha terminado. El dragón aguarda.",
        image: "https://images.unsplash.com/photo-1627850604058-52e40de1b847?q=80&w=1000&auto=format&fit=crop",
        content: "Lorem ipsum dolor sit amet..."
    },
    {
        id: 2,
        title: "Mantenimiento Programado",
        date: "10 Dic 2025",
        category: "Sistema",
        epigraph: "Mejoras de rendimiento y backup.",
        image: null, // Sin imagen
        content: "..."
    },
    {
        id: 3,
        title: "Llega el plugin de Clanes",
        date: "05 Dic 2025",
        category: "Update",
        epigraph: "Forma alianzas y conquista territorios.",
        image: "https://images.unsplash.com/photo-1599582299736-1c251d184eb3?q=80&w=800&auto=format&fit=crop",
        content: "..."
    },
    {
        id: 4,
        title: "Ganadores del Torneo PvP #4",
        date: "01 Dic 2025",
        category: "Comunidad",
        epigraph: "Felicidades a xX_Slayer_Xx por la victoria.",
        image: null,
        content: "..."
    },
    {
        id: 5,
        title: "Nueva Tienda de Items Mágicos",
        date: "28 Nov 2025",
        category: "Economía",
        epigraph: "Gasta tus monedas en varitas exclusivas.",
        image: null,
        content: "..."
    }
]

const CATEGORIES = ["Todas", "Evento", "Update", "Sistema", "Comunidad"]

export default function NewsPage() {
    const [activeCategory, setActiveCategory] = useState("Todas")
    const [search, setSearch] = useState("")

    const filteredNews = ALL_NEWS.filter(news => {
        const matchesCategory = activeCategory === "Todas" || news.category === activeCategory
        const matchesSearch = news.title.toLowerCase().includes(search.toLowerCase())
        return matchesCategory && matchesSearch
    })

    return (
        <div style={{ paddingTop: "100px", paddingBottom: "4rem", minHeight: "100vh", background: "#050505" }}>
            <div className="container">

                {/* Header */}
                <Section>
                    <div style={{ textAlign: "center", marginBottom: "4rem" }}>
                        <h1 className="section-title">Novedades Crystal Tides</h1>
                        <p style={{ color: "var(--muted)", maxWidth: "600px", margin: "0 auto" }}>
                            Mantente al día con los últimos parches, eventos y anuncios oficiales del staff.
                        </p>
                    </div>

                    {/* Filters & Search */}
                    <div className="news-controls" style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "1rem",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "3rem",
                        background: "rgba(255,255,255,0.02)",
                        padding: "1rem",
                        borderRadius: "12px",
                        border: "1px solid rgba(255,255,255,0.05)"
                    }}>
                        <div className="category-filters" style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={activeCategory === cat ? "btn-primary" : "btn-secondary"}
                                    style={{ padding: "0.5rem 1rem", fontSize: "0.8rem" }}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        <div className="search-box" style={{ position: "relative" }}>
                            <FaSearch style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#888" }} />
                            <input
                                type="text"
                                placeholder="Buscar noticia..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                style={{
                                    padding: "0.6rem 1rem 0.6rem 2.5rem",
                                    background: "rgba(0,0,0,0.3)",
                                    border: "1px solid #333",
                                    borderRadius: "20px",
                                    color: "#fff",
                                    width: "200px"
                                }}
                            />
                        </div>
                    </div>
                </Section>

                {/* News Grid */}
                <div className="news-grid-page" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "2rem" }}>
                    {filteredNews.map(news => (
                        <Section key={news.id}>
                            <article className="news-card-full" style={{
                                background: "rgba(30, 30, 40, 0.6)",
                                borderRadius: "12px",
                                overflow: "hidden",
                                border: "1px solid rgba(255,255,255,0.05)",
                                height: "100%",
                                display: "flex",
                                flexDirection: "column"
                            }}>
                                <div style={{
                                    height: "180px",
                                    background: news.image ? `url(${news.image}) center/cover` : "linear-gradient(45deg, #1a1a2e, #16213e)",
                                    position: "relative"
                                }}>
                                    <span style={{
                                        position: "absolute", top: "10px", right: "10px",
                                        background: "var(--accent)", color: "#000",
                                        padding: "0.2rem 0.6rem", borderRadius: "4px",
                                        fontSize: "0.7rem", fontWeight: "bold", textTransform: "uppercase"
                                    }}>
                                        {news.category}
                                    </span>
                                </div>
                                <div style={{ padding: "1.5rem", flex: 1, display: "flex", flexDirection: "column" }}>
                                    <div style={{ color: "var(--muted)", fontSize: "0.8rem", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                        <FaCalendarAlt /> {news.date}
                                    </div>
                                    <h3 style={{ fontSize: "1.2rem", fontWeight: "700", marginBottom: "0.8rem", color: "#fff" }}>{news.title}</h3>
                                    <p style={{ color: "#aaa", fontSize: "0.9rem", lineHeight: "1.6", marginBottom: "1.5rem", flex: 1 }}>{news.epigraph}</p>
                                    <a href="#" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: "600", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                        Leer artículo <FaArrowRight />
                                    </a>
                                </div>
                            </article>
                        </Section>
                    ))}

                    {filteredNews.length === 0 && (
                        <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "4rem", color: "#666" }}>
                            No se encontraron noticias con esos filtros.
                        </div>
                    )}
                </div>

            </div>
        </div>
    )
}
