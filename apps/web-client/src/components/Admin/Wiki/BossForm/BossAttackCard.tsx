const BOX_BORDER_BOX: React.CSSProperties['boxSizing'] = 'border-box';
const DARK_BG = 'rgba(0,0,0,0.4)';
const WHITE_BORDER_10 = '1px solid rgba(255,255,255,0.1)';

interface VariantClipButtonProps {
  clip: string;
  isSelected: boolean;
  onToggle: (clip: string) => void;
}

export function VariantClipButton({
  clip,
  isSelected,
  onToggle,
}: Readonly<VariantClipButtonProps>) {
  return (
    <button
      type="button"
      onClick={() => onToggle(clip)}
      style={{
        background: isSelected ? 'rgba(168, 85, 247, 0.25)' : DARK_BG,
        border: isSelected ? '1px solid rgba(168, 85, 247, 0.6)' : WHITE_BORDER_10,
        color: isSelected ? '#e9d5ff' : '#94a3b8',
        borderRadius: '4px',
        padding: '0.15rem 0.35rem',
        fontSize: '0.67rem',
        cursor: 'pointer',
        fontWeight: isSelected ? 'bold' : 'normal',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.2rem',
      }}
      title={isSelected ? `Quitar variante ${clip}` : `Añadir variante ${clip}`}
    >
      {isSelected ? '✓' : '+'} 🎬 {clip}
    </button>
  );
}

export interface BossAttack {
  name: string;
  type: string;
  damage: string;
  description: string;
  animation_clip?: string;
  variant_clips?: string[];
}

interface BossAttackCardProps {
  attack: BossAttack;
  attackIdx: number;
  phaseIdx: number;
  detectedClips: string[];
  onUpdateAttack: (field: string, value: string | string[]) => void;
  onRemoveAttack: () => void;
  onPreviewClip: (clip: string) => void;
}

export function BossAttackCard({
  attack,
  attackIdx,
  phaseIdx,
  detectedClips,
  onUpdateAttack,
  onRemoveAttack,
  onPreviewClip,
}: Readonly<BossAttackCardProps>) {
  return (
    <div
      style={{
        background: 'rgba(0,0,0,0.3)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '6px',
        padding: '0.6rem',
        marginBottom: '0.6rem',
        width: '100%',
        boxSizing: BOX_BORDER_BOX,
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'minmax(0, 1.2fr) minmax(0, 1.2fr) minmax(0, 0.9fr) minmax(0, 0.8fr) auto auto',
          gap: '0.4rem',
          marginBottom: '0.4rem',
          alignItems: 'center',
          width: '100%',
        }}
      >
        <input
          type="text"
          aria-label="Nombre de Habilidad"
          placeholder="Nombre (ej. Shoot)"
          value={attack.name}
          onChange={(e) => onUpdateAttack('name', e.target.value)}
          style={{
            width: '100%',
            minWidth: 0,
            background: DARK_BG,
            border: WHITE_BORDER_10,
            borderRadius: '4px',
            padding: '0.35rem 0.4rem',
            color: '#fff',
            fontSize: '0.75rem',
            boxSizing: BOX_BORDER_BOX,
          }}
        />

        {detectedClips.length > 0 ? (
          <select
            aria-label="Clip de animación del ataque"
            value={attack.animation_clip ?? ''}
            onChange={(e) => onUpdateAttack('animation_clip', e.target.value)}
            style={{
              width: '100%',
              minWidth: 0,
              background: 'rgba(0,0,0,0.5)',
              border: '1px solid rgba(239,68,68,0.4)',
              borderRadius: '4px',
              padding: '0.35rem 0.4rem',
              color: '#fca5a5',
              fontSize: '0.75rem',
              fontWeight: 'bold',
              boxSizing: BOX_BORDER_BOX,
            }}
          >
            <option value="">-- Clip GLTF --</option>
            {detectedClips.map((clip) => (
              <option key={clip} value={clip}>
                🎬 {clip}
              </option>
            ))}
          </select>
        ) : (
          <div style={{ width: '100%', minWidth: 0 }}>
            <input
              type="text"
              aria-label="Clip de Animación GLTF"
              list={`gltf-clips-datalist-${phaseIdx}-${attackIdx}`}
              placeholder="Clip GLTF"
              value={attack.animation_clip ?? ''}
              onChange={(e) => onUpdateAttack('animation_clip', e.target.value)}
              style={{
                width: '100%',
                minWidth: 0,
                background: DARK_BG,
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: '4px',
                padding: '0.35rem 0.4rem',
                color: '#fca5a5',
                fontSize: '0.75rem',
                boxSizing: BOX_BORDER_BOX,
              }}
            />
            <datalist id={`gltf-clips-datalist-${phaseIdx}-${attackIdx}`}>
              {[
                'idle',
                'attack',
                'shoot',
                'walk',
                'head_off',
                'spawn',
                'smash',
                'roundhouse',
                'claw1',
                'claw2',
                'wither_pool',
              ].map((c) => (
                <option key={c} value={c} label={c}>
                  {c}
                </option>
              ))}
            </datalist>
          </div>
        )}

        <select
          aria-label="Tipo de ataque"
          value={attack.type}
          onChange={(e) => onUpdateAttack('type', e.target.value)}
          style={{
            width: '100%',
            minWidth: 0,
            background: DARK_BG,
            border: WHITE_BORDER_10,
            borderRadius: '4px',
            padding: '0.35rem 0.3rem',
            color: '#fff',
            fontSize: '0.75rem',
            boxSizing: BOX_BORDER_BOX,
          }}
        >
          <option value="Proyectil">Proyectil</option>
          <option value="AoE">AoE</option>
          <option value="Melee">Melee</option>
          <option value="Defensa">Defensa</option>
          <option value="Canalizado">Canalizado</option>
          <option value="Invocación">Invocación</option>
        </select>

        <input
          type="text"
          aria-label="Daño de Habilidad"
          placeholder="Daño"
          value={attack.damage}
          onChange={(e) => onUpdateAttack('damage', e.target.value)}
          style={{
            width: '100%',
            minWidth: 0,
            background: DARK_BG,
            border: WHITE_BORDER_10,
            borderRadius: '4px',
            padding: '0.35rem 0.4rem',
            color: '#fff',
            fontSize: '0.75rem',
            boxSizing: BOX_BORDER_BOX,
          }}
        />

        <button
          type="button"
          title="Probar esta animación en el visor 3D"
          onClick={() => onPreviewClip(attack.animation_clip ?? 'idle')}
          style={{
            background: 'rgba(59, 130, 246, 0.3)',
            border: '1px solid rgba(59, 130, 246, 0.5)',
            color: '#bfdbfe',
            padding: '0.35rem 0.5rem',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.7rem',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '0.2rem',
            whiteSpace: 'nowrap',
          }}
        >
          ▶️ Probar
        </button>

        <button
          type="button"
          title="Eliminar esta habilidad"
          onClick={onRemoveAttack}
          style={{
            background: 'rgba(239, 68, 68, 0.3)',
            border: '1px solid rgba(239, 68, 68, 0.5)',
            color: '#fca5a5',
            padding: '0.35rem 0.55rem',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
          }}
        >
          🗑️
        </button>
      </div>

      <input
        type="text"
        aria-label="Descripción detallada de la habilidad"
        placeholder="Descripción detallada de la habilidad..."
        value={attack.description}
        onChange={(e) => onUpdateAttack('description', e.target.value)}
        style={{
          width: '100%',
          background: DARK_BG,
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '4px',
          padding: '0.35rem 0.5rem',
          color: '#ccc',
          fontSize: '0.73rem',
          boxSizing: BOX_BORDER_BOX,
        }}
      />

      {detectedClips.length > 0 && (
        <div
          style={{
            marginTop: '0.4rem',
            paddingTop: '0.4rem',
            borderTop: '1px solid rgba(255,255,255,0.05)',
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.3rem',
          }}
        >
          <span
            style={{
              fontSize: '0.68rem',
              color: '#94a3b8',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '0.2rem',
            }}
          >
            🔁 Variantes / Combos:
          </span>
          {detectedClips
            .filter((c) => c !== attack.animation_clip)
            .map((clip) => {
              const currentVariants = attack.variant_clips || [];
              const isSelected = currentVariants.includes(clip);
              return (
                <VariantClipButton
                  key={`variant-${clip}`}
                  clip={clip}
                  isSelected={isSelected}
                  onToggle={(toggledClip) => {
                    const nextVariants = isSelected
                      ? currentVariants.filter((v) => v !== toggledClip)
                      : [...currentVariants, toggledClip];
                    onUpdateAttack('variant_clips', nextVariants);
                    onPreviewClip(toggledClip);
                  }}
                />
              );
            })}
        </div>
      )}
    </div>
  );
}
