import { WikiArticle } from '../../../../services/wikiService';
import WikiBoss3DCard, {
  BossAttack,
  BossPhaseData,
  WikiBoss3DCardProps,
} from '../../../Wiki/WikiBoss3DCard';

const WHITE_BORDER_10 = '1px solid rgba(255,255,255,0.1)';

interface Boss3DPreviewPaneProps {
  formData: Partial<WikiArticle>;
  activePhase?: BossPhaseData;
  selectedPhaseIdx: number;
  previewClip: string | null;
  phases: BossPhaseData[];
  activeAttacks: BossAttack[];
  previewModelUrl?: string;
}

function computePreviewProps({
  formData,
  activePhase,
  selectedPhaseIdx,
  previewClip,
  phases,
  activeAttacks,
  previewModelUrl,
}: Boss3DPreviewPaneProps): WikiBoss3DCardProps {
  return {
    minimal3dOnly: true,
    activeClipOverride: previewClip ?? undefined,
    modelPath: previewModelUrl ?? '/models/toro_wither.gltf',
    modelPathPhase2: formData.model_3d_url_phase_2 ?? '/models/toro_wither_terror.gltf',
    bossName: formData.title ?? 'Previsualizador 3D',
    subtitle: activePhase?.phase_name ?? 'Modo Inspección',
    hp: activePhase?.hp ?? formData.boss_hp ?? '600 HP',
    hpPhase2: formData.boss_hp_phase_2 ?? '800 HP',
    damage: activePhase?.damage ?? formData.boss_damage ?? '35 Daño',
    damagePhase2: formData.boss_damage_phase_2 ?? '50 Daño',
    armor: formData.boss_armor ?? '1.0 Empuje',
    speed: formData.boss_speed ?? '0.2 Vuelo',
    location: formData.boss_location ?? 'Nether',
    spawnMethod: formData.boss_spawn_method ?? 'Ritual',
    description: formData.content ?? formData.description,
    drops: formData.boss_drops ?? [],
    kcReward: formData.boss_kc_reward ?? 4500,
    phases,
    phase1Attacks: selectedPhaseIdx === 0 ? activeAttacks : formData.boss_phase_1_attacks,
    phase2Attacks: selectedPhaseIdx === 1 ? activeAttacks : formData.boss_phase_2_attacks,
  };
}

export function Boss3DPreviewPane(props: Readonly<Boss3DPreviewPaneProps>) {
  const { activePhase, selectedPhaseIdx, previewClip } = props;
  const previewCardProps = computePreviewProps(props);

  return (
    <div
      style={{
        position: 'sticky',
        top: '0',
        width: '100%',
        minWidth: 0,
        background: 'rgba(10, 10, 10, 0.85)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: '12px',
        padding: '0.8rem',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.6rem',
          borderBottom: WHITE_BORDER_10,
          paddingBottom: '0.4rem',
        }}
      >
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 'bold',
            color: '#ef4444',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <span>
            🎮 Visor 3D en Vivo ({activePhase?.phase_name || `Fase ${selectedPhaseIdx + 1}`})
          </span>
        </span>
        {previewClip && (
          <span
            style={{
              fontSize: '0.7rem',
              color: '#60a5fa',
              fontWeight: 'bold',
              background: 'rgba(59, 130, 246, 0.2)',
              padding: '0.2rem 0.4rem',
              borderRadius: '4px',
            }}
          >
            🎬 {previewClip}
          </span>
        )}
      </div>

      <div
        style={{
          width: '100%',
          height: '360px',
          borderRadius: '8px',
          overflow: 'hidden',
          border: WHITE_BORDER_10,
        }}
      >
        <WikiBoss3DCard {...previewCardProps} />
      </div>
    </div>
  );
}
