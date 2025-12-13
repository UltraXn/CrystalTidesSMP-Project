
import { useState } from 'react'
import { FaEnvelope, FaLock, FaSignInAlt, FaDiscord, FaTwitch, FaEye, FaEyeSlash } from 'react-icons/fa'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useTranslation } from 'react-i18next'

export default function Login() {
    const { t } = useTranslation()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const { login, loginWithProvider } = useAuth()
    const navigate = useNavigate()

    const handleProviderLogin = async (provider) => {
        try {
            const { error: providerError } = await loginWithProvider(provider)
            if (providerError) throw providerError
        } catch (err) {
            console.error(err)
            setError(`Error al iniciar con ${provider}`)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const { error: loginError } = await login(email, password)
            if (loginError) {
                if (loginError.message === 'Invalid login credentials') {
                    throw new Error('Credenciales inválidas. Verifica tu correo y contraseña.')
                }
                throw loginError
            }
            // Navegar al dashboard o home tras login exitoso
            navigate('/')
        } catch (err) {
            console.error(err)
            setError(err.message || 'Error al iniciar sesión')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="account-page">
            <div className="account-container">
                <div className="account-card animate-pop-up">
                    <div className="account-header">
                        <h2>{t('login.title')}</h2>
                        <p>{t('login.welcome')}</p>
                    </div>

                    {error && <div className="error-message" style={{ color: '#ff6b6b', background: 'rgba(255, 107, 107, 0.1)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.9rem', border: '1px solid rgba(255, 107, 107, 0.2)' }}>{error}</div>}

                    <form className="account-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label><FaEnvelope /> {t('login.email_label')}</label>
                            <input
                                type="email"
                                placeholder={t('login.email_placeholder')}
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label><FaLock /> {t('login.password_label')}</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder={t('login.password_placeholder')}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    style={{ paddingRight: '2.5rem' }}
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '0.75rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--muted)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: '0.25rem',
                                        zIndex: 2
                                    }}
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>

                        <div style={{ textAlign: 'right', marginBottom: '1rem' }}>
                            <Link to="/forgot-password" style={{ color: 'var(--muted)', fontSize: '0.85rem', textDecoration: 'none' }}>
                                {t('login.forgot_password')}
                            </Link>
                        </div>

                        <button type="submit" className="btn-submit" disabled={loading}>
                            {loading ? t('login.loading') : <><FaSignInAlt /> {t('login.sign_in_verb')}</>}
                        </button>
                    </form>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.5rem 0' }}>
                        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                        <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>{t('login.or_sign_in_with')}</span>
                        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                        <button
                            type="button"
                            onClick={() => handleProviderLogin('discord')}
                            className="btn-submit"
                            style={{ background: '#5865F2', marginTop: 0 }}
                            disabled={loading}
                        >
                            <FaDiscord size={20} /> Discord
                        </button>
                        <button
                            type="button"
                            onClick={() => handleProviderLogin('twitch')}
                            className="btn-submit"
                            style={{ background: '#9146FF', marginTop: 0 }}
                            disabled={loading}
                        >
                            <FaTwitch size={20} /> Twitch
                        </button>
                    </div>

                    <div className="account-footer">
                        <p>
                            {t('login.no_account')} <Link to="/register" className="btn-text">{t('login.register')}</Link>
                        </p>
                        <Link to="/" className="back-link">← {t('login.back_home')}</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}