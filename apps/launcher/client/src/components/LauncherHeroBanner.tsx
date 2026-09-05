import React, { useEffect, useState } from "react";
import { MorphIcon } from "morphicons/react";
import { Sun, Moon } from "lucide";
import { WallpaperMode } from "./types";
import { fetchServerStatus, ServerStatus } from "../services/serverStatusService";

interface LauncherHeroBannerProps {
  playerName?: string;
  playerAvatar?: string;
  lastPlayedServer?: string;
  lastPlayedTime?: string;
  totalPlaytime?: string;
  wallpaperMode: WallpaperMode;
  onSelectWallpaperMode: (mode: WallpaperMode) => void;
  onOpenAccountSwitcher?: () => void;
}

export const LauncherHeroBanner: React.FC<LauncherHeroBannerProps> = ({
  playerName = "dbrn",
  playerAvatar = "https://mc-heads.net/avatar/dbrn/24",
  lastPlayedServer = "CrystalTides SMP",
  lastPlayedTime = "Recently",
  totalPlaytime = "1,364h",
  wallpaperMode,
  onSelectWallpaperMode,
  onOpenAccountSwitcher,
}) => {
  const [serverStatus, setServerStatus] = useState<ServerStatus | null>(null);

  useEffect(() => {
    let isMounted = true;
    fetchServerStatus("mc.crystaltidessmp.net", 25565).then((status) => {
      if (isMounted && status) {
        setServerStatus(status);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexShrink: 0 }}>
      {/* Player Greeting and Playtime Details (Figma Nodes 10:1649, 10:1653, 10:1657) */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {/* Greeting + Player Avatar + Chevron */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: "#FAFCFF",
              letterSpacing: "-0.02em",
              fontFamily: "'Figtree', 'Inter', sans-serif",
            }}
          >
            Good to see you,
          </span>
          <div
            onClick={onOpenAccountSwitcher}
            title="Cambiar de cuenta"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              cursor: onOpenAccountSwitcher ? "pointer" : "default",
              padding: "3px 8px",
              borderRadius: 8,
              backgroundColor: "#11131C",
              border: "1px solid #262E42",
              transition: "all 150ms ease",
            }}
            onMouseEnter={(e) => {
              if (onOpenAccountSwitcher) {
                e.currentTarget.style.backgroundColor = "#1A1F29";
                e.currentTarget.style.borderColor = "#404D6B";
              }
            }}
            onMouseLeave={(e) => {
              if (onOpenAccountSwitcher) {
                e.currentTarget.style.backgroundColor = "#11131C";
                e.currentTarget.style.borderColor = "#262E42";
              }
            }}
          >
            <img
              src={playerAvatar}
              alt={playerName}
              style={{ width: 20, height: 20, borderRadius: 4, imageRendering: "pixelated" }}
            />
            <span
              style={{
                fontSize: 20,
                fontWeight: 800,
                color: "#FAFCFF",
                fontFamily: "'Figtree', 'Inter', sans-serif",
              }}
            >
              {playerName}
            </span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ color: "#949EB8" }}
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>
        </div>

        {/* Server & Playtime stats */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            fontSize: 11.5,
            color: "#949EB8",
            lineHeight: 1.4,
            fontFamily: "'Figtree', 'Inter', sans-serif",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span>Last played:</span>
            <span style={{ fontWeight: 700, color: "#FAFCFF" }}>{lastPlayedServer}</span>
            <span style={{ color: "#262E42" }}>•</span>
            <span>{lastPlayedTime}</span>
            {serverStatus?.online && (
              <>
                <span style={{ color: "#262E42" }}>•</span>
                <span style={{ color: "#2ED96B", fontWeight: 700 }}>{serverStatus.playersOnline || 0} Online</span>
              </>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span>Total playtime:</span>
            <span style={{ fontWeight: 700, color: "#FAFCFF" }}>{totalPlaytime}</span>
          </div>
        </div>
      </div>

      {/* Dynamic Wallpaper Mode Switcher (Day / Night) */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          backgroundColor: "#11131C",
          border: "1px solid #262E42",
          borderRadius: 8,
          padding: 3,
          gap: 2,
        }}
      >
        <button
          type="button"
          onClick={() => onSelectWallpaperMode("day")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "4px 10px",
            borderRadius: 6,
            border: "none",
            backgroundColor: wallpaperMode === "day" ? "#1F2638" : "transparent",
            color: wallpaperMode === "day" ? "#FAFCFF" : "#949EB8",
            fontSize: 10.5,
            fontWeight: 700,
            cursor: "pointer",
            transition: "all 150ms ease",
          }}
        >
          <MorphIcon
            icon={Sun}
            size={13}
            color={wallpaperMode === "day" ? "#F59E0B" : "currentColor"}
            strokeWidth={2.2}
          />
          <span>Day</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectWallpaperMode("night")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "4px 10px",
            borderRadius: 6,
            border: "none",
            backgroundColor: wallpaperMode === "night" ? "#1F2638" : "transparent",
            color: wallpaperMode === "night" ? "#FAFCFF" : "#949EB8",
            fontSize: 10.5,
            fontWeight: 700,
            cursor: "pointer",
            transition: "all 150ms ease",
          }}
        >
          <MorphIcon
            icon={Moon}
            size={13}
            color={wallpaperMode === "night" ? "#38BDF8" : "currentColor"}
            strokeWidth={2.2}
          />
          <span>Night</span>
        </button>
      </div>
    </div>
  );
};
