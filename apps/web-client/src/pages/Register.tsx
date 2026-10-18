import { useState } from 'react';
import { User, Mail, Lock, UserPlus, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Provider } from '@supabase/supabase-js';
import { useForm, UseFormRegisterReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerFormSchema, type RegisterFormValues } from '@crystaltides/shared';

const STYLES = {
  input:
    'w-full px-4 py-3 bg-black/40 border border-white/10 rounded-2xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-(--accent) focus:ring-1 focus:ring-(--accent) transition-colors',
  inputPassword:
    'w-full px-4 py-3 bg-black/40 border border-white/10 rounded-2xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-(--accent) focus:ring-1 focus:ring-(--accent) transition-colors pr-12',
  label: 'flex items-center gap-2 text-xs font-bold text-gray-300 uppercase tracking-wider',
  errorText: 'text-rose-400 text-xs font-bold block pt-1',
  toggleVisibilityBtn:
    'absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1 transition-colors cursor-pointer',
  socialBtn:
    'flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-white font-bold text-xs hover:scale-105 active:scale-95 transition-colors cursor-pointer disabled:opacity-50',
} as const;

const PASSWORD_MASK = '••••••••';

function DiscordIcon() {
  return (
    <svg className="size-4 fill-current" viewBox="0 0 640 512" aria-hidden="true">
      <path d="M524.531,69.836a1.5,1.5,0,0,0-.764-.7A485.065,485.065,0,0,0,404.081,32.03a1.816,1.816,0,0,0-1.923.91,337.461,337.461,0,0,0-14.9,30.6,447.848,447.848,0,0,0-134.426,0,309.541,309.541,0,0,0-15.135-30.6,1.89,1.89,0,0,0-1.924-.91A483.689,483.689,0,0,0,116.085,69.137a1.712,1.712,0,0,0-.788.676C39.068,183.651,18.186,294.69,28.43,404.354a2.016,2.016,0,0,0,.765,1.375A487.666,487.666,0,0,0,176.02,479.918a1.9,1.9,0,0,0,2.063-.676A348.2,348.2,0,0,0,208.12,430.4a1.86,1.86,0,0,0-1.019-2.588,321.173,321.173,0,0,1-45.868-21.853,1.885,1.885,0,0,1-.185-3.126c3.082-2.309,6.166-4.711,9.109-7.137a1.819,1.819,0,0,1,1.9-.256c96.229,43.917,200.41,43.917,295.5,0a1.812,1.812,0,0,1,1.924.233c2.944,2.426,6.027,4.851,9.132,7.16a1.884,1.884,0,0,1-.162,3.126,301.407,301.407,0,0,1-45.89,21.83,1.875,1.875,0,0,0-1,2.611,391.055,391.055,0,0,0,30.014,48.815,1.864,1.864,0,0,0,2.063.7A486.048,486.048,0,0,0,610.7,405.729a1.882,1.882,0,0,0,.765-1.352C623.729,277.594,590.8,167.234,524.531,69.836ZM222.491,337.58c-28.972,0-52.844-26.587-52.844-59.239S193.056,219.1,222.491,219.1c29.665,0,53.306,26.82,52.843,59.239C275.334,310.993,251.924,337.58,222.491,337.58Zm195.38,0c-28.971,0-52.843-26.587-52.843-59.239S388.437,219.1,417.871,219.1c29.667,0,53.307,26.82,52.844,59.239C470.715,310.993,447.538,337.58,417.871,337.58Z" />
    </svg>
  );
}

function TwitchIcon() {
  return (
    <svg className="size-4 fill-current" viewBox="0 0 512 512" aria-hidden="true">
      <path d="M80 32l-32 32v304h96v96h96l64-64h64l112-112V32H80zm56 256V80h320v192l-56 56h-88l-48 48v-48h-72v-40h-56zM280 144h48v112h-48V144zm80 0h48v112h-48V144z" />
    </svg>
  );
}

function formatRegistrationError(
  err: unknown,
  translate: ReturnType<typeof useTranslation>['t'],
): string {
  const message = err instanceof Error ? err.message : String(err);
  if (message.includes('unique constraint') || message.includes('409')) {
    return `${translate('register.user_exists', 'El usuario ya existe')} (DB)`;
  }
  return `${translate('register.error_generic', 'Error')}: ${message}`;
}

interface PasswordFieldProps {
  id: string;
  label: string;
  registration: UseFormRegisterReturn;
  error?: string;
  disabled?: boolean;
}

function PasswordField({ id, label, registration, error, disabled }: Readonly<PasswordFieldProps>) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className={STYLES.label}>
        <Lock className="text-(--accent) size-4" /> {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={showPassword ? 'text' : 'password'}
          placeholder={PASSWORD_MASK}
          className={STYLES.inputPassword}
          {...registration}
          disabled={disabled}
        />
        <button
          aria-label="Action"
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className={STYLES.toggleVisibilityBtn}
        >
          {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
      {error && <span className={STYLES.errorText}>{error}</span>}
    </div>
  );
}

export default function Register() {
  const { t } = useTranslation();
  const [generalError, setGeneralError] = useState('');
  const { register, loginWithProvider } = useAuth();
  const navigate = useNavigate();

  const {
    register: registerField,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
  });

  const handleProviderLogin = async (provider: Provider) => {
    try {
      await loginWithProvider(provider);
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : String(err);
      setGeneralError(`Error al iniciar con ${provider}: ${message}`);
    }
  };

  const onSubmit = async (data: RegisterFormValues) => {
    setGeneralError('');

    try {
      const { user } = await register(data.email, data.password, {
        username: data.username,
        full_name: data.username,
        avatar_url: `https://ui-avatars.com/api/?name=${data.username}`,
      });

      if (user) {
        navigate('/register/success');
      }
    } catch (err) {
      console.error(err);
      setGeneralError(formatRegistrationError(err, t));
    }
  };

  return (
    <div className="relative z-10 flex min-h-[calc(100vh-80px)] w-full items-start justify-center px-4 pb-16 pt-32 md:items-center">
      {/* Ambient Background Glow */}
      <div className="bg-(--accent)/10 -translate-1/2 pointer-events-none absolute left-1/2 top-1/2 size-96 rounded-full blur-3xl" />

      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 text-left shadow-2xl backdrop-blur-2xl">
        {/* Top Accent Line */}
        <div className="bg-linear-to-r via-(--accent) absolute inset-x-0 top-0 h-1 from-transparent to-transparent opacity-50" />

        <div className="mb-8 text-center">
          <span className="text-(--accent) mb-1 block text-[10px] font-black uppercase tracking-widest">
            CrystalTides SMP
          </span>
          <h2 className="text-3xl font-black uppercase tracking-tight text-white">
            {t('register.title', 'Crear Cuenta')}
          </h2>
          <p className="mt-1 text-xs font-medium text-gray-400">
            {t('register.subtitle', 'Únete a la aventura hoy mismo')}
          </p>
        </div>

        {generalError && (
          <div className="mb-6 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-3.5 text-center text-xs font-bold text-rose-300">
            {generalError}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-1.5">
            <label htmlFor="register-username" className={STYLES.label}>
              <User className="text-(--accent) size-4" /> {t('register.username_label', 'Usuario')}
            </label>
            <input
              id="register-username"
              type="text"
              placeholder={t('register.username_placeholder', 'Tu usuario en la web')}
              className={STYLES.input}
              {...registerField('username')}
              disabled={isSubmitting}
            />
            {errors.username?.message && (
              <span className={STYLES.errorText}>{errors.username.message}</span>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="register-email" className={STYLES.label}>
              <Mail className="text-(--accent) size-4" />{' '}
              {t('register.email_label', 'Correo Electrónico')}
            </label>
            <input
              id="register-email"
              type="email"
              placeholder={t('register.email_placeholder', 'correo@ejemplo.com')}
              className={STYLES.input}
              {...registerField('email')}
              disabled={isSubmitting}
            />
            {errors.email?.message && (
              <span className={STYLES.errorText}>{errors.email.message}</span>
            )}
          </div>

          <PasswordField
            id="register-password"
            label={t('register.password_label', 'Contraseña')}
            registration={registerField('password')}
            error={errors.password?.message}
            disabled={isSubmitting}
          />

          <PasswordField
            id="register-confirm-password"
            label={t('register.confirm_password_label', 'Confirmar Contraseña')}
            registration={registerField('confirmPassword')}
            error={errors.confirmPassword?.message}
            disabled={isSubmitting}
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-(--accent) mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl px-6 py-3.5 font-black uppercase tracking-widest text-black shadow-xl transition-colors hover:scale-[1.02] active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>{t('register.loading', 'Creando cuenta...')}</span>
            ) : (
              <>
                <UserPlus className="size-4" />
                <span>{t('register.submit', 'Registrarse')}</span>
              </>
            )}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
            {t('register.or_register_with', 'O regístrate con')}
          </span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleProviderLogin('discord')}
            disabled={isSubmitting}
            className={`${STYLES.socialBtn} border border-[#5865F2]/40 bg-[#5865F2]/20 hover:bg-[#5865F2]/40`}
          >
            <DiscordIcon />
            <span>Discord</span>
          </button>

          <button
            type="button"
            onClick={() => handleProviderLogin('twitch')}
            disabled={isSubmitting}
            className={`${STYLES.socialBtn} border border-[#9146FF]/40 bg-[#9146FF]/20 hover:bg-[#9146FF]/40`}
          >
            <TwitchIcon />
            <span>Twitch</span>
          </button>
        </div>

        <div className="space-y-2 border-t border-white/10 pt-4 text-center">
          <p className="text-xs text-gray-400">
            {t('register.already_have_account', '¿Ya tienes una cuenta?')}{' '}
            <Link to="/login" className="text-(--accent) font-bold hover:underline">
              {t('register.sign_in', 'Inicia Sesión')}
            </Link>
          </p>
          <Link
            to="/"
            className="inline-block pt-2 text-xs text-gray-500 transition-colors hover:text-white"
          >
            ← {t('register.back_home', 'Volver al inicio')}
          </Link>
        </div>
      </div>
    </div>
  );
}
