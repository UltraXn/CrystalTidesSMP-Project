import React, { useState, useEffect } from "react";
import { CrystalCard } from "./CrystalCard";
import { CrystalPageHeader } from "./CrystalPageHeader";
import {
  getProfiles,
  getActiveProfile,
  setSelectedProfileId,
  deleteProfile,
  cloneProfile,
  type Profile
} from "../services/profileService";
import { ProfileEditorDialog } from "./ProfileEditorDialog";

export const ProfileManagerPage: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);
  
  // Dialog state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = () => {
    const list = getProfiles();
    setProfiles(list);
    setActiveProfile(getActiveProfile());
  };

  const handleSetActive = (id: string) => {
    setSelectedProfileId(id);
    loadProfiles();
  };

  const handleCreateNew = () => {
    setEditingProfile(null);
    setIsEditorOpen(true);
  };

  const handleEdit = (profile: Profile) => {
    setEditingProfile(profile);
    setIsEditorOpen(true);
  };

  const handleClone = (id: string) => {
    try {
      cloneProfile(id);
      loadProfiles();
    } catch (err: any) {
      alert(err.message || "Error al clonar el perfil");
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (id === "default-profile-id") {
      alert("No se puede eliminar el perfil por defecto.");
      return;
    }
    const confirm = window.confirm(`¿Estás seguro de que deseas eliminar el perfil "${name}"? Esta acción no se puede deshacer.`);
    if (confirm) {
      try {
        deleteProfile(id);
        loadProfiles();
      } catch (err: any) {
        alert(err.message || "Error al eliminar el perfil");
      }
    }
  };

  return (
    <div style={{ padding: "24px 32px", display: "flex", flexDirection: "column", height: "100%", boxSizing: "border-box", overflowY: "auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <CrystalPageHeader
          eyebrow="Configuración"
          title="Gestión de Perfiles"
        />
        <button
          onClick={handleCreateNew}
          className="btn btn-primary"
          style={{
            height: 40,
            padding: "0 20px",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span>➕</span> Crear Perfil
        </button>
      </div>

      <div style={{ marginTop: 24, textAlign: "left" }}>
        <p style={{ margin: "0 0 24px 0", color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.6 }}>
          Crea perfiles independientes para jugar diferentes versiones de Minecraft o experimentar con distintos conjuntos de mods.
          El perfil seleccionado como <strong>Activo</strong> será el que se ejecute al pulsar JUGAR en la pantalla principal.
        </p>

        {/* Profiles Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
          {profiles.map((p) => {
            const isActive = activeProfile?.id === p.id;
            return (
              <CrystalCard
                key={p.id}
                style={{
                  padding: 20,
                  border: isActive ? "1px solid var(--accent)" : "1px solid var(--border-low)",
                  backgroundColor: isActive ? "rgba(45, 212, 191, 0.04)" : "rgba(255,255,255,0.01)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  minHeight: 180,
                }}
                enableHoverEffect
              >
                <div>
                  <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                    <span style={{
                      fontSize: 26,
                      padding: 10,
                      borderRadius: 12,
                      backgroundColor: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.05)",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 44,
                      height: 44,
                      boxSizing: "border-box",
                    }}>
                      {p.iconPath && (p.iconPath.startsWith("/") || p.iconPath.startsWith("http") || p.iconPath.includes(".")) ? (
                        <img src={p.iconPath} alt="Profile icon" style={{ width: 28, height: 28, objectFit: "contain" }} />
                      ) : (
                        p.iconPath || "🌊"
                      )}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <h4 style={{
                          margin: 0,
                          fontSize: 16,
                          fontWeight: "bold",
                          color: "#FFFFFF",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}>
                          {p.name}
                        </h4>
                        {isActive && (
                          <span style={{
                            fontSize: 9,
                            padding: "2px 8px",
                            borderRadius: 4,
                            backgroundColor: "var(--accent)",
                            color: "#000",
                            fontWeight: "bold",
                            letterSpacing: 0.5,
                          }}>
                            ACTIVO
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 4 }}>
                        MC {p.mcVersion} • {p.loaderType ? p.loaderType.toUpperCase() : "VANILLA"} {p.loaderVersion}
                      </div>
                    </div>
                  </div>

                  <div style={{
                    marginTop: 16,
                    fontSize: 12,
                    color: "rgba(255,255,255,0.35)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                  }}>
                    <div>💾 Aislamiento de carpetas: <strong>{p.isolateSaves ? "Activado" : "Desactivado"}</strong></div>
                    {p.lastUsed && (
                      <div>📅 Último uso: <strong>{new Date(p.lastUsed).toLocaleDateString()}</strong></div>
                    )}
                  </div>
                </div>

                <div style={{
                  marginTop: 20,
                  borderTop: "1px solid rgba(255,255,255,0.05)",
                  paddingTop: 12,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}>
                  {/* Action group left */}
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      onClick={() => handleEdit(p)}
                      title="Editar perfil"
                      style={{
                        padding: "6px 12px",
                        fontSize: 12,
                        borderRadius: 8,
                        backgroundColor: "rgba(255, 255, 255, 0.03)",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        color: "rgba(255, 255, 255, 0.7)",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.08)";
                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.03)";
                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                      }}
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => handleClone(p.id)}
                      title="Clonar perfil"
                      style={{
                        padding: "6px 10px",
                        fontSize: 12,
                        borderRadius: 8,
                        backgroundColor: "rgba(255, 255, 255, 0.03)",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        color: "rgba(255, 255, 255, 0.7)",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.08)";
                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.03)";
                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                      }}
                    >
                      👥 Clonar
                    </button>
                    {p.id !== "default-profile-id" && (
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        title="Eliminar perfil"
                        style={{
                          padding: "6px 10px",
                          fontSize: 12,
                          borderRadius: 8,
                          backgroundColor: "rgba(239, 68, 68, 0.03)",
                          border: "1px solid rgba(239, 68, 68, 0.15)",
                          color: "#FF8A8A",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.08)";
                          e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.4)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.03)";
                          e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.15)";
                        }}
                      >
                        🗑️
                      </button>
                    )}
                  </div>

                  {/* Set active toggle button */}
                  {!isActive && (
                    <button
                      onClick={() => handleSetActive(p.id)}
                      className="btn btn-secondary btn-sm"
                      style={{
                        padding: "6px 12px",
                        borderRadius: 8,
                      }}
                    >
                      Activar
                    </button>
                  )}
                </div>
              </CrystalCard>
            );
          })}
        </div>
      </div>

      {isEditorOpen && (
        <ProfileEditorDialog
          profile={editingProfile}
          onClose={() => setIsEditorOpen(false)}
          onSave={() => {
            setIsEditorOpen(false);
            loadProfiles();
          }}
        />
      )}
    </div>
  );
};
