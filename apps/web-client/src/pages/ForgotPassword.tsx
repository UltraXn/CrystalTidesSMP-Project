import { useState } from 'react'
import { Mail, ArrowLeft, Send } from 'lucide-react'
import { Link } from 'react-router-dom'
import { supabase } from '../services/supabaseClient'

export default function ForgotPassword() {
    const [email, setEmail] = useState('')
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const [message, setMessage] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setStatus('loading')
        setMessage('')

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            })

            if (error) throw error

            setStatus('success')
            setMessage('Te hemos enviado un correo con instrucciones para restablecer tu contraseña.')
        } catch (err: unknown) {
            console.error(err)
            setStatus('error')
            const errObj = err as { message?: string }
            setMessage(errObj.message || 'Ocurrió un error al intentar enviar el correo.')
        }
    }

    return (
        <div className="min-h-[85vh] w-full flex items-center justify-center px-4 pt-32 pb-20 relative z-10">
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
                        Recuperar Contraseña
                    </h2>
                    <p className="text-xs text-gray-400 mt-1 font-medium">
                        Introduce tu correo para recibir un enlace de recuperación.
                    </p>
                </div>

                {status === 'success' ? (
                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-bold text-center space-y-4">
                        <p>{message}</p>
                        <Link
                            to="/login"
                            className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-(--accent) text-black font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-colors"
                        >
                            Volver al Login
                        </Link>
                    </div>
                ) : (
                    <form className="space-y-5" onSubmit={handleSubmit}>
                        {status === 'error' && (
                            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-bold text-center">
                                {message}
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label htmlFor="forgot-password-email" className="flex items-center gap-2 text-xs font-bold text-gray-300 uppercase tracking-wider">
                                <Mail className="w-4 h-4 text-(--accent)" /> Correo Electrónico
                            </label>
                            <input id="forgot-password-email"
                                type="email"
                                placeholder="correo@ejemplo.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={status === 'loading'}
                                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-2xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-(--accent) focus:ring-1 focus:ring-(--accent) transition-colors"
                            />
                        </div>

                        <button 
                            type="submit"
                            disabled={status === 'loading'}
                            className="w-full py-3.5 px-6 bg-(--accent) text-black font-black uppercase tracking-widest rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                            {status === 'loading' ? (
                                <span>Enviando...</span>
                            ) : (
                                <>
                                    <Send className="w-4 h-4" />
                                    <span>Enviar Enlace</span>
                                </>
                            )}
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
