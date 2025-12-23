import { useState } from 'react'
import { FaEnvelope } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { supabase } from '../services/supabaseClient'

export default function ForgotPassword() {
    const [email, setEmail] = useState('')
    const [status, setStatus] = useState('idle') // idle, loading, success, error
    const [message, setMessage] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setStatus('loading')
        setMessage('')

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.origin + '/account', // Redirect to account page where they can change password
            })
            if (error) throw error
            setStatus('success')
            setMessage("Se ha enviado un correo de recuperación. Revisa tu bandeja de entrada.")
        } catch (error: any) {
            console.error(error)
            setStatus('error')
            setMessage(error.message || String(error) || "Error al enviar el correo.")
        }
    }

    return (
        <div className="account-page">
            <div className="account-container">
                <div className="account-card animate-pop-up">
                    <div className="account-header">
                        <h2>Recuperar Contraseña</h2>
                        <p>Introduce tu correo para recibir un enlace de recuperación.</p>
                    </div>

                    {status === 'success' ? (
                         <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(46, 204, 113, 0.1)', borderRadius: '8px', border: '1px solid #2ecc71', color: '#2ecc71' }}>
                            <p>{message}</p>
                            <Link to="/login" className="btn-primary" style={{ marginTop: '1rem', display: 'inline-block', textDecoration:'none', color:'white', background:'var(--accent)', padding:'0.5rem 1rem', borderRadius:'6px' }}>Volver al Login</Link>
                         </div>
                    ) : (
                        <form className="account-form" onSubmit={handleSubmit}>
                            {status === 'error' && (
                                <div className="error-message" style={{ color: '#ff6b6b', background: 'rgba(255, 107, 107, 0.1)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center' }}>
                                    {message}
                                </div>
                            )}

                            <div className="form-group">
                                <label><FaEnvelope /> Correo Electrónico</label>
                                <input
                                    type="email"
                                    placeholder="correo@ejemplo.com"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={status === 'loading'}
                                />
                            </div>

                            <button type="submit" className="btn-submit" disabled={status === 'loading'}>
                                {status === 'loading' ? 'Enviando...' : 'Enviar Enlace'}
                            </button>
                        </form>
                    )}

                    <div className="account-footer">
                        <Link to="/login" className="back-link">← Cancelar y volver</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
