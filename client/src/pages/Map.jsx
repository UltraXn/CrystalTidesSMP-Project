import Section from "@/components/Layout/Section"
import { FaMapMarkedAlt, FaExpand } from "react-icons/fa"

export default function Map() {
    // Cuando tengas la URL real de tu Dynmap/BlueMap, ponla aquí
    const MAP_URL = "" // Ej: "http://mc.crystaltides.net:8123"

    return (
        <div style={{
            height: 'calc(100vh - 80px)', // Restar altura navbar
            position: 'relative',
            background: '#050505',
            marginTop: '80px', // Espacio para navbar fija
            display: 'flex',
            flexDirection: 'column'
        }}>
            {MAP_URL ? (
                <iframe
                    src={MAP_URL}
                    title="Live Server Map"
                    style={{
                        width: '100%',
                        height: '100%',
                        border: 'none',
                        filter: 'invert(0)' // Ajustar si el mapa es muy brillante
                    }}
                    allowFullScreen
                />
            ) : (
                <div style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: `
                        linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)),
                        url('https://media.forgecdn.net/attachments/302/206/scrsht_3.png') center/cover
                    `,
                    color: 'white',
                    padding: '2rem',
                    textAlign: 'center'
                }}>
                    <FaMapMarkedAlt size={80} color="var(--accent)" style={{ marginBottom: '2rem' }} />
                    <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1rem', textShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>
                        Mapa en Tiempo Real
                    </h1>
                    <p style={{ maxWidth: '600px', fontSize: '1.2rem', color: '#ccc', marginBottom: '2rem' }}>
                        Explora el mundo de CrystalTides desde tu navegador. Observa construcciones, jugadores y territorios en vivo.
                    </p>
                    <div style={{
                        padding: '1rem 2rem',
                        background: 'rgba(255,50,50,0.2)',
                        border: '1px solid rgba(255,50,50,0.3)',
                        borderRadius: '8px',
                        backdropFilter: 'blur(10px)'
                    }}>
                        ⚠️ URL del Mapa no configurada en Map.jsx
                    </div>
                </div>
            )}
        </div>
    )
}
