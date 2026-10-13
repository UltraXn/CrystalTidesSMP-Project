import { useState, useEffect } from 'react';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { WikiArticle } from '../../../../services/wikiService';

function getDefaultPhases(formData: Partial<WikiArticle>) {
  return [
    {
      phase_number: 1,
      phase_name: 'Fase I',
      model_3d_url: formData.model_3d_url ?? '/models/toro_wither.gltf',
      hp: formData.boss_hp ?? '600 HP',
      damage: formData.boss_damage ?? '35 Daño',
      attacks: formData.boss_phase_1_attacks || [],
    },
    {
      phase_number: 2,
      phase_name: 'Fase II',
      model_3d_url: formData.model_3d_url_phase_2 ?? '/models/toro_wither_terror.gltf',
      hp: formData.boss_hp_phase_2 ?? '800 HP',
      damage: formData.boss_damage_phase_2 ?? '50 Daño Crítico',
      attacks: formData.boss_phase_2_attacks || [],
    },
  ];
}

export function useBossSkills(
  formData: Partial<WikiArticle>,
  setFormData: React.Dispatch<React.SetStateAction<Partial<WikiArticle>>>,
) {
  const phases =
    (formData.boss_phases?.length ?? 0) > 0 ? formData.boss_phases! : getDefaultPhases(formData);

  const [selectedPhaseIdx, setSelectedPhaseIdx] = useState<number>(0);
  const [previewClip, setPreviewClip] = useState<string | null>(null);

  const activePhase = phases[selectedPhaseIdx] || phases[0];

  const [clipsMap, setClipsMap] = useState<Record<string, string[]>>({});

  const activeModelUrl = activePhase?.model_3d_url ?? formData.model_3d_url ?? '';
  const loadingClips = Boolean(activeModelUrl && !(activeModelUrl in clipsMap));

  // Inspect GLTF model clips dynamically
  useEffect(() => {
    if (!activeModelUrl || activeModelUrl in clipsMap) return;

    let isMounted = true;
    const loader = new GLTFLoader();
    loader.load(
      activeModelUrl,
      (gltf) => {
        if (!isMounted) return;
        const foundClips = (gltf.animations || []).map((c) => c.name);
        setClipsMap((prev) => ({ ...prev, [activeModelUrl]: foundClips }));
      },
      undefined,
      () => {
        if (!isMounted) return;
        setClipsMap((prev) => ({ ...prev, [activeModelUrl]: [] }));
      },
    );

    return () => {
      isMounted = false;
    };
  }, [activeModelUrl, clipsMap]);

  const detectedClips = clipsMap[activeModelUrl] || [];

  const updatePhaseField = (phaseIdx: number, field: string, value: unknown) => {
    const updated = [...phases];
    updated[phaseIdx] = { ...updated[phaseIdx], [field]: value };
    setFormData({ ...formData, boss_phases: updated });
  };

  const addPhase = () => {
    const nextNum = phases.length + 1;
    const newPhase = {
      phase_number: nextNum,
      phase_name: `Fase ${nextNum}`,
      model_3d_url: '',
      hp: '500 HP',
      damage: '30 Daño',
      attacks: [
        {
          name: 'Ataque Primario',
          type: 'Melee',
          damage: '25 Daño',
          description: 'Descripción de la habilidad',
          animation_clip: 'attack',
        },
      ],
    };
    const updated = [...phases, newPhase];
    setFormData({ ...formData, boss_phases: updated });
    setSelectedPhaseIdx(updated.length - 1);
  };

  const removePhase = (phaseIdx: number) => {
    if (phases.length <= 1) return;
    const updated = phases
      .filter((_, i) => i !== phaseIdx)
      .map((p, i) => ({ ...p, phase_number: i + 1 }));
    setFormData({ ...formData, boss_phases: updated });
    setSelectedPhaseIdx(Math.max(0, phaseIdx - 1));
  };

  const addAttack = (phaseIdx: number, initialClip: string = '') => {
    const updated = [...phases];
    const currentAttacks = updated[phaseIdx].attacks || [];
    const newAttack = {
      name: 'Nueva Habilidad',
      type: 'Proyectil',
      damage: '25 Daño',
      description: 'Descripción de la habilidad.',
      animation_clip: initialClip || 'attack',
    };
    updated[phaseIdx] = {
      ...updated[phaseIdx],
      attacks: [...currentAttacks, newAttack],
    };
    setFormData({ ...formData, boss_phases: updated });
  };

  const updateAttack = (
    phaseIdx: number,
    attackIdx: number,
    field: string,
    value: string | string[],
  ) => {
    const updated = [...phases];
    const currentAttacks = [...(updated[phaseIdx].attacks || [])];
    currentAttacks[attackIdx] = {
      ...currentAttacks[attackIdx],
      [field]: value,
    };
    updated[phaseIdx] = { ...updated[phaseIdx], attacks: currentAttacks };
    setFormData({ ...formData, boss_phases: updated });

    if (field === 'animation_clip' && typeof value === 'string') {
      setPreviewClip(value);
    }
  };

  const removeAttack = (phaseIdx: number, attackIdx: number) => {
    const updated = [...phases];
    const currentAttacks = (updated[phaseIdx].attacks || []).filter((_, i) => i !== attackIdx);
    updated[phaseIdx] = { ...updated[phaseIdx], attacks: currentAttacks };
    setFormData({ ...formData, boss_phases: updated });
  };

  return {
    phases,
    selectedPhaseIdx,
    setSelectedPhaseIdx,
    previewClip,
    setPreviewClip,
    activePhase,
    activeModelUrl,
    loadingClips,
    detectedClips,
    updatePhaseField,
    addPhase,
    removePhase,
    addAttack,
    updateAttack,
    removeAttack,
  };
}
