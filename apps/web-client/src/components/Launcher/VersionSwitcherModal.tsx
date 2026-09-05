import React, { useState } from "react";
import { Search, Play, Settings2, X } from "lucide-react";

export interface VersionCardData {
  major: string;
  subVersions: string[];
  selectedSub: string;
  name: string;
  loader: "Fabric" | "Forge" | "NeoForge" | "Vanilla";
  bgGradient: string;
  tag?: string;
  isInstalled?: boolean;
}

const DEFAULT_VERSIONS: VersionCardData[] = [
  {
    major: "26.1",
    subVersions: ["26.1.1", "26.1.0-snap"],
    selectedSub: "26.1.1",
    name: "Future Snapshot",
    loader: "Fabric",
    bgGradient: "linear-gradient(135deg, rgba(88, 28, 135, 0.4) 0%, rgba(15, 23, 42, 0.9) 100%)",
    tag: "NUEVO",
    isInstalled: true,
  },
  {
    major: "1.21",
    subVersions: ["1.21.7", "1.21.4", "1.21.3", "1.21.1"],
    selectedSub: "1.21.3",
    name: "CrystalTides Oficial",
    loader: "Fabric",
    bgGradient: "linear-gradient(135deg, rgba(13, 148, 136, 0.4) 0%, rgba(15, 23, 42, 0.9) 100%)",
    tag: "RECOMENDADO",
    isInstalled: true,
  },
  {
    major: "1.20",
    subVersions: ["1.20.4", "1.20.2", "1.20.1"],
    selectedSub: "1.20.4",
    name: "Trails & Tales",
    loader: "Fabric",
    bgGradient: "linear-gradient(135deg, rgba(180, 83, 9, 0.3) 0%, rgba(15, 23, 42, 0.9) 100%)",
    isInstalled: true,
  },
  {
    major: "1.19",
    subVersions: ["1.19.4", "1.19.2"],
    selectedSub: "1.19.4",
    name: "The Wild Update",
    loader: "Fabric",
    bgGradient: "linear-gradient(135deg, rgba(21, 128, 61, 0.3) 0%, rgba(15, 23, 42, 0.9) 100%)",
    isInstalled: false,
  },
  {
    major: "1.16",
    subVersions: ["1.16.5", "1.16.4"],
    selectedSub: "1.16.5",
    name: "Nether Update",
    loader: "Forge",
    bgGradient: "linear-gradient(135deg, rgba(185, 28, 28, 0.3) 0%, rgba(15, 23, 42, 0.9) 100%)",
    isInstalled: true,
  },
  {
    major: "1.8",
    subVersions: ["1.8.9"],
    selectedSub: "1.8.9",
    name: "Legacy PvP / Bedwars",
    loader: "Forge",
    bgGradient: "linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(15, 23, 42, 0.9) 100%)",
    isInstalled: true,
  },
];

export const VersionSwitcherModal: React.FC<{
  onSelectVersion: (version: string, loader: string) => void;
  onClose: () => void;
}> = ({ onSelectVersion, onClose }) => {
  const [versions, setVersions] = useState<VersionCardData[]>(DEFAULT_VERSIONS);
  const [search, setSearch] = useState("");
  const [selectedLoader, setSelectedLoader] = useState<string>("ALL");

  const filtered = versions.filter((v) => {
    const matchesSearch =
      v.major.includes(search) ||
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.selectedSub.includes(search);
    const matchesLoader = selectedLoader === "ALL" || v.loader.toUpperCase() === selectedLoader;
    return matchesSearch && matchesLoader;
  });

  const handleSubChange = (index: number, newSub: string) => {
    setVersions((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, selectedSub: newSub } : item))
    );
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="version-switcher-heading"
      style={{
        padding: "24px 32px",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 20,
        boxSizing: "border-box",
        overflowY: "auto",
        backgroundColor: "#07040a",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "#2dd4bf",
              marginBottom: 4,
            }}
          >
            Selector de Versiones
          </div>
          <h1 id="version-switcher-heading" style={{ margin: 0, fontSize: 24, fontWeight: 900, color: "#FFF" }}>
            Elige tu versión de juego
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: 12.5, color: "rgba(255, 255, 255, 0.55)" }}>
            Navega entre lanzamientos de Minecraft y gestiona perfiles con un solo clic.
          </p>
        </div>

        <button
          type="button"
          aria-label="Volver al inicio"
          onClick={onClose}
          style={{
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            color: "#FFF",
            padding: "8px 14px",
            borderRadius: 10,
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <X size={15} aria-hidden="true" /> Volver al Inicio
        </button>
      </div>

      {/* Filter Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
          padding: "12px 16px",
          backgroundColor: "rgba(255, 255, 255, 0.02)",
          border: "1px solid rgba(255, 255, 255, 0.06)",
          borderRadius: 14,
        }}
      >
        <div
          style={{
            flex: 1,
            minWidth: 200,
            display: "flex",
            alignItems: "center",
            gap: 8,
            backgroundColor: "rgba(255, 255, 255, 0.04)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: 10,
            padding: "6px 12px",
          }}
        >
          <Search size={14} aria-hidden="true" color="rgba(255, 255, 255, 0.4)" />
          <input
            type="text"
            aria-label="Buscar versión por número o nombre"
            placeholder="Buscar por versión o nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1,
              background: "none",
              border: "none",
              outline: "none",
              color: "#FFF",
              fontSize: 12,
            }}
          />
        </div>

        {/* Loader Pills */}
        <div role="group" aria-label="Filtrar por mod loader" style={{ display: "flex", gap: 6 }}>
          {["ALL", "FABRIC", "FORGE", "VANILLA"].map((loader) => (
            <button
              key={loader}
              type="button"
              aria-pressed={selectedLoader === loader}
              onClick={() => setSelectedLoader(loader)}
              style={{
                background:
                  selectedLoader === loader
                    ? "linear-gradient(135deg, #2dd4bf, #0d9488)"
                    : "rgba(255, 255, 255, 0.04)",
                border:
                  selectedLoader === loader
                    ? "1px solid #2dd4bf"
                    : "1px solid rgba(255, 255, 255, 0.08)",
                color: selectedLoader === loader ? "#022c22" : "rgba(255, 255, 255, 0.6)",
                padding: "5px 12px",
                borderRadius: 8,
                fontSize: 11,
                fontWeight: 800,
                cursor: "pointer",
                transition: "all 150ms ease",
              }}
            >
              {loader === "ALL" ? "Todos" : loader}
            </button>
          ))}
        </div>
      </div>

      {/* Version Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 16,
        }}
      >
        {filtered.map((item, index) => (
          <div
            key={item.major}
            style={{
              position: "relative",
              borderRadius: 16,
              border: "1px solid rgba(255, 255, 255, 0.08)",
              background: item.bgGradient,
              padding: "18px 20px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              minHeight: 180,
              overflow: "hidden",
              boxShadow: "0 10px 24px rgba(0, 0, 0, 0.5)",
              transition: "transform 200ms ease, border-color 200ms ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-3px)";
              e.currentTarget.style.borderColor = "rgba(45, 212, 191, 0.5)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
            }}
          >
            {/* Top Row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 2 }}>
              <select
                aria-label="Seleccionar subversión"
                value={item.selectedSub}
                onChange={(e) => handleSubChange(index, e.target.value)}
                style={{
                  backgroundColor: "rgba(0, 0, 0, 0.6)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  color: "#FFF",
                  fontSize: 11,
                  fontWeight: 800,
                  padding: "4px 8px",
                  borderRadius: 8,
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                {item.subVersions.map((sub) => (
                  <option key={sub} value={sub} style={{ background: "#0f172a" }}>
                    {sub}
                  </option>
                ))}
              </select>

              {item.tag && (
                <span
                  style={{
                    fontSize: 9.5,
                    fontWeight: 900,
                    padding: "3px 8px",
                    borderRadius: 999,
                    backgroundColor: item.tag === "RECOMENDADO" ? "rgba(45, 212, 191, 0.2)" : "rgba(168, 85, 247, 0.3)",
                    color: item.tag === "RECOMENDADO" ? "#2dd4bf" : "#c084fc",
                    border: `1px solid ${item.tag === "RECOMENDADO" ? "rgba(45, 212, 191, 0.4)" : "rgba(168, 85, 247, 0.5)"}`,
                  }}
                >
                  {item.tag}
                </span>
              )}
            </div>

            {/* Center Big Version Number */}
            <div style={{ margin: "14px 0", zIndex: 2 }}>
              <div
                style={{
                  fontSize: 42,
                  fontWeight: 900,
                  color: "#FFFFFF",
                  lineHeight: 1,
                  letterSpacing: "-0.03em",
                  textShadow: "0 4px 20px rgba(0,0,0,0.8)",
                }}
              >
                {item.major}
              </div>
              <div style={{ fontSize: 12, color: "rgba(255, 255, 255, 0.7)", marginTop: 4, fontWeight: 600 }}>
                {item.name} • <span style={{ color: "#2dd4bf" }}>{item.loader}</span>
              </div>
            </div>

            {/* Bottom Actions */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, zIndex: 2 }}>
              <button
                type="button"
                aria-label={`Jugar versión ${item.selectedSub} con ${item.loader}`}
                onClick={() => {
                  onSelectVersion(item.selectedSub, item.loader);
                  onClose();
                }}
                style={{
                  flex: 1,
                  background: "linear-gradient(135deg, #2dd4bf 0%, #0d9488 100%)",
                  border: "none",
                  borderRadius: 10,
                  color: "#022c22",
                  fontSize: 12,
                  fontWeight: 800,
                  padding: "8px 12px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  boxShadow: "0 4px 14px rgba(45, 212, 191, 0.3)",
                  transition: "all 150ms ease",
                }}
              >
                <Play size={13} fill="#022c22" aria-hidden="true" /> JUGAR {item.selectedSub}
              </button>

              <button
                type="button"
                aria-label={`Configuración de versión ${item.major}`}
                title="Configuración de versión"
                style={{
                  background: "rgba(0, 0, 0, 0.5)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  borderRadius: 10,
                  color: "rgba(255, 255, 255, 0.7)",
                  padding: "8px 10px",
                  cursor: "pointer",
                  display: "flex",
                }}
              >
                <Settings2 size={15} aria-hidden="true" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
