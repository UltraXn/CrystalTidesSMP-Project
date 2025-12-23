import { useState } from 'react'
import { FaUser, FaEnvelope, FaLock, FaUserPlus, FaDiscord, FaTwitch, FaEye, FaEyeSlash } from 'react-icons/fa'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import SuccessModal from '../components/UI/SuccessModal'
import { useTranslation } from 'react-i18next'
import { Provider } from '@supabase/supabase-js'

export default function Register() {
    const { t } = useTranslation()
    const [email, setEmail] = useState('')
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [error, setError] = useState('')
    const [showSuccessModal, setShowSuccessModal] = useState(false)

    const { register, loginWithProvider } = useAuth()
    const navigate = useNavigate()

    const handleProviderLogin = async (provider: Provider) => {
        try {
            await loginWithProvider(provider)
        } catch (err) {
            console.error(err)
            const message = err instanceof Error ? err.message : String(err)
            setError(`Error al iniciar con ${provider}: ${message}`)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (password !== confirmPassword) {
            return setError(t('register.passwords_do_not_match'))
        }

        try {
            // Use user provided username (independent of Minecraft nick)
            const { user } = await register(email, password, {
                username: username,
                full_name: username,
                // role: 'user', 
                avatar_url: `https://ui-avatars.com/api/?name=${username}`
            })

            if (user) {
                setShowSuccessModal(true)
            }
        } catch (err) {
            console.error(err)
            const message = err instanceof Error ? err.message : String(err)
            
            if (message.includes('unique constraint') || message.includes('409')) {
                return setError(`${t('register.user_exists')} (DB)`)
            }
            
            setError('Error: ' + message)
        }
    }

    return (
        <div className="account-page">
            <SuccessModal
                isOpen={showSuccessModal}
                title={t('register.success_title')}
                message={t('register.success_msg')}
                buttonText={t('register.go_to_login')}
                onAction={() => navigate('/login')}
                onClose={() => navigate('/login')}
            />

            <div className="account-container">
                <div className="account-card animate-pop-up">
                    <div className="account-header">
                        <h2>{t('register.title')}</h2>
                        <p>{t('register.subtitle')}</p>
                    </div>

                    {error && <div style={{ color: 'red', textAlign: 'center', marginBottom: '1rem' }}>{error}</div>}

                    <form className="account-form" onSubmit={handleSubmit}>
                        
                        <div className="form-group">
                            <label><FaUser /> {t('register.username_label')}</label>
                            <input
                                type="text"
                                placeholder={t('register.username_placeholder')}
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label><FaEnvelope /> {t('register.email_label')}</label>
                            <input
                                type="email"
                                placeholder={t('register.email_placeholder')}
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label><FaLock /> {t('register.password_label')}</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    style={{ paddingRight: '2.5rem' }}
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
                                        padding: '0.25rem'
                                    }}
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label><FaLock /> {t('register.confirm_password_label')}</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    style={{ paddingRight: '2.5rem' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                                        padding: '0.25rem'
                                    }}
                                >
                                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="btn-submit">
                            <FaUserPlus /> {t('register.submit')}
                        </button>
                    </form>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.5rem 0' }}>
                        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                        <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>{t('register.or_register_with')}</span>
                        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                    </div>

                    <div className="social-login-group" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                        <button
                            type="button"
                            onClick={() => handleProviderLogin('discord')}
                            className="btn-submit"
                            style={{ background: '#5865F2', marginTop: 0 }}
                        >
                            <FaDiscord size={20} /> Discord
                        </button>
                        <button
                            type="button"
                            onClick={() => handleProviderLogin('twitch')}
                            className="btn-submit"
                            style={{ background: '#9146FF', marginTop: 0 }}
                        >
                            <FaTwitch size={20} /> Twitch
                        </button>
                    </div>

                    <div className="account-footer">
                        <p>
                            {t('register.already_have_account')} <Link to="/login" className="btn-text">{t('register.sign_in')}</Link>
                        </p>
                        <Link to="/" className="back-link">← {t('register.back_home')}</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
