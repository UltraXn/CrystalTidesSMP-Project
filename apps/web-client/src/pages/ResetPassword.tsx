import { useState, useEffect } from 'react';
import { Lock, ArrowLeft, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { supabase } from '../services/supabaseClient';
import { useTranslation } from 'react-i18next';

export default function ResetPassword() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Verify if session exists or if we arrived via recovery hash
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        // If no active session from recovery link, notify user
        setStatus('error');
        setMessage(
          t(
            'reset_password.no_session',
            'El enlace de recuperación es inválido o ha expirado. Por favor solicita uno nuevo.',
          ),
        );
      }
    });
  }, [t]);

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setStatus('error');
      setMessage(
        t('reset_password.short_password', 'La contraseña debe tener al menos 8 caracteres.'),
      );
      return;
    }

    // eslint-disable-next-line security/detect-possible-timing-attacks -- Client-side password confirmation equality check
    if (password !== confirmPassword) {
      setStatus('error');
      setMessage(t('reset_password.password_mismatch', 'Las contraseñas no coinciden.'));
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      setStatus('success');
      setMessage(
        t('reset_password.success', '¡Contraseña restablecida exitosamente! Redirigiendo...'),
      );
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err: unknown) {
      console.error(err);
      setStatus('error');
      const errObj = err as { message?: string };
      setMessage(
        errObj.message ?? t('reset_password.generic_error', 'Error al restablecer la contraseña.'),
      );
    }
  };

  return (
    <div className="relative z-10 flex min-h-[85vh] w-full items-center justify-center px-4 pb-20 pt-32">
      <div className="-translate-1/2 bg-(--accent)/10 pointer-events-none absolute left-1/2 top-1/2 size-96 rounded-full blur-3xl" />

      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 text-left shadow-2xl backdrop-blur-2xl">
        <div className="bg-linear-to-r via-(--accent) absolute inset-x-0 top-0 h-1 from-transparent to-transparent opacity-50" />

        <div className="mb-8 text-center">
          <span className="text-(--accent) mb-1 block text-[10px] font-black uppercase tracking-widest">
            CrystalTides SMP
          </span>
          <h2 className="text-3xl font-black uppercase tracking-tight text-white">
            {t('reset_password.title', 'Nueva Contraseña')}
          </h2>
          <p className="mt-1 text-xs font-medium text-gray-400">
            {t('reset_password.subtitle', 'Introduce tu nueva clave de acceso')}
          </p>
        </div>

        {status === 'success' ? (
          <div className="space-y-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5 text-center text-xs font-bold text-emerald-300">
            <CheckCircle className="mx-auto size-8 text-emerald-400" />
            <p>{message}</p>
            <Link
              to="/login"
              className="bg-(--accent) inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 font-black uppercase tracking-widest text-black transition-colors hover:scale-105"
            >
              Ir al Login
            </Link>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            {status === 'error' && (
              <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-3.5 text-center text-xs font-bold text-rose-300">
                {message}
              </div>
            )}

            <div className="space-y-1.5">
              <label
                htmlFor="reset-new-password"
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-300"
              >
                <Lock className="text-(--accent) size-4" /> Nueva Contraseña
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
                  className="focus:border-(--accent) focus:ring-(--accent) w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder-gray-500 transition-colors focus:outline-none focus:ring-1"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-white"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="reset-confirm-password"
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-300"
              >
                <Lock className="text-(--accent) size-4" /> Confirmar Contraseña
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
                className="focus:border-(--accent) focus:ring-(--accent) w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder-gray-500 transition-colors focus:outline-none focus:ring-1"
              />
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="bg-(--accent) mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl px-6 py-3.5 font-black uppercase tracking-widest text-black shadow-xl transition-colors hover:scale-[1.02] active:scale-95 disabled:opacity-50"
            >
              {status === 'loading' ? 'Guardando...' : 'Actualizar Contraseña'}
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
