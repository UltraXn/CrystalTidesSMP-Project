import React, { useState } from "react";
import { LauncherVersionConfigModal } from "./LauncherVersionConfigModal";

export interface VersionCardData {
  id: string;
  majorName: string;
  selectedSubversion: string;
  subversions: string[];
  bgImage: string;
  loaderType: "tag" | "anvil";
  releaseDate: string;
}

const VERSIONS_DATA: VersionCardData[] = [
  {
    id: "26.1",
    majorName: "26.1",
    selectedSubversion: "26.1.1",
    subversions: ["26.1.1", "26.1.0", "26.1-rc1", "26.1-pre2"],
    bgImage: "/wallpapers/crystaltides_day.png",
    loaderType: "tag",
    releaseDate: "2026",
  },
  {
    id: "1.21",
    majorName: "1.21",
    selectedSubversion: "1.21.7",
    subversions: ["1.21.11", "1.21.10", "1.21.9", "1.21.8", "1.21.7", "1.21.4", "1.21.1"],
    bgImage: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80",
    loaderType: "tag",
    releaseDate: "Tricky Trials",
  },
  {
    id: "1.20",
    majorName: "1.20",
    selectedSubversion: "1.20.4",
    subversions: ["1.20.6", "1.20.4", "1.20.2", "1.20.1", "1.20"],
    bgImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80",
    loaderType: "tag",
    releaseDate: "Trails & Tales",
  },
  {
    id: "1.19",
    majorName: "1.19",
    selectedSubversion: "1.19.1",
    subversions: ["1.19.4", "1.19.3", "1.19.2", "1.19.1", "1.19"],
    bgImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80",
    loaderType: "tag",
    releaseDate: "The Wild",
  },
  {
    id: "1.16",
    majorName: "1.16",
    selectedSubversion: "1.16.5",
    subversions: ["1.16.5", "1.16.4", "1.16.3", "1.16.2", "1.16.1"],
    bgImage: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80",
    loaderType: "tag",
    releaseDate: "Nether Update",
  },
  {
    id: "1.13",
    majorName: "1.13",
    selectedSubversion: "1.13.1",
    subversions: ["1.13.2", "1.13.1", "1.13"],
    bgImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80",
    loaderType: "tag",
    releaseDate: "Update Aquatic",
  },
  {
    id: "1.12",
    majorName: "1.12",
    selectedSubversion: "1.12.2",
    subversions: ["1.12.2", "1.12.1", "1.12"],
    bgImage: "https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?auto=format&fit=crop&w=600&q=80",
    loaderType: "tag",
    releaseDate: "World of Color",
  },
  {
    id: "1.8",
    majorName: "1.8",
    selectedSubversion: "1.8.9",
    subversions: ["1.8.9", "1.8.8", "1.8"],
    bgImage: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=600&q=80",
    loaderType: "anvil",
    releaseDate: "Bountiful Update",
  },
  {
    id: "1.7",
    majorName: "1.7",
    selectedSubversion: "1.7.10",
    subversions: ["1.7.10", "1.7.9", "1.7.2"],
    bgImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80",
    loaderType: "anvil",
    releaseDate: "The Update that Changed the World",
  },
];

interface LauncherChangeVersionViewProps {
  onLaunchVersion?: (version: string) => void;
  onOpenSettings?: (version: string) => void;
}

export const LauncherChangeVersionView: React.FC<LauncherChangeVersionViewProps> = ({
  onLaunchVersion,
  onOpenSettings,
}) => {
  const [selectedMajor, setSelectedMajor] = useState<string>("1.21");
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [configuringVersionId, setConfiguringVersionId] = useState<string | null>(null);
  const [selectedSubversions, setSelectedSubversions] = useState<Record<string, string>>({
    "26.1": "26.1.1",
    "1.21": "1.21.7",
    "1.20": "1.20.4",
    "1.19": "1.19.1",
    "1.16": "1.16.5",
    "1.13": "1.13.1",
    "1.12": "1.12.2",
    "1.8": "1.8.9",
    "1.7": "1.7.10",
  });

  const handleSelectSubversion = (majorId: string, sub: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedSubversions((prev) => ({ ...prev, [majorId]: sub }));
    setOpenDropdownId(null);
  };

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
      {/* Title Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
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
          Change Version
        </h1>
        <span style={{ fontSize: 12, color: "rgba(255, 255, 255, 0.4)", fontWeight: 600 }}>
          Select Minecraft installation or customize mod profiles
        </span>
      </div>

      {/* 3x3 Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
          width: "100%",
          paddingBottom: 24,
        }}
      >
        {VERSIONS_DATA.map((item) => {
          const isSelected = selectedMajor === item.id;
          const currentSub = selectedSubversions[item.id] || item.selectedSubversion;
          const isDropdownOpen = openDropdownId === item.id;

          return (
            <div
              key={item.id}
              onClick={() => setSelectedMajor(item.id)}
              style={{
                position: "relative",
                height: 146,
                borderRadius: 14,
                overflow: "visible",
                border: isSelected
                  ? "1.5px solid #2DD4BF"
                  : "1px solid rgba(255, 255, 255, 0.08)",
                boxShadow: isSelected
                  ? "0 0 24px rgba(45, 212, 191, 0.28), 0 8px 24px rgba(0, 0, 0, 0.6)"
                  : "0 4px 16px rgba(0, 0, 0, 0.4)",
                cursor: "pointer",
                transition: "all 200ms ease",
                backgroundColor: "#070B12",
              }}
            >
              {/* Inner card clipped background */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 13,
                  overflow: "hidden",
                }}
              >
                {/* Background Image Artwork */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage: `url('${item.bgImage}')`,
                    backgroundPosition: "center",
                    backgroundSize: "cover",
                    opacity: isSelected ? 0.4 : 0.16,
                    transform: isSelected ? "scale(1.04)" : "scale(1)",
                    transition: "all 300ms ease",
                  }}
                />

                {/* Dark Vignette Overlay */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(180deg, rgba(7, 11, 18, 0.35) 0%, rgba(5, 7, 12, 0.85) 100%)",
                  }}
                />

                {/* Giant Centered Version Number */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 48,
                    fontWeight: 900,
                    letterSpacing: "-0.03em",
                    color: "#FFFFFF",
                    textShadow: "0 4px 18px rgba(0, 0, 0, 0.8)",
                    pointerEvents: "none",
                  }}
                >
                  {item.majorName}
                </div>
              </div>

              {/* Top-Left Version Dropdown Button */}
              <div style={{ position: "absolute", top: 10, left: 10, zIndex: 10 }}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenDropdownId(isDropdownOpen ? null : item.id);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    backgroundColor: "rgba(0, 0, 0, 0.72)",
                    backdropFilter: "blur(8px)",
                    border: "1px solid rgba(255, 255, 255, 0.14)",
                    borderRadius: 7,
                    padding: "4px 8px",
                    color: "#FFFFFF",
                    fontSize: 11,
                    fontWeight: 800,
                    cursor: "pointer",
                    transition: "background 150ms ease",
                  }}
                >
                  <span>{currentSub}</span>
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      transform: isDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 150ms ease",
                    }}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {/* Subversion Popup Menu */}
                {isDropdownOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: "calc(100% + 4px)",
                      left: 0,
                      width: 100,
                      maxHeight: 140,
                      overflowY: "auto",
                      backgroundColor: "#0B101B",
                      border: "1px solid rgba(45, 212, 191, 0.3)",
                      borderRadius: 8,
                      boxShadow: "0 10px 28px rgba(0, 0, 0, 0.8)",
                      zIndex: 100,
                      padding: "4px 0",
                    }}
                  >
                    {item.subversions.map((sub) => (
                      <div
                        key={sub}
                        onClick={(e) => handleSelectSubversion(item.id, sub, e)}
                        style={{
                          padding: "5px 10px",
                          fontSize: 11,
                          fontWeight: sub === currentSub ? 800 : 500,
                          color: sub === currentSub ? "#2DD4BF" : "rgba(255, 255, 255, 0.8)",
                          backgroundColor:
                            sub === currentSub ? "rgba(45, 212, 191, 0.12)" : "transparent",
                          cursor: "pointer",
                          transition: "background 120ms ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.08)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor =
                            sub === currentSub ? "rgba(45, 212, 191, 0.12)" : "transparent";
                        }}
                      >
                        {sub}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom Action Controls Bar */}
              <div
                style={{
                  position: "absolute",
                  bottom: 10,
                  left: 10,
                  right: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  zIndex: 5,
                }}
              >
                {/* Left: Tag / Anvil Icon Badge */}
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 6,
                    backgroundColor: "rgba(0, 0, 0, 0.65)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "rgba(255, 255, 255, 0.65)",
                  }}
                >
                  {item.loaderType === "tag" ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
                      <path d="M7 7h.01" />
                    </svg>
                  ) : (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M7 10h10" />
                      <path d="M4 6h16l-2 4H6L4 6z" />
                      <path d="M9 14h6" />
                      <path d="M10 14v4h4v-4" />
                    </svg>
                  )}
                </div>

                {/* Right: Settings Gear + LAUNCH Button */}
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {/* Gear Settings Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfiguringVersionId(item.id);
                      onOpenSettings?.(item.id);
                    }}
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 6,
                      backgroundColor: "rgba(0, 0, 0, 0.65)",
                      border: "1px solid rgba(255, 255, 255, 0.12)",
                      color: "rgba(255, 255, 255, 0.7)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 150ms ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#FFFFFF";
                      e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "rgba(255, 255, 255, 0.7)";
                      e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.65)";
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                  </button>

                  {/* LAUNCH Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onLaunchVersion?.(currentSub);
                    }}
                    style={{
                      height: 26,
                      padding: "0 12px",
                      borderRadius: 6,
                      backgroundColor: isSelected ? "#2DD4BF" : "rgba(255, 255, 255, 0.05)",
                      border: isSelected ? "none" : "1px solid rgba(255, 255, 255, 0.12)",
                      color: isSelected ? "#051614" : "#FFFFFF",
                      fontSize: 10.5,
                      fontWeight: 900,
                      letterSpacing: "0.04em",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 150ms ease",
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = "rgba(45, 212, 191, 0.15)";
                        e.currentTarget.style.borderColor = "rgba(45, 212, 191, 0.4)";
                        e.currentTarget.style.color = "#2DD4BF";
                      } else {
                        e.currentTarget.style.filter = "brightness(1.1)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
                        e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.12)";
                        e.currentTarget.style.color = "#FFFFFF";
                      } else {
                        e.currentTarget.style.filter = "brightness(1)";
                      }
                    }}
                  >
                    LAUNCH
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Version Configuration Modal */}
      {configuringVersionId && (
        <LauncherVersionConfigModal
          isOpen={!!configuringVersionId}
          versionId={configuringVersionId}
          onClose={() => setConfiguringVersionId(null)}
        />
      )}
    </div>
  );
};
