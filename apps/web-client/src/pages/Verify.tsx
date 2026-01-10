
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Check, AlertCircle, Loader2 } from "lucide-react";

interface LinkedData {
  username: string;
  uuid: string;
  success: boolean;
}

export default function Verify() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [status, setStatus] = useState<string>(() => token ? "loading" : "error"); // loading, processing, success, error
  const [message, setMessage] = useState<string>(() => token ? "Verificando..." : "Enlace inválido. No se encontró ningún token.");
  const [linkedData, setLinkedData] = useState<LinkedData | null>(null);

  useEffect(() => {
    // 1. Wait for Auth to load
    if (loading) return;

    // 2. Not logged in? Redirect to login
    if (!user) {
      // Store the current URL to redirect back after login? 
      // For now just redirect to login
      navigate("/login?redirect=/verify?token=" + token);
      return;
    }

    // 3. No token? Stop here (state already handled in initial render)
    if (!token) return;

    const verifyToken = async () => {
      setStatus("processing");
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/minecraft/link`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code: token,
            userId: user.id,
          }),
        });
  
        const data = await response.json();
  
        if (response.ok && data.success) {
          setStatus("success");
          setLinkedData(data);
          setMessage("¡Cuenta vinculada exitosamente!");
        } else {
          setStatus("error");
          setMessage(data.error || "Error al vincular la cuenta.");
        }
      } catch (error) {
        console.error(error);
        setStatus("error");
        setMessage("Error de conexión con el servidor.");
      }
    };

    // 4. Trigger Verification
    verifyToken();
  }, [user, loading, token, navigate]);

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white">
        <Loader2 className="w-10 h-10 animate-spin text-(--accent)" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] p-4 text-white relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-linear-to-br from-[rgba(var(--accent-rgb),0.1)] to-transparent pointer-events-none" />

      <div className="max-w-md w-full bg-[#151515] border border-[#333] rounded-2xl p-8 shadow-2xl relative z-10 text-center">
        
        {status === "processing" && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-16 h-16 animate-spin text-(--accent)" />
            <h2 className="text-2xl font-bold">Verificando...</h2>
            <p className="text-gray-400">Por favor espera un momento.</p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
            <div className="relative">
                <div className="w-24 h-24 bg-green-500/20 rounded-xl flex items-center justify-center mb-2 overflow-hidden border-2 border-green-500/50">
                    <img 
                        src={`https://mc-heads.net/avatar/${linkedData?.uuid}/100`} 
                        alt={linkedData?.username}
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-1 border-4 border-[#151515]">
                    <Check className="w-6 h-6 text-black" />
                </div>
            </div>
            
            <h2 className="text-2xl font-bold text-green-400">¡Vinculación Exitosa!</h2>
            <p className="text-gray-300">
              Tu cuenta de Minecraft <strong>{linkedData?.username}</strong> ha sido vinculada correctamente.
            </p>
            <button 
              onClick={() => navigate('/account')}
              className="mt-6 px-6 py-3 bg-(--accent) hover:bg-(--accent-hover) text-black font-bold rounded-xl transition-all w-full"
            >
              Ir a mi Cuenta
            </button>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
             <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-2">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-red-500">Error</h2>
            <p className="text-gray-300">{message}</p>
            <button 
              onClick={() => navigate('/')}
              className="mt-6 px-6 py-3 bg-[#333] hover:bg-[#444] text-white font-bold rounded-xl transition-all w-full"
            >
              Volver al Inicio
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
