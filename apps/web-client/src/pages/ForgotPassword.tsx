import { useState } from 'react';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import { Link } from 'react-router';
import { supabase } from '../services/supabaseClient';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setStatus('success');
      setMessage('Te hemos enviado un correo con instrucciones para restablecer tu contraseña.');
    } catch (err: unknown) {
      console.error(err);
      setStatus('error');
      const errObj = err as { message?: string };
      setMessage(errObj.message || 'Ocurrió un error al intentar enviar el correo.');
    }
  };

  return (
    <div className="relative z-10 flex min-h-[85vh] w-full items-center justify-center px-4 pb-20 pt-32">
      {/* Ambient Background Glow */}
      <div className="-translate-1/2 bg-(--accent)/10 pointer-events-none absolute left-1/2 top-1/2 size-96 rounded-full blur-3xl" />

      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 text-left shadow-2xl backdrop-blur-2xl">
        {/* Top Accent Line */}
        <div className="bg-linear-to-r via-(--accent) absolute inset-x-0 top-0 h-1 from-transparent to-transparent opacity-50" />

        <div className="mb-8 text-center">
          <span className="text-(--accent) mb-1 block text-[10px] font-black uppercase tracking-widest">
            CrystalTides SMP
          </span>
          <h2 className="text-3xl font-black uppercase tracking-tight text-white">
            Recuperar Contraseña
          </h2>
          <p className="mt-1 text-xs font-medium text-gray-400">
            Introduce tu correo para recibir un enlace de recuperación.
          </p>
        </div>

        {status === 'success' ? (
          <div className="space-y-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-center text-xs font-bold text-emerald-300">
            <p>{message}</p>
            <Link
              to="/login"
              className="bg-(--accent) inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 font-black uppercase tracking-widest text-black transition-colors hover:scale-105"
            >
              Volver al Login
            </Link>
          </div>
        ) : (
          <form className="space-y-5" onSubmit={handleSubmit}>
            {status === 'error' && (
              <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-3.5 text-center text-xs font-bold text-rose-300">
                {message}
              </div>
            )}

            <div className="space-y-1.5">
              <label
                htmlFor="forgot-password-email"
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-300"
              >
                <Mail className="text-(--accent) size-4" /> Correo Electrónico
              </label>
              <input
                id="forgot-password-email"
                type="email"
                placeholder="correo@ejemplo.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === 'loading'}
                className="focus:border-(--accent) focus:ring-(--accent) w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder-gray-500 transition-colors focus:outline-none focus:ring-1"
              />
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="bg-(--accent) flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl px-6 py-3.5 font-black uppercase tracking-widest text-black shadow-xl transition-colors hover:scale-[1.02] active:scale-95 disabled:opacity-50"
            >
              {status === 'loading' ? (
                <span>Enviando...</span>
              ) : (
                <>
                  <Send className="size-4" />
                  <span>Enviar Enlace</span>
                </>
              )}
            </button>
          </form>
        )}

        <div className="mt-6 border-t border-white/10 pt-6 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs text-gray-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="size-3.5" /> Volver al Iniciar Sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
