import React, { useState, useEffect } from "react";

export const LauncherLoadingScreen: React.FC = () => {
  const [phaseIndex, setPhaseIndex] = useState<number>(0);

  const PHASES = [
    "Iniciando módulos principales de Crystal Client...",
    "Verificando entorno seguro y almacenamiento local...",
    "Sincronizando perfiles y configuraciones...",
    "Cargando experiencia de juego...",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setPhaseIndex((prev) => (prev + 1) % PHASES.length);
    }, 900);
    return () => clearInterval(interval);
  }, []);

  const handleStartDrag = async (e: React.MouseEvent) => {
    if (e.button === 0) {
      try {
        const { getCurrentWindow } = await import("@tauri-apps/api/window");
        await getCurrentWindow().startDragging();
      } catch {
        /* Ignore if not in Tauri */
      }
    }
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        backgroundColor: "#050307",
        color: "#FFFFFF",
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        userSelect: "none",
      }}
    >
      {/* ── TOP FRAMELESS DRAG TITLEBAR ── */}
      <header
        data-tauri-drag-region
        onMouseDown={handleStartDrag}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 44,
          display: "flex",
          alignItems: "center",
          padding: "0 24px",
          fontSize: 12,
          color: "rgba(255, 255, 255, 0.4)",
          zIndex: 50,
        }}
      >
        <div data-tauri-drag-region style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img
            src="/logo.png"
            alt="Logo"
            style={{ width: 16, height: 16, objectFit: "contain", opacity: 0.6 }}
          />
          <span style={{ fontWeight: 700, color: "rgba(255, 255, 255, 0.7)" }}>
            Crystal Client
          </span>
          <span style={{ color: "rgba(255, 255, 255, 0.15)" }}>|</span>
          <span style={{ fontSize: 11, color: "rgba(255, 255, 255, 0.35)" }}>Iniciando...</span>
        </div>
      </header>

      {/* ── AMBIENT RADIAL LIGHTING ── */}
      <div
        style={{
          position: "absolute",
          width: 320,
          height: 320,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(45, 212, 191, 0.18) 0%, rgba(168, 85, 247, 0.1) 45%, transparent 70%)",
          filter: "blur(40px)",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      {/* ── CENTER CONTAINER ── */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
          maxWidth: 420,
          textAlign: "center",
        }}
      >
        {/* Mascot Avatar with Levitation */}
        <div
          style={{
            position: "relative",
            width: 100,
            height: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: 100,
              height: 100,
              borderRadius: "50%",
              backgroundColor: "rgba(45, 212, 191, 0.12)",
              filter: "blur(16px)",
              animation: "pulse 2s infinite ease-in-out",
            }}
          />
          <img
            src="/logo.png"
            alt="Crystal Mascot"
            style={{
              width: 88,
              height: 88,
              objectFit: "contain",
              filter: "drop-shadow(0 0 24px rgba(45, 212, 191, 0.45))",
              animation: "float 3s ease-in-out infinite",
            }}
          />
        </div>

        {/* Brand Name */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 900,
              letterSpacing: "-0.03em",
              margin: 0,
              background: "linear-gradient(135deg, #FFFFFF 30%, #2DD4BF 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Crystal Client
          </h1>
          <span
            style={{
              fontSize: 12.5,
              fontWeight: 600,
              color: "rgba(255, 255, 255, 0.6)",
              minHeight: 18,
              transition: "opacity 200ms ease",
            }}
          >
            {PHASES[phaseIndex]}
          </span>
        </div>

        {/* Futuristic Glowing Progress Bar */}
        <div
          style={{
            width: 260,
            height: 4,
            borderRadius: 999,
            backgroundColor: "rgba(255, 255, 255, 0.08)",
            position: "relative",
            overflow: "hidden",
            marginTop: 4,
            boxShadow: "0 0 10px rgba(0, 0, 0, 0.5)",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              bottom: 0,
              width: "45%",
              borderRadius: 999,
              background:
                "linear-gradient(90deg, transparent 0%, #2DD4BF 50%, #A855F7 100%)",
              boxShadow: "0 0 12px #2DD4BF",
              animation: "shimmerSlide 1.4s infinite ease-in-out",
            }}
          />
        </div>

        {/* Bottom Tag */}
        <span
          style={{
            fontSize: 10.5,
            color: "rgba(255, 255, 255, 0.3)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            fontWeight: 700,
            marginTop: 6,
          }}
        >
          Build 0.9.2 • Crystal Engine
        </span>
      </div>

      {/* Global Embedded Keyframes for Floating & Shimmer */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-7px) scale(1.03); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; transform: scale(0.95); }
          50% { opacity: 0.8; transform: scale(1.15); }
        }
        @keyframes shimmerSlide {
          0% { left: -45%; }
          100% { left: 100%; }
        }
      `}</style>
    </div>
  );
};
