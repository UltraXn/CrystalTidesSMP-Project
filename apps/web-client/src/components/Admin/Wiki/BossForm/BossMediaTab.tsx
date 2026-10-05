import React from 'react';
import { Loader2, Upload } from 'lucide-react';
import { WikiArticle } from '../../../../services/wikiService';
import { BOSS_FORM_STYLES } from './BossFormStyles';

interface BossMediaTabProps {
  formData: Partial<WikiArticle>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<WikiArticle>>>;
  uploadingField: string | null;
  handleFileUpload: (file: File, fieldName: keyof WikiArticle, folder: string) => Promise<void>;
}

export function BossMediaTab({
  formData,
  setFormData,
  uploadingField,
  handleFileUpload,
}: Readonly<BossMediaTabProps>) {
  return (
    <div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1rem',
          marginBottom: '1rem',
        }}
      >
        <div>
          <label htmlFor="boss_location_input" style={BOSS_FORM_STYLES.label}>
            Hábitat / Dimensión / Mazmorra
          </label>
          <input
            id="boss_location_input"
            type="text"
            value={formData.boss_location ?? ''}
            onChange={(e) => setFormData({ ...formData, boss_location: e.target.value })}
            placeholder="ej. Nether / Mazmorra del Sculk / End Citadel"
            style={BOSS_FORM_STYLES.input}
          />
        </div>

        <div>
          <label htmlFor="boss_spawn_method_input" style={BOSS_FORM_STYLES.label}>
            Método de Aparición / Ritual
          </label>
          <input
            id="boss_spawn_method_input"
            type="text"
            value={formData.boss_spawn_method ?? ''}
            onChange={(e) => setFormData({ ...formData, boss_spawn_method: e.target.value })}
            placeholder="ej. Altar Wither + 3 Almas Ancestrales"
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
          <label htmlFor="boss_spawn_command_input" style={BOSS_FORM_STYLES.label}>
            Comando de Invocación Staff / Admin
          </label>
          <input
            id="boss_spawn_command_input"
            type="text"
            value={formData.boss_spawn_command ?? ''}
            onChange={(e) => setFormData({ ...formData, boss_spawn_command: e.target.value })}
            placeholder="ej. /mm mobs spawn ToroWither 1 Nether"
            style={BOSS_FORM_STYLES.input}
          />
        </div>

        <div>
          <label htmlFor="boss_kc_reward_input" style={BOSS_FORM_STYLES.label}>
            Recompensa de Monedas / KC Reward
          </label>
          <input
            id="boss_kc_reward_input"
            type="number"
            value={formData.boss_kc_reward ?? 4500}
            onChange={(e) => {
              const raw = e.target.value;
              const val = raw === '' ? 0 : Number.parseInt(raw, 10);
              setFormData({ ...formData, boss_kc_reward: Number.isNaN(val) ? 0 : val });
            }}
            placeholder="4500"
            style={BOSS_FORM_STYLES.input}
          />
        </div>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="boss_drops_input" style={BOSS_FORM_STYLES.label}>
          Catálogo de Drops & Botín de Caza (separados por comas)
        </label>
        <input
          id="boss_drops_input"
          type="text"
          value={
            Array.isArray(formData.boss_drops)
              ? formData.boss_drops.join(', ')
              : (formData.boss_drops ?? '')
          }
          onChange={(e) =>
            setFormData({ ...formData, boss_drops: e.target.value.split(',').map((s) => s.trim()) })
          }
          placeholder="Estrella del Nether (100%), Fragmento Mítico (45%), Corazón Abisal"
          style={BOSS_FORM_STYLES.input}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <label htmlFor="boss_music_url_input" style={BOSS_FORM_STYLES.label}>
            Música de Fondo / Tema de Combate (.ogg / .mp3)
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              id="boss_music_url_input"
              type="text"
              value={formData.boss_music_url ?? ''}
              onChange={(e) => setFormData({ ...formData, boss_music_url: e.target.value })}
              placeholder="/audio/boss_theme.ogg"
              style={BOSS_FORM_STYLES.inputFlex}
            />
            <label style={BOSS_FORM_STYLES.uploadButton}>
              {uploadingField === 'boss_music_url' ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Upload className="size-3.5" />
              )}
              <span>{uploadingField === 'boss_music_url' ? 'Subiendo...' : 'Subir Audio'}</span>
              <input
                type="file"
                accept=".mp3,.ogg,.wav"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, 'boss_music_url', 'audio');
                }}
              />
            </label>
          </div>
        </div>

        <div>
          <label htmlFor="boss_sound_spawn_input" style={BOSS_FORM_STYLES.label}>
            Líneas de Voz / Rugidos Míticos
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              id="boss_sound_spawn_input"
              type="text"
              value={formData.boss_sound_spawn ?? ''}
              onChange={(e) => setFormData({ ...formData, boss_sound_spawn: e.target.value })}
              placeholder="/audio/roar.ogg"
              style={BOSS_FORM_STYLES.inputFlex}
            />
            <label style={BOSS_FORM_STYLES.uploadButton}>
              {uploadingField === 'boss_sound_spawn' ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Upload className="size-3.5" />
              )}
              <span>{uploadingField === 'boss_sound_spawn' ? 'Subiendo...' : 'Subir Rugido'}</span>
              <input
                type="file"
                accept=".mp3,.ogg,.wav"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, 'boss_sound_spawn', 'audio');
                }}
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
