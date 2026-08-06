import React, { useState, useEffect } from 'react';
import { Loader2, Film } from 'lucide-react';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { WikiArticle } from '../../../../services/wikiService';
import WikiBoss3DCard from '../../../Wiki/WikiBoss3DCard';

interface BossSkillsTabProps {
    formData: Partial<WikiArticle>;
    setFormData: React.Dispatch<React.SetStateAction<Partial<WikiArticle>>>;
}

export function BossSkillsTab({ formData, setFormData }: Readonly<BossSkillsTabProps>) {
    const phases = (formData.boss_phases && formData.boss_phases.length > 0)
        ? formData.boss_phases
        : [
            { phase_number: 1, phase_name: 'Fase I', model_3d_url: formData.model_3d_url || '/models/toro_wither.gltf', hp: formData.boss_hp || '600 HP', damage: formData.boss_damage || '35 Daño', attacks: formData.boss_phase_1_attacks || [] },
            { phase_number: 2, phase_name: 'Fase II', model_3d_url: formData.model_3d_url_phase_2 || '/models/toro_wither_terror.gltf', hp: formData.boss_hp_phase_2 || '800 HP', damage: formData.boss_damage_phase_2 || '50 Daño Crítico', attacks: formData.boss_phase_2_attacks || [] }
        ];

    const [selectedPhaseIdx, setSelectedPhaseIdx] = useState<number>(0);
    const [previewClip, setPreviewClip] = useState<string | null>(null);

    const activePhase = phases[selectedPhaseIdx] || phases[0];

    const [clipsMap, setClipsMap] = useState<Record<string, string[]>>({});
    const [loadingClips, setLoadingClips] = useState<boolean>(false);

    const activeModelUrl = activePhase?.model_3d_url || formData.model_3d_url || '';

    // Inspect GLTF model clips dynamically
    useEffect(() => {
        if (!activeModelUrl || clipsMap[activeModelUrl]) return;

        setLoadingClips(true);
        const loader = new GLTFLoader();
        loader.load(
            activeModelUrl,
            (gltf) => {
                const foundClips = (gltf.animations || []).map((c) => c.name);
                setClipsMap((prev) => ({ ...prev, [activeModelUrl]: foundClips }));
                setLoadingClips(false);
            },
            undefined,
            () => {
                setLoadingClips(false);
            }
        );
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
            attacks: [{ name: 'Ataque Primario', type: 'Melee', damage: '25 Daño', description: 'Descripción de la habilidad', animation_clip: 'attack' }]
        };
        const updated = [...phases, newPhase];
        setFormData({ ...formData, boss_phases: updated });
        setSelectedPhaseIdx(updated.length - 1);
    };

    const removePhase = (phaseIdx: number) => {
        if (phases.length <= 1) return;
        const updated = phases.filter((_, i) => i !== phaseIdx).map((p, i) => ({ ...p, phase_number: i + 1 }));
        setFormData({ ...formData, boss_phases: updated });
        setSelectedPhaseIdx(Math.max(0, phaseIdx - 1));
    };

    const addAttack = (phaseIdx: number, initialClip: string = '') => {
        const updated = [...phases];
        const currentAttacks = updated[phaseIdx].attacks || [];
        const newAttack = { name: 'Nueva Habilidad', type: 'Proyectil', damage: '25 Daño', description: 'Descripción de la habilidad.', animation_clip: initialClip || 'attack' };
        updated[phaseIdx] = { ...updated[phaseIdx], attacks: [...currentAttacks, newAttack] };
        setFormData({ ...formData, boss_phases: updated });
    };

    const updateAttack = (phaseIdx: number, attackIdx: number, field: string, value: string | string[]) => {
        const updated = [...phases];
        const currentAttacks = [...(updated[phaseIdx].attacks || [])];
        currentAttacks[attackIdx] = { ...currentAttacks[attackIdx], [field]: value };
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

    // Prepare preview 3D card phase & attacks
    const activeAttacks = activePhase?.attacks || [];
    const previewModelUrl = activePhase?.model_3d_url || (selectedPhaseIdx === 1 ? (formData.model_3d_url_phase_2 || formData.model_3d_url) : formData.model_3d_url);

    return (
        <div style={{ width: '100%', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: '1.2rem', alignItems: 'start' }}>
                <div style={{ width: '100%', minWidth: 0, overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.6rem' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                            {phases.map((phase, pIdx) => (
                                <button
                                    key={`phase-selector-${phase.phase_number}-${pIdx}`}
                                    type="button"
                                    onClick={() => {
                                        setSelectedPhaseIdx(pIdx);
                                        setPreviewClip(null);
                                    }}
                                    style={{
                                        padding: '0.35rem 0.7rem',
                                        borderRadius: '6px',
                                        fontSize: '0.75rem',
                                        fontWeight: 'bold',
                                        border: '1px solid',
                                        borderColor: selectedPhaseIdx === pIdx ? '#ef4444' : 'rgba(255,255,255,0.1)',
                                        background: selectedPhaseIdx === pIdx ? 'rgba(239, 68, 68, 0.25)' : 'rgba(0,0,0,0.3)',
                                        color: selectedPhaseIdx === pIdx ? '#fca5a5' : '#888',
                                        cursor: 'pointer'
                                    }}
                                >
                                    🔥 {phase.phase_name || `Fase ${phase.phase_number}`} ({(phase.attacks || []).length})
                                </button>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={addPhase}
                            style={{ background: 'rgba(34, 197, 94, 0.2)', border: '1px solid rgba(34, 197, 94, 0.4)', color: '#86efac', padding: '0.35rem 0.7rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                            + Añadir Fase
                        </button>
                    </div>

                    {activePhase && (
                        <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', padding: '0.9rem', borderRadius: '8px', marginBottom: '1rem', width: '100%', boxSizing: 'border-box' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                                <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#fca5a5', textTransform: 'uppercase' }}>
                                    Configuración de {activePhase.phase_name || `Fase ${activePhase.phase_number}`}
                                </span>
                                {phases.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removePhase(selectedPhaseIdx)}
                                        style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#fca5a5', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', cursor: 'pointer' }}
                                    >
                                        🗑️ Eliminar Fase {activePhase.phase_number}
                                    </button>
                                )}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginBottom: '0.8rem' }}>
                                <div>
                                    <span style={{ display: 'block', fontSize: '0.68rem', color: '#aaa', marginBottom: '0.2rem' }}>Nombre de la Fase</span>
                                    <input type="text" value={activePhase.phase_name} onChange={e => updatePhaseField(selectedPhaseIdx, 'phase_name', e.target.value)} placeholder="Fase I: Voladora" style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', padding: '0.4rem', color: '#fff', fontSize: '0.8rem', boxSizing: 'border-box' }} />
                                </div>
                                <div>
                                    <span style={{ display: 'block', fontSize: '0.68rem', color: '#aaa', marginBottom: '0.2rem' }}>Modelo 3D GLTF de la Fase</span>
                                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                                        <input type="text" value={activePhase.model_3d_url ?? ''} onChange={e => updatePhaseField(selectedPhaseIdx, 'model_3d_url', e.target.value)} placeholder="/models/boss_phase.gltf" style={{ flex: 1, background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', padding: '0.4rem', color: '#fff', fontSize: '0.8rem', boxSizing: 'border-box' }} />
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginBottom: '0.8rem' }}>
                                <div>
                                    <span style={{ display: 'block', fontSize: '0.68rem', color: '#aaa', marginBottom: '0.2rem' }}>Salud HP de Fase</span>
                                    <input type="text" value={activePhase.hp ?? ''} onChange={e => updatePhaseField(selectedPhaseIdx, 'hp', e.target.value)} placeholder="600 HP" style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', padding: '0.4rem', color: '#fff', fontSize: '0.8rem', boxSizing: 'border-box' }} />
                                </div>
                                <div>
                                    <span style={{ display: 'block', fontSize: '0.68rem', color: '#aaa', marginBottom: '0.2rem' }}>Daño de Fase</span>
                                    <input type="text" value={activePhase.damage ?? ''} onChange={e => updatePhaseField(selectedPhaseIdx, 'damage', e.target.value)} placeholder="35 Daño" style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', padding: '0.4rem', color: '#fff', fontSize: '0.8rem', boxSizing: 'border-box' }} />
                                </div>
                            </div>

                            <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(59, 130, 246, 0.25)', padding: '0.5rem 0.7rem', borderRadius: '6px', marginBottom: '0.8rem' }}>
                                <div style={{ fontSize: '0.68rem', fontWeight: 'bold', color: '#93c5fd', display: 'flex', alignItems: 'center', gap: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>
                                    <Film className="w-3.5 h-3.5 text-blue-400" />
                                    Clips GLTF Detectados ({detectedClips.length}):
                                </div>

                                {loadingClips && (
                                    <span style={{ fontSize: '0.7rem', color: '#60a5fa', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                                        <Loader2 className="w-3 h-3 animate-spin" /> Escaneando animaciones 3D...
                                    </span>
                                )}

                                {!loadingClips && detectedClips.length === 0 && (
                                    <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontStyle: 'italic' }}>
                                        (Sin clips o ingrese URL válida de modelo GLTF)
                                    </span>
                                )}

                                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                                    {detectedClips.map((clipName) => (
                                        <button
                                            key={clipName}
                                            type="button"
                                            title={`Haz clic para asignar el clip "${clipName}" y probarlo 3D`}
                                            onClick={() => {
                                                const currentAttacks = activePhase.attacks || [];
                                                const emptyIdx = currentAttacks.findIndex(a => !a.animation_clip);
                                                if (emptyIdx !== -1) {
                                                    updateAttack(selectedPhaseIdx, emptyIdx, 'animation_clip', clipName);
                                                } else {
                                                    addAttack(selectedPhaseIdx, clipName);
                                                }
                                                setPreviewClip(clipName);
                                            }}
                                            style={{
                                                background: previewClip === clipName ? 'rgba(59, 130, 246, 0.4)' : 'rgba(59, 130, 246, 0.15)',
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
                                                gap: '0.2rem'
                                            }}
                                        >
                                            🎬 {clipName}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#86efac', textTransform: 'uppercase' }}>
                                    ⚔️ Habilidades & Clips de Animación ({ activeAttacks.length })
                                </span>
                                <button type="button" onClick={() => addAttack(selectedPhaseIdx)} style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#fca5a5', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', cursor: 'pointer', fontWeight: 'bold' }}>
                                    + Añadir Habilidad
                                </button>
                            </div>

                            {activeAttacks.map((attack, aIdx) => (
                                <div key={`phase-${selectedPhaseIdx}-attack-${aIdx}`} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', padding: '0.6rem', marginBottom: '0.6rem', width: '100%', boxSizing: 'border-box' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1.2fr) minmax(0, 0.9fr) minmax(0, 0.8fr) auto auto', gap: '0.4rem', marginBottom: '0.4rem', alignItems: 'center', width: '100%' }}>
                                        <input type="text" placeholder="Nombre (ej. Shoot)" value={attack.name} onChange={e => updateAttack(selectedPhaseIdx, aIdx, 'name', e.target.value)} style={{ width: '100%', minWidth: 0, background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', padding: '0.35rem 0.4rem', color: '#fff', fontSize: '0.75rem', boxSizing: 'border-box' }} />
                                        
                                        {detectedClips.length > 0 ? (
                                            <select
                                                value={attack.animation_clip ?? ''}
                                                onChange={(e) => updateAttack(selectedPhaseIdx, aIdx, 'animation_clip', e.target.value)}
                                                style={{ width: '100%', minWidth: 0, background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: '4px', padding: '0.35rem 0.4rem', color: '#fca5a5', fontSize: '0.75rem', fontWeight: 'bold', boxSizing: 'border-box' }}
                                            >
                                                <option value="">-- Clip GLTF --</option>
                                                {detectedClips.map((clip) => (
                                                    <option key={clip} value={clip}>🎬 {clip}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <div style={{ width: '100%', minWidth: 0 }}>
                                                <input
                                                    type="text"
                                                    list={`gltf-clips-datalist-${selectedPhaseIdx}`}
                                                    placeholder="Clip GLTF"
                                                    value={attack.animation_clip ?? ''}
                                                    onChange={e => updateAttack(selectedPhaseIdx, aIdx, 'animation_clip', e.target.value)}
                                                    style={{ width: '100%', minWidth: 0, background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '4px', padding: '0.35rem 0.4rem', color: '#fca5a5', fontSize: '0.75rem', boxSizing: 'border-box' }}
                                                />
                                                <datalist id={`gltf-clips-datalist-${selectedPhaseIdx}`}>
                                                    {['idle', 'attack', 'shoot', 'walk', 'head_off', 'spawn', 'smash', 'roundhouse', 'claw1', 'claw2', 'wither_pool'].map(c => (
                                                        <option key={c} value={c} />
                                                    ))}
                                                </datalist>
                                            </div>
                                        )}

                                        <select value={attack.type} onChange={e => updateAttack(selectedPhaseIdx, aIdx, 'type', e.target.value)} style={{ width: '100%', minWidth: 0, background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', padding: '0.35rem 0.3rem', color: '#fff', fontSize: '0.75rem', boxSizing: 'border-box' }}>
                                            <option value="Proyectil">Proyectil</option>
                                            <option value="AoE">AoE</option>
                                            <option value="Melee">Melee</option>
                                            <option value="Defensa">Defensa</option>
                                            <option value="Canalizado">Canalizado</option>
                                            <option value="Invocación">Invocación</option>
                                        </select>

                                        <input type="text" placeholder="Daño" value={attack.damage} onChange={e => updateAttack(selectedPhaseIdx, aIdx, 'damage', e.target.value)} style={{ width: '100%', minWidth: 0, background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', padding: '0.35rem 0.4rem', color: '#fff', fontSize: '0.75rem', boxSizing: 'border-box' }} />

                                        <button
                                            type="button"
                                            title="Probar esta animación en el visor 3D"
                                            onClick={() => setPreviewClip(attack.animation_clip || 'idle')}
                                            style={{ background: 'rgba(59, 130, 246, 0.3)', border: '1px solid rgba(59, 130, 246, 0.5)', color: '#bfdbfe', padding: '0.35rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.2rem', whiteSpace: 'nowrap' }}
                                        >
                                            ▶️ Probar
                                        </button>

                                        <button
                                            type="button"
                                            title="Eliminar esta habilidad"
                                            onClick={() => removeAttack(selectedPhaseIdx, aIdx)}
                                            style={{ background: 'rgba(239, 68, 68, 0.3)', border: '1px solid rgba(239, 68, 68, 0.5)', color: '#fca5a5', padding: '0.35rem 0.55rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold', whiteSpace: 'nowrap' }}
                                        >
                                            🗑️
                                        </button>
                                    </div>

                                    <input type="text" placeholder="Descripción detallada de la habilidad..." value={attack.description} onChange={e => updateAttack(selectedPhaseIdx, aIdx, 'description', e.target.value)} style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', padding: '0.35rem 0.5rem', color: '#ccc', fontSize: '0.73rem', boxSizing: 'border-box' }} />

                                    {detectedClips.length > 0 && (
                                        <div style={{ marginTop: '0.4rem', paddingTop: '0.4rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.3rem' }}>
                                            <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                                🔁 Variantes / Combos:
                                            </span>
                                            {detectedClips.filter(c => c !== attack.animation_clip).map((clip) => {
                                                const isSelected = (attack.variant_clips || []).includes(clip);
                                                return (
                                                    <button
                                                        key={`variant-${clip}`}
                                                        type="button"
                                                        onClick={() => {
                                                            const currentVariants = attack.variant_clips || [];
                                                            const nextVariants = isSelected
                                                                ? currentVariants.filter(v => v !== clip)
                                                                : [...currentVariants, clip];
                                                            updateAttack(selectedPhaseIdx, aIdx, 'variant_clips', nextVariants);
                                                            setPreviewClip(clip);
                                                        }}
                                                        style={{
                                                            background: isSelected ? 'rgba(168, 85, 247, 0.25)' : 'rgba(0,0,0,0.4)',
                                                            border: isSelected ? '1px solid rgba(168, 85, 247, 0.6)' : '1px solid rgba(255,255,255,0.1)',
                                                            color: isSelected ? '#e9d5ff' : '#94a3b8',
                                                            borderRadius: '4px',
                                                            padding: '0.15rem 0.35rem',
                                                            fontSize: '0.67rem',
                                                            cursor: 'pointer',
                                                            fontWeight: isSelected ? 'bold' : 'normal',
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '0.2rem'
                                                        }}
                                                        title={isSelected ? `Quitar variante ${clip}` : `Añadir variante ${clip}`}
                                                    >
                                                        {isSelected ? '✓' : '+'} 🎬 {clip}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div style={{ position: 'sticky', top: '0', width: '100%', minWidth: 0, background: 'rgba(10, 10, 10, 0.85)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', padding: '0.8rem', boxSizing: 'border-box' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.4rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span>🎮 Visor 3D en Vivo ({activePhase?.phase_name || `Fase ${selectedPhaseIdx + 1}`})</span>
                        </span>
                        {previewClip && (
                            <span style={{ fontSize: '0.7rem', color: '#60a5fa', fontWeight: 'bold', background: 'rgba(59, 130, 246, 0.2)', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>
                                🎬 {previewClip}
                            </span>
                        )}
                    </div>

                    <div style={{ width: '100%', height: '360px', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <WikiBoss3DCard
                            minimal3dOnly={true}
                            activeClipOverride={previewClip || undefined}
                            modelPath={previewModelUrl || '/models/toro_wither.gltf'}
                            modelPathPhase2={formData.model_3d_url_phase_2 || '/models/toro_wither_terror.gltf'}
                            bossName={formData.title || 'Previsualizador 3D'}
                            subtitle={activePhase?.phase_name || 'Modo Inspección'}
                            hp={activePhase?.hp || formData.boss_hp || '600 HP'}
                            hpPhase2={formData.boss_hp_phase_2 || '800 HP'}
                            damage={activePhase?.damage || formData.boss_damage || '35 Daño'}
                            damagePhase2={formData.boss_damage_phase_2 || '50 Daño'}
                            armor={formData.boss_armor || '1.0 Empuje'}
                            speed={formData.boss_speed || '0.2 Vuelo'}
                            location={formData.boss_location || 'Nether'}
                            spawnMethod={formData.boss_spawn_method || 'Ritual'}
                            description={formData.content || formData.description}
                            drops={formData.boss_drops || []}
                            kcReward={formData.boss_kc_reward || 4500}
                            phases={phases}
                            phase1Attacks={selectedPhaseIdx === 0 ? activeAttacks : formData.boss_phase_1_attacks}
                            phase2Attacks={selectedPhaseIdx === 1 ? activeAttacks : formData.boss_phase_2_attacks}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
