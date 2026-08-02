import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Gift, Save, Trophy, RefreshCw } from "lucide-react";
import { getAdminToken } from "../../services/adminAuth";

export interface RoadmapDayConfig {
  day: number;
  title: string;
  reward_type: "killucoins" | "gacha_spin" | "achievement";
  reward_value: number;
  multiplier: number;
  is_jackpot?: boolean;
}

const API_URL = import.meta.env.VITE_API_URL || '/api';

export default function RoadmapAdminManager() {
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const { data: daysData = [], isLoading: loading } = useQuery<RoadmapDayConfig[]>({
    queryKey: ['roadmapAdminConfig'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/roadmap/config`);
      if (!res.ok) throw new Error("Failed to load roadmap config");
      const data = await res.json();
      return (data.success && Array.isArray(data.data)) ? data.data : [];
    },
    staleTime: 60_000,
  });

  const [daysOverride, setDaysOverride] = useState<RoadmapDayConfig[] | null>(null);
  const days = daysOverride ?? daysData;

  const handleChange = <K extends keyof RoadmapDayConfig>(
    index: number,
    field: K,
    value: RoadmapDayConfig[K]
  ) => {
    const updated = [...days];
    updated[index] = { ...updated[index], [field]: value };
    setDaysOverride(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    setMsg(null);
    try {
      const token = getAdminToken();
      const res = await fetch(`${API_URL}/roadmap/admin/config`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ days }),
      });
      if (!res.ok) {
        setMsg("❌ Error guardando configuración.");
        return;
      }
      const data = await res.json();
      if (data.success) {
        setMsg("✅ Configuración de Roadmap actualizada correctamente.");
      } else {
        setMsg("❌ Error guardando configuración.");
      }
    } catch (err) {
      console.error("Save error:", err);
      setMsg("❌ Error de conexión al guardar.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "#2DD4BF" }}>
        <RefreshCw className="animate-spin" size={32} style={{ margin: "0 auto 12px" }} />
        Cargando Gestor de Recompensas del Roadmap...
      </div>
    );
  }

  return (
    <div style={{ padding: 24, color: "#F8FAFC" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, color: "#2DD4BF", display: "flex", alignItems: "center", gap: 10 }}>
            <Gift size={24} /> Gestor de Recompensas y Roadmap Mensual (30 Días)
          </h2>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
            Configura los KilluCoins, tiradas de Gacha y el Logro Único Legendario del Día 30 para el Launcher.
          </p>
        </div>

        <button aria-label="Action" type="button"
          onClick={handleSave}
          disabled={saving}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 20px",
            borderRadius: 10,
            background: "linear-gradient(135deg, #2DD4BF 0%, #0D9488 100%)",
            color: "#030712",
            fontWeight: 800,
            fontSize: 13,
            border: "none",
            cursor: "pointer",
            boxShadow: "0 4px 16px rgba(45, 212, 191, 0.3)",
          }}
        >
          <Save size={16} /> {saving ? "Guardando..." : "Guardar Cambios"}
        </button>
      </div>

      {msg && (
        <div style={{ padding: "12px 16px", borderRadius: 10, background: "rgba(45,212,191,0.15)", border: "1px solid #2DD4BF", color: "#2DD4BF", marginBottom: 20, fontSize: 13 }}>
          {msg}
        </div>
      )}

      {/* Grid 30 días */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
        {days.map((day, idx) => (
          <div
            key={day.day}
            style={{
              padding: 16,
              borderRadius: 14,
              backgroundColor: day.day === 30 ? "rgba(177, 80, 179, 0.18)" : "rgba(15, 23, 42, 0.6)",
              border: day.day === 30 ? "1.5px solid #B150B3" : "1px solid rgba(255,255,255,0.1)",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 800, fontSize: 13, color: day.day === 30 ? "#E879F9" : "#2DD4BF", display: "flex", alignItems: "center", gap: 6 }}>
                {day.day === 30 ? <Trophy size={16} /> : <Calendar size={14} />} Día {day.day}
              </span>
              {day.day === 30 && (
                <span style={{ fontSize: 10, fontWeight: 800, background: "#B150B3", color: "#FFF", padding: "2px 8px", borderRadius: 10 }}>
                  JACKPOT X50
                </span>
              )}
            </div>

            <div>
              <label htmlFor={`roadmap-day-${day.day}-title`} style={{ fontSize: 10.5, color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>Título</label>
              <input id={`roadmap-day-${day.day}-title`}
                type="text"
                value={day.title}
                onChange={(e) => handleChange(idx, "title", e.target.value)}
                style={{ width: "100%", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6, padding: "6px 10px", color: "#FFF", fontSize: 12, marginTop: 2, boxSizing: "border-box" }}
              />
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ flex: 1 }}>
                <label htmlFor={`roadmap-day-${day.day}-type`} style={{ fontSize: 10.5, color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>Tipo</label>
                <select id={`roadmap-day-${day.day}-type`}
                  value={day.reward_type}
                  onChange={(e) => handleChange(idx, "reward_type", e.target.value as RoadmapDayConfig["reward_type"])}
                  style={{ width: "100%", background: "#0F172A", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6, padding: "6px 8px", color: "#FFF", fontSize: 11.5, marginTop: 2, boxSizing: "border-box" }}
                >
                  <option value="killucoins">KilluCoins</option>
                  <option value="gacha_spin">Tirada Gacha</option>
                  <option value="achievement">Logro Único</option>
                </select>
              </div>

              <div style={{ flex: 1 }}>
                <label htmlFor={`roadmap-day-${day.day}-value`} style={{ fontSize: 10.5, color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>Valor Base</label>
                <input id={`roadmap-day-${day.day}-value`}
                  type="number"
                  value={day.reward_value}
                  onChange={(e) => handleChange(idx, "reward_value", e.target.value ? Number(e.target.value) : 0)}
                  style={{ width: "100%", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6, padding: "6px 8px", color: "#FFF", fontSize: 12, marginTop: 2, boxSizing: "border-box" }}
                />
              </div>

              <div style={{ width: 64 }}>
                <label htmlFor={`roadmap-day-${day.day}-multiplier`} style={{ fontSize: 10.5, color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>Mult.</label>
                <input id={`roadmap-day-${day.day}-multiplier`}
                  type="number"
                  value={day.multiplier}
                  onChange={(e) => handleChange(idx, "multiplier", e.target.value ? Number(e.target.value) : 1)}
                  style={{ width: "100%", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6, padding: "6px 8px", color: "#2DD4BF", fontWeight: 700, fontSize: 12, marginTop: 2, boxSizing: "border-box" }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
