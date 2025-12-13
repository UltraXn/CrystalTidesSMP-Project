import React from 'react'

export default function Loader({ text = "Cargando contenido..." }) {
    return (
        <div className="loader-container" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            width: '100%',
            height: '100%',
            minHeight: '200px'
        }}>
            <style>{`
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                @keyframes jump { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
                .spinner-circle {
                    width: 50px; height: 50px;
                    border: 3px solid rgba(255, 255, 255, 0.1);
                    border-top: 3px solid var(--accent, #0F969C);
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                .pulpito-mini {
                    animation: jump 2s infinite ease-in-out;
                }
            `}</style>

            <div className="loader-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', marginBottom: '1rem' }}>
                <div className="spinner-circle"></div>
                <img
                    src="/images/ui/logo.webp"
                    alt="Loading..."
                    className="pulpito-mini"
                    style={{ width: '50px', height: 'auto', display: 'block' }}
                />
            </div>
            {text && <p style={{ color: 'var(--muted, #aaa)', fontSize: '1rem', marginTop: '0.5rem' }}>{text}</p>}
        </div>
    )
}
