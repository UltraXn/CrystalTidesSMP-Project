import { useState, useEffect } from 'react'
import { Lock, ArrowLeft, CheckCircle, Eye, EyeOff } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabaseClient'
import { useTranslation } from 'react-i18next'

export default function ResetPassword() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const [message, setMessage] = useState('')

    useEffect(() => {
        // Verify if session exists or if we arrived via recovery hash
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                // If no active session from recovery link, notify user
                setStatus('error')
                setMessage(t('reset_password.no_session', 'El enlace de recuperación es inválido o ha expirado. Por favor solicita uno nuevo.'))
            }
        })
    }, [t])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (password.length < 8) {
            setStatus('error')
            setMessage(t('reset_password.short_password', 'La contraseña debe tener al menos 8 caracteres.'))
            return
        }

        if (password !== confirmPassword) {
            setStatus('error')
            setMessage(t('reset_password.password_mismatch', 'Las contraseñas no coinciden.'))
            return
        }

        setStatus('loading')
        setMessage('')

        try {
            const { error } = await supabase.auth.updateUser({ password })
            if (error) throw error

            setStatus('success')
            setMessage(t('reset_password.success', '¡Contraseña restablecida exitosamente! Redirigiendo...'))
            setTimeout(() => {
                navigate('/login')
            }, 2500)
        } catch (err: unknown) {
            console.error(err)
            setStatus('error')
            const errObj = err as { message?: string }
            setMessage(errObj.message || t('reset_password.generic_error', 'Error al restablecer la contraseña.'))
        }
    }

    return (
        <div className="min-h-[85vh] w-full flex items-center justify-center px-4 pt-32 pb-20 relative z-10">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-(--accent)/10 blur-3xl rounded-full pointer-events-none" />

            <div className="w-full max-w-md bg-white/5 border border-white/10 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl relative overflow-hidden text-left">
                <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-(--accent) to-transparent opacity-50" />

                <div className="text-center mb-8">
                    <span className="text-[10px] font-black uppercase tracking-widest text-(--accent) block mb-1">
                        CrystalTides SMP
                    </span>
                    <h2 className="text-3xl font-black text-white uppercase tracking-tight">
                        {t('reset_password.title', 'Nueva Contraseña')}
                    </h2>
                    <p className="text-xs text-gray-400 mt-1 font-medium">
                        {t('reset_password.subtitle', 'Introduce tu nueva clave de acceso')}
                    </p>
                </div>

                {status === 'success' ? (
                    <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-bold text-center space-y-4">
                        <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
                        <p>{message}</p>
                        <Link
                            to="/login"
                            className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-(--accent) text-black font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-colors"
                        >
                            Ir al Login
                        </Link>
                    </div>
                ) : (
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        {status === 'error' && (
                            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-bold text-center">
                                {message}
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label htmlFor="reset-new-password" className="flex items-center gap-2 text-xs font-bold text-gray-300 uppercase tracking-wider">
                                <Lock className="w-4 h-4 text-(--accent)" /> Nueva Contraseña
                            </label>
                            <div className="relative">
                                <input
                                    id="reset-new-password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    required
                                    minLength={8}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={status === 'loading'}
                                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-2xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-(--accent) focus:ring-1 focus:ring-(--accent) transition-colors"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                    aria-label="Toggle password visibility"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="reset-confirm-password" className="flex items-center gap-2 text-xs font-bold text-gray-300 uppercase tracking-wider">
                                <Lock className="w-4 h-4 text-(--accent)" /> Confirmar Contraseña
                            </label>
                            <input
                                id="reset-confirm-password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                required
                                minLength={8}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                disabled={status === 'loading'}
                                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-2xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-(--accent) focus:ring-1 focus:ring-(--accent) transition-colors"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            className="w-full py-3.5 px-6 bg-(--accent) text-black font-black uppercase tracking-widest rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-4"
                        >
                            {status === 'loading' ? 'Guardando...' : 'Actualizar Contraseña'}
                        </button>
                    </form>
                )}

                <div className="pt-6 mt-6 border-t border-white/10 text-center">
                    <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-3.5 h-3.5" /> Volver al Iniciar Sesión
                    </Link>
                </div>
            </div>
        </div>
    )
}
