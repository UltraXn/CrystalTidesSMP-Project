import React, { useState, useEffect } from "react";
import { Profile, createProfile, updateProfile } from "../services/profileService";
import { CrystalCard } from "./CrystalCard";
import { CrystalButton } from "./CrystalButton";
import {
  fetchVanillaVersions,
  fetchFabricLoaderVersions,
  fetchNeoForgeVersions,
  fetchForgeVersions,
} from "../services/minecraftMetadataService";
import { calculateRecommendedRam } from "../services/ramCalculator";

interface ProfileEditorDialogProps {
  profile?: Profile | null; // If null/undefined, we are in CREATE mode
  onClose: () => void;
  onSave: () => void;
}

const EMOJIS = ["🌊", "🎮", "🧱", "🧩", "🚀", "⚔️", "🛡️", "✨", "🔮", "⚙️"];

export const ProfileEditorDialog: React.FC<ProfileEditorDialogProps> = ({
  profile,
  onClose,
  onSave,
}) => {
  const isEdit = !!profile;

  // Form states
  const [name, setName] = useState("");
  const [iconPath, setIconPath] = useState("🌊");
  const [mcVersion, setMcVersion] = useState("1.21.1");
  const [loaderType, setLoaderType] = useState<"vanilla" | "neoforge" | "fabric" | "forge" | "">("neoforge");
  const [loaderVersion, setLoaderVersion] = useState("21.1.65");
  const [isolateSaves, setIsolateSaves] = useState(false);
  const [gameDir, setGameDir] = useState("");

  // Dynamic versions lists
  const [vanillaVersions, setVanillaVersions] = useState<string[]>([]);
  const [loaderVersions, setLoaderVersions] = useState<string[]>([]);
  const [isLoadingVersions, setIsLoadingVersions] = useState(false);
  
  // RAM Customization
  const [useCustomRam, setUseCustomRam] = useState(false);
  const [minRam, setMinRam] = useState(2048);
  const [maxRam, setMaxRam] = useState(4096);
  const [useOptimization, setUseOptimization] = useState(true);

  // Advanced
  const [javaArgs, setJavaArgs] = useState("");
  const [javaPath, setJavaPath] = useState("");

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setIconPath(profile.iconPath || "🌊");
      setMcVersion(profile.mcVersion);
      setLoaderType(profile.loaderType);
      setLoaderVersion(profile.loaderVersion || "");
      setIsolateSaves(profile.isolateSaves);
      setGameDir(profile.gameDir || "");
      setUseOptimization(profile.useOptimization);
      setJavaArgs(profile.javaArgs || "");
      setJavaPath(profile.javaPath || "");

      if (profile.minRam !== undefined || profile.maxRam !== undefined) {
        setUseCustomRam(true);
        setMinRam(profile.minRam || 2048);
        setMaxRam(profile.maxRam || 4096);
      }
    } else {
      setName("Nuevo Perfil");
      setIconPath("🌊");
      setMcVersion("1.21.1");
      setLoaderType("neoforge");
      setLoaderVersion("21.1.65");
      setIsolateSaves(false);
      setGameDir("");
      setUseCustomRam(false);
      setUseOptimization(true);
      setJavaArgs("");
      setJavaPath("");
    }
  }, [profile]);

  useEffect(() => {
    const loadMcVersions = async () => {
      try {
        const list = await fetchVanillaVersions();
        setVanillaVersions(list);
      } catch (err) {
        console.error("Error loading MC versions:", err);
      }
    };
    loadMcVersions();
  }, []);

  useEffect(() => {
    const loadLoaders = async () => {
      if (loaderType === "vanilla" || loaderType === "") {
        setLoaderVersions([]);
        setLoaderVersion("");
        return;
      }
      setIsLoadingVersions(true);
      try {
        let list: string[] = [];
        if (loaderType === "fabric") {
          list = await fetchFabricLoaderVersions();
        } else if (loaderType === "neoforge") {
          list = await fetchNeoForgeVersions(mcVersion);
        } else if (loaderType === "forge") {
          list = await fetchForgeVersions(mcVersion);
        }
        setLoaderVersions(list);
        
        if (list.length > 0) {
          setLoaderVersion((prevVersion) => {
            if (!profile || profile?.loaderType !== loaderType || !list.includes(prevVersion)) {
              return list[0];
            }
            return prevVersion;
          });
        } else {
          setLoaderVersion("");
        }
      } catch (err) {
        console.error("Error loading loader versions:", err);
      } finally {
        setIsLoadingVersions(false);
      }
    };
    loadLoaders();
  }, [mcVersion, loaderType, profile]);

  const handleSave = () => {
    if (!name.trim()) {
      alert("Por favor ingresa un nombre para el perfil.");
      return;
    }

    const payload = {
      name: name.trim(),
      iconPath,
      mcVersion,
      loaderType,
      loaderVersion,
      isolateSaves,
      gameDir: gameDir.trim() || undefined,
      useOptimization,
      javaArgs: javaArgs.trim() || undefined,
      javaPath: javaPath.trim() || undefined,
      minRam: useCustomRam ? minRam : undefined,
      maxRam: useCustomRam ? maxRam : undefined,
    };

    try {
      if (isEdit && profile) {
        updateProfile({
          ...profile,
          ...payload,
        });
      } else {
        createProfile(payload);
      }
      onSave();
      onClose();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Error al guardar el perfil";
      alert(errorMsg);
    }
  };

  const formSectionStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    textAlign: "left",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 11,
    color: "var(--text-muted)",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: 1,
  };

  return (
    <div className="modal-overlay">
      <CrystalCard
        className="modal-content"
        style={{
          width: 520,
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          padding: 0,
          overflow: "hidden",
        }}
        enableHoverEffect={false}
      >
        {/* Header */}
        <div
          style={{
            padding: "24px 32px",
            borderBottom: "1px solid var(--border-low)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: "bold", color: "#FFFFFF" }}>
            {isEdit ? "Editar Perfil" : "Crear Perfil"}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "rgba(255, 255, 255, 0.45)",
              fontSize: 18,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "var(--danger)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255, 255, 255, 0.45)"; }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div
          style={{
            padding: 32,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 20,
            flex: 1,
          }}
        >
          {/* General Section */}
          <div style={formSectionStyle}>
            <label style={labelStyle} htmlFor="profile-name-input">Nombre del Perfil</label>
            <input
              id="profile-name-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Aventura 1.20"
            />
          </div>

          <div style={formSectionStyle}>
            <span style={labelStyle}>Icono</span>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setIconPath(emoji)}
                  style={{
                    fontSize: 20,
                    padding: 8,
                    borderRadius: 8,
                    border: iconPath === emoji ? "1.5px solid var(--accent)" : "1.5px solid transparent",
                    backgroundColor: iconPath === emoji ? "rgba(22, 140, 128, 0.15)" : "rgba(255,255,255,0.02)",
                    cursor: "pointer",
                    transition: "all 150ms ease",
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Version Section */}
          <div style={{ display: "flex", gap: 16 }}>
            <div style={{ ...formSectionStyle, flex: 1 }}>
              <label style={labelStyle} htmlFor="mc-version-select">Versión de Minecraft</label>
              <select
                id="mc-version-select"
                value={mcVersion}
                onChange={(e) => setMcVersion(e.target.value)}
              >
                {vanillaVersions.length === 0 ? (
                  <>
                    <option value="1.21.1">1.21.1 (Recomendado)</option>
                    <option value="1.20.1">1.20.1</option>
                    <option value="1.19.4">1.19.4</option>
                  </>
                ) : (
                  vanillaVersions.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))
                )}
              </select>
            </div>
            <div style={{ ...formSectionStyle, flex: 1 }}>
              <label style={labelStyle} htmlFor="loader-type-select">Cargador (Mod Loader)</label>
              <select
                id="loader-type-select"
                value={loaderType}
                onChange={(e) => {
                  const type = e.target.value as "vanilla" | "neoforge" | "fabric" | "forge" | "";
                  setLoaderType(type);
                }}
              >
                <option value="neoforge">NeoForge</option>
                <option value="fabric">Fabric</option>
                <option value="forge">Forge</option>
                <option value="vanilla">Vanilla (Sin Mods)</option>
              </select>
            </div>
          </div>

          {loaderType !== "vanilla" && loaderType !== "" && (
            <div style={formSectionStyle}>
              <label style={labelStyle} htmlFor="loader-version-input">Versión del Cargador</label>
              {isLoadingVersions && (
                <select id="loader-version-input" disabled style={{ opacity: 0.7 }}>
                  <option>Cargando versiones...</option>
                </select>
              )}
              {!isLoadingVersions && loaderVersions.length === 0 && (
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    id="loader-version-input"
                    type="text"
                    value={loaderVersion}
                    onChange={(e) => setLoaderVersion(e.target.value)}
                    placeholder="Ej: 47.1.3"
                    style={{ flex: 1 }}
                  />
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", alignSelf: "center" }}>
                    ⚠️ Manual
                  </span>
                </div>
              )}
              {!isLoadingVersions && loaderVersions.length > 0 && (
                <select
                  id="loader-version-input"
                  value={loaderVersion}
                  onChange={(e) => setLoaderVersion(e.target.value)}
                >
                  {loaderVersions.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Isolation & Directory */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                type="checkbox"
                id="isolate-saves"
                checked={isolateSaves}
                onChange={(e) => setIsolateSaves(e.target.checked)}
                style={{ accentColor: "var(--primary)" }}
              />
              <label
                htmlFor="isolate-saves"
                style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", cursor: "pointer" }}
              >
                Aislar partidas y configuraciones de este perfil
              </label>
            </div>

            <div style={formSectionStyle}>
              <label style={labelStyle} htmlFor="game-dir-input">Directorio de Juego Personalizado (Opcional)</label>
              <input
                id="game-dir-input"
                type="text"
                value={gameDir}
                onChange={(e) => setGameDir(e.target.value)}
                placeholder="C:/Ruta/Personalizada/.crystaltides"
              />
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                Deja en blanco para usar la ubicación oficial del launcher (~/.crystaltides).
              </span>
            </div>
          </div>

          {/* Custom RAM */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 16 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                type="checkbox"
                id="custom-ram"
                checked={useCustomRam}
                onChange={(e) => setUseCustomRam(e.target.checked)}
                style={{ accentColor: "var(--primary)" }}
              />
              <label
                htmlFor="custom-ram"
                style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", cursor: "pointer" }}
              >
                Personalizar Memoria RAM
              </label>
            </div>

            {useCustomRam && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", gap: 16 }}>
                  <div style={{ ...formSectionStyle, flex: 1 }}>
                    <label style={labelStyle} htmlFor="min-ram-input">Mínima (MB)</label>
                    <input
                      id="min-ram-input"
                      type="number"
                      value={minRam}
                      onChange={(e) => setMinRam(Number(e.target.value))}
                    />
                  </div>
                  <div style={{ ...formSectionStyle, flex: 1 }}>
                    <label style={labelStyle} htmlFor="max-ram-input">Máxima (MB)</label>
                    <input
                      id="max-ram-input"
                      type="number"
                      value={maxRam}
                      onChange={(e) => setMaxRam(Number(e.target.value))}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const rec = calculateRecommendedRam();
                    setMinRam(rec.minRam);
                    setMaxRam(rec.maxRam);
                  }}
                  style={{
                    alignSelf: "flex-start",
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#2DD4BF",
                    background: "rgba(45, 212, 191, 0.12)",
                    border: "1px solid rgba(45, 212, 191, 0.3)",
                    borderRadius: 6,
                    padding: "5px 12px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  ⚡ Auto-calcular RAM Recomendada
                </button>
              </div>
            )}

            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                type="checkbox"
                id="use-optimization"
                checked={useOptimization}
                onChange={(e) => setUseOptimization(e.target.checked)}
                style={{ accentColor: "var(--primary)" }}
              />
              <label
                htmlFor="use-optimization"
                style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", cursor: "pointer" }}
              >
                Activar optimizaciones G1GC (Recomendado)
              </label>
            </div>
          </div>

          {/* Advanced Java */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 16 }}>
            <div style={formSectionStyle}>
              <label style={labelStyle} htmlFor="java-args-input">Argumentos JVM Personalizados</label>
              <input
                id="java-args-input"
                type="text"
                value={javaArgs}
                onChange={(e) => setJavaArgs(e.target.value)}
                placeholder="-XX:+UseG1GC ..."
              />
            </div>
            <div style={formSectionStyle}>
              <label style={labelStyle} htmlFor="java-path-input">Ruta de Java ejecutable (Opcional)</label>
              <input
                id="java-path-input"
                type="text"
                value={javaPath}
                onChange={(e) => setJavaPath(e.target.value)}
                placeholder="C:/Program Files/Java/.../java.exe"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: "20px 32px",
            borderTop: "1px solid var(--border-low)",
            display: "flex",
            justifyContent: "flex-end",
            gap: 12,
          }}
        >
          <CrystalButton text="Cancelar" variant="ghost" onPressed={onClose} />
          <CrystalButton text="Guardar" variant="primary" onPressed={handleSave} />
        </div>
      </CrystalCard>
    </div>
  );
};
