import React, { useRef, useState, useMemo, useEffect } from 'react';
import { BossAttack, BossPhaseData, getEntityDefaultAttacks } from './BossCard/defaultBossData';
import { getBossCardTheme } from './BossCard/bossCardTheme';
import { BossCardViewport3D } from './BossCard/BossCardViewport3D';
import { BossCardStatsGrid } from './BossCard/BossCardStatsGrid';
import { BossCardAttacksSection } from './BossCard/BossCardAttacksSection';
import { BossCardDropsSection } from './BossCard/BossCardDropsSection';

export type { BossAttack, BossPhaseData };

export interface WikiBoss3DCardProps {
  minimal3dOnly?: boolean;
  activeClipOverride?: string | null;
  modelPath?: string;
  textureUrl?: string;
  modelPathPhase2?: string;
  bossName?: string;
  category?: string;
  subtitle?: string;
  hp?: string;
  hpPhase2?: string;
  damage?: string;
  damagePhase2?: string;
  armor?: string;
  speed?: string;
  location?: string;
  spawnMethod?: string;
  description?: string;
  drops?: string[];
  kcReward?: number;
  phases?: BossPhaseData[];
  phase1Attacks?: BossAttack[];
  phase2Attacks?: BossAttack[];
  cardTheme?: 'red' | 'emerald' | 'amber' | 'purple' | 'cyan' | 'slate';
  threatLabel?: string;
  hpLabel?: string;
  damageLabel?: string;
  speedLabel?: string;
  locationLabel?: string;
  dropsLabel?: string;
  bountyLabel?: string;
}

const EMPTY_DROPS: string[] = [];
const EMPTY_PHASES: BossPhaseData[] = [];
const DEFAULT_MODEL_PATH = '/models/toro_wither.gltf';

function computeActivePhases(params: {
  phases?: BossPhaseData[];
  hpPhase2?: string;
  modelPathPhase2?: string;
  phase2Attacks?: BossAttack[];
  phase1Attacks?: BossAttack[];
  modelPath: string;
  hp: string;
  damage: string;
  damagePhase2?: string;
  bossName: string;
  category: string;
}): BossPhaseData[] {
  const {
    phases,
    hpPhase2,
    modelPathPhase2,
    phase2Attacks,
    phase1Attacks,
    modelPath,
    hp,
    damage,
    damagePhase2,
    bossName,
    category,
  } = params;

  if (phases && phases.length > 0) {
    return phases.map((p, idx) => ({
      ...p,
      attacks:
        p.attacks ||
        (idx === 1
          ? phase2Attacks || getEntityDefaultAttacks(bossName, category, 2)
          : phase1Attacks || getEntityDefaultAttacks(bossName, category, 1)),
      model_3d_url:
        p.model_3d_url ??
        (idx === 0
          ? modelPath || DEFAULT_MODEL_PATH
          : (modelPathPhase2 ?? modelPath ?? '/models/toro_wither_terror.gltf')),
    }));
  }

  if (hpPhase2 || modelPathPhase2 || (phase2Attacks && phase2Attacks.length > 0)) {
    return [
      {
        phase_number: 1,
        phase_name: 'Fase I: Combate',
        model_3d_url: modelPath || DEFAULT_MODEL_PATH,
        hp,
        damage,
        attacks: phase1Attacks || getEntityDefaultAttacks(bossName, category, 1),
      },
      {
        phase_number: 2,
        phase_name: 'Fase II: Despertar',
        model_3d_url: modelPathPhase2 ?? '/models/toro_wither_terror.gltf',
        hp: hpPhase2,
        damage: damagePhase2,
        attacks: phase2Attacks || getEntityDefaultAttacks(bossName, category, 2),
      },
    ];
  }

  return [
    {
      phase_number: 1,
      phase_name: 'Estadísticas & Combate',
      model_3d_url: modelPath || DEFAULT_MODEL_PATH,
      hp,
      damage,
      attacks: phase1Attacks || getEntityDefaultAttacks(bossName, category, 1),
    },
  ];
}

export const WikiBoss3DCard: React.FC<Readonly<WikiBoss3DCardProps>> = ({
  minimal3dOnly,
  activeClipOverride,
  modelPath = DEFAULT_MODEL_PATH,
  modelPathPhase2,
  bossName = 'Entidad',
  category = '',
  subtitle = 'Bestiario • Entidad Modificada',
  hp = '100 HP',
  hpPhase2,
  damage = 'Ataque Estándar',
  damagePhase2,
  armor = 'Sin Armadura',
  speed = 'Velocidad Normal',
  location = 'Overworld / Estructura',
  spawnMethod = 'Generación Natural',
  description = '',
  drops = EMPTY_DROPS,
  kcReward = 0,
  phases = EMPTY_PHASES,
  phase1Attacks,
  phase2Attacks,
  threatLabel,
  hpLabel,
  damageLabel,
  speedLabel,
  locationLabel,
  dropsLabel,
  bountyLabel,
}) => {
  const cardWrapperRef = useRef<HTMLDivElement>(null);
  const [selectedPhase, setSelectedPhase] = useState<number>(1);

  const themeStyles = useMemo(() => getBossCardTheme(category, bossName), [category, bossName]);

  const activePhases = useMemo(
    () =>
      computeActivePhases({
        phases,
        hpPhase2,
        modelPathPhase2,
        phase2Attacks,
        phase1Attacks,
        modelPath,
        hp,
        damage,
        damagePhase2,
        bossName,
        category,
      }),
    [
      phases,
      hpPhase2,
      modelPathPhase2,
      phase2Attacks,
      phase1Attacks,
      modelPath,
      hp,
      damage,
      damagePhase2,
      bossName,
      category,
    ],
  );

  const currentPhaseObj =
    activePhases.find((p) => p.phase_number === selectedPhase) || activePhases[0];
  const activeModel = currentPhaseObj?.model_3d_url ?? modelPath ?? DEFAULT_MODEL_PATH;
  const activeAttacksList = useMemo(() => {
    return currentPhaseObj?.attacks || getEntityDefaultAttacks(bossName, category, selectedPhase);
  }, [currentPhaseObj, bossName, category, selectedPhase]);

  const [selectedAttack, setSelectedAttack] = useState<BossAttack | null>(
    activeAttacksList[0] || null,
  );

  useEffect(() => {
    if (activeAttacksList && activeAttacksList.length > 0) {
      setSelectedAttack(activeAttacksList[0]);
    }
  }, [activeAttacksList]);

  const handleSwitchPhase = (phaseNum: number) => {
    setSelectedPhase(phaseNum);
    const targetPhase = activePhases.find((p) => p.phase_number === phaseNum) || activePhases[0];
    if (targetPhase?.attacks && targetPhase.attacks.length > 0) {
      setSelectedAttack(targetPhase.attacks[0]);
    }
  };

  const viewportElement = (
    <BossCardViewport3D
      activeModel={activeModel}
      themeStyles={themeStyles}
      activePhases={activePhases}
      selectedPhase={selectedPhase}
      onSwitchPhase={handleSwitchPhase}
      cardWrapperRef={cardWrapperRef}
      selectedAttack={selectedAttack}
      activeClipOverride={activeClipOverride}
    />
  );

  if (minimal3dOnly) {
    return (
      <div ref={cardWrapperRef} className="size-full">
        {viewportElement}
      </div>
    );
  }

  return (
    <div ref={cardWrapperRef} className="my-1 w-full">
      <div
        className={`relative overflow-hidden rounded-2xl border shadow-xl backdrop-blur-xl ${themeStyles.cardBg}`}
      >
        <div className="grid grid-cols-1 items-stretch gap-0 lg:grid-cols-12">
          {viewportElement}

          <div className="flex flex-col justify-between space-y-5 p-6 sm:p-7 lg:col-span-7">
            <div className="space-y-4">
              <BossCardStatsGrid
                threatLabel={threatLabel}
                subtitle={subtitle}
                category={category}
                bossName={bossName}
                currentPhaseName={currentPhaseObj.phase_name}
                description={description}
                themeStyles={themeStyles}
                hpLabel={hpLabel}
                damageLabel={damageLabel}
                speedLabel={speedLabel}
                currentHp={currentPhaseObj.hp ?? hp}
                currentDamage={currentPhaseObj.damage ?? damage}
                armor={armor}
                speed={speed}
              />

              <BossCardAttacksSection
                attacks={activeAttacksList}
                selectedAttack={selectedAttack}
                onTriggerAttack={setSelectedAttack}
                themeStyles={themeStyles}
              />

              <BossCardDropsSection
                locationLabel={locationLabel}
                location={location}
                spawnMethod={spawnMethod}
                drops={drops}
                dropsLabel={dropsLabel}
                kcReward={kcReward}
                bountyLabel={bountyLabel}
                themeStyles={themeStyles}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WikiBoss3DCard;
