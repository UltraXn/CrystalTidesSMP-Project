import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Check, AlertCircle, Loader2 } from 'lucide-react';
import '../styles/pages/account.css';

interface LinkedData {
  username: string;
  uuid: string;
  success: boolean;
}

export default function Verify() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [status, setStatus] = useState<string>(() => (token ? 'loading' : 'error')); // loading, processing, success, error
  const [message, setMessage] = useState<string>(() =>
    token ? 'Verificando...' : 'Enlace inválido. No se encontró ningún token.',
  );
  const [linkedData, setLinkedData] = useState<LinkedData | null>(null);

  useEffect(() => {
    // 1. Wait for Auth to load
    if (loading) return;

    // 2. Not logged in? Redirect to login
    if (!user) {
      // Store the current URL to redirect back after login?
      // For now just redirect to login
      navigate('/login?redirect=/verify?token=' + token);
      return;
    }

    // 3. No token? Stop here (state already handled in initial render)
    if (!token) return;

    let ignore = false;

    const verifyToken = async () => {
      setStatus('processing');
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/minecraft/link`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code: token,
            userId: user.id,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          if (!ignore) {
            setStatus('error');
            setMessage(errorData.error || 'Error al vincular la cuenta.');
          }
          return;
        }

        const data = await response.json();

        if (!ignore) {
          if (data.success) {
            setStatus('success');
            setLinkedData(data);
            setMessage('¡Cuenta vinculada exitosamente!');
          } else {
            setStatus('error');
            setMessage(data.error || 'Error al vincular la cuenta.');
          }
        }
      } catch (error) {
        console.error(error);
        if (!ignore) {
          setStatus('error');
          setMessage('Error de conexión con el servidor.');
        }
      }
    };

    // 4. Trigger Verification
    verifyToken();

    return () => {
      ignore = true;
    };
  }, [user, loading, token, navigate]);

  if (loading || status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] text-white">
        <Loader2 className="text-(--accent) size-10 animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0a0a0a] p-4 text-white">
      {/* Background Ambience */}
      <div className="bg-linear-to-br pointer-events-none absolute inset-0 from-[rgba(var(--accent-rgb),0.1)] to-transparent" />

      <div className="relative z-10 w-full max-w-md rounded-2xl border border-[#333] bg-[#151515] p-8 text-center shadow-2xl">
        {status === 'processing' && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="text-(--accent) size-16 animate-spin" />
            <h2 className="text-2xl font-bold">Verificando...</h2>
            <p className="text-gray-400">Por favor espera un momento.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center gap-4 transition-opacity duration-300">
            <div className="relative">
              <div className="mb-2 flex size-24 items-center justify-center overflow-hidden rounded-xl border-2 border-green-500/50 bg-green-500/20">
                <img
                  src={`https://mc-heads.net/avatar/${linkedData?.uuid}/100`}
                  alt={linkedData?.username}
                  className="size-full object-cover"
                />
              </div>
              <div className="absolute -bottom-2 -right-2 rounded-full border-4 border-[#151515] bg-green-500 p-1">
                <Check className="size-6 text-black" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-green-400">¡Vinculación Exitosa!</h2>
            <p className="text-gray-300">
              Tu cuenta de Minecraft <strong>{linkedData?.username}</strong> ha sido vinculada
              correctamente.
            </p>
            <button
              type="button"
              onClick={() => navigate('/account')}
              className="bg-(--accent) hover:bg-(--accent-hover) mt-6 w-full rounded-xl px-6 py-3 font-bold text-black transition-colors"
            >
              Ir a mi Cuenta
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center gap-4 transition-opacity duration-300">
            <div className="mb-2 flex size-20 items-center justify-center rounded-full bg-red-500/20">
              <AlertCircle className="size-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-red-500">Error</h2>
            <p className="text-gray-300">{message}</p>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="mt-6 w-full rounded-xl bg-[#333] px-6 py-3 font-bold text-white transition-[color,background-color,border-color,opacity] hover:bg-[#444]"
            >
              Volver al Inicio
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
