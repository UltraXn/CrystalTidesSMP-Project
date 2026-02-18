import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Check, AlertCircle, Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { verifyMinecraftLink } from "../services/userService";

export default function Verify() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Mutation: Verify Token
  const verifyMutation = useMutation({
    mutationFn: ({ code, userId }: { code: string; userId: string }) => verifyMinecraftLink(code, userId),
  });

  useEffect(() => {
    // 1. Wait for Auth to load
    if (authLoading) return;

    // 2. Not logged in? Redirect to login
    if (!user) {
      if (token) {
        navigate(`/login?redirect=/verify?token=${token}`);
      } else {
        navigate('/login');
      }
      return;
    }

    // 3. Trigger Verification if token exists and not already processing/done
    if (token && verifyMutation.isIdle) {
      verifyMutation.mutate({ code: token, userId: user.id });
    }
  }, [user, authLoading, token, navigate, verifyMutation]);

  const isLoading = authLoading || verifyMutation.isPending || verifyMutation.isIdle && !!token;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white">
        <Loader2 className="w-10 h-10 animate-spin text-(--accent)" />
      </div>
    );
  }

  const isError = verifyMutation.isError || !token;
  const isSuccess = verifyMutation.isSuccess;
  const linkedData = verifyMutation.data;
  const errorMessage = !token ? "Enlace inválido. No se encontró ningún token." : verifyMutation.error?.message;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] p-4 text-white relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-radial from-(--accent)/5 to-transparent pointer-events-none" />

      <div className="max-w-md w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative z-10 text-center">
        
        {isSuccess && (
          <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-500">
            <div className="relative">
                <div className="w-24 h-24 bg-green-500/10 rounded-2xl flex items-center justify-center mb-2 overflow-hidden border border-green-500/30">
                    <img 
                        src={`https://mc-heads.net/avatar/${linkedData?.uuid}/100`} 
                        alt={linkedData?.username}
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-1.5 border-4 border-[#151515] shadow-lg">
                    <Check className="w-4 h-4 text-black font-bold" />
                </div>
            </div>
            
            <div className="space-y-2">
                <h2 className="text-2xl font-bold text-green-400">¡Vinculación Exitosa!</h2>
                <p className="text-white/60 text-sm">
                  Tu cuenta de Minecraft <strong className="text-white">{linkedData?.username}</strong> ha sido vinculada correctamente.
                </p>
            </div>

            <button 
              onClick={() => navigate('/account')}
              className="mt-4 px-8 py-3 bg-(--accent) hover:bg-(--accent)/90 text-black font-bold rounded-xl transition-all w-full shadow-[0_0_20px_rgba(var(--accent-rgb),0.2)]"
            >
              Ir a mi Cuenta
            </button>
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-500">
             <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-2 border border-red-500/20">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            
            <div className="space-y-2">
                <h2 className="text-2xl font-bold text-red-500">Error en la verificación</h2>
                <p className="text-white/60 text-sm">{errorMessage}</p>
            </div>

            <button 
              onClick={() => navigate('/')}
              className="mt-4 px-8 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl border border-white/10 transition-all w-full"
            >
              Volver al Inicio
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
