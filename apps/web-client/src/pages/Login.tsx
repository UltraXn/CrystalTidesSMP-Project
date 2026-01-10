import { useState } from 'react'
import { Mail, Lock, LogIn, Eye, EyeOff } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from 'react-i18next'
import { Provider } from '@supabase/supabase-js'
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { loginSchema, LoginFormValues } from '../schemas/user'

export default function Login() {
    const { t } = useTranslation()
    const [showPassword, setShowPassword] = useState(false)
    const [generalError, setGeneralError] = useState('')

    const { login, loginWithProvider } = useAuth()
    const navigate = useNavigate()

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema)
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

    const onSubmit = async (data: LoginFormValues) => {
        setGeneralError('')

        try {
            await login(data.email, data.password)
            // Navegar al dashboard o home tras login exitoso
            navigate('/')
        } catch (err) {
            console.error(err)
            const message = err instanceof Error ? err.message : String(err)
            if (message === 'Invalid login credentials') {
                setGeneralError(t('login.error_invalid_credentials', 'Credenciales inválidas. Verifica tu correo y contraseña.'))
            } else {
                setGeneralError(message || t('login.error_generic', 'Error al iniciar sesión'))
            }
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

                    {generalError && <div className="error-message" style={{ color: '#ff6b6b', background: 'rgba(255, 107, 107, 0.1)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.9rem', border: '1px solid rgba(255, 107, 107, 0.2)' }}>{generalError}</div>}

                    <form className="account-form" onSubmit={handleSubmit(onSubmit)}>
                        <div className="form-group">
                            <label><Mail size={16} /> {t('login.email_label')}</label>
                            <input
                                type="email"
                                placeholder={t('login.email_placeholder')}
                                {...register("email")}
                                disabled={isSubmitting}
                            />
                            {errors.email && <span style={{color: 'red', fontSize: '0.8rem'}}>{errors.email.message}</span>}
                        </div>

                        <div className="form-group">
                            <label><Lock size={16} /> {t('login.password_label')}</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder={t('login.password_placeholder')}
                                    {...register("password")}
                                    style={{ paddingRight: '2.5rem' }}
                                    disabled={isSubmitting}
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
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {errors.password && <span style={{color: 'red', fontSize: '0.8rem'}}>{errors.password.message}</span>}
                        </div>

                        <div style={{ textAlign: 'right', marginBottom: '1rem' }}>
                            <Link to="/forgot-password" style={{ color: 'var(--muted)', fontSize: '0.85rem', textDecoration: 'none' }}>
                                {t('login.forgot_password')}
                            </Link>
                        </div>

                        <button type="submit" className="btn-submit" disabled={isSubmitting}>
                            {isSubmitting ? t('login.loading') : <><LogIn size={18} /> {t('login.sign_in_verb')}</>}
                        </button>
                    </form>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.5rem 0' }}>
                        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                        <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>{t('login.or_sign_in_with')}</span>
                        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                    </div>

                    <div className="social-login-group" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                        <button
                            type="button"
                            onClick={() => handleProviderLogin('discord')}
                            className="btn-submit"
                            style={{ background: '#5865F2', marginTop: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                            disabled={isSubmitting}
                        >
                            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 640 512" height="20" width="20" xmlns="http://www.w3.org/2000/svg"><path d="M524.531,69.836a1.5,1.5,0,0,0-.764-.7A485.065,485.065,0,0,0,404.081,32.03a1.816,1.816,0,0,0-1.923.91,337.461,337.461,0,0,0-14.9,30.6,447.848,447.848,0,0,0-134.426,0,309.541,309.541,0,0,0-15.135-30.6,1.89,1.89,0,0,0-1.924-.91A483.689,483.689,0,0,0,116.085,69.137a1.712,1.712,0,0,0-.788.676C39.068,183.651,18.186,294.69,28.43,404.354a2.016,2.016,0,0,0,.765,1.375A487.666,487.666,0,0,0,176.02,479.918a1.9,1.9,0,0,0,2.063-.676A348.2,348.2,0,0,0,208.12,430.4a1.86,1.86,0,0,0-1.019-2.588,321.173,321.173,0,0,1-45.868-21.853,1.885,1.885,0,0,1-.185-3.126c3.082-2.309,6.166-4.711,9.109-7.137a1.819,1.819,0,0,1,1.9-.256c96.229,43.917,200.41,43.917,295.5,0a1.812,1.812,0,0,1,1.924.233c2.944,2.426,6.027,4.851,9.132,7.16a1.884,1.884,0,0,1-.162,3.126,301.407,301.407,0,0,1-45.89,21.83,1.875,1.875,0,0,0-1,2.611,391.055,391.055,0,0,0,30.014,48.815,1.864,1.864,0,0,0,2.063.7A486.048,486.048,0,0,0,610.7,405.729a1.882,1.882,0,0,0,.765-1.352C623.729,277.594,590.8,167.234,524.531,69.836ZM222.491,337.58c-28.972,0-52.844-26.587-52.844-59.239S193.056,219.1,222.491,219.1c29.665,0,53.306,26.82,52.843,59.239C275.334,310.993,251.924,337.58,222.491,337.58Zm195.38,0c-28.971,0-52.843-26.587-52.843-59.239S388.437,219.1,417.871,219.1c29.667,0,53.307,26.82,52.844,59.239C470.715,310.993,447.538,337.58,417.871,337.58Z"></path></svg> Discord
                        </button>
                        <button
                            type="button"
                            onClick={() => handleProviderLogin('twitch')}
                            className="btn-submit"
                            style={{ background: '#9146FF', marginTop: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                            disabled={isSubmitting}
                        >
                            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="20" width="20" xmlns="http://www.w3.org/2000/svg"><path d="M80 32l-32 32v304h96v96h96l64-64h64l112-112V32H80zm56 256V80h320v192l-56 56h-88l-48 48v-48h-72v-40h-56zM280 144h48v112h-48V144zm80 0h48v112h-48V144z"></path></svg> Twitch
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