import { Loader2, Film } from 'lucide-react';
import { WikiArticle } from '../../../../services/wikiService';

const BOX_BORDER_BOX = 'border-box' as const;
const DARK_BG = 'rgba(0,0,0,0.4)';
const WHITE_BORDER_10 = '1px solid rgba(255,255,255,0.1)';

type BossPhase = NonNullable<WikiArticle['boss_phases']>[number];

interface BossPhaseConfigProps {
  activePhase: BossPhase;
  phaseIdx: number;
  totalPhases: number;
  loadingClips: boolean;
  detectedClips: string[];
  previewClip: string | null;
  onUpdatePhaseField: (field: string, value: unknown) => void;
  onRemovePhase: () => void;
  onAssignClip: (clipName: string) => void;
}

export function BossPhaseConfig({
  activePhase,
  phaseIdx,
  totalPhases,
  loadingClips,
  detectedClips,
  previewClip,
  onUpdatePhaseField,
  onRemovePhase,
  onAssignClip,
}: BossPhaseConfigProps) {
  return (
    <div
      style={{
        background: 'rgba(0,0,0,0.3)',
        border: '1px solid rgba(255,255,255,0.08)',
        padding: '0.9rem',
        borderRadius: '8px',
        marginBottom: '1rem',
        width: '100%',
        boxSizing: BOX_BORDER_BOX,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.8rem',
        }}
      >
        <span
          style={{
            fontSize: '0.8rem',
            fontWeight: 'bold',
            color: '#fca5a5',
            textTransform: 'uppercase',
          }}
        >
          Configuración de {activePhase.phase_name || `Fase ${activePhase.phase_number}`}
        </span>
        {totalPhases > 1 && (
          <button
            type="button"
            onClick={onRemovePhase}
            style={{
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#fca5a5',
              padding: '0.25rem 0.5rem',
              borderRadius: '4px',
              fontSize: '0.7rem',
              cursor: 'pointer',
            }}
          >
            🗑️ Eliminar Fase {activePhase.phase_number || phaseIdx + 1}
          </button>
        )}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.6rem',
          marginBottom: '0.8rem',
        }}
      >
        <div>
          <span
            style={{
              display: 'block',
              fontSize: '0.68rem',
              color: '#aaa',
              marginBottom: '0.2rem',
            }}
          >
            Nombre de la Fase
          </span>
          <input
            type="text"
            aria-label="Nombre de la Fase"
            value={activePhase.phase_name}
            onChange={(e) => onUpdatePhaseField('phase_name', e.target.value)}
            placeholder="Fase I: Voladora"
            style={{
              width: '100%',
              background: DARK_BG,
              border: WHITE_BORDER_10,
              borderRadius: '4px',
              padding: '0.4rem',
              color: '#fff',
              fontSize: '0.8rem',
              boxSizing: BOX_BORDER_BOX,
            }}
          />
        </div>
        <div>
          <span
            style={{
              display: 'block',
              fontSize: '0.68rem',
              color: '#aaa',
              marginBottom: '0.2rem',
            }}
          >
            Modelo 3D GLTF de la Fase
          </span>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <input
              type="text"
              aria-label="Modelo 3D GLTF de la Fase"
              value={activePhase.model_3d_url ?? ''}
              onChange={(e) => onUpdatePhaseField('model_3d_url', e.target.value)}
              placeholder="/models/boss_phase.gltf"
              style={{
                flex: 1,
                background: DARK_BG,
                border: WHITE_BORDER_10,
                borderRadius: '4px',
                padding: '0.4rem',
                color: '#fff',
                fontSize: '0.8rem',
                boxSizing: BOX_BORDER_BOX,
              }}
            />
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.6rem',
          marginBottom: '0.8rem',
        }}
      >
        <div>
          <span
            style={{
              display: 'block',
              fontSize: '0.68rem',
              color: '#aaa',
              marginBottom: '0.2rem',
            }}
          >
            Salud HP de Fase
          </span>
          <input
            type="text"
            aria-label="Salud HP de Fase"
            value={activePhase.hp ?? ''}
            onChange={(e) => onUpdatePhaseField('hp', e.target.value)}
            placeholder="600 HP"
            style={{
              width: '100%',
              background: DARK_BG,
              border: WHITE_BORDER_10,
              borderRadius: '4px',
              padding: '0.4rem',
              color: '#fff',
              fontSize: '0.8rem',
              boxSizing: BOX_BORDER_BOX,
            }}
          />
        </div>
        <div>
          <span
            style={{
              display: 'block',
              fontSize: '0.68rem',
              color: '#aaa',
              marginBottom: '0.2rem',
            }}
          >
            Daño de Fase
          </span>
          <input
            type="text"
            aria-label="Daño de Fase"
            value={activePhase.damage ?? ''}
            onChange={(e) => onUpdatePhaseField('damage', e.target.value)}
            placeholder="35 Daño"
            style={{
              width: '100%',
              background: DARK_BG,
              border: WHITE_BORDER_10,
              borderRadius: '4px',
              padding: '0.4rem',
              color: '#fff',
              fontSize: '0.8rem',
              boxSizing: BOX_BORDER_BOX,
            }}
          />
        </div>
      </div>

      <div
        style={{
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid rgba(59, 130, 246, 0.25)',
          padding: '0.5rem 0.7rem',
          borderRadius: '6px',
          marginBottom: '0.8rem',
        }}
      >
        <div
          style={{
            fontSize: '0.68rem',
            fontWeight: 'bold',
            color: '#93c5fd',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '0.4rem',
          }}
        >
          <Film className="size-3.5 text-blue-400" />
          Clips GLTF Detectados ({detectedClips.length}):
        </div>

        {loadingClips && (
          <span
            style={{
              fontSize: '0.7rem',
              color: '#60a5fa',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}
          >
            <Loader2 className="size-3 animate-spin" /> Escaneando animaciones 3D...
          </span>
        )}

        {!loadingClips && detectedClips.length === 0 && (
          <span
            style={{
              fontSize: '0.7rem',
              color: '#94a3b8',
              fontStyle: 'italic',
            }}
          >
            (Sin clips o ingrese URL válida de modelo GLTF)
          </span>
        )}

        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
          {detectedClips.map((clipName) => (
            <button
              key={clipName}
              type="button"
              title={`Haz clic para asignar el clip "${clipName}" y probarlo 3D`}
              onClick={() => onAssignClip(clipName)}
              style={{
                background:
                  previewClip === clipName ? 'rgba(59, 130, 246, 0.4)' : 'rgba(59, 130, 246, 0.15)',
                border: '1px solid',
                borderColor: previewClip === clipName ? '#60a5fa' : 'rgba(59, 130, 246, 0.35)',
                color: '#bfdbfe',
                padding: '0.2rem 0.45rem',
                borderRadius: '4px',
                fontSize: '0.68rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.2rem',
              }}
            >
              🎬 {clipName}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
