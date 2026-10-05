import type { Dispatch, SetStateAction } from 'react';
import { WikiArticle } from '../../../../services/wikiService';
import { useBossSkills } from './useBossSkills';
import { BossPhaseHeader } from './BossPhaseHeader';
import { BossPhaseConfig } from './BossPhaseConfig';
import { BossAttackCard } from './BossAttackCard';
import { Boss3DPreviewPane } from './Boss3DPreviewPane';

interface BossSkillsTabProps {
  formData: Partial<WikiArticle>;
  setFormData: Dispatch<SetStateAction<Partial<WikiArticle>>>;
}

export function BossSkillsTab({ formData, setFormData }: Readonly<BossSkillsTabProps>) {
  const {
    phases,
    selectedPhaseIdx,
    setSelectedPhaseIdx,
    previewClip,
    setPreviewClip,
    activePhase,
    loadingClips,
    detectedClips,
    updatePhaseField,
    addPhase,
    removePhase,
    addAttack,
    updateAttack,
    removeAttack,
  } = useBossSkills(formData, setFormData);

  const activeAttacks = activePhase?.attacks || [];
  const previewModelUrl =
    activePhase?.model_3d_url ||
    (selectedPhaseIdx === 1
      ? formData.model_3d_url_phase_2 || formData.model_3d_url
      : formData.model_3d_url);

  const handleAssignClip = (clipName: string) => {
    const emptyIdx = activeAttacks.findIndex((a) => !a.animation_clip);
    if (emptyIdx !== -1) {
      updateAttack(selectedPhaseIdx, emptyIdx, 'animation_clip', clipName);
    } else {
      addAttack(selectedPhaseIdx, clipName);
    }
    setPreviewClip(clipName);
  };

  return (
    <div style={{ width: '100%', overflow: 'hidden' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)',
          gap: '1.2rem',
          alignItems: 'start',
        }}
      >
        <div style={{ width: '100%', minWidth: 0, overflow: 'hidden' }}>
          <BossPhaseHeader
            phases={phases}
            selectedPhaseIdx={selectedPhaseIdx}
            onSelectPhase={(idx) => {
              setSelectedPhaseIdx(idx);
              setPreviewClip(null);
            }}
            onAddPhase={addPhase}
          />

          {activePhase && (
            <>
              <BossPhaseConfig
                activePhase={activePhase}
                phaseIdx={selectedPhaseIdx}
                totalPhases={phases.length}
                loadingClips={loadingClips}
                detectedClips={detectedClips}
                previewClip={previewClip}
                onUpdatePhaseField={(field, value) =>
                  updatePhaseField(selectedPhaseIdx, field, value)
                }
                onRemovePhase={() => removePhase(selectedPhaseIdx)}
                onAssignClip={handleAssignClip}
              />

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.6rem',
                }}
              >
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    color: '#86efac',
                    textTransform: 'uppercase',
                  }}
                >
                  ⚔️ Habilidades & Clips de Animación ({activeAttacks.length})
                </span>
                <button
                  type="button"
                  onClick={() => addAttack(selectedPhaseIdx)}
                  style={{
                    background: 'rgba(239, 68, 68, 0.2)',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    color: '#fca5a5',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                  }}
                >
                  + Añadir Habilidad
                </button>
              </div>

              {activeAttacks.map((attack, aIdx) => (
                <BossAttackCard
                  key={`phase-${selectedPhaseIdx}-attack-${aIdx}`}
                  attack={attack}
                  attackIdx={aIdx}
                  phaseIdx={selectedPhaseIdx}
                  detectedClips={detectedClips}
                  onUpdateAttack={(field, value) =>
                    updateAttack(selectedPhaseIdx, aIdx, field, value)
                  }
                  onRemoveAttack={() => removeAttack(selectedPhaseIdx, aIdx)}
                  onPreviewClip={setPreviewClip}
                />
              ))}
            </>
          )}
        </div>

        <Boss3DPreviewPane
          formData={formData}
          activePhase={activePhase}
          selectedPhaseIdx={selectedPhaseIdx}
          previewClip={previewClip}
          phases={phases}
          activeAttacks={activeAttacks}
          previewModelUrl={previewModelUrl}
        />
      </div>
    </div>
  );
}
