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

const DEFAULT_PREVIEW_VALUES = {
  modelPath: '/models/toro_wither.gltf',
  modelPathPhase2: '/models/toro_wither_terror.gltf',
  bossName: 'Previsualizador 3D',
  subtitle: 'Modo Inspección',
  hp: '600 HP',
  hpPhase2: '800 HP',
  damage: '35 Daño',
  damagePhase2: '50 Daño',
  armor: '1.0 Empuje',
  speed: '0.2 Vuelo',
  location: 'Nether',
  spawnMethod: 'Ritual',
  kcReward: 4500,
};

function resolvePhaseAttacks(
  selectedPhaseIdx: number,
  activeAttacks: BossAttack[],
  fallbackAttacks?: BossAttack[],
  targetIdx = 0,
): BossAttack[] | undefined {
  if (selectedPhaseIdx === targetIdx) {
    return activeAttacks;
  }
  return fallbackAttacks;
}

function getModelPaths(previewModelUrl?: string | null, phase2Url?: string | null) {
  return {
    modelPath: previewModelUrl ?? DEFAULT_PREVIEW_VALUES.modelPath,
    modelPathPhase2: phase2Url ?? DEFAULT_PREVIEW_VALUES.modelPathPhase2,
  };
}

function getBossCombatStats(
  formData: Boss3DPreviewPaneProps['formData'],
  activePhase?: Boss3DPreviewPaneProps['activePhase'],
) {
  return {
    hp: activePhase?.hp ?? formData.boss_hp ?? DEFAULT_PREVIEW_VALUES.hp,
    damage: activePhase?.damage ?? formData.boss_damage ?? DEFAULT_PREVIEW_VALUES.damage,
    subtitle: activePhase?.phase_name ?? DEFAULT_PREVIEW_VALUES.subtitle,
    hpPhase2: formData.boss_hp_phase_2 ?? DEFAULT_PREVIEW_VALUES.hpPhase2,
    damagePhase2: formData.boss_damage_phase_2 ?? DEFAULT_PREVIEW_VALUES.damagePhase2,
  };
}

function getBossAttributes(formData: Boss3DPreviewPaneProps['formData']) {
  return {
    armor: formData.boss_armor ?? DEFAULT_PREVIEW_VALUES.armor,
    speed: formData.boss_speed ?? DEFAULT_PREVIEW_VALUES.speed,
    location: formData.boss_location ?? DEFAULT_PREVIEW_VALUES.location,
    spawnMethod: formData.boss_spawn_method ?? DEFAULT_PREVIEW_VALUES.spawnMethod,
    kcReward: formData.boss_kc_reward ?? DEFAULT_PREVIEW_VALUES.kcReward,
  };
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
  const models = getModelPaths(previewModelUrl, formData.model_3d_url_phase_2);
  const combat = getBossCombatStats(formData, activePhase);
  const attributes = getBossAttributes(formData);

  return {
    minimal3dOnly: true,
    activeClipOverride: previewClip ?? undefined,
    ...models,
    bossName: formData.title ?? DEFAULT_PREVIEW_VALUES.bossName,
    ...combat,
    ...attributes,
    description: formData.content ?? formData.description,
    drops: formData.boss_drops ?? [],
    phases,
    phase1Attacks: resolvePhaseAttacks(
      selectedPhaseIdx,
      activeAttacks,
      formData.boss_phase_1_attacks,
      0,
    ),
    phase2Attacks: resolvePhaseAttacks(
      selectedPhaseIdx,
      activeAttacks,
      formData.boss_phase_2_attacks,
      1,
    ),
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
            🎮 Visor 3D en Vivo ({activePhase?.phase_name ?? `Fase ${selectedPhaseIdx + 1}`})
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
