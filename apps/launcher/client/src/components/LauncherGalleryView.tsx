import React, { useState } from "react";
import { invoke } from "@tauri-apps/api/core";

export interface ScreenshotItem {
  id: string;
  title: string;
  server: string;
  date: string;
  imageUrl: string;
  isFavorite?: boolean;
  size: string;
  players: string[];
}

const SAMPLE_SCREENSHOTS: ScreenshotItem[] = [
  {
    id: "1",
    title: "Spawn Hub Build",
    server: "Hypixel",
    date: "18 April, 21:37",
    imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80",
    isFavorite: true,
    size: "2.4 MB",
    players: ["UltraXn", "dbrn"],
  },
  {
    id: "2",
    title: "Nether Portal Base",
    server: "Crystal SMP",
    date: "17 April, 18:20",
    imageUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80",
    isFavorite: false,
    size: "3.1 MB",
    players: ["UltraXn", "CooI_Dog"],
  },
  {
    id: "3",
    title: "Ancient City Exploration",
    server: "Donut SMP",
    date: "15 April, 23:45",
    imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80",
    isFavorite: true,
    size: "1.8 MB",
    players: ["juli", "172px"],
  },
  {
    id: "4",
    title: "Skyblock Island Expansion",
    server: "Hypixel",
    date: "14 April, 16:10",
    imageUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80",
    isFavorite: false,
    size: "4.2 MB",
    players: ["UltraXn"],
  },
  {
    id: "5",
    title: "End Dragon Fight Victory",
    server: "Crystal SMP",
    date: "12 April, 20:05",
    imageUrl: "https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?auto=format&fit=crop&w=600&q=80",
    isFavorite: true,
    size: "2.9 MB",
    players: ["UltraXn", "dbrn", "Maxx"],
  },
  {
    id: "6",
    title: "Bedwars 4v4 Quad Win",
    server: "Hypixel",
    date: "10 April, 19:30",
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80",
    isFavorite: false,
    size: "2.1 MB",
    players: ["UltraXn", "172px"],
  },
];

export const LauncherGalleryView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list" | "detailed">("grid");
  const [sorting, setSorting] = useState<"newest" | "oldest" | "size">("newest");
  const [selectedScreenshotId, setSelectedScreenshotId] = useState<string>("1");
  const [selectedFilterServer, setSelectedFilterServer] = useState<string>("all");
  const [selectedFilterPlayer, setSelectedFilterPlayer] = useState<string>("all");

  const handleOpenScreenshotsFolder = async () => {
    try {
      const homeDir = await invoke<string | null>("get_home_dir");
      const path = homeDir ? `${homeDir.replace(/\\/g, "/")}/.crystaltides/screenshots` : "";
      if (path) {
        await invoke("open_folder", { path });
      }
    } catch (err) {
      console.warn("Could not open screenshots folder:", err);
    }
  };

  const filteredScreenshots = SAMPLE_SCREENSHOTS.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.server.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesServer =
      selectedFilterServer === "all" || s.server === selectedFilterServer;
    const matchesPlayer =
      selectedFilterPlayer === "all" || s.players.includes(selectedFilterPlayer);
    return matchesSearch && matchesServer && matchesPlayer;
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        width: "100%",
        height: "100%",
        padding: "8px 12px 20px 8px",
        boxSizing: "border-box",
        overflowY: "auto",
        userSelect: "none",
      }}
    >
      {/* Top Header Bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <h1
            style={{
              fontSize: 20,
              fontWeight: 900,
              color: "#FFFFFF",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              margin: 0,
            }}
          >
            Gallery
          </h1>

          {/* Search Box */}
          <div style={{ position: "relative", width: 280 }}>
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(255, 255, 255, 0.35)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search in gallery..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                backgroundColor: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: 8,
                padding: "6px 10px 6px 30px",
                color: "#FFFFFF",
                fontSize: 11,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>

        {/* Cloud Sync Stats & Folder Action */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "rgba(255, 255, 255, 0.45)" }}>
            <span>All media synced to Crystal Cloud</span>
            <span style={{ color: "#2DD4BF", fontWeight: 700 }}>3.8 GB / 10.0 GB used</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button
              type="button"
              title="Cloud Sync"
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                backgroundColor: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                color: "rgba(255, 255, 255, 0.7)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={handleOpenScreenshotsFolder}
              title="Open Screenshots Folder"
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                backgroundColor: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                color: "rgba(255, 255, 255, 0.7)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Main 2-Column Gallery Layout */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 240px",
          gap: 16,
          width: "100%",
          alignItems: "start",
        }}
      >
        {/* ── LEFT: SCREENSHOTS GRID (3 Columns) ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 14,
            width: "100%",
          }}
        >
          {filteredScreenshots.map((item) => {
            const isSelected = selectedScreenshotId === item.id;
            return (
              <div
                key={item.id}
                onClick={() => setSelectedScreenshotId(item.id)}
                style={{
                  position: "relative",
                  height: 140,
                  borderRadius: 12,
                  overflow: "hidden",
                  border: isSelected
                    ? "1.5px solid #A855F7"
                    : "1px solid rgba(255, 255, 255, 0.08)",
                  boxShadow: isSelected
                    ? "0 0 20px rgba(168, 85, 247, 0.35)"
                    : "0 4px 14px rgba(0, 0, 0, 0.5)",
                  cursor: "pointer",
                  backgroundColor: "#060A10",
                }}
              >
                {/* Background Image */}
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transform: isSelected ? "scale(1.03)" : "scale(1)",
                    transition: "transform 250ms ease",
                  }}
                />

                {/* Star Favorite Indicator */}
                {item.isFavorite && (
                  <div
                    style={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: "#F59E0B",
                      boxShadow: "0 0 8px #F59E0B",
                    }}
                  />
                )}

                {/* Active Card Hover Controls Overlay */}
                {isSelected && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "linear-gradient(180deg, rgba(7, 10, 18, 0.6) 0%, rgba(5, 7, 12, 0.9) 100%)",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      padding: 10,
                      boxSizing: "border-box",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 800, color: "#FFFFFF" }}>{item.server}</div>
                        <div style={{ fontSize: 9.5, color: "rgba(255, 255, 255, 0.5)" }}>{item.date}</div>
                      </div>
                      <span style={{ fontSize: 10, color: "#A855F7", fontWeight: 700 }}>{item.size}</span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          type="button"
                          title="Delete"
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: 6,
                            backgroundColor: "rgba(239, 68, 68, 0.2)",
                            border: "1px solid rgba(239, 68, 68, 0.4)",
                            color: "#EF4444",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M3 6h18" />
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          title="Copy to Clipboard"
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: 6,
                            backgroundColor: "rgba(255, 255, 255, 0.08)",
                            border: "1px solid rgba(255, 255, 255, 0.15)",
                            color: "#FFFFFF",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                          </svg>
                        </button>
                      </div>

                      {/* Tagged Players Stack */}
                      <div style={{ display: "flex", alignItems: "center" }}>
                        {item.players.map((p, idx) => (
                          <img
                            key={p}
                            src={`https://mc-heads.net/avatar/${p}/24`}
                            alt={p}
                            style={{
                              width: 18,
                              height: 18,
                              borderRadius: 4,
                              marginLeft: idx > 0 ? -4 : 0,
                              border: "1px solid #000",
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── RIGHT: FILTERS & VIEW SETTINGS SIDEBAR ── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            backgroundColor: "#05070D",
            borderRadius: 12,
            border: "1px solid rgba(255, 255, 255, 0.06)",
            padding: 14,
            boxSizing: "border-box",
          }}
        >
          {/* 1. View Selector */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "rgba(255, 255, 255, 0.6)", textTransform: "uppercase" }}>
              ^ View
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4 }}>
              {(["grid", "list", "detailed"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setViewMode(m)}
                  style={{
                    padding: "5px 0",
                    borderRadius: 6,
                    backgroundColor: viewMode === m ? "#2DD4BF" : "rgba(255, 255, 255, 0.04)",
                    border: "none",
                    color: viewMode === m ? "#041814" : "rgba(255, 255, 255, 0.7)",
                    fontSize: 10,
                    fontWeight: 800,
                    textTransform: "capitalize",
                    cursor: "pointer",
                  }}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Sorting */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "rgba(255, 255, 255, 0.6)", textTransform: "uppercase" }}>
              ^ Sorting
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4 }}>
              {(["newest", "oldest", "size"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSorting(s)}
                  style={{
                    padding: "5px 0",
                    borderRadius: 6,
                    backgroundColor: sorting === s ? "rgba(168, 85, 247, 0.25)" : "rgba(255, 255, 255, 0.04)",
                    border: sorting === s ? "1px solid #A855F7" : "1px solid transparent",
                    color: sorting === s ? "#C084FC" : "rgba(255, 255, 255, 0.7)",
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: "capitalize",
                    cursor: "pointer",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Smart Filters */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "rgba(255, 255, 255, 0.6)", textTransform: "uppercase" }}>
              ^ Smart Filters
            </div>

            {/* Filter by player */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 10, color: "rgba(255, 255, 255, 0.4)", fontWeight: 600 }}>Filter by player</span>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {["UltraXn", "dbrn", "172px", "juli", "Maxx"].map((pl) => (
                  <img
                    key={pl}
                    src={`https://mc-heads.net/avatar/${pl}/32`}
                    alt={pl}
                    onClick={() => setSelectedFilterPlayer(selectedFilterPlayer === pl ? "all" : pl)}
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 6,
                      cursor: "pointer",
                      border: selectedFilterPlayer === pl ? "2px solid #2DD4BF" : "1px solid rgba(255, 255, 255, 0.1)",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Filter by server */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 10, color: "rgba(255, 255, 255, 0.4)", fontWeight: 600 }}>Filter by server</span>
              <select
                value={selectedFilterServer}
                onChange={(e) => setSelectedFilterServer(e.target.value)}
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: 6,
                  color: "#FFFFFF",
                  fontSize: 10.5,
                  padding: "4px 8px",
                  outline: "none",
                }}
              >
                <option value="all" style={{ backgroundColor: "#0B101B" }}>All Servers</option>
                <option value="Hypixel" style={{ backgroundColor: "#0B101B" }}>Hypixel</option>
                <option value="Crystal SMP" style={{ backgroundColor: "#0B101B" }}>Crystal SMP</option>
                <option value="Donut SMP" style={{ backgroundColor: "#0B101B" }}>Donut SMP</option>
              </select>
            </div>

            {/* Mini Calendar Widget */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}>
              <span style={{ fontSize: 10, color: "rgba(255, 255, 255, 0.4)", fontWeight: 600 }}>Filter by date</span>
              <div
                style={{
                  backgroundColor: "rgba(0, 0, 0, 0.35)",
                  borderRadius: 8,
                  border: "1px solid rgba(255, 255, 255, 0.05)",
                  padding: "8px 6px",
                  fontSize: 9.5,
                }}
              >
                <div style={{ textAlign: "center", fontWeight: 800, color: "rgba(255, 255, 255, 0.8)", marginBottom: 4 }}>
                  April 2026
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, textAlign: "center" }}>
                  {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                    <span key={i} style={{ color: "rgba(255, 255, 255, 0.3)", fontWeight: 700 }}>{d}</span>
                  ))}
                  {[12, 13, 14, 15, 16, 17, 18].map((n) => (
                    <span
                      key={n}
                      style={{
                        padding: "2px 0",
                        borderRadius: 3,
                        backgroundColor: n === 18 ? "#A855F7" : "transparent",
                        color: n === 18 ? "#FFF" : "rgba(255, 255, 255, 0.7)",
                        fontWeight: n === 18 ? 900 : 500,
                        cursor: "pointer",
                      }}
                    >
                      {n}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
