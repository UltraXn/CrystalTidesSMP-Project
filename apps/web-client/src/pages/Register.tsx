import { useState } from 'react'
import { FaUser, FaEnvelope, FaLock, FaUserPlus, FaDiscord, FaTwitch, FaEye, FaEyeSlash } from 'react-icons/fa'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from 'react-i18next'
import { Provider } from '@supabase/supabase-js'
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { registerSchema, RegisterFormValues } from '../schemas/user'

export default function Register() {
    const { t } = useTranslation()
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [generalError, setGeneralError] = useState('')

    const { register, loginWithProvider } = useAuth()
    const navigate = useNavigate()

    const { register: registerField, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema)
    })

    const handleProviderLogin = async (provider: Provider) => {
        try {
            await loginWithProvider(provider)
        } catch (err) {
            console.error(err)
            const message = err instanceof Error ? err.message : String(err)
            setGeneralError(`Error al iniciar con ${provider}: ${message}`)
        }
    }

    const onSubmit = async (data: RegisterFormValues) => {
        setGeneralError('')

        try {
            const { user } = await register(data.email, data.password, {
                username: data.username,
                full_name: data.username,
                avatar_url: `https://ui-avatars.com/api/?name=${data.username}`
            })

            if (user) {
                navigate('/register/success')
            }
        } catch (err) {
            console.error(err)
            const message = err instanceof Error ? err.message : String(err)
            
            if (message.includes('unique constraint') || message.includes('409')) {
                return setGeneralError(`${t('register.user_exists')} (DB)`)
            }
            setGeneralError(t('register.error_generic', 'Error') + ': ' + message)
        }
    }

    return (
        <div className="account-page">

            <div className="account-container">
                <div className="account-card animate-pop-up">
                    <div className="account-header">
                        <h2>{t('register.title')}</h2>
                        <p>{t('register.subtitle')}</p>
                    </div>

                    {generalError && <div style={{ color: 'red', textAlign: 'center', marginBottom: '1rem', background: 'rgba(255,0,0,0.1)', padding: '0.5rem', borderRadius: '4px' }}>{generalError}</div>}

                    <form className="account-form" onSubmit={handleSubmit(onSubmit)}>
                        
                        <div className="form-group">
                            <label><FaUser /> {t('register.username_label')}</label>
                            <input
                                type="text"
                                placeholder={t('register.username_placeholder')}
                                {...registerField("username")}
                            />
                            {errors.username && <span style={{color: 'red', fontSize: '0.8rem'}}>{errors.username.message}</span>}
                        </div>

                        <div className="form-group">
                            <label><FaEnvelope /> {t('register.email_label')}</label>
                            <input
                                type="email"
                                placeholder={t('register.email_placeholder')}
                                {...registerField("email")}
                            />
                             {errors.email && <span style={{color: 'red', fontSize: '0.8rem'}}>{errors.email.message}</span>}
                        </div>

                        <div className="form-group">
                            <label><FaLock /> {t('register.password_label')}</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    {...registerField("password")}
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
                                        padding: '0.25rem',
                                        zIndex: 2
                                    }}
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                            {errors.password && <span style={{color: 'red', fontSize: '0.8rem'}}>{errors.password.message}</span>}
                        </div>

                        <div className="form-group">
                            <label><FaLock /> {t('register.confirm_password_label')}</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    {...registerField("confirmPassword")}
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
                                        padding: '0.25rem',
                                        zIndex: 2
                                    }}
                                >
                                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                            {errors.confirmPassword && <span style={{color: 'red', fontSize: '0.8rem'}}>{errors.confirmPassword.message}</span>}
                        </div>

                        <button type="submit" className="btn-submit" disabled={isSubmitting}>
                            <FaUserPlus /> {isSubmitting ? t('register.loading') : t('register.submit')}
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
                            disabled={isSubmitting}
                        >
                            <FaDiscord size={20} /> Discord
                        </button>
                        <button
                            type="button"
                            onClick={() => handleProviderLogin('twitch')}
                            className="btn-submit"
                            style={{ background: '#9146FF', marginTop: 0 }}
                            disabled={isSubmitting}
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
