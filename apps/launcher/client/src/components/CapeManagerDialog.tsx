import React, { useState, useEffect, useRef } from "react";
import { fetchMinecraftProfile, setActiveCape, hideCape, type MinecraftCape } from "../services/microsoftAuthService";
import { CrystalCard } from "./CrystalCard";
import { CrystalButton } from "./CrystalButton";
import { invoke } from "@tauri-apps/api/core";

interface CapeCanvasProps {
  url: string;
  style?: React.CSSProperties;
}

const CapeCanvas: React.FC<CapeCanvasProps> = ({ url, style }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const img = new Image();
    img.src = url;
    img.onload = () => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.imageSmoothingEnabled = false;

      const w = img.naturalWidth;
      const h = img.naturalHeight;

      // Mathematical ratio coordinates for the back face of the cape (x=12, y=1 in 64x32 grid)
      const sx = (12 / 64) * w;
      const sy = (1 / 32) * h;
      const sw = (10 / 64) * w;
      const sh = (16 / 32) * h;

      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
    };
  }, [url]);

  return (
    <canvas
      ref={canvasRef}
      width={100}
      height={160}
      style={{
        width: "100%",
        height: "100%",
        display: "block",
        imageRendering: "pixelated",
        ...style,
      }}
    />
  );
};


interface CapeManagerDialogProps {
  accessToken: string;
  isOpen: boolean;
  onClose: () => void;
  onCapeChanged: (newActiveCapeUrl?: string) => void;
}

export const CapeManagerDialog: React.FC<CapeManagerDialogProps> = ({
  accessToken,
  isOpen,
  onClose,
  onCapeChanged,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [capes, setCapes] = useState<MinecraftCape[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const proxyCapesList = async (capesList: MinecraftCape[]) => {
    return Promise.all(
      capesList.map(async (cape) => {
        if (cape.url?.startsWith("http")) {
          try {
            const b64 = await invoke<string>("fetch_image_base64", { url: cape.url });
            return { ...cape, url: b64 };
          } catch (err) {
            console.error(`Failed to proxy cape thumbnail for ${cape.alias}:`, err);
          }
        }
        return cape;
      })
    );
  };

  const loadCapes = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const profile = await fetchMinecraftProfile(accessToken);
      const proxied = await proxyCapesList(profile.capes || []);
      setCapes(proxied);
    } catch (err: unknown) {
      console.error("Error fetching capes:", err);
      setError("No se pudieron cargar tus capas oficiales. Por favor, reintenta.");
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (isOpen && accessToken) {
      loadCapes();
    }
  }, [isOpen, accessToken, loadCapes]);

  if (!isOpen) return null;

  const handleEquip = async (capeId: string) => {
    setActionLoadingId(capeId);
    setError(null);
    try {
      await setActiveCape(accessToken, capeId);
      // Reload profile to get updated states and URLs
      const updatedProfile = await fetchMinecraftProfile(accessToken);
      const proxied = await proxyCapesList(updatedProfile.capes || []);
      setCapes(proxied);
      
      const activeCape = updatedProfile.capes?.find((c) => c.state === "ACTIVE");
      onCapeChanged(activeCape?.url);
    } catch (err: unknown) {
      console.error("Error equipping cape:", err);
      setError("No se pudo equipar la capa. Inténtalo de nuevo.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleUnequip = async (capeId: string) => {
    setActionLoadingId(capeId);
    setError(null);
    try {
      await hideCape(accessToken);
      // Reload profile
      const updatedProfile = await fetchMinecraftProfile(accessToken);
      const proxied = await proxyCapesList(updatedProfile.capes || []);
      setCapes(proxied);
      onCapeChanged(undefined);
    } catch (err: unknown) {
      console.error("Error unequipping cape:", err);
      setError("No se pudo desequipar la capa. Inténtalo de nuevo.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const renderCapesContent = () => {
    if (isLoading) {
      return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 200, gap: 12 }}>
          <div
            style={{
              width: 32,
              height: 32,
              border: "3px solid rgba(45, 212, 191, 0.1)",
              borderTopColor: "var(--primary)",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>Consultando inventario de capas...</span>
        </div>
      );
    }

    if (capes.length === 0) {
      return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 200, color: "rgba(255,255,255,0.4)", textAlign: "center" }}>
          <span style={{ fontSize: 32, marginBottom: 8 }}>🛡️</span>
          <span style={{ fontSize: 13, fontWeight: 600 }}>No se encontraron capas en esta cuenta</span>
          <span style={{ fontSize: 11, marginTop: 4, color: "rgba(255,255,255,0.3)" }}>
            Las capas se consiguen en eventos oficiales de Mojang, migraciones de cuenta o aniversarios.
          </span>
        </div>
      );
    }

    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
          gap: 16,
          padding: "4px 0",
        }}
      >
        {capes.map((cape) => {
          const isActive = cape.state === "ACTIVE";
          const isProcessing = actionLoadingId === cape.id;

          return (
            <CrystalCard
              key={cape.id}
              enableHoverEffect={!isProcessing}
              style={{
                padding: 14,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                backgroundColor: isActive ? "rgba(45, 212, 191, 0.04)" : "rgba(255, 255, 255, 0.01)",
                borderColor: isActive ? "rgba(45, 212, 191, 0.3)" : "rgba(255,255,255,0.06)",
                boxShadow: isActive ? "0 0 16px rgba(45, 212, 191, 0.1)" : "none",
                position: "relative",
                transition: "all 0.25s ease",
              }}
            >
              {/* Cape Preview (styled to look like a mini vertical cape banner) */}
              <div
                style={{
                  width: 50,
                  height: 80,
                  borderRadius: 6,
                  overflow: "hidden",
                  backgroundColor: "rgba(0,0,0,0.3)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  marginBottom: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  boxShadow: "inset 0 4px 10px rgba(0,0,0,0.5)",
                }}
              >
                <CapeCanvas url={cape.url} />
              </div>

              {/* Cape Name */}
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  textAlign: "center",
                  marginBottom: 12,
                  color: "#FFF",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  width: "100%",
                }}
                title={cape.alias}
              >
                {cape.alias}
              </span>

              {/* Action Button */}
              {isActive ? (
                <CrystalButton
                  text={isProcessing ? "Quitando..." : "Desequipar"}
                  variant="ghost"
                  size="sm"
                  onPressed={() => handleUnequip(cape.id)}
                  disabled={actionLoadingId !== null}
                  style={{
                    width: "100%",
                    fontSize: 11,
                    padding: "4px 8px",
                    borderColor: "rgba(239, 68, 68, 0.4)",
                    color: "#FF8B8B",
                  }}
                />
              ) : (
                <CrystalButton
                  text={isProcessing ? "Equipando..." : "Equipar"}
                  variant="primary"
                  size="sm"
                  onPressed={() => handleEquip(cape.id)}
                  disabled={actionLoadingId !== null}
                  style={{
                    width: "100%",
                    fontSize: 11,
                    padding: "4px 8px",
                  }}
                />
              )}
            </CrystalCard>
          );
        })}
      </div>
    );
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 580,
          backgroundColor: "#0B0F19",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: 24,
          padding: 24,
          boxShadow: "0 24px 48px rgba(0, 0, 0, 0.8)",
          display: "flex",
          flexDirection: "column",
          maxHeight: "85vh",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, letterSpacing: "-0.01em" }}>
              ✨ Capas Oficiales
            </h3>
            <span style={{ fontSize: 11, color: "rgba(255, 255, 255, 0.45)" }}>
              Elige cuál de tus capas oficiales de Minecraft quieres lucir en el juego
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "50%",
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "rgba(255,255,255,0.6)",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#EF4444";
              e.currentTarget.style.color = "#EF4444";
              e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
              e.currentTarget.style.color = "rgba(255,255,255,0.6)";
              e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.03)";
            }}
          >
            ✕
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              color: "#FCA5A5",
              fontSize: 12,
              marginBottom: 16,
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* Content Container */}
        <div style={{ flex: 1, overflowY: "auto", minHeight: 200, paddingRight: 4 }}>
          {renderCapesContent()}
        </div>
        
        {/* Styles for loader spinning */}
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes scaleIn {
            from { transform: scale(0.95); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
        `}</style>
      </div>
    </div>
  );
};
