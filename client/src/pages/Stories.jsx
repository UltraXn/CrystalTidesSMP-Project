import { useState } from "react"
import { FaMapPin, FaQuestion, FaTimes, FaUser } from "react-icons/fa"
import Section from "@/components/Layout/Section"

import { motion, AnimatePresence } from "framer-motion"

const PLACES = [
    {
        id: 1,
        title: "Santuario del Spawn",
        coords: "0, 100, 0",
        desc: "Nuestro punto de bienvenida. Una isla flotante iluminada por linternas.",
        longDesc: "El Santuario del Spawn fue la primera construcción del servidor. Diseñado para recibir a los nuevos jugadores con una atmósfera de paz y misterio. Cuenta con portales de teletransporte ocultos tras las cascadas y una zona de intercambio con aldeanos protegidos. Los cerezos fueron plantados a mano uno por uno.",
        image: "/hero-bg-1.webp",
        authors: [
            { name: "Killaradian", role: "Arquitecto" },
            { name: "UltraXn", role: "Co-Creador" }
        ]
    },
    {
        id: 2,
        title: "¡Futuro Proyecto!",
        coords: "???",
        desc: "Una nueva zona está siendo construida en secreto.",
        longDesc: "Zona restringida por el staff. Se rumorea que será una nueva mazmorra procedural.",
        image: null,
        isComingSoon: true,
        authors: [{ name: "Admin", role: "Staff" }]
    },
    {
        id: 3,
        title: "¡Expansión en Breve!",
        coords: "???",
        desc: "Estamos preparando el terreno para algo grande.",
        longDesc: "Ampliación del borde del mundo programada para la versión 1.22.",
        image: null,
        isComingSoon: true,
        authors: [{ name: "Staff", role: "Team" }]
    }
]

export default function Stories() {
    const [selectedPlace, setSelectedPlace] = useState(null)

    return (
        <Section title="lugares y lore">
            <Section>
                <div style={{ textAlign: "center", marginBottom: "3rem", color: "var(--muted)", maxWidth: "600px", margin: "0 auto 3rem" }}>
                    <p>Descubre los puntos de interés de nuestro mundo. Haz clic en las tarjetas para ver los detalles.</p>
                </div>

                <div className="places-grid">
                    {PLACES.map(place => (
                        <div
                            key={place.id}
                            className="place-card"
                            onClick={() => setSelectedPlace(place)}
                            style={{ cursor: "pointer" }}
                        >
                            <div className="place-image-container">
                                {place.isComingSoon ? (
                                    <div className="secret-placeholder">
                                        <div className="secret-overlay"></div>
                                        <FaQuestion className="secret-icon" />
                                    </div>
                                ) : (
                                    <>
                                        <span className="place-coords-badge">
                                            <FaMapPin style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                                            {place.coords}
                                        </span>
                                        <img src={place.image} alt={place.title} className="place-image" />
                                    </>
                                )}
                            </div>
                            <div className="place-content">
                                <h3 className="place-title" style={place.isComingSoon ? { color: 'var(--muted)' } : {}}>{place.title}</h3>
                                <p className="place-desc">{place.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </Section>

            {/* MODAL / LIGHTBOX */}
            <AnimatePresence>
                {selectedPlace && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedPlace(null)}
                        className="modal-overlay"
                        style={{
                            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                            background: "rgba(0,0,0,0.85)", zIndex: 1000,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            padding: "2rem", backdropFilter: "blur(5px)"
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()} // Evitar cerrar al hacer clic dentro
                            className="modal-content"
                            style={{
                                background: "#1a1a20", maxWidth: "900px", width: "100%",
                                borderRadius: "16px", overflow: "hidden",
                                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
                                border: "1px solid rgba(255,255,255,0.1)",
                                position: "relative"
                            }}
                        >
                            <button
                                onClick={() => setSelectedPlace(null)}
                                style={{
                                    position: "absolute", top: "20px", right: "20px",
                                    background: "rgba(0,0,0,0.5)", border: "none",
                                    color: "#fff", width: "40px", height: "40px", borderRadius: "50%",
                                    cursor: "pointer", zIndex: 10, display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: "1.2rem"
                                }}
                            >
                                <FaTimes />
                            </button>

                            <div style={{ height: "400px", position: "relative" }}>
                                {selectedPlace.isComingSoon ? (
                                    <div className="secret-placeholder" style={{ height: "100%", width: "100%" }}>
                                        <FaQuestion className="secret-icon" style={{ fontSize: "8rem" }} />
                                    </div>
                                ) : (
                                    <img
                                        src={selectedPlace.image}
                                        alt={selectedPlace.title}
                                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                    />
                                )}
                                <div style={{
                                    position: "absolute", bottom: 0, left: 0, right: 0,
                                    background: "linear-gradient(to top, #1a1a20 0%, transparent 100%)",
                                    height: "150px"
                                }}></div>
                            </div>

                            <div style={{ padding: "2.5rem" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
                                    <div>
                                        <h2 style={{ fontSize: "2.5rem", fontWeight: "800", marginBottom: "0.5rem", lineHeight: 1 }}>
                                            {selectedPlace.title}
                                        </h2>
                                        <span style={{ color: "var(--accent)", fontFamily: "monospace", fontSize: "1.1rem" }}>
                                            <FaMapPin style={{ marginRight: "0.5rem" }} />
                                            {selectedPlace.coords}
                                        </span>
                                    </div>

                                    {/* AUTORES TAGS (Lista) */}
                                    <div style={{ display: "flex", gap: "1rem" }}>
                                        {selectedPlace.authors && selectedPlace.authors.map((auth, idx) => (
                                            <div key={idx} style={{ display: "flex", alignItems: "center", gap: "0.8rem", background: "rgba(255,255,255,0.05)", padding: "0.5rem 1rem", borderRadius: "50px", border: "1px solid rgba(255,255,255,0.1)" }}>
                                                <img
                                                    src={`https://minotar.net/helm/${auth.name}/100.png`}
                                                    alt={auth.name}
                                                    style={{ width: "32px", height: "32px", borderRadius: "50%" }}
                                                />
                                                <div>
                                                    <div style={{ fontSize: "0.6rem", color: "var(--muted)", textTransform: "uppercase", fontWeight: "bold" }}>{auth.role}</div>
                                                    <div style={{ fontWeight: "bold", color: "#fff", fontSize: "0.9rem" }}>{auth.name}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <p style={{ fontSize: "1.1rem", lineHeight: "1.8", color: "#ccc" }}>
                                    {selectedPlace.longDesc}
                                </p>
                            </div>

                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </Section>
    )
}
