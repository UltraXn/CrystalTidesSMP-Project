import React from 'react';
import { WikiArticle } from '../../../../services/wikiService';
import { BOSS_FORM_STYLES } from './BossFormStyles';

interface BossStatsTabProps {
  formData: Partial<WikiArticle>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<WikiArticle>>>;
}

export function BossStatsTab({ formData, setFormData }: Readonly<BossStatsTabProps>) {
  return (
    <div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr 1fr',
          gap: '0.8rem',
          marginBottom: '1rem',
        }}
      >
        <div>
          <label htmlFor="boss_hp_input" style={BOSS_FORM_STYLES.label}>
            Salud Fase 1 (HP)
          </label>
          <input
            id="boss_hp_input"
            type="text"
            value={formData.boss_hp ?? ''}
            onChange={(e) => setFormData({ ...formData, boss_hp: e.target.value })}
            placeholder="600 HP"
            style={BOSS_FORM_STYLES.input}
          />
        </div>
        <div>
          <label htmlFor="boss_hp_phase_2_input" style={BOSS_FORM_STYLES.label}>
            Salud Fase 2 (Enfurecido)
          </label>
          <input
            id="boss_hp_phase_2_input"
            type="text"
            value={formData.boss_hp_phase_2 ?? ''}
            onChange={(e) => setFormData({ ...formData, boss_hp_phase_2: e.target.value })}
            placeholder="800 HP (DarkenSky Activo)"
            style={BOSS_FORM_STYLES.input}
          />
        </div>
        <div>
          <label htmlFor="boss_damage_input" style={BOSS_FORM_STYLES.label}>
            Daño Base Fase 1
          </label>
          <input
            id="boss_damage_input"
            type="text"
            value={formData.boss_damage ?? ''}
            onChange={(e) => setFormData({ ...formData, boss_damage: e.target.value })}
            placeholder="35 (Efecto Wither)"
            style={BOSS_FORM_STYLES.input}
          />
        </div>
        <div>
          <label htmlFor="boss_damage_phase_2_input" style={BOSS_FORM_STYLES.label}>
            Daño Crítico Fase 2
          </label>
          <input
            id="boss_damage_phase_2_input"
            type="text"
            value={formData.boss_damage_phase_2 ?? ''}
            onChange={(e) => setFormData({ ...formData, boss_damage_phase_2: e.target.value })}
            placeholder="50 Daño Crítico"
            style={BOSS_FORM_STYLES.input}
          />
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1rem',
          marginBottom: '1rem',
        }}
      >
        <div>
          <label htmlFor="boss_armor_input" style={BOSS_FORM_STYLES.label}>
            Resistencia / Escudo Knockback
          </label>
          <input
            id="boss_armor_input"
            type="text"
            value={formData.boss_armor ?? ''}
            onChange={(e) => setFormData({ ...formData, boss_armor: e.target.value })}
            placeholder="1.0 Resistencia al Empuje"
            style={BOSS_FORM_STYLES.input}
          />
        </div>
        <div>
          <label htmlFor="boss_speed_input" style={BOSS_FORM_STYLES.label}>
            Velocidad & Rango de Agresión
          </label>
          <input
            id="boss_speed_input"
            type="text"
            value={formData.boss_speed ?? ''}
            onChange={(e) => setFormData({ ...formData, boss_speed: e.target.value })}
            placeholder="MovementSpeed 0.2 (Rango 64)"
            style={BOSS_FORM_STYLES.input}
          />
        </div>
      </div>

      <div>
        <label htmlFor="boss_immunities_input" style={BOSS_FORM_STYLES.label}>
          Inmunidades & Protecciones Especiales (separadas por comas)
        </label>
        <input
          id="boss_immunities_input"
          type="text"
          value={
            Array.isArray(formData.boss_immunities)
              ? formData.boss_immunities.join(', ')
              : (formData.boss_immunities ?? '')
          }
          onChange={(e) =>
            setFormData({
              ...formData,
              boss_immunities: e.target.value.split(',').map((s) => s.trim()),
            })
          }
          placeholder="Inmune a Proyectiles (Fase 2), Inmune a Fuego, Resistencia a Magia"
          style={BOSS_FORM_STYLES.input}
        />
      </div>
    </div>
  );
}
