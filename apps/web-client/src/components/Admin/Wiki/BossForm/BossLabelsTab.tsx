import React from 'react';
import { WikiArticle } from '../../../../services/wikiService';
import { BOSS_FORM_STYLES } from './BossFormStyles';

interface BossLabelsTabProps {
  formData: Partial<WikiArticle>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<WikiArticle>>>;
}

export function BossLabelsTab({ formData, setFormData }: Readonly<BossLabelsTabProps>) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
      <div>
        <label htmlFor="card-theme-select" style={BOSS_FORM_STYLES.label}>
          Tema de Color Visual (Card Theme)
        </label>
        <select
          id="card-theme-select"
          value={formData.card_theme ?? 'red'}
          onChange={(e) =>
            setFormData({
              ...formData,
              card_theme: e.target.value as
                | 'red'
                | 'emerald'
                | 'amber'
                | 'purple'
                | 'cyan'
                | 'slate',
            })
          }
          style={BOSS_FORM_STYLES.input}
        >
          <option value="red">🔴 Carmesí / Hostil (Rojo)</option>
          <option value="emerald">🟢 Esmeralda / Mascota (Verde)</option>
          <option value="amber">🟡 Ámbar / Mercader (Dorado)</option>
          <option value="purple">🟣 Imperial / Mítico (Púrpura)</option>
          <option value="cyan">🔵 Nether / Abisal (Cyan)</option>
          <option value="slate">⚙️ Neutro / Sistema (Gris)</option>
        </select>
      </div>
      <div>
        <label htmlFor="threat-label-input" style={BOSS_FORM_STYLES.label}>
          Título Cuadro 1 (Amenaza / Tipo)
        </label>
        <input
          id="threat-label-input"
          type="text"
          value={formData.threat_label ?? ''}
          onChange={(e) => setFormData({ ...formData, threat_label: e.target.value })}
          placeholder="ej. NIVEL DE AMENAZA / TEMPERAMENTO / MONEDA"
          style={BOSS_FORM_STYLES.input}
        />
      </div>
      <div>
        <label htmlFor="hp-label-input" style={BOSS_FORM_STYLES.label}>
          Título Cuadro 2 (Salud / Vida)
        </label>
        <input
          id="hp-label-input"
          type="text"
          value={formData.hp_label ?? ''}
          onChange={(e) => setFormData({ ...formData, hp_label: e.target.value })}
          placeholder="ej. SALUD DE COMBATE / SALUD DE MASCOTA"
          style={BOSS_FORM_STYLES.input}
        />
      </div>
      <div>
        <label htmlFor="damage-label-input" style={BOSS_FORM_STYLES.label}>
          Título Cuadro 3 (Ataque / Daño)
        </label>
        <input
          id="damage-label-input"
          type="text"
          value={formData.damage_label ?? ''}
          onChange={(e) => setFormData({ ...formData, damage_label: e.target.value })}
          placeholder="ej. PODER DE DAÑO / ESPECIALIDAD DE TIENDA"
          style={BOSS_FORM_STYLES.input}
        />
      </div>
      <div>
        <label htmlFor="speed-label-input" style={BOSS_FORM_STYLES.label}>
          Título Cuadro 4 (Velocidad / Marcha)
        </label>
        <input
          id="speed-label-input"
          type="text"
          value={formData.speed_label ?? ''}
          onChange={(e) => setFormData({ ...formData, speed_label: e.target.value })}
          placeholder="ej. VELOCIDAD / MARCHA / AGILIDAD DE VUELO"
          style={BOSS_FORM_STYLES.input}
        />
      </div>
      <div>
        <label htmlFor="location-label-input" style={BOSS_FORM_STYLES.label}>
          Título Hábitat / Ubicación
        </label>
        <input
          id="location-label-input"
          type="text"
          value={formData.location_label ?? ''}
          onChange={(e) => setFormData({ ...formData, location_label: e.target.value })}
          placeholder="ej. UBICACIÓN & APARICIÓN / HÁBITAT NATURAL"
          style={BOSS_FORM_STYLES.input}
        />
      </div>
      <div>
        <label htmlFor="drops-label-input" style={BOSS_FORM_STYLES.label}>
          Título Drops / Objetos
        </label>
        <input
          id="drops-label-input"
          type="text"
          value={formData.drops_label ?? ''}
          onChange={(e) => setFormData({ ...formData, drops_label: e.target.value })}
          placeholder="ej. BOTÍN DE CAZA / CATÁLOGO DE MERCADO"
          style={BOSS_FORM_STYLES.input}
        />
      </div>
      <div>
        <label htmlFor="bounty-label-input" style={BOSS_FORM_STYLES.label}>
          Título Pie de Página (Recompensa)
        </label>
        <input
          id="bounty-label-input"
          type="text"
          value={formData.bounty_label ?? ''}
          onChange={(e) => setFormData({ ...formData, bounty_label: e.target.value })}
          placeholder="ej. RECOMPENSA DE CAZA / RECOMPENSA IMPERIAL"
          style={BOSS_FORM_STYLES.input}
        />
      </div>
    </div>
  );
}
