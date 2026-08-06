import React, { useState, useEffect, useRef } from "react";
import {
  Profile,
  getProfiles,
  getActiveProfile,
  setSelectedProfileId,
  cloneProfile,
  deleteProfile,
} from "../services/profileService";
import { getSettings } from "../services/settingsService";

interface ProfileSelectorProps {
  onEditProfile: (profile: Profile) => void;
  onCreateProfile: () => void;
  onProfileChanged?: () => void;
}

export const ProfileSelector: React.FC<ProfileSelectorProps> = ({
  onEditProfile,
  onCreateProfile,
  onProfileChanged,
}) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadData = () => {
    const list = getProfiles();
    const active = getActiveProfile();
    setProfiles(list);
    setActiveProfile(active);
  };

  useEffect(() => {
    loadData();

    // Listen to clicks outside to close the dropdown
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleSelect = (profileId: string) => {
    setSelectedProfileId(profileId);
    loadData();
    setIsOpen(false);
    onProfileChanged?.();
  };

  const handleClone = (e: React.MouseEvent, profileId: string) => {
    e.stopPropagation();
    try {
      cloneProfile(profileId);
      loadData();
      onProfileChanged?.();
    } catch (err: unknown) {
      alert(`Error al clonar el perfil: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const handleDelete = (e: React.MouseEvent, profileId: string) => {
    e.stopPropagation();
    if (confirm("¿Estás seguro de que deseas eliminar este perfil?")) {
      try {
        deleteProfile(profileId);
        loadData();
        onProfileChanged?.();
      } catch (err: unknown) {
        alert(err instanceof Error ? err.message : "Error al eliminar el perfil");
      }
    }
  };

  return (
    <div
      ref={dropdownRef}
      style={{
        position: "relative",
        display: "inline-block",
      }}
    >
      {/* Current Active Profile Bar — chip v2 */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 11,
          padding: "0 16px 0 13px",
          height: 62,
          boxSizing: "border-box",
          borderRadius: 14,
          backgroundColor: "rgba(255, 255, 255, 0.03)",
          border: "1px solid var(--border-low)",
          cursor: "pointer",
          userSelect: "none",
          minWidth: 235,
          transition: "border-color 150ms ease, background-color 150ms ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)";
          e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "var(--border-low)";
          e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.03)";
        }}
      >
        <span style={{
          width: 34,
          height: 34,
          minWidth: 34,
          borderRadius: 10,
          background: "rgba(45, 212, 191, 0.12)",
          border: "1px solid rgba(45, 212, 191, 0.22)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 17,
        }}>
          {activeProfile?.iconPath && (activeProfile.iconPath.startsWith("/") || activeProfile.iconPath.startsWith("http") || activeProfile.iconPath.includes(".")) ? (
            <img src={activeProfile.iconPath} alt="Profile icon" style={{ width: 20, height: 20, objectFit: "contain" }} />
          ) : (
            activeProfile?.iconPath || "🌊"
          )}
        </span>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", minWidth: 0 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#FFFFFF", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 140 }}>
            {activeProfile?.name || "Cargando..."}
          </span>
          <span style={{ fontSize: 10.5, color: "rgba(255, 255, 255, 0.5)", marginTop: 1 }}>
            {activeProfile?.mcVersion} · {activeProfile?.loaderType || "Vanilla"} · {activeProfile?.maxRam ? (activeProfile.maxRam > 100 ? `${activeProfile.maxRam / 1024} GB` : `${activeProfile.maxRam} GB`) : `${getSettings().maxRam > 100 ? getSettings().maxRam / 1024 : getSettings().maxRam} GB`}
          </span>
        </div>
        <svg style={{ marginLeft: "auto", flexShrink: 0, opacity: 0.5 }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {/* Dropdown List */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            bottom: "110%",
            left: 0,
            width: 280,
            maxHeight: 350,
            overflowY: "auto",
            backgroundColor: "rgba(14, 16, 21, 0.85)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1.5px solid var(--border-medium)",
            borderRadius: 16,
            boxShadow: "0 12px 36px rgba(0,0,0,0.6)",
            zIndex: 1000,
            padding: 8,
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          <div
            style={{
              padding: "6px 8px",
              fontSize: 11,
              fontWeight: "bold",
              color: "rgba(255,255,255,0.4)",
              textTransform: "uppercase",
              letterSpacing: 1,
              borderBottom: "1px solid rgba(255,255,255,0.05)",
              marginBottom: 4,
            }}
          >
            Selecciona un Perfil
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1, overflowY: "auto" }}>
            {profiles.map((p) => {
              const isActive = activeProfile?.id === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => handleSelect(p.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 10px",
                    borderRadius: 10,
                    cursor: "pointer",
                    backgroundColor: isActive ? "rgba(22, 140, 128, 0.12)" : "transparent",
                    transition: "background-color 150ms ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.04)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
                    <span style={{ fontSize: 18, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                      {p.iconPath && (p.iconPath.startsWith("/") || p.iconPath.startsWith("http") || p.iconPath.includes(".")) ? (
                        <img src={p.iconPath} alt="Icon" style={{ width: 18, height: 18, objectFit: "contain" }} />
                      ) : (
                        p.iconPath || "🌊"
                      )}
                    </span>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: "bold",
                          color: isActive ? "var(--accent)" : "#FFFFFF",
                        }}
                      >
                        {p.name}
                      </span>
                      <span style={{ fontSize: 10, color: "rgba(255, 255, 255, 0.4)" }}>
                        {p.mcVersion} ({p.loaderType || "vanilla"})
                      </span>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div style={{ display: "flex", gap: 4 }} onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => {
                        setIsOpen(false);
                        onEditProfile(p);
                      }}
                      title="Editar perfil"
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: 12,
                        padding: 4,
                        color: "rgba(255,255,255,0.6)",
                      }}
                    >
                      ✏️
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleClone(e, p.id)}
                      title="Clonar perfil"
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: 12,
                        padding: 4,
                        color: "rgba(255,255,255,0.6)",
                      }}
                    >
                      👥
                    </button>
                    {p.id !== "default-profile-id" && (
                      <button
                        type="button"
                        onClick={(e) => handleDelete(e, p.id)}
                        title="Eliminar perfil"
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontSize: 12,
                          padding: 4,
                          color: "var(--danger)",
                        }}
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onCreateProfile();
            }}
            style={{
              marginTop: 6,
              padding: "10px 0",
              width: "100%",
              backgroundColor: "rgba(22, 140, 128, 0.1)",
              border: "1px dashed var(--primary)",
              color: "var(--accent)",
              borderRadius: 10,
              cursor: "pointer",
              fontSize: 12,
              fontWeight: "bold",
              transition: "all 150ms ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(22, 140, 128, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(22, 140, 128, 0.1)";
            }}
          >
            ➕ Nuevo Perfil
          </button>
        </div>
      )}
    </div>
  );
};
