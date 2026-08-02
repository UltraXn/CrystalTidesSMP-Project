import { useState } from 'react'
import { User, Mail, Lock, UserPlus, Eye, EyeOff } from 'lucide-react'
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
                return setGeneralError(`${t('register.user_exists', 'El usuario ya existe')} (DB)`)
            }
            setGeneralError(t('register.error_generic', 'Error') + ': ' + message)
        }
    }

    return (
        <div className="min-h-[calc(100vh-80px)] w-full flex items-start md:items-center justify-center px-4 pt-32 pb-16 relative z-10">
            {/* Ambient Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-(--accent)/10 blur-3xl rounded-full pointer-events-none" />

            <div className="w-full max-w-md bg-white/5 border border-white/10 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl relative overflow-hidden text-left">
                {/* Top Accent Line */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-(--accent) to-transparent opacity-50" />

                <div className="text-center mb-8">
                    <span className="text-[10px] font-black uppercase tracking-widest text-(--accent) block mb-1">
                        CrystalTides SMP
                    </span>
                    <h2 className="text-3xl font-black text-white uppercase tracking-tight">
                        {t('register.title', 'Crear Cuenta')}
                    </h2>
                    <p className="text-xs text-gray-400 mt-1 font-medium">
                        {t('register.subtitle', 'Únete a la aventura hoy mismo')}
                    </p>
                </div>

                {generalError && (
                    <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-bold text-center mb-6">
                        {generalError}
                    </div>
                )}

                <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                    <div className="space-y-1.5">
                        <label htmlFor="register-username" className="flex items-center gap-2 text-xs font-bold text-gray-300 uppercase tracking-wider">
                            <User className="w-4 h-4 text-(--accent)" /> {t('register.username_label', 'Usuario')}
                        </label>
                        <input id="register-username"
                            type="text"
                            placeholder={t('register.username_placeholder', 'Tu usuario en la web')}
                            className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-2xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-(--accent) focus:ring-1 focus:ring-(--accent) transition-colors"
                            {...registerField("username")}
                            disabled={isSubmitting}
                        />
                        {errors.username && (
                            <span className="text-rose-400 text-xs font-bold block pt-1">{errors.username.message}</span>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="register-email" className="flex items-center gap-2 text-xs font-bold text-gray-300 uppercase tracking-wider">
                            <Mail className="w-4 h-4 text-(--accent)" /> {t('register.email_label', 'Correo Electrónico')}
                        </label>
                        <input id="register-email"
                            type="email"
                            placeholder={t('register.email_placeholder', 'correo@ejemplo.com')}
                            className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-2xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-(--accent) focus:ring-1 focus:ring-(--accent) transition-colors"
                            {...registerField("email")}
                            disabled={isSubmitting}
                        />
                        {errors.email && (
                            <span className="text-rose-400 text-xs font-bold block pt-1">{errors.email.message}</span>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="register-password" className="flex items-center gap-2 text-xs font-bold text-gray-300 uppercase tracking-wider">
                            <Lock className="w-4 h-4 text-(--accent)" /> {t('register.password_label', 'Contraseña')}
                        </label>
                        <div className="relative">
                            <input
                                id="register-password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-2xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-(--accent) focus:ring-1 focus:ring-(--accent) transition-colors pr-12"
                                {...registerField("password")}
                                disabled={isSubmitting}
                            />
                            <button aria-label="Action"
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1 transition-colors cursor-pointer"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        {errors.password && (
                            <span className="text-rose-400 text-xs font-bold block pt-1">{errors.password.message}</span>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="register-confirm-password" className="flex items-center gap-2 text-xs font-bold text-gray-300 uppercase tracking-wider">
                            <Lock className="w-4 h-4 text-(--accent)" /> {t('register.confirm_password_label', 'Confirmar Contraseña')}
                        </label>
                        <div className="relative">
                            <input
                                id="register-confirm-password"
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="••••••••"
                                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-2xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-(--accent) focus:ring-1 focus:ring-(--accent) transition-colors pr-12"
                                {...registerField("confirmPassword")}
                                disabled={isSubmitting}
                            />
                            <button aria-label="Action"
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1 transition-colors cursor-pointer"
                            >
                                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        {errors.confirmPassword && (
                            <span className="text-rose-400 text-xs font-bold block pt-1">{errors.confirmPassword.message}</span>
                        )}
                    </div>

                    <button 
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3.5 px-6 bg-(--accent) text-black font-black uppercase tracking-widest rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
                    >
                        {isSubmitting ? (
                            <span>{t('register.loading', 'Creando cuenta...')}</span>
                        ) : (
                            <>
                                <UserPlus className="w-4 h-4" />
                                <span>{t('register.submit', 'Registrarse')}</span>
                            </>
                        )}
                    </button>
                </form>

                <div className="flex items-center gap-3 my-6">
                    <div className="flex-1 h-px bg-white/10" />
                    <span className="text-xs font-bold uppercase text-gray-500 tracking-wider">
                        {t('register.or_register_with', 'O regístrate con')}
                    </span>
                    <div className="flex-1 h-px bg-white/10" />
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                    <button 
                        type="button"
                        onClick={() => handleProviderLogin('discord')}
                        disabled={isSubmitting}
                        className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#5865F2]/20 border border-[#5865F2]/40 text-white font-bold text-xs hover:bg-[#5865F2]/40 hover:scale-105 active:scale-95 transition-colors cursor-pointer disabled:opacity-50"
                    >
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 640 512">
                            <path d="M524.531,69.836a1.5,1.5,0,0,0-.764-.7A485.065,485.065,0,0,0,404.081,32.03a1.816,1.816,0,0,0-1.923.91,337.461,337.461,0,0,0-14.9,30.6,447.848,447.848,0,0,0-134.426,0,309.541,309.541,0,0,0-15.135-30.6,1.89,1.89,0,0,0-1.924-.91A483.689,483.689,0,0,0,116.085,69.137a1.712,1.712,0,0,0-.788.676C39.068,183.651,18.186,294.69,28.43,404.354a2.016,2.016,0,0,0,.765,1.375A487.666,487.666,0,0,0,176.02,479.918a1.9,1.9,0,0,0,2.063-.676A348.2,348.2,0,0,0,208.12,430.4a1.86,1.86,0,0,0-1.019-2.588,321.173,321.173,0,0,1-45.868-21.853,1.885,1.885,0,0,1-.185-3.126c3.082-2.309,6.166-4.711,9.109-7.137a1.819,1.819,0,0,1,1.9-.256c96.229,43.917,200.41,43.917,295.5,0a1.812,1.812,0,0,1,1.924.233c2.944,2.426,6.027,4.851,9.132,7.16a1.884,1.884,0,0,1-.162,3.126,301.407,301.407,0,0,1-45.89,21.83,1.875,1.875,0,0,0-1,2.611,391.055,391.055,0,0,0,30.014,48.815,1.864,1.864,0,0,0,2.063.7A486.048,486.048,0,0,0,610.7,405.729a1.882,1.882,0,0,0,.765-1.352C623.729,277.594,590.8,167.234,524.531,69.836ZM222.491,337.58c-28.972,0-52.844-26.587-52.844-59.239S193.056,219.1,222.491,219.1c29.665,0,53.306,26.82,52.843,59.239C275.334,310.993,251.924,337.58,222.491,337.58Zm195.38,0c-28.971,0-52.843-26.587-52.843-59.239S388.437,219.1,417.871,219.1c29.667,0,53.307,26.82,52.844,59.239C470.715,310.993,447.538,337.58,417.871,337.58Z" />
                        </svg>
                        <span>Discord</span>
                    </button>

                    <button 
                        type="button"
                        onClick={() => handleProviderLogin('twitch')}
                        disabled={isSubmitting}
                        className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#9146FF]/20 border border-[#9146FF]/40 text-white font-bold text-xs hover:bg-[#9146FF]/40 hover:scale-105 active:scale-95 transition-colors cursor-pointer disabled:opacity-50"
                    >
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 512 512">
                            <path d="M80 32l-32 32v304h96v96h96l64-64h64l112-112V32H80zm56 256V80h320v192l-56 56h-88l-48 48v-48h-72v-40h-56zM280 144h48v112h-48V144zm80 0h48v112h-48V144z" />
                        </svg>
                        <span>Twitch</span>
                    </button>
                </div>

                <div className="pt-4 border-t border-white/10 text-center space-y-2">
                    <p className="text-xs text-gray-400">
                        {t('register.already_have_account', '¿Ya tienes una cuenta?')} {' '}
                        <Link to="/login" className="text-(--accent) hover:underline font-bold">
                            {t('register.sign_in', 'Inicia Sesión')}
                        </Link>
                    </p>
                    <Link to="/" className="inline-block text-xs text-gray-500 hover:text-white transition-colors pt-2">
                        ← {t('register.back_home', 'Volver al inicio')}
                    </Link>
                </div>
            </div>
        </div>
    )
}
