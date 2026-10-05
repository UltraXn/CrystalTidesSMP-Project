import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Gift, Save, RefreshCw } from 'lucide-react';
import { getAdminToken } from '../../services/adminAuth';
import { RoadmapDayCard } from './Roadmap/RoadmapDayCard';

export interface RoadmapDayConfig {
  day: number;
  title: string;
  reward_type: 'killucoins' | 'gacha_spin' | 'achievement';
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
      if (!res.ok) throw new Error('Failed to load roadmap config');
      const data = await res.json();
      return data.success && Array.isArray(data.data) ? data.data : [];
    },
    staleTime: 60_000,
  });

  const [daysOverride, setDaysOverride] = useState<RoadmapDayConfig[] | null>(null);
  const days = daysOverride ?? daysData;

  const handleChange = <K extends keyof RoadmapDayConfig>(
    index: number,
    field: K,
    value: RoadmapDayConfig[K],
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
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ days }),
      });
      if (!res.ok) {
        setMsg('❌ Error guardando configuración.');
        return;
      }
      const data = await res.json();
      if (data.success) {
        setMsg('✅ Configuración de Roadmap actualizada correctamente.');
      } else {
        setMsg('❌ Error guardando configuración.');
      }
    } catch (err) {
      console.error('Save error:', err);
      setMsg('❌ Error de conexión al guardar.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#2DD4BF' }}>
        <RefreshCw className="animate-spin" size={32} style={{ margin: '0 auto 12px' }} />
        Cargando Gestor de Recompensas del Roadmap...
      </div>
    );
  }

  return (
    <div style={{ padding: 24, color: '#F8FAFC' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: 22,
              color: '#2DD4BF',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <Gift size={24} /> Gestor de Recompensas y Roadmap Mensual (30 Días)
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
            Configura los KilluCoins, tiradas de Gacha y el Logro Único Legendario del Día 30 para
            el Launcher.
          </p>
        </div>

        <button
          aria-label="Guardar configuración del roadmap"
          aria-busy={saving}
          type="button"
          onClick={handleSave}
          disabled={saving}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 20px',
            borderRadius: 10,
            background: 'linear-gradient(135deg, #2DD4BF 0%, #0D9488 100%)',
            color: '#030712',
            fontWeight: 800,
            fontSize: 13,
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(45, 212, 191, 0.3)',
          }}
        >
          <Save size={16} aria-hidden="true" /> {saving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>

      {msg && (
        <output
          aria-live="polite"
          style={{
            display: 'block',
            padding: '12px 16px',
            borderRadius: 10,
            background: 'rgba(45,212,191,0.15)',
            border: '1px solid #2DD4BF',
            color: '#2DD4BF',
            marginBottom: 20,
            fontSize: 13,
          }}
        >
          {msg}
        </output>
      )}

      {/* Grid 30 días */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 16,
        }}
      >
        {days.map((day, idx) => (
          <RoadmapDayCard key={day.day} day={day} index={idx} onChange={handleChange} />
        ))}
      </div>
    </div>
  );
}
