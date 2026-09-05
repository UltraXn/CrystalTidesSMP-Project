import React, { useEffect, useState } from "react";
import { MorphIcon } from "morphicons/react";
import {
  ChevronDown,
  Play,
  Pause,
  X,
} from "lucide";
import { FabricLogo, ForgeLogo, NeoForgeLogo, QuiltLogo, VanillaLogo } from "./Logos";
import { getProfiles, getProfile, Profile } from "../services/profileService";

interface LoaderTheme {
  upperGradient: string;
  upperBorder: string;
  upperShadow: string;
  drawerBorder: string;
  drawerText: string;
  drawerHoverBg: string;
}

const LOADER_THEMES: Record<string, LoaderTheme> = {
  fabric: {
    upperGradient: "linear-gradient(180deg, #53C7C4 0%, #238B8F 62%, #186D71 100%)",
    upperBorder: "rgba(102, 242, 229, 0.45)",
    upperShadow: "0 8px 24px rgba(0, 0, 0, 0.55), 0 3px 12px rgba(83, 199, 196, 0.35)",
    drawerBorder: "rgba(26, 82, 77, 0.85)",
    drawerText: "#66F2E5",
    drawerHoverBg: "#0c1716",
  },
  forge: {
    upperGradient: "linear-gradient(180deg, #27374D 0%, #1B263B 62%, #0D1B2A 100%)",
    upperBorder: "rgba(141, 169, 196, 0.4)",
    upperShadow: "0 8px 24px rgba(0, 0, 0, 0.55), 0 3px 12px rgba(39, 55, 77, 0.35)",
    drawerBorder: "rgba(45, 60, 80, 0.85)",
    drawerText: "#8DA9C4",
    drawerHoverBg: "#0d131a",
  },
  neoforge: {
    upperGradient: "linear-gradient(180deg, #E68C37 0%, #BF6134 50.5%, #A44E37 100%)",
    upperBorder: "rgba(255, 166, 122, 0.45)",
    upperShadow: "0 8px 24px rgba(0, 0, 0, 0.55), 0 3px 12px rgba(230, 140, 55, 0.35)",
    drawerBorder: "rgba(94, 31, 26, 0.85)",
    drawerText: "#FFA67A",
    drawerHoverBg: "#170c0a",
  },
  quilt: {
    upperGradient: "linear-gradient(180deg, #529EF0 0%, #5C3DB8 55%, #331A6B 100%)",
    upperBorder: "rgba(140, 199, 255, 0.5)",
    upperShadow: "0 8px 24px rgba(0, 0, 0, 0.55), 0 3px 12px rgba(82, 158, 240, 0.35)",
    drawerBorder: "rgba(56, 71, 158, 0.85)",
    drawerText: "#8CC7FF",
    drawerHoverBg: "#0d0f1a",
  },
  vanilla: {
    upperGradient: "linear-gradient(180deg, #40D173 0%, #1F9447 62%, #146B31 100%)",
    upperBorder: "rgba(115, 250, 160, 0.45)",
    upperShadow: "0 8px 24px rgba(0, 0, 0, 0.55), 0 3px 12px rgba(64, 209, 115, 0.35)",
    drawerBorder: "rgba(20, 77, 41, 0.85)",
    drawerText: "#73FAA0",
    drawerHoverBg: "#0b140e",
  },
};

interface LauncherActionDeckProps {
  isDownloading: boolean;
  downloadProgress: number;
  currentAsset?: string;
  downloadedMB?: number;
  totalMB?: number;
  isPaused?: boolean;
  isOffline?: boolean;
  onPauseDownload?: () => void;
  onCancelDownload?: () => void;
  onLaunch: () => void;
  selectedProfile: string;
  onSelectProfile: (id: string) => void;
  onChangeVersion?: () => void;
}

export const LauncherActionDeck: React.FC<LauncherActionDeckProps> = ({
  isDownloading,
  downloadProgress,
  currentAsset = "Comprobando archivos...",
  isPaused = false,
  isOffline = false,
  onPauseDownload,
  onCancelDownload,
  onLaunch,
  selectedProfile,
  onSelectProfile,
  onChangeVersion,
}) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);

  useEffect(() => {
    const load = () => {
      const all = getProfiles();
      setProfiles(all);
    };
    load();
    window.addEventListener("storage", load);
    window.addEventListener("crystaltides_profiles_updated", load);
    return () => {
      window.removeEventListener("storage", load);
      window.removeEventListener("crystaltides_profiles_updated", load);
    };
  }, []);

  const activeProfile = getProfile(selectedProfile) || profiles[0];
  const loaderKey = activeProfile?.loaderType?.toLowerCase() || "vanilla";
  const currentTheme = LOADER_THEMES[loaderKey] || LOADER_THEMES.vanilla;

  const getLoaderIcon = (loaderType?: string) => {
    switch (loaderType?.toLowerCase()) {
      case "forge":
        return <ForgeLogo size={14} />;
      case "neoforge":
        return <NeoForgeLogo size={14} />;
      case "quilt":
        return <QuiltLogo size={14} />;
      case "fabric":
        return <FabricLogo size={14} />;
      case "vanilla":
      default:
        return <VanillaLogo size={14} />;
    }
  };

  const formatLoaderName = (type?: string) => {
    const t = (type || "vanilla").toLowerCase();
    if (t === "neoforge") return "NeoForge";
    if (t === "fabric") return "Fabric";
    if (t === "forge") return "Forge";
    if (t === "quilt") return "Quilt";
    return "Vanilla";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", flexShrink: 0 }}>
      {/* 2-Deck Row (Launch Box + Real Profiles Deck) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "392px 1fr",
          gap: 29,
          alignItems: "stretch",
          width: "100%",
        }}
      >
        {/* Deck Card 1: Elevated Layered LAUNCH / DOWNLOADING / OFFLINE Box */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            boxSizing: "border-box",
            position: "relative",
            width: "100%",
            minWidth: 0,
            justifyContent: "flex-end",
          }}
        >
          {/* 1. TOP ELEVATED BUTTON */}
          <button
            type="button"
            onClick={isDownloading ? undefined : onLaunch}
            style={{
              width: "100%",
              height: 91,
              minHeight: 91,
              borderRadius: 14,
              background: isDownloading
                ? "linear-gradient(180deg, #2bb673 0%, #22a861 50%, #1a8f51 100%)"
                : isOffline
                ? "linear-gradient(180deg, #64748b 0%, #475569 55%, #334155 100%)"
                : currentTheme.upperGradient,
              border: isDownloading
                ? "1px solid rgba(255, 255, 255, 0.28)"
                : isOffline
                ? "1px solid rgba(255, 255, 255, 0.25)"
                : `1px solid ${currentTheme.upperBorder}`,
              cursor: isDownloading ? "default" : "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              position: "relative",
              zIndex: 2,
              boxShadow: isDownloading
                ? "inset 0 1px 1px rgba(255, 255, 255, 0.6), 0 8px 24px rgba(0, 0, 0, 0.55), 0 3px 12px rgba(34, 168, 97, 0.35)"
                : isOffline
                ? "inset 0 1px 1px rgba(255, 255, 255, 0.5), 0 8px 24px rgba(0, 0, 0, 0.55), 0 3px 12px rgba(71, 85, 105, 0.3)"
                : `inset 0 1px 1px rgba(255, 255, 255, 0.7), ${currentTheme.upperShadow}`,
              transition: "all 180ms ease",
              overflow: "hidden",
              padding: "10px 14px 8px 14px",
              boxSizing: "border-box",
            }}
            onMouseEnter={(e) => {
              if (!isDownloading) {
                e.currentTarget.style.filter = "brightness(1.05)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isDownloading) {
                e.currentTarget.style.filter = "none";
              }
            }}
          >
            {/* Main Action Title */}
            <span
              style={{
                fontSize: isDownloading ? 26 : isOffline ? 23 : 34,
                fontWeight: 800,
                letterSpacing: isDownloading ? "0.06em" : isOffline ? "0.08em" : "0.22em",
                textTransform: "uppercase",
                fontFamily: "'Figtree', 'Inter', sans-serif",
                color: "#ECE9EA",
                textShadow: "0 2px 4px rgba(0, 0, 0, 0.35)",
                lineHeight: 1,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "100%",
              }}
            >
              {isDownloading
                ? downloadProgress >= 100
                  ? "READY"
                  : "DOWNLOADING"
                : isOffline
                ? "PLAY OFFLINE"
                : "LAUNCH"}
            </span>

            {/* Subtitle Row with Version & Controls */}
            <div
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                marginTop: 2,
              }}
            >
              {/* Loader Version Tag */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 11,
                  fontWeight: 700,
                  fontFamily: "'Figtree', 'Inter', sans-serif",
                  color: "#ECE9EA",
                  textShadow: "0 1px 2px rgba(0, 0, 0, 0.25)",
                  opacity: 0.95,
                }}
              >
                <span>{formatLoaderName(activeProfile?.loaderType)}</span>
                {getLoaderIcon(activeProfile?.loaderType)}
                <span>{activeProfile?.mcVersion || "1.21.1"}</span>
                {isOffline && <span style={{ opacity: 0.7, fontSize: 11 }}>• Offline</span>}
              </div>

              {/* Pause & Cancel Controls (When Downloading) */}
              {isDownloading && (
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "50%",
                    transform: "translateY(-50%)",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  {/* Cancel Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCancelDownload?.();
                    }}
                    title="Cancelar Descarga"
                    style={{
                      cursor: "pointer",
                      padding: "2px 4px",
                      borderRadius: 4,
                      backgroundColor: "rgba(0, 0, 0, 0.3)",
                      border: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#FFFFFF",
                    }}
                  >
                    <MorphIcon icon={X} size={11} color="#FFFFFF" strokeWidth={2.5} />
                  </button>

                  {/* Pause Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPauseDownload?.();
                    }}
                    title={isPaused ? "Reanudar" : "Pausar"}
                    style={{
                      cursor: "pointer",
                      padding: "2px 4px",
                      borderRadius: 4,
                      backgroundColor: "rgba(0, 0, 0, 0.3)",
                      border: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#FFFFFF",
                    }}
                  >
                    <MorphIcon
                      icon={isPaused ? Play : Pause}
                      size={11}
                      color="#FFFFFF"
                      strokeWidth={2.5}
                    />
                  </button>
                </div>
              )}
            </div>

            {/* Inner Progress Fill (During Download) */}
            {isDownloading && (
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  height: 3,
                  width: `${downloadProgress}%`,
                  backgroundColor: "rgba(255, 255, 255, 0.85)",
                  boxShadow: "0 0 8px rgba(255, 255, 255, 0.9)",
                  transition: "width 180ms ease-out",
                }}
              />
            )}
          </button>

          {/* 2. BOTTOM BASE "CHANGE VERSION" TAB */}
          <button
            type="button"
            onClick={onChangeVersion}
            style={{
              width: "100%",
              height: 24,
              marginTop: -3,
              backgroundColor: "#0C0E0D",
              borderLeft: `1px solid ${currentTheme.drawerBorder}`,
              borderRight: `1px solid ${currentTheme.drawerBorder}`,
              borderBottom: `1px solid ${currentTheme.drawerBorder}`,
              borderTop: "none",
              borderBottomLeftRadius: 8,
              borderBottomRightRadius: 8,
              color: currentTheme.drawerText,
              opacity: 0.9,
              fontSize: 9.5,
              fontWeight: 800,
              letterSpacing: "1px",
              fontFamily: "'Figtree', 'Inter', sans-serif",
              textTransform: "uppercase",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 5,
              position: "relative",
              zIndex: 1,
              boxShadow: "0 6px 18px rgba(0, 0, 0, 0.55)",
              transition: "all 150ms ease",
              flexShrink: 0,
              boxSizing: "border-box",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "1";
              e.currentTarget.style.backgroundColor = currentTheme.drawerHoverBg;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "0.9";
              e.currentTarget.style.backgroundColor = "#0C0E0D";
            }}
          >
            <span>CHANGE VERSION</span>
            <MorphIcon icon={ChevronDown} size={10} color="currentColor" strokeWidth={2.5} />
          </button>
        </div>

        {/* RIGHT SIDE: 1. PROFILES (162px) + 2. PARTNERS (176px) */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 16,
            boxSizing: "border-box",
          }}
        >
          {/* 1. LATEST PROFILES (162px) */}
          <div
            style={{
              width: 162,
              minWidth: 162,
              display: "flex",
              flexDirection: "column",
              gap: 6,
              boxSizing: "border-box",
            }}
          >
            {/* Header: LATEST PROFILES */}
            <div
              style={{
                fontSize: 9.5,
                fontWeight: 800,
                color: "#FAFCFF",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                height: 14,
                lineHeight: "14px",
                padding: "0 2px",
                fontFamily: "'Figtree', 'Inter', sans-serif",
              }}
            >
              LATEST PROFILES
            </div>

            {/* Profiles stack (2 items + dots) */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {profiles.slice(0, 2).map((prof, idx) => {
                const isSelected = selectedProfile === prof.id || (!selectedProfile && idx === 0);
                const emoji = idx === 0 ? "🗡️" : "📦";
                return (
                  <div
                    key={prof.id}
                    onClick={() => onSelectProfile(prof.id)}
                    style={{
                      width: 162,
                      height: 40,
                      minHeight: 40,
                      padding: "4px 10px",
                      boxSizing: "border-box",
                      borderRadius: 8,
                      backgroundColor: "#11131C",
                      border: isSelected
                        ? "1px solid rgba(45, 212, 191, 0.45)"
                        : "1px solid #262E42",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      cursor: "pointer",
                      transition: "all 140ms ease",
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.borderColor = "#404D6B";
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.borderColor = "#262E42";
                    }}
                  >
                    <span style={{ fontSize: 13 }}>{emoji}</span>
                    <div style={{ display: "flex", flexDirection: "column", gap: 1, overflow: "hidden" }}>
                      <span
                        style={{
                          fontSize: 10.5,
                          fontWeight: 700,
                          color: isSelected ? "#FAFCFF" : "#949EB8",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          fontFamily: "'Figtree', 'Inter', sans-serif",
                        }}
                      >
                        {prof.name}
                      </span>
                      <span
                        style={{
                          fontSize: 9,
                          color: "#949EB8",
                          fontFamily: "'Figtree', 'Inter', sans-serif",
                        }}
                      >
                        {prof.loaderType || "Forge"} {prof.mcVersion}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Dots (Figma Node 10:1616) */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 5,
                marginTop: 2,
              }}
            >
              <span style={{ width: 4, height: 4, borderRadius: "50%", backgroundColor: "#FAFCFF" }} />
              <span style={{ width: 4, height: 4, borderRadius: "50%", backgroundColor: "#59617A" }} />
              <span style={{ width: 4, height: 4, borderRadius: "50%", backgroundColor: "#59617A" }} />
              <span style={{ width: 4, height: 4, borderRadius: "50%", backgroundColor: "#59617A" }} />
            </div>
          </div>

          {/* 2. PARTNERS CARD (176px × 88px) (Figma Node 14:1961) */}
          <div
            style={{
              width: 176,
              minWidth: 176,
              display: "flex",
              flexDirection: "column",
              gap: 6,
              boxSizing: "border-box",
            }}
          >
            {/* Header: PARTNERS */}
            <div
              style={{
                fontSize: 8.5,
                fontWeight: 800,
                color: "#949EB8",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                height: 14,
                lineHeight: "14px",
                padding: "0 2px",
                fontFamily: "'Figtree', 'Inter', sans-serif",
              }}
            >
              PARTNERS
            </div>

            {/* Partners Badge Grid Container (176x88px) - Exact Figma Colors */}
            <div
              style={{
                width: 176,
                height: 86,
                borderRadius: 8,
                backgroundColor: "#11131C",
                border: "1px solid #262E42",
                padding: "8px 10px",
                boxSizing: "border-box",
                display: "grid",
                gridTemplateColumns: "repeat(4, 22px)",
                gridTemplateRows: "repeat(2, 22px)",
                gap: "8px 14px",
                alignContent: "center",
                justifyContent: "center",
              }}
            >
              {[
                { label: "H", bg: "#593814", text: "#FAFCFF" },
                { label: "🛡️", bg: "#471F1F", text: "#FAFCFF" },
                { label: "⚔️", bg: "#1F4729", text: "#FAFCFF" },
                { label: "🌀", bg: "#1A3861", text: "#FAFCFF" },
                { label: "RN", bg: "#382447", text: "#FAFCFF" },
                { label: "G", bg: "#524014", text: "#FAFCFF" },
                { label: "T", bg: "#1F3847", text: "#FAFCFF" },
                { label: "E", bg: "#4D1F40", text: "#FAFCFF" },
              ].map((badge, bIdx) => (
                <div
                  key={bIdx}
                  title={`Partner ${badge.label}`}
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 4,
                    backgroundColor: badge.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 9.5,
                    fontWeight: 800,
                    color: badge.text,
                    cursor: "pointer",
                    transition: "transform 140ms ease",
                    userSelect: "none",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.15)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
                >
                  {badge.label}
                </div>
              ))}
            </div>

            {/* Pagination Dots (Figma Node 10:1621) */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 5,
                marginTop: 2,
              }}
            >
              <span style={{ width: 4, height: 4, borderRadius: "50%", backgroundColor: "#FAFCFF" }} />
              <span style={{ width: 4, height: 4, borderRadius: "50%", backgroundColor: "#59617A" }} />
              <span style={{ width: 4, height: 4, borderRadius: "50%", backgroundColor: "#59617A" }} />
            </div>
          </div>
        </div>
      </div>

      {/* Downloading Banner (If active) */}
      {isDownloading && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "8px 12px",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            border: "1px solid rgba(45, 212, 191, 0.2)",
            borderRadius: 8,
            fontSize: 11,
            color: "rgba(255, 255, 255, 0.8)",
          }}
        >
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {currentAsset}
          </span>
          <span style={{ fontWeight: 800, color: "#2DD4BF" }}>{downloadProgress}%</span>
        </div>
      )}
    </div>
  );
};
