import { WikiArticle } from '../../../../services/wikiService';

type BossPhase = NonNullable<WikiArticle['boss_phases']>[number];

interface BossPhaseHeaderProps {
  phases: BossPhase[];
  selectedPhaseIdx: number;
  onSelectPhase: (idx: number) => void;
  onAddPhase: () => void;
}

export function BossPhaseHeader({
  phases,
  selectedPhaseIdx,
  onSelectPhase,
  onAddPhase,
}: BossPhaseHeaderProps) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.8rem',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        paddingBottom: '0.6rem',
      }}
    >
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
        {phases.map((phase, pIdx) => (
          <button
            key={`phase-selector-${phase.phase_number}-${pIdx}`}
            type="button"
            onClick={() => onSelectPhase(pIdx)}
            style={{
              padding: '0.35rem 0.7rem',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 'bold',
              border: '1px solid',
              borderColor: selectedPhaseIdx === pIdx ? '#ef4444' : 'rgba(255,255,255,0.1)',
              background: selectedPhaseIdx === pIdx ? 'rgba(239, 68, 68, 0.25)' : 'rgba(0,0,0,0.3)',
              color: selectedPhaseIdx === pIdx ? '#fca5a5' : '#888',
              cursor: 'pointer',
            }}
          >
            🔥 {phase.phase_name || `Fase ${phase.phase_number}`} ({(phase.attacks || []).length})
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={onAddPhase}
        style={{
          background: 'rgba(34, 197, 94, 0.2)',
          border: '1px solid rgba(34, 197, 94, 0.4)',
          color: '#86efac',
          padding: '0.35rem 0.7rem',
          borderRadius: '6px',
          fontSize: '0.75rem',
          fontWeight: 'bold',
          cursor: 'pointer',
        }}
      >
        + Añadir Fase
      </button>
    </div>
  );
}
