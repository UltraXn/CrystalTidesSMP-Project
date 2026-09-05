import React, { useState, useRef, useEffect } from "react";
import { MorphIcon } from "morphicons/react";
import {
  Shirt,
  Shield,
  RotateCcw,
  Download,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Cloud,
  Star,
  Plus,
  X,
  Check,
  FolderOpen,
} from "lucide";
import { useAuth } from "../services/authContext";
import { Launcher3DSkinViewer } from "./Launcher3DSkinViewer";
import type { SkinViewer as SkinViewerType } from "skinview3d";

export interface CapeItem {
  id: string;
  name: string;
  url: string;
  isActive: boolean;
}

export interface SkinEntry {
  id: string;
  name: string;
  skinUrl: string;
  model: "wide" | "slim";
  isFavorite: boolean;
  timeAgo: string;
  fileName?: string;
  createdAt: number;
}

// ── 2D Canvas Skin Renderer for Cards & Thumbnails ──
const MinecraftSkinRenderer: React.FC<{
  skinUrl: string;
  model?: "wide" | "slim";
  width?: number;
  height?: number;
}> = ({ skinUrl, model = "wide", width = 56, height = 112 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (skinUrl.includes("/body/") || skinUrl.includes("/armor/body/")) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = skinUrl;
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.imageSmoothingEnabled = false;

      const targetW = canvas.width;
      const u = targetW / 16; // 1 unit in character grid

      const isSlim = model === "slim";
      const armW = isSlim ? 3 : 4;

      const drawPart = (
        sx: number,
        sy: number,
        sw: number,
        sh: number,
        dx: number,
        dy: number,
        dw: number,
        dh: number
      ) => {
        ctx.drawImage(img, sx, sy, sw, sh, dx * u, dy * u, dw * u, dh * u);
      };

      // 1. Head Base & Layer 2
      drawPart(8, 8, 8, 8, 4, 0, 8, 8);
      drawPart(40, 8, 8, 8, 4, 0, 8, 8);

      // 2. Torso Base & Layer 2
      drawPart(20, 20, 8, 12, 4, 8, 8, 12);
      if (img.height >= 64) {
        drawPart(20, 36, 8, 12, 4, 8, 8, 12);
      }

      // 3. Right Arm
      const rArmX = isSlim ? 1 : 0;
      drawPart(44, 20, armW, 12, rArmX, 8, armW, 12);
      if (img.height >= 64) {
        drawPart(44, 36, armW, 12, rArmX, 8, armW, 12);
      }

      // 4. Left Arm
      const lArmX = 12;
      if (img.height >= 64) {
        drawPart(36, 52, armW, 12, lArmX, 8, armW, 12);
        drawPart(52, 52, armW, 12, lArmX, 8, armW, 12);
      } else {
        ctx.save();
        ctx.translate((lArmX + armW) * u, 8 * u);
        ctx.scale(-1, 1);
        ctx.drawImage(img, 44, 20, armW, 12, 0, 0, armW * u, 12 * u);
        ctx.restore();
      }

      // 5. Right Leg
      drawPart(4, 20, 4, 12, 4, 20, 4, 12);
      if (img.height >= 64) {
        drawPart(4, 36, 4, 12, 4, 20, 4, 12);
      }

      // 6. Left Leg
      if (img.height >= 64) {
        drawPart(20, 52, 4, 12, 8, 20, 4, 12);
        drawPart(4, 52, 4, 12, 8, 20, 4, 12);
      } else {
        ctx.save();
        ctx.translate(12 * u, 20 * u);
        ctx.scale(-1, 1);
        ctx.drawImage(img, 4, 20, 4, 12, 0, 0, 4 * u, 12 * u);
        ctx.restore();
      }
    };
    img.src = skinUrl;
  }, [skinUrl, model, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        width,
        height,
        imageRendering: "pixelated",
      }}
    />
  );
};

// ── Minecraft Cape Thumbnail Component ──
const MinecraftCapeThumbnail: React.FC<{ url: string; width?: number; height?: number }> = ({
  url,
  width = 28,
  height = 42,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.imageSmoothingEnabled = false;
      const scale = img.width / 64;
      ctx.drawImage(
        img,
        1 * scale,
        1 * scale,
        10 * scale,
        16 * scale,
        0,
        0,
        canvas.width,
        canvas.height
      );
    };
    img.src = url;
  }, [url]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        width,
        height,
        borderRadius: 4,
        imageRendering: "pixelated",
        boxShadow: "0 2px 8px rgba(0,0,0,0.6)",
      }}
    />
  );
};

const CRYSTAL_CAPES: CapeItem[] = [
  {
    id: "cherry",
    name: "Cherry Blossom",
    url: "https://textures.minecraft.net/texture/afd553b39358a24edfe3b8a9a939fa5fa4faa4d9a9c3d6af8eafb377fa05c2bb",
    isActive: true,
  },
  {
    id: "creeper",
    name: "Creeper Cape",
    url: "https://textures.minecraft.net/texture/28de4a81688ad18b49e735a273e086c18f1e3966956123ccb574034c06f5d336",
    isActive: false,
  },
  {
    id: "anniversary",
    name: "15th Anniversary",
    url: "https://textures.minecraft.net/texture/cd9d82ab17fd92022dbd4a86cde4c382a7540e117fae7b9a2853658505a80625",
    isActive: false,
  },
  {
    id: "heart",
    name: "Valentine Heart",
    url: "https://textures.minecraft.net/texture/2340c0e03dd24a11b15a8b33c2a7e9e32abb2051b2481d0ba7defd635ca7a933",
    isActive: false,
  },
  {
    id: "pan",
    name: "Pancake Gold",
    url: "https://textures.minecraft.net/texture/5c29410057e32abec02d870ecb52ec25fb45ea81e785a7854ae8429d7236ca26",
    isActive: false,
  },
  {
    id: "fire",
    name: "Nether Flame",
    url: "https://textures.minecraft.net/texture/5ec930cdd2629c8771655c60eebeb867b4b6559b0e6d3bc71c40c96347fa03f0",
    isActive: false,
  },
];

const DEFAULT_INITIAL_SKINS: SkinEntry[] = [
  {
    id: "skin_suit",
    name: "suit",
    skinUrl: "https://textures.minecraft.net/texture/7249b5c3e62f5923c5eef4582f0fa50e82c5f1be6d5b0d06371ef3b50c0ef48e",
    model: "wide",
    isFavorite: true,
    timeAgo: "13d",
    createdAt: Date.now() - 13 * 86400000,
  },
  {
    id: "skin_unnamed1",
    name: "unnamed-1",
    skinUrl: "https://textures.minecraft.net/texture/740dcbb8437eb931969a531f82c4be51e70e5b78f47f2a1c0d5718dfbb3da52c",
    model: "wide",
    isFavorite: true,
    timeAgo: "27d",
    createdAt: Date.now() - 27 * 86400000,
  },
  {
    id: "skin_unnamed2",
    name: "unnamed-2",
    skinUrl: "https://textures.minecraft.net/texture/8334ef5c07b6ae691458e657c7931c3fc388907865239ae1d09e557223e7f",
    model: "wide",
    isFavorite: true,
    timeAgo: "45d",
    createdAt: Date.now() - 45 * 86400000,
  },
  {
    id: "skin_unnamed3",
    name: "unnamed-3",
    skinUrl: "https://textures.minecraft.net/texture/4172f3e8200e6d87d4a6f7b11d9f48a5c49a37ad9f0868832a8ceb1cf70c675",
    model: "wide",
    isFavorite: false,
    timeAgo: "2d",
    createdAt: Date.now() - 2 * 86400000,
  },
  {
    id: "skin_unnamed4",
    name: "cyber-hoodie",
    skinUrl: "https://textures.minecraft.net/texture/92a83e0c7ba8d6c7b3992ae5e80dc9e78fb866299b9cf90558eb632f05a96",
    model: "wide",
    isFavorite: false,
    timeAgo: "5d",
    createdAt: Date.now() - 5 * 86400000,
  },
  {
    id: "skin_steve",
    name: "classic-steve",
    skinUrl: "https://textures.minecraft.net/texture/b08709325cc7c76891eb812e128b9fb6f8e70beea2ddde7a5e9cd9f76a5c2f82",
    model: "wide",
    isFavorite: false,
    timeAgo: "60d",
    createdAt: Date.now() - 60 * 86400000,
  },
];

const SKINS_STORAGE_KEY = "crystaltides_locker_skins_v2";

export const LauncherLockerView: React.FC = () => {
  const { currentSession } = useAuth();

  // Active Skin & Capes
  const defaultSkinUrl = currentSession?.username
    ? `https://mc-heads.net/skin/${currentSession.username}`
    : DEFAULT_INITIAL_SKINS[0].skinUrl;

  const [activeSkinUrl, setActiveSkinUrl] = useState<string>(defaultSkinUrl);
  const [selectedCapeId, setSelectedCapeId] = useState<string>("cherry");

  // Toggles & 3D controls
  const [showCape, setShowCape] = useState<boolean>(true);
  const [showArmor, setShowArmor] = useState<boolean>(false);
  const [isPlayingAnimation, setIsPlayingAnimation] = useState<boolean>(true);
  const [autoRotate] = useState<boolean>(false);

  // All skins list
  const [skins, setSkins] = useState<SkinEntry[]>(() => {
    try {
      const stored = localStorage.getItem(SKINS_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return DEFAULT_INITIAL_SKINS;
  });

  // Modal State for Upload / Edit Skin
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [modalSkinData, setModalSkinData] = useState<string | null>(null);
  const [modalFileName, setModalFileName] = useState<string>("15d28829ff3a6321.png");
  const [modalSkinName, setModalSkinName] = useState<string>("unnamed-3");
  const [modalModelType, setModalModelType] = useState<"wide" | "slim">("wide");

  // Drag over state for UPLOAD SKIN box
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  // Carousels Scroll Refs
  const capesScrollRef = useRef<HTMLDivElement>(null);
  const favoritesScrollRef = useRef<HTMLDivElement>(null);
  const latestScrollRef = useRef<HTMLDivElement>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalFileInputRef = useRef<HTMLInputElement>(null);
  const viewerInstanceRef = useRef<SkinViewerType | null>(null);

  // Save skins to LocalStorage whenever updated
  useEffect(() => {
    try {
      localStorage.setItem(SKINS_STORAGE_KEY, JSON.stringify(skins));
    } catch {
      // ignore
    }
  }, [skins]);

  const selectedCape = showCape ? CRYSTAL_CAPES.find((c) => c.id === selectedCapeId) : undefined;

  // Toggle Favorite
  const handleToggleFavorite = (skinId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSkins((prev) =>
      prev.map((s) => (s.id === skinId ? { ...s, isFavorite: !s.isFavorite } : s))
    );
  };

  // Reset 3D Viewer Rotation
  const handleResetRotation = () => {
    if (viewerInstanceRef.current) {
      viewerInstanceRef.current.camera.position.set(0, 10, 52);
      viewerInstanceRef.current.camera.rotation.set(0, 0, 0);
    }
  };

  // Export / Download Current Skin
  const handleDownloadSkin = () => {
    const a = document.createElement("a");
    a.href = activeSkinUrl;
    a.download = "minecraft_skin.png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Scroll Helpers
  const scrollCarousel = (ref: React.RefObject<HTMLDivElement | null>, direction: "left" | "right") => {
    if (ref.current) {
      const scrollAmount = direction === "left" ? -220 : 220;
      ref.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  // File Upload Handlers
  const processSkinFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === "string") {
        const dataUrl = event.target.result;
        const cleanName = file.name.replace(/\.[^/.]+$/, "") || "Custom Skin";
        setModalSkinData(dataUrl);
        setModalFileName(file.name);
        setModalSkinName(cleanName);
        setIsUploadModalOpen(true);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processSkinFile(file);
    }
  };

  const handleSaveModalSkin = () => {
    if (!modalSkinData) return;

    const newSkin: SkinEntry = {
      id: `skin_${Date.now()}`,
      name: modalSkinName.trim() || "unnamed",
      skinUrl: modalSkinData,
      model: modalModelType,
      isFavorite: true,
      timeAgo: "Just now",
      fileName: modalFileName,
      createdAt: Date.now(),
    };

    setSkins((prev) => [newSkin, ...prev]);
    setActiveSkinUrl(modalSkinData);
    setIsUploadModalOpen(false);
    setModalSkinData(null);
  };

  const favoritesList = skins.filter((s) => s.isFavorite);
  const latestList = skins;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        width: "100%",
        height: "100%",
        padding: "4px 8px 16px 4px",
        boxSizing: "border-box",
        overflowY: "auto",
        userSelect: "none",
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        position: "relative",
      }}
    >
      {/* ── HEADER TITLE ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingLeft: 2 }}>
        <h1
          style={{
            fontSize: 16,
            fontWeight: 900,
            color: "#FFFFFF",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            margin: 0,
          }}
        >
          LOCKER
        </h1>
      </div>

      {/* ── 2-COLUMN MAIN CONTENT ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "270px 1fr",
          gap: 16,
          width: "100%",
          alignItems: "start",
        }}
      >
        {/* ─── LEFT: CURRENT SKIN CARD ─── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 800,
              color: "rgba(255, 255, 255, 0.7)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            CURRENT SKIN
          </span>

          <div
            style={{
              width: "100%",
              height: 480,
              backgroundColor: "#07060B",
              borderRadius: 14,
              border: "1.5px solid rgba(147, 51, 234, 0.35)",
              boxShadow: "0 20px 48px rgba(0, 0, 0, 0.75), 0 0 24px rgba(147, 51, 234, 0.08)",
              position: "relative",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Top-Left Overlay Icons: Cape & Jacket/Armor */}
            <div
              style={{
                position: "absolute",
                top: 14,
                left: 14,
                display: "flex",
                flexDirection: "column",
                gap: 8,
                zIndex: 10,
              }}
            >
              {/* Cape Toggle Icon */}
              <button
                type="button"
                onClick={() => setShowCape(!showCape)}
                title={showCape ? "Ocultar Capa" : "Mostrar Capa"}
                style={{
                  background: "none",
                  border: "none",
                  color: showCape ? "#C084FC" : "rgba(255, 255, 255, 0.35)",
                  cursor: "pointer",
                  padding: 4,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 140ms ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#FFFFFF";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = showCape ? "#C084FC" : "rgba(255, 255, 255, 0.35)";
                }}
              >
                <MorphIcon icon={Shield} size={18} color="currentColor" strokeWidth={2} />
              </button>

              {/* Jacket / Armor Toggle Icon */}
              <button
                type="button"
                onClick={() => setShowArmor(!showArmor)}
                title={showArmor ? "Ocultar Chaqueta/Capa 2" : "Mostrar Chaqueta/Capa 2"}
                style={{
                  background: "none",
                  border: "none",
                  color: showArmor ? "#C084FC" : "rgba(255, 255, 255, 0.35)",
                  cursor: "pointer",
                  padding: 4,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 140ms ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#FFFFFF";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = showArmor ? "#C084FC" : "rgba(255, 255, 255, 0.35)";
                }}
              >
                <MorphIcon icon={Shirt} size={18} color="currentColor" strokeWidth={2} />
              </button>
            </div>

            {/* 3D Skin Viewer Center */}
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px 0",
              }}
            >
              <Launcher3DSkinViewer
                skinUrl={activeSkinUrl}
                capeUrl={selectedCape?.url}
                width={250}
                height={400}
                animationType={isPlayingAnimation ? "idle" : "none"}
                autoRotate={autoRotate}
                onViewerReady={(viewer) => {
                  viewerInstanceRef.current = viewer;
                }}
              />
            </div>

            {/* Bottom-Left: Reset Rotation Icon */}
            <div
              style={{
                position: "absolute",
                bottom: 14,
                left: 14,
                display: "flex",
                alignItems: "center",
                gap: 6,
                zIndex: 10,
              }}
            >
              <button
                type="button"
                onClick={handleResetRotation}
                title="Restablecer Rotación"
                style={{
                  background: "none",
                  border: "none",
                  color: "rgba(255, 255, 255, 0.5)",
                  cursor: "pointer",
                  padding: 4,
                  display: "flex",
                  transition: "all 140ms ease",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#FFFFFF"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255, 255, 255, 0.5)"; }}
              >
                <MorphIcon icon={RotateCcw} size={16} color="currentColor" strokeWidth={2.2} />
              </button>
            </div>

            {/* Bottom-Right: Download Skin & Play/Pause Animation Icons */}
            <div
              style={{
                position: "absolute",
                bottom: 14,
                right: 14,
                display: "flex",
                alignItems: "center",
                gap: 10,
                zIndex: 10,
              }}
            >
              {/* Download / Export */}
              <button
                type="button"
                onClick={handleDownloadSkin}
                title="Descargar Skin .png"
                style={{
                  background: "none",
                  border: "none",
                  color: "rgba(255, 255, 255, 0.5)",
                  cursor: "pointer",
                  padding: 4,
                  display: "flex",
                  transition: "all 140ms ease",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#FFFFFF"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255, 255, 255, 0.5)"; }}
              >
                <MorphIcon icon={Download} size={16} color="currentColor" strokeWidth={2.2} />
              </button>

              {/* Play / Pause Animation */}
              <button
                type="button"
                onClick={() => setIsPlayingAnimation(!isPlayingAnimation)}
                title={isPlayingAnimation ? "Pausar Animación" : "Reanudar Animación"}
                style={{
                  background: "none",
                  border: "none",
                  color: isPlayingAnimation ? "#C084FC" : "rgba(255, 255, 255, 0.5)",
                  cursor: "pointer",
                  padding: 4,
                  display: "flex",
                  transition: "all 140ms ease",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#FFFFFF"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = isPlayingAnimation ? "#C084FC" : "rgba(255, 255, 255, 0.5)"; }}
              >
                <MorphIcon
                  icon={isPlayingAnimation ? Pause : Play}
                  size={16}
                  color="currentColor"
                  strokeWidth={2.2}
                />
              </button>
            </div>
          </div>
        </div>

        {/* ─── RIGHT: UPLOAD, CAPES, FAVORITES & LATEST ─── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18, minWidth: 0 }}>
          {/* Hidden Global File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png"
            onChange={handleFileInputChange}
            style={{ display: "none" }}
          />

          {/* ── Top Row: UPLOAD SKIN + CAPES ── */}
          <div style={{ display: "grid", gridTemplateColumns: "170px 1fr", gap: 16 }}>
            {/* 1. UPLOAD SKIN Box */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: "rgba(255, 255, 255, 0.7)",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                UPLOAD SKIN
              </span>

              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragOver(false);
                  const file = e.dataTransfer.files[0];
                  if (file) {
                    processSkinFile(file);
                  }
                }}
                style={{
                  height: 72,
                  backgroundColor: isDragOver ? "rgba(147, 51, 234, 0.08)" : "rgba(255, 255, 255, 0.02)",
                  border: isDragOver
                    ? "1.5px dashed #C084FC"
                    : "1.5px dashed rgba(255, 255, 255, 0.16)",
                  borderRadius: 12,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                  cursor: "pointer",
                  transition: "all 140ms ease",
                  padding: "0 8px",
                  boxSizing: "border-box",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.35)";
                  e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.035)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.16)";
                  e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.02)";
                }}
              >
                {/* Dotted Plus Box */}
                <div
                  style={{
                    width: 24,
                    height: 18,
                    borderRadius: 4,
                    border: "1px dashed rgba(255, 255, 255, 0.4)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "rgba(255, 255, 255, 0.7)",
                  }}
                >
                  <MorphIcon icon={Plus} size={12} color="currentColor" strokeWidth={2.5} />
                </div>
                <span
                  style={{
                    fontSize: 9.5,
                    color: "rgba(255, 255, 255, 0.45)",
                    fontWeight: 600,
                    textAlign: "center",
                    lineHeight: 1.2,
                  }}
                >
                  Drag &amp; drop file or browse
                </span>
              </div>
            </div>

            {/* 2. CAPES Carousel */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
              {/* Header with < > */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    color: "rgba(255, 255, 255, 0.7)",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  CAPES
                </span>

                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <button
                    type="button"
                    onClick={() => scrollCarousel(capesScrollRef, "left")}
                    style={{
                      background: "none",
                      border: "none",
                      color: "rgba(255, 255, 255, 0.4)",
                      cursor: "pointer",
                      padding: 2,
                      display: "flex",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = "#FFFFFF"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255, 255, 255, 0.4)"; }}
                  >
                    <MorphIcon icon={ChevronLeft} size={14} color="currentColor" strokeWidth={2.5} />
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollCarousel(capesScrollRef, "right")}
                    style={{
                      background: "none",
                      border: "none",
                      color: "rgba(255, 255, 255, 0.4)",
                      cursor: "pointer",
                      padding: 2,
                      display: "flex",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = "#FFFFFF"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255, 255, 255, 0.4)"; }}
                  >
                    <MorphIcon icon={ChevronRight} size={14} color="currentColor" strokeWidth={2.5} />
                  </button>
                </div>
              </div>

              {/* Capes Row */}
              <div
                ref={capesScrollRef}
                style={{
                  display: "flex",
                  gap: 8,
                  overflowX: "auto",
                  paddingBottom: 2,
                  scrollbarWidth: "none",
                  alignItems: "center",
                }}
              >
                {CRYSTAL_CAPES.map((cape) => {
                  const isSelected = selectedCapeId === cape.id && showCape;
                  return (
                    <div
                      key={cape.id}
                      onClick={() => {
                        if (selectedCapeId === cape.id && showCape) {
                          setShowCape(false);
                        } else {
                          setSelectedCapeId(cape.id);
                          setShowCape(true);
                        }
                      }}
                      style={{
                        width: 44,
                        height: 72,
                        minWidth: 44,
                        borderRadius: 10,
                        backgroundColor: isSelected ? "rgba(147, 51, 234, 0.15)" : "rgba(255, 255, 255, 0.02)",
                        border: isSelected
                          ? "1.5px solid rgba(192, 132, 252, 0.8)"
                          : "1px solid rgba(255, 255, 255, 0.07)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        boxSizing: "border-box",
                        transition: "all 140ms ease",
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
                          e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.02)";
                          e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.07)";
                        }
                      }}
                    >
                      <MinecraftCapeThumbnail url={cape.url} width={26} height={42} />
                    </div>
                  );
                })}
              </div>

              {/* Subtitle */}
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
                <span style={{ fontSize: 9.5, color: "rgba(255, 255, 255, 0.35)", fontWeight: 500 }}>
                  All cosmetics synced to Crystal Cloud
                </span>
                <MorphIcon icon={Cloud} size={11} color="rgba(255, 255, 255, 0.35)" strokeWidth={2} />
              </div>
            </div>
          </div>

          {/* ── Middle Row: FAVORITES ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
            {/* Header with < > */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: "rgba(255, 255, 255, 0.7)",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                FAVORITES
              </span>

              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <button
                  type="button"
                  onClick={() => scrollCarousel(favoritesScrollRef, "left")}
                  style={{
                    background: "none",
                    border: "none",
                    color: "rgba(255, 255, 255, 0.4)",
                    cursor: "pointer",
                    padding: 2,
                    display: "flex",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "#FFFFFF"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255, 255, 255, 0.4)"; }}
                >
                  <MorphIcon icon={ChevronLeft} size={14} color="currentColor" strokeWidth={2.5} />
                </button>
                <button
                  type="button"
                  onClick={() => scrollCarousel(favoritesScrollRef, "right")}
                  style={{
                    background: "none",
                    border: "none",
                    color: "rgba(255, 255, 255, 0.4)",
                    cursor: "pointer",
                    padding: 2,
                    display: "flex",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "#FFFFFF"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255, 255, 255, 0.4)"; }}
                >
                  <MorphIcon icon={ChevronRight} size={14} color="currentColor" strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {/* Favorites Horizontal Grid */}
            <div
              ref={favoritesScrollRef}
              style={{
                display: "flex",
                gap: 12,
                overflowX: "auto",
                paddingBottom: 2,
                scrollbarWidth: "none",
              }}
            >
              {favoritesList.map((item) => {
                const isActive = activeSkinUrl === item.skinUrl;
                return (
                  <div
                    key={item.id}
                    onClick={() => setActiveSkinUrl(item.skinUrl)}
                    style={{
                      width: 122,
                      minWidth: 122,
                      height: 154,
                      backgroundColor: isActive ? "rgba(147, 51, 234, 0.08)" : "rgba(255, 255, 255, 0.02)",
                      border: isActive
                        ? "1.5px solid rgba(192, 132, 252, 0.6)"
                        : "1px solid rgba(255, 255, 255, 0.07)",
                      borderRadius: 12,
                      padding: "8px 10px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      cursor: "pointer",
                      boxSizing: "border-box",
                      position: "relative",
                      transition: "all 140ms ease",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.04)";
                        e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.14)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.02)";
                        e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.07)";
                      }
                    }}
                  >
                    {/* Star Icon (Favorite) */}
                    <button
                      type="button"
                      onClick={(e) => handleToggleFavorite(item.id, e)}
                      title="Quitar de Favoritos"
                      style={{
                        position: "absolute",
                        top: 8,
                        left: 8,
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                        display: "flex",
                        color: "#F59E0B",
                        zIndex: 5,
                      }}
                    >
                      <MorphIcon icon={Star} size={12} color="#F59E0B" strokeWidth={2.5} />
                    </button>

                    {/* Skin Character Preview */}
                    <div
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "6px 0 2px 0",
                      }}
                    >
                      <MinecraftSkinRenderer
                        skinUrl={item.skinUrl}
                        model={item.model}
                        width={44}
                        height={88}
                      />
                    </div>

                    {/* Footer Row: Name + TimeAgo */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        width: "100%",
                        paddingTop: 4,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: isActive ? "#FFFFFF" : "rgba(255, 255, 255, 0.8)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: 70,
                        }}
                      >
                        {item.name}
                      </span>
                      <span style={{ fontSize: 9.5, color: "rgba(255, 255, 255, 0.35)", fontWeight: 500 }}>
                        {item.timeAgo}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Empty placeholder slot */}
              <div
                style={{
                  width: 122,
                  minWidth: 122,
                  height: 154,
                  backgroundColor: "rgba(255, 255, 255, 0.01)",
                  border: "1px solid rgba(255, 255, 255, 0.04)",
                  borderRadius: 12,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                  padding: "8px 10px",
                  boxSizing: "border-box",
                }}
              >
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <span style={{ fontSize: 9.5, color: "rgba(255, 255, 255, 0.2)" }}>-</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Bottom Row: LATEST ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
            {/* Header with < > */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: "rgba(255, 255, 255, 0.7)",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                LATEST
              </span>

              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <button
                  type="button"
                  onClick={() => scrollCarousel(latestScrollRef, "left")}
                  style={{
                    background: "none",
                    border: "none",
                    color: "rgba(255, 255, 255, 0.4)",
                    cursor: "pointer",
                    padding: 2,
                    display: "flex",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "#FFFFFF"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255, 255, 255, 0.4)"; }}
                >
                  <MorphIcon icon={ChevronLeft} size={14} color="currentColor" strokeWidth={2.5} />
                </button>
                <button
                  type="button"
                  onClick={() => scrollCarousel(latestScrollRef, "right")}
                  style={{
                    background: "none",
                    border: "none",
                    color: "rgba(255, 255, 255, 0.4)",
                    cursor: "pointer",
                    padding: 2,
                    display: "flex",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "#FFFFFF"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255, 255, 255, 0.4)"; }}
                >
                  <MorphIcon icon={ChevronRight} size={14} color="currentColor" strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {/* Latest Horizontal Grid */}
            <div
              ref={latestScrollRef}
              style={{
                display: "flex",
                gap: 12,
                overflowX: "auto",
                paddingBottom: 2,
                scrollbarWidth: "none",
              }}
            >
              {latestList.map((item) => {
                const isActive = activeSkinUrl === item.skinUrl;
                return (
                  <div
                    key={item.id}
                    onClick={() => setActiveSkinUrl(item.skinUrl)}
                    style={{
                      width: 122,
                      minWidth: 122,
                      height: 154,
                      backgroundColor: isActive ? "rgba(147, 51, 234, 0.08)" : "rgba(255, 255, 255, 0.02)",
                      border: isActive
                        ? "1.5px solid rgba(192, 132, 252, 0.6)"
                        : "1px solid rgba(255, 255, 255, 0.07)",
                      borderRadius: 12,
                      padding: "8px 10px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      cursor: "pointer",
                      boxSizing: "border-box",
                      position: "relative",
                      transition: "all 140ms ease",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.04)";
                        e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.14)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.02)";
                        e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.07)";
                      }
                    }}
                  >
                    {/* Star Icon (Toggle) */}
                    <button
                      type="button"
                      onClick={(e) => handleToggleFavorite(item.id, e)}
                      title={item.isFavorite ? "Quitar de Favoritos" : "Marcar como Favorito"}
                      style={{
                        position: "absolute",
                        top: 8,
                        left: 8,
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                        display: "flex",
                        color: item.isFavorite ? "#F59E0B" : "rgba(255, 255, 255, 0.25)",
                        zIndex: 5,
                      }}
                    >
                      <MorphIcon
                        icon={Star}
                        size={12}
                        color={item.isFavorite ? "#F59E0B" : "currentColor"}
                        strokeWidth={item.isFavorite ? 2.5 : 1.8}
                      />
                    </button>

                    {/* Skin Character Preview */}
                    <div
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "6px 0 2px 0",
                      }}
                    >
                      <MinecraftSkinRenderer
                        skinUrl={item.skinUrl}
                        model={item.model}
                        width={44}
                        height={88}
                      />
                    </div>

                    {/* Footer Row: Name + TimeAgo */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        width: "100%",
                        paddingTop: 4,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: isActive ? "#FFFFFF" : "rgba(255, 255, 255, 0.8)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: 70,
                        }}
                      >
                        {item.name}
                      </span>
                      <span style={{ fontSize: 9.5, color: "rgba(255, 255, 255, 0.35)", fontWeight: 500 }}>
                        {item.timeAgo}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ─── UPLOAD / EDIT SKIN MODAL OVERLAY ─── */}
      {isUploadModalOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setIsUploadModalOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0, 0, 0, 0.65)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              zIndex: 999,
            }}
          />

          {/* Modal Container */}
          <div
            style={{
              position: "fixed",
              bottom: 36,
              right: 48,
              width: 480,
              backgroundColor: "rgba(10, 8, 14, 0.96)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: 16,
              boxShadow: "0 24px 64px rgba(0, 0, 0, 0.85), 0 0 32px rgba(147, 51, 234, 0.08)",
              zIndex: 1000,
              padding: "18px 20px",
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
              gap: 14,
              animation: "authModeFadeIn 180ms cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            {/* Modal Top Row: Close Button */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: -6 }}>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "rgba(255, 255, 255, 0.4)",
                  cursor: "pointer",
                  padding: 4,
                  display: "flex",
                  transition: "color 120ms ease",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#FFFFFF"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255, 255, 255, 0.4)"; }}
              >
                <MorphIcon icon={X} size={15} color="currentColor" strokeWidth={2.2} />
              </button>
            </div>

            {/* Modal Body: Left 3D/2D Preview Box, Right Form Fields */}
            <div style={{ display: "grid", gridTemplateColumns: "150px 1fr", gap: 16, alignItems: "center" }}>
              {/* Left Preview Box */}
              <div
                style={{
                  height: 180,
                  backgroundColor: "rgba(255, 255, 255, 0.02)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "8px 0",
                  boxSizing: "border-box",
                }}
              >
                {modalSkinData ? (
                  <MinecraftSkinRenderer
                    skinUrl={modalSkinData}
                    model={modalModelType}
                    width={56}
                    height={112}
                  />
                ) : (
                  <div style={{ fontSize: 11, color: "rgba(255, 255, 255, 0.3)" }}>Preview</div>
                )}
              </div>

              {/* Right Form Fields */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {/* 1. Name Field */}
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "rgba(255, 255, 255, 0.7)" }}>
                    Name
                  </label>
                  <input
                    type="text"
                    value={modalSkinName}
                    onChange={(e) => setModalSkinName(e.target.value)}
                    placeholder="unnamed-3"
                    style={{
                      height: 32,
                      borderRadius: 8,
                      backgroundColor: "rgba(255, 255, 255, 0.04)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      color: "#FFFFFF",
                      fontSize: 12,
                      padding: "0 10px",
                      outline: "none",
                    }}
                  />
                </div>

                {/* 2. File Field */}
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "rgba(255, 255, 255, 0.7)" }}>
                    File
                  </label>
                  <div style={{ display: "flex", gap: 6 }}>
                    <input
                      ref={modalFileInputRef}
                      type="file"
                      accept="image/png"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) processSkinFile(f);
                      }}
                      style={{ display: "none" }}
                    />
                    <div
                      style={{
                        flex: 1,
                        height: 32,
                        borderRadius: 8,
                        backgroundColor: "rgba(255, 255, 255, 0.04)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        color: "rgba(255, 255, 255, 0.6)",
                        fontSize: 11,
                        padding: "0 10px",
                        display: "flex",
                        alignItems: "center",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {modalFileName}
                    </div>
                    <button
                      type="button"
                      onClick={() => modalFileInputRef.current?.click()}
                      title="Explorar archivo"
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        backgroundColor: "rgba(255, 255, 255, 0.04)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        color: "rgba(255, 255, 255, 0.7)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <MorphIcon icon={FolderOpen} size={15} color="currentColor" strokeWidth={2} />
                    </button>
                  </div>
                </div>

                {/* 3. Player Model + Save Button Row */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 2 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255, 255, 255, 0.7)" }}>
                      Player Model
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      {/* Wide (Steve) */}
                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                          fontSize: 11.5,
                          color: modalModelType === "wide" ? "#FFFFFF" : "rgba(255, 255, 255, 0.5)",
                          cursor: "pointer",
                        }}
                      >
                        <input
                          type="radio"
                          name="playerModel"
                          checked={modalModelType === "wide"}
                          onChange={() => setModalModelType("wide")}
                          style={{ accentColor: "#A855F7" }}
                        />
                        <span>Wide</span>
                      </label>

                      {/* Slim (Alex) */}
                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                          fontSize: 11.5,
                          color: modalModelType === "slim" ? "#FFFFFF" : "rgba(255, 255, 255, 0.5)",
                          cursor: "pointer",
                        }}
                      >
                        <input
                          type="radio"
                          name="playerModel"
                          checked={modalModelType === "slim"}
                          onChange={() => setModalModelType("slim")}
                          style={{ accentColor: "#A855F7" }}
                        />
                        <span>Slim</span>
                      </label>
                    </div>
                  </div>

                  {/* Save Button */}
                  <button
                    type="button"
                    onClick={handleSaveModalSkin}
                    style={{
                      height: 32,
                      padding: "0 18px",
                      borderRadius: 8,
                      backgroundColor: "#10B981",
                      border: "none",
                      color: "#FFFFFF",
                      fontSize: 12,
                      fontWeight: 800,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      boxShadow: "0 4px 12px rgba(16, 185, 129, 0.35)",
                      transition: "filter 120ms ease",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.filter = "brightness(1.1)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.filter = "none"; }}
                  >
                    <MorphIcon icon={Check} size={13} color="#FFFFFF" strokeWidth={3} />
                    <span>Save</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
