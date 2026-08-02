import { useState, useEffect } from "react"
import { m as motion, AnimatePresence } from "framer-motion"
import { Save, X, Loader2, Eye, Edit3, Upload, Film, Sparkles, Copy, Check, FileCode, Bot } from "lucide-react"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import ReactMarkdown from "react-markdown"
import WikiBoss3DCard from "../../Wiki/WikiBoss3DCard"

import { useTranslation } from "react-i18next"
import { TFunction } from "i18next"
import { WikiArticle } from "../../../services/wikiService"
import { uploadImage } from "../../../services/uploadService"

interface WikiArticleFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (article: Partial<WikiArticle>) => Promise<void>;
    initialData: Partial<WikiArticle> | null;
    isEditing: boolean;
    saving: boolean;
}


interface BossMetadataFieldsProps {
    formData: Partial<WikiArticle>;
    setFormData: React.Dispatch<React.SetStateAction<Partial<WikiArticle>>>;
}

function BossModelsTab({ formData, setFormData, uploadingField, handleFileUpload }: Readonly<{
    formData: Partial<WikiArticle>;
    setFormData: React.Dispatch<React.SetStateAction<Partial<WikiArticle>>>;
    uploadingField: string | null;
    handleFileUpload: (file: File, fieldName: keyof WikiArticle, folder: string) => Promise<void>;
}>) {
    return (
        <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                    <label htmlFor="boss_entity_type_select" style={{ display: 'block', fontSize: '0.7rem', color: '#aaa', marginBottom: '0.3rem' }}>Sistema / Origen de Entidad</label>
                    <select
                        id="boss_entity_type_select"
                        value={formData.boss_entity_type ?? 'MythicMobs Plugin'}
                        onChange={e => setFormData({ ...formData, boss_entity_type: e.target.value })}
                        style={{ width: '100%', background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px', padding: '0.6rem 0.8rem', color: '#fff', fontSize: '0.85rem' }}
                    >
                        <option value="MythicMobs Plugin">MythicMobs Custom Plugin</option>
                        <option value="Mod Entity (GeckoLib)">Mod Entity (GeckoLib / Java Mod)</option>
                        <option value="Vanilla / ModelEngine">Vanilla / ModelEngine</option>
                        <option value="Custom Dungeon Boss">Custom Dungeon / Event Boss</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="boss_mod_name_input" style={{ display: 'block', fontSize: '0.7rem', color: '#aaa', marginBottom: '0.3rem' }}>Nombre del Mod o Pack</label>
                    <input
                        id="boss_mod_name_input"
                        type="text"
                        value={formData.boss_mod_name ?? ''}
                        onChange={e => setFormData({ ...formData, boss_mod_name: e.target.value })}
                        placeholder="ej. Cataclysm Mod / Mowzie's Mobs / Custom Mythic"
                        style={{ width: '100%', background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px', padding: '0.6rem 0.8rem', color: '#fff', fontSize: '0.85rem' }}
                    />
                </div>

                <div>
                    <label htmlFor="boss_tier_select" style={{ display: 'block', fontSize: '0.7rem', color: '#aaa', marginBottom: '0.3rem' }}>Rango / Tier de Peligro</label>
                    <select
                        id="boss_tier_select"
                        value={formData.boss_tier ?? 'Jefe Supremo de Mazmorra'}
                        onChange={e => setFormData({ ...formData, boss_tier: e.target.value })}
                        style={{ width: '100%', background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px', padding: '0.6rem 0.8rem', color: '#fff', fontSize: '0.85rem' }}
                    >
                        <option value="Jefe Supremo de Mazmorra">Jefe Supremo (Tier 5)</option>
                        <option value="World Boss">World Boss (Jefe de Mundo)</option>
                        <option value="Mini-boss">Mini-Boss</option>
                        <option value="Entidad Hostil de Mod">Entidad Hostil de Mod</option>
                        <option value="Invocación Mítica">Invocación Mítica</option>
                    </select>
                </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
                <div>
                    <label htmlFor="model_3d_url_input" style={{ display: 'block', fontSize: '0.7rem', color: '#aaa', marginBottom: '0.3rem' }}>Modelo 3D Principal / Inicial (.gltf / .glb)</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input
                            id="model_3d_url_input"
                            type="text"
                            value={formData.model_3d_url ?? ''}
                            onChange={e => setFormData({ ...formData, model_3d_url: e.target.value })}
                            placeholder="/models/toro_wither.gltf"
                            style={{ flex: 1, background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px', padding: '0.6rem 0.8rem', color: '#fff', fontSize: '0.85rem' }}
                        />
                        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#fca5a5', padding: '0.6rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                            {uploadingField === 'model_3d_url' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                            <span>{uploadingField === 'model_3d_url' ? 'Subiendo...' : 'Subir 3D'}</span>
                            <input type="file" accept=".gltf,.glb,.json" style={{ display: 'none' }} onChange={e => {
                                const file = e.target.files?.[0];
                                if (file) handleFileUpload(file, 'model_3d_url', 'admin-assets');
                            }} />
                        </label>
                    </div>
                </div>
            </div>

            <div>
                <label htmlFor="boss_subtitle_input" style={{ display: 'block', fontSize: '0.7rem', color: '#aaa', marginBottom: '0.3rem' }}>Subtítulo Mítico Banner / Insignia</label>
                <input
                    id="boss_subtitle_input"
                    type="text"
                    value={formData.boss_subtitle ?? ''}
                    onChange={e => setFormData({ ...formData, boss_subtitle: e.target.value })}
                    placeholder="MYTHICMOBS • JEFE SUPREMO E INVOCACIÓN DE MAZMORRA"
                    style={{ width: '100%', background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px', padding: '0.6rem 0.8rem', color: '#fff', fontSize: '0.85rem' }}
                />
            </div>
        </div>
    );
}

function BossStatsTab({ formData, setFormData }: Readonly<{
    formData: Partial<WikiArticle>;
    setFormData: React.Dispatch<React.SetStateAction<Partial<WikiArticle>>>;
}>) {
    return (
        <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.8rem', marginBottom: '1rem' }}>
                <div>
                    <label htmlFor="boss_hp_input" style={{ display: 'block', fontSize: '0.7rem', color: '#aaa', marginBottom: '0.3rem' }}>Salud Fase 1 (HP)</label>
                    <input
                        id="boss_hp_input"
                        type="text"
                        value={formData.boss_hp ?? ''}
                        onChange={e => setFormData({ ...formData, boss_hp: e.target.value })}
                        placeholder="600 HP"
                        style={{ width: '100%', background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px', padding: '0.6rem 0.8rem', color: '#fff', fontSize: '0.85rem' }}
                    />
                </div>
                <div>
                    <label htmlFor="boss_hp_phase_2_input" style={{ display: 'block', fontSize: '0.7rem', color: '#aaa', marginBottom: '0.3rem' }}>Salud Fase 2 (Enfurecido)</label>
                    <input
                        id="boss_hp_phase_2_input"
                        type="text"
                        value={formData.boss_hp_phase_2 ?? ''}
                        onChange={e => setFormData({ ...formData, boss_hp_phase_2: e.target.value })}
                        placeholder="800 HP (DarkenSky Activo)"
                        style={{ width: '100%', background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px', padding: '0.6rem 0.8rem', color: '#fff', fontSize: '0.85rem' }}
                    />
                </div>
                <div>
                    <label htmlFor="boss_damage_input" style={{ display: 'block', fontSize: '0.7rem', color: '#aaa', marginBottom: '0.3rem' }}>Daño Base Fase 1</label>
                    <input
                        id="boss_damage_input"
                        type="text"
                        value={formData.boss_damage ?? ''}
                        onChange={e => setFormData({ ...formData, boss_damage: e.target.value })}
                        placeholder="35 (Efecto Wither)"
                        style={{ width: '100%', background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px', padding: '0.6rem 0.8rem', color: '#fff', fontSize: '0.85rem' }}
                    />
                </div>
                <div>
                    <label htmlFor="boss_damage_phase_2_input" style={{ display: 'block', fontSize: '0.7rem', color: '#aaa', marginBottom: '0.3rem' }}>Daño Crítico Fase 2</label>
                    <input
                        id="boss_damage_phase_2_input"
                        type="text"
                        value={formData.boss_damage_phase_2 ?? ''}
                        onChange={e => setFormData({ ...formData, boss_damage_phase_2: e.target.value })}
                        placeholder="50 Daño Crítico"
                        style={{ width: '100%', background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px', padding: '0.6rem 0.8rem', color: '#fff', fontSize: '0.85rem' }}
                    />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                    <label htmlFor="boss_armor_input" style={{ display: 'block', fontSize: '0.7rem', color: '#aaa', marginBottom: '0.3rem' }}>Resistencia / Escudo Knockback</label>
                    <input
                        id="boss_armor_input"
                        type="text"
                        value={formData.boss_armor ?? ''}
                        onChange={e => setFormData({ ...formData, boss_armor: e.target.value })}
                        placeholder="1.0 Resistencia al Empuje"
                        style={{ width: '100%', background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px', padding: '0.6rem 0.8rem', color: '#fff', fontSize: '0.85rem' }}
                    />
                </div>
                <div>
                    <label htmlFor="boss_speed_input" style={{ display: 'block', fontSize: '0.7rem', color: '#aaa', marginBottom: '0.3rem' }}>Velocidad & Rango de Agresión</label>
                    <input
                        id="boss_speed_input"
                        type="text"
                        value={formData.boss_speed ?? ''}
                        onChange={e => setFormData({ ...formData, boss_speed: e.target.value })}
                        placeholder="MovementSpeed 0.2 (Rango 64)"
                        style={{ width: '100%', background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px', padding: '0.6rem 0.8rem', color: '#fff', fontSize: '0.85rem' }}
                    />
                </div>
            </div>

            <div>
                <label htmlFor="boss_immunities_input" style={{ display: 'block', fontSize: '0.7rem', color: '#aaa', marginBottom: '0.3rem' }}>Inmunidades & Protecciones Especiales (separadas por comas)</label>
                <input
                    id="boss_immunities_input"
                    type="text"
                    value={Array.isArray(formData.boss_immunities) ? formData.boss_immunities.join(', ') : (formData.boss_immunities ?? '')}
                    onChange={e => setFormData({ ...formData, boss_immunities: e.target.value.split(',').map(s => s.trim()) })}
                    placeholder="Inmune a Proyectiles (Fase 2), Inmune a Fuego, Resistencia a Magia"
                    style={{ width: '100%', background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px', padding: '0.6rem 0.8rem', color: '#fff', fontSize: '0.85rem' }}
                />
            </div>
        </div>
    );
}

function BossSkillsTab({ formData, setFormData }: Readonly<{
    formData: Partial<WikiArticle>;
    setFormData: React.Dispatch<React.SetStateAction<Partial<WikiArticle>>>;
}>) {
    const phases = (formData.boss_phases && formData.boss_phases.length > 0)
        ? formData.boss_phases
        : [
            { phase_number: 1, phase_name: 'Fase I', model_3d_url: formData.model_3d_url || '/models/toro_wither.gltf', hp: formData.boss_hp || '600 HP', damage: formData.boss_damage || '35 Daño', attacks: formData.boss_phase_1_attacks || [] },
            { phase_number: 2, phase_name: 'Fase II', model_3d_url: formData.model_3d_url_phase_2 || '/models/toro_wither_terror.gltf', hp: formData.boss_hp_phase_2 || '800 HP', damage: formData.boss_damage_phase_2 || '50 Daño Crítico', attacks: formData.boss_phase_2_attacks || [] }
        ];

    const [selectedPhaseIdx, setSelectedPhaseIdx] = useState<number>(0);
    const [previewClip, setPreviewClip] = useState<string | null>(null);
    const [uploadingPhaseIdx, setUploadingPhaseIdx] = useState<number | null>(null);

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
            {/* Split 2-Column Grid Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: '1.2rem', alignItems: 'start' }}>
                
                {/* LEFT COLUMN: Editor Controls */}
                <div style={{ width: '100%', minWidth: 0, overflow: 'hidden' }}>
                    
                    {/* Dynamic Phase Tabs Header */}
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

                    {/* Active Phase Editor Card */}
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
                                        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#fca5a5', padding: '0.35rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                                            {uploadingPhaseIdx === selectedPhaseIdx ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                                            <span>{uploadingPhaseIdx === selectedPhaseIdx ? 'Subiendo...' : 'Subir 3D'}</span>
                                            <input type="file" accept=".gltf,.glb,.json" style={{ display: 'none' }} onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    setUploadingPhaseIdx(selectedPhaseIdx);
                                                    try {
                                                        const url = await uploadImage(file, 'admin-assets', 'models');
                                                        updatePhaseField(selectedPhaseIdx, 'model_3d_url', url);
                                                    } catch (err: unknown) {
                                                        const errorMsg = err instanceof Error ? err.message : 'Error al subir el modelo 3D';
                                                        alert(errorMsg);
                                                    } finally {
                                                        setUploadingPhaseIdx(null);
                                                    }
                                                }
                                            }} />
                                        </label>
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

                            {/* Detected GLTF Clips Badge Bar */}
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

                            {/* Attacks Table for current phase */}
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
                                    {/* Line 1: Main Controls */}
                                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1.2fr) minmax(0, 0.9fr) minmax(0, 0.8fr) auto auto', gap: '0.4rem', marginBottom: '0.4rem', alignItems: 'center', width: '100%' }}>
                                        <input type="text" placeholder="Nombre (ej. Shoot)" value={attack.name} onChange={e => updateAttack(selectedPhaseIdx, aIdx, 'name', e.target.value)} style={{ width: '100%', minWidth: 0, background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', padding: '0.35rem 0.4rem', color: '#fff', fontSize: '0.75rem', boxSizing: 'border-box' }} />
                                        
                                        {/* Clip GLTF Selector */}
                                        {detectedClips.length > 0 ? (
                                            <select
                                                value={attack.animation_clip ?? ''}
                                                onChange={(e) => updateAttack(selectedPhaseIdx, aIdx, 'animation_clip', e.target.value)}
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
                                                    boxSizing: 'border-box'
                                                }}
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

                                        {/* Play 3D Clip Preview Button */}
                                        <button
                                            type="button"
                                            title="Probar esta animación en el visor 3D"
                                            onClick={() => setPreviewClip(attack.animation_clip || 'idle')}
                                            style={{ background: 'rgba(59, 130, 246, 0.3)', border: '1px solid rgba(59, 130, 246, 0.5)', color: '#bfdbfe', padding: '0.35rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.2rem', whiteSpace: 'nowrap' }}
                                        >
                                            ▶️ Probar
                                        </button>

                                        {/* Delete Attack Button */}
                                        <button
                                            type="button"
                                            title="Eliminar esta habilidad"
                                            onClick={() => removeAttack(selectedPhaseIdx, aIdx)}
                                            style={{ background: 'rgba(239, 68, 68, 0.3)', border: '1px solid rgba(239, 68, 68, 0.5)', color: '#fca5a5', padding: '0.35rem 0.55rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold', whiteSpace: 'nowrap' }}
                                        >
                                            🗑️
                                        </button>
                                    </div>

                                    {/* Line 2: Full Width Description */}
                                    <input type="text" placeholder="Descripción detallada de la habilidad..." value={attack.description} onChange={e => updateAttack(selectedPhaseIdx, aIdx, 'description', e.target.value)} style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', padding: '0.35rem 0.5rem', color: '#ccc', fontSize: '0.73rem', boxSizing: 'border-box' }} />

                                    {/* Line 3: Skill Variants & Secondary Clips Selector */}
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
                                                        title={isSelected ? `Quitar variante ${clip} (haz clic para probar en el visor 3D)` : `Añadir variante ${clip} (haz clic para probar en el visor 3D)`}
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

                {/* RIGHT COLUMN: Live 3D Viewport Preview Inspector */}
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

function BossMediaTab({ formData, setFormData, uploadingField, handleFileUpload }: Readonly<{
    formData: Partial<WikiArticle>;
    setFormData: React.Dispatch<React.SetStateAction<Partial<WikiArticle>>>;
    uploadingField: string | null;
    handleFileUpload: (file: File, fieldName: keyof WikiArticle, folder: string) => Promise<void>;
}>) {
    return (
        <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                    <label htmlFor="boss_location_input" style={{ display: 'block', fontSize: '0.7rem', color: '#aaa', marginBottom: '0.3rem' }}>Hábitat / Bioma / Ubicación</label>
                    <input
                        id="boss_location_input"
                        type="text"
                        value={formData.boss_location ?? ''}
                        onChange={e => setFormData({ ...formData, boss_location: e.target.value })}
                        placeholder="Nether / Mazmorra Olvidada"
                        style={{ width: '100%', background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px', padding: '0.6rem 0.8rem', color: '#fff', fontSize: '0.85rem' }}
                    />
                </div>
                <div>
                    <label htmlFor="boss_spawn_method_input" style={{ display: 'block', fontSize: '0.7rem', color: '#aaa', marginBottom: '0.3rem' }}>Método de Invocación / Ritual</label>
                    <input
                        id="boss_spawn_method_input"
                        type="text"
                        value={formData.boss_spawn_method ?? ''}
                        onChange={e => setFormData({ ...formData, boss_spawn_method: e.target.value })}
                        placeholder="Invocado con el Cráneo de Tormenta Olvidada en el Altar Ancestral"
                        style={{ width: '100%', background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px', padding: '0.6rem 0.8rem', color: '#fff', fontSize: '0.85rem' }}
                    />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                    <label htmlFor="boss_spawn_command_input" style={{ display: 'block', fontSize: '0.7rem', color: '#aaa', marginBottom: '0.3rem' }}>Comando In-Game (Spawning / Give)</label>
                    <input
                        id="boss_spawn_command_input"
                        type="text"
                        value={formData.boss_spawn_command ?? ''}
                        onChange={e => setFormData({ ...formData, boss_spawn_command: e.target.value })}
                        placeholder="/mm mobs spawn toro_wither 1 world,x,y,z"
                        style={{ width: '100%', background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px', padding: '0.6rem 0.8rem', fontFamily: 'monospace', color: '#6ee7b7', fontSize: '0.85rem' }}
                    />
                </div>
                <div>
                    <label htmlFor="boss_music_url_input" style={{ display: 'block', fontSize: '0.7rem', color: '#aaa', marginBottom: '0.3rem' }}>Música de Boss Theme (URL Audio / Subir .mp3 / .ogg)</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input
                            id="boss_music_url_input"
                            type="text"
                            value={formData.boss_music_url ?? ''}
                            onChange={e => setFormData({ ...formData, boss_music_url: e.target.value })}
                            placeholder="/audio/boss_theme.mp3"
                            style={{ flex: 1, background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px', padding: '0.6rem 0.8rem', color: '#fff', fontSize: '0.85rem' }}
                        />
                        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(59, 130, 246, 0.2)', border: '1px solid rgba(59, 130, 246, 0.4)', color: '#93c5fd', padding: '0.6rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                            {uploadingField === 'boss_music_url' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                            <span>{uploadingField === 'boss_music_url' ? 'Subiendo...' : 'Subir Audio'}</span>
                            <input type="file" accept=".mp3,.ogg,.wav" style={{ display: 'none' }} onChange={e => {
                                const file = e.target.files?.[0];
                                if (file) handleFileUpload(file, 'boss_music_url', 'audio');
                            }} />
                        </label>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '1rem' }}>
                <div>
                    <label htmlFor="boss_drops_input" style={{ display: 'block', fontSize: '0.7rem', color: '#aaa', marginBottom: '0.3rem' }}>Recompensas / Drops Míticos (separados por comas)</label>
                    <input
                        id="boss_drops_input"
                        type="text"
                        value={Array.isArray(formData.boss_drops) ? formData.boss_drops.join(', ') : (formData.boss_drops ?? '')}
                        onChange={e => setFormData({ ...formData, boss_drops: e.target.value.split(',').map(s => s.trim()) })}
                        placeholder="Cráneo de Tormenta Olvidada, Estrella de las Sombras, Lingote de Netherita Ancestral"
                        style={{ width: '100%', background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px', padding: '0.6rem 0.8rem', color: '#fff', fontSize: '0.85rem' }}
                    />
                </div>
                <div>
                    <label htmlFor="boss_kc_reward_input" style={{ display: 'block', fontSize: '0.7rem', color: '#aaa', marginBottom: '0.3rem' }}>Recompensa KC (KilluCoins)</label>
                    <input
                        id="boss_kc_reward_input"
                        type="number"
                        value={formData.boss_kc_reward ?? 4500}
                        onChange={e => setFormData({ ...formData, boss_kc_reward: Number(e.target.value) })}
                        placeholder="4500"
                        style={{ width: '100%', background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px', padding: '0.6rem 0.8rem', color: '#fff', fontSize: '0.85rem' }}
                    />
                </div>
            </div>
        </div>
    );
}

function BossLabelsTab({ formData, setFormData }: Readonly<{
    formData: Partial<WikiArticle>;
    setFormData: React.Dispatch<React.SetStateAction<Partial<WikiArticle>>>;
}>) {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
                <label style={{ display: 'block', fontSize: '0.7rem', color: '#aaa', marginBottom: '0.3rem' }}>Tema de Color Visual (Card Theme)</label>
                <select
                    value={formData.card_theme ?? 'red'}
                    onChange={e => setFormData({ ...formData, card_theme: e.target.value as any })}
                    style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '0.6rem 0.8rem', color: '#fff', fontSize: '0.85rem' }}
                >
                    <option value="red">🔴 Carmesí / Hostil (Rojo)</option>
                    <option value="emerald">🟢 Esmeralda / Mascota (Verde)</option>
                    <option value="amber">🟡 Ámbar / Mercader (Dorado)</option>
                    <option value="purple">🟣 Imperial / Mítico (Púrpura)</option>
                    <option value="cyan">🔵 Nether / Abisal (Cyan)</option>
                    <option value="slate">⚙️ Neutro / Sistema (Gris)</option>
                </select>
            </div>
            <div>
                <label style={{ display: 'block', fontSize: '0.7rem', color: '#aaa', marginBottom: '0.3rem' }}>Título Cuadro 1 (Amenaza / Tipo)</label>
                <input
                    type="text"
                    value={formData.threat_label ?? ''}
                    onChange={e => setFormData({ ...formData, threat_label: e.target.value })}
                    placeholder="ej. NIVEL DE AMENAZA / TEMPERAMENTO / MONEDA"
                    style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '0.6rem 0.8rem', color: '#fff', fontSize: '0.85rem' }}
                />
            </div>
            <div>
                <label style={{ display: 'block', fontSize: '0.7rem', color: '#aaa', marginBottom: '0.3rem' }}>Título Cuadro 2 (Salud / Vida)</label>
                <input
                    type="text"
                    value={formData.hp_label ?? ''}
                    onChange={e => setFormData({ ...formData, hp_label: e.target.value })}
                    placeholder="ej. SALUD DE COMBATE / SALUD DE MASCOTA"
                    style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '0.6rem 0.8rem', color: '#fff', fontSize: '0.85rem' }}
                />
            </div>
            <div>
                <label style={{ display: 'block', fontSize: '0.7rem', color: '#aaa', marginBottom: '0.3rem' }}>Título Cuadro 3 (Ataque / Daño)</label>
                <input
                    type="text"
                    value={formData.damage_label ?? ''}
                    onChange={e => setFormData({ ...formData, damage_label: e.target.value })}
                    placeholder="ej. PODER DE DAÑO / ESPECIALIDAD DE TIENDA"
                    style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '0.6rem 0.8rem', color: '#fff', fontSize: '0.85rem' }}
                />
            </div>
            <div>
                <label style={{ display: 'block', fontSize: '0.7rem', color: '#aaa', marginBottom: '0.3rem' }}>Título Cuadro 4 (Velocidad / Marcha)</label>
                <input
                    type="text"
                    value={formData.speed_label ?? ''}
                    onChange={e => setFormData({ ...formData, speed_label: e.target.value })}
                    placeholder="ej. VELOCIDAD / MARCHA / AGILIDAD DE VUELO"
                    style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '0.6rem 0.8rem', color: '#fff', fontSize: '0.85rem' }}
                />
            </div>
            <div>
                <label style={{ display: 'block', fontSize: '0.7rem', color: '#aaa', marginBottom: '0.3rem' }}>Título Hábitat / Ubicación</label>
                <input
                    type="text"
                    value={formData.location_label ?? ''}
                    onChange={e => setFormData({ ...formData, location_label: e.target.value })}
                    placeholder="ej. UBICACIÓN & APARICIÓN / HÁBITAT NATURAL"
                    style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '0.6rem 0.8rem', color: '#fff', fontSize: '0.85rem' }}
                />
            </div>
            <div>
                <label style={{ display: 'block', fontSize: '0.7rem', color: '#aaa', marginBottom: '0.3rem' }}>Título Drops / Objetos</label>
                <input
                    type="text"
                    value={formData.drops_label ?? ''}
                    onChange={e => setFormData({ ...formData, drops_label: e.target.value })}
                    placeholder="ej. BOTÍN DE CAZA / CATÁLOGO DE MERCADO"
                    style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '0.6rem 0.8rem', color: '#fff', fontSize: '0.85rem' }}
                />
            </div>
            <div>
                <label style={{ display: 'block', fontSize: '0.7rem', color: '#aaa', marginBottom: '0.3rem' }}>Título Pie de Página (Recompensa)</label>
                <input
                    type="text"
                    value={formData.bounty_label ?? ''}
                    onChange={e => setFormData({ ...formData, bounty_label: e.target.value })}
                    placeholder="ej. RECOMPENSA DE CAZA / RECOMPENSA IMPERIAL"
                    style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '0.6rem 0.8rem', color: '#fff', fontSize: '0.85rem' }}
                />
            </div>
        </div>
    );
}

function BossMetadataFields({ formData, setFormData }: Readonly<BossMetadataFieldsProps>) {
    const [activeTab, setActiveTab] = useState<'models' | 'stats' | 'skills' | 'media' | 'labels'>('models');
    const [uploadingField, setUploadingField] = useState<string | null>(null);

    // AI JSON Import / Export State
    const [showAiModal, setShowAiModal] = useState(false);
    const [aiJsonInput, setAiJsonInput] = useState('');
    const [copiedPrompt, setCopiedPrompt] = useState(false);
    const [copiedJson, setCopiedJson] = useState(false);
    const [importStatus, setImportStatus] = useState<string | null>(null);

    const AI_PROMPT_TEMPLATE = `Actúa como diseñador de mobs y entidades 3D para CrystalTides SMP. Genera la configuración JSON exacta para un Boss o Criatura con la siguiente estructura válida:

{
  "title": "Nombre del Jefe",
  "category": "Bestiario / Jefes 3D",
  "boss_subtitle": "Subtítulo / Apodo Mítico",
  "boss_tier": "Jefe Supremo de Mazmorra",
  "boss_entity_type": "MythicMobs Plugin",
  "boss_mod_name": "Nombre del Mod o Pack",
  "model_3d_url": "/models/toro_wither.gltf",
  "boss_hp": "1000 HP",
  "boss_damage": "45 Daño",
  "boss_armor": "90% Reducción Proyectiles",
  "boss_speed": "0.2 Vuelo",
  "boss_location": "Nether / Mazmorra Olvidada",
  "boss_spawn_method": "Ritual de Invocación",
  "boss_kc_reward": 5000,
  "boss_drops": ["Nether Star", "Cráneo Ancestral"],
  "boss_immunities": ["Inmune a Fuego", "Resistencia a Magia"],
  "boss_phases": [
    {
      "phase_number": 1,
      "phase_name": "Fase I: Tormenta",
      "model_3d_url": "/models/fase1.gltf",
      "hp": "500 HP",
      "damage": "35 Daño",
      "attacks": [
        {
          "name": "Smash Brutal",
          "type": "Melee",
          "damage": "40 Daño",
          "description": "Golpea el suelo creando una onda expansiva.",
          "animation_clip": "smash",
          "variant_clips": ["smash", "roundhouse"]
        }
      ]
    }
  ]
}

Responde ÚNICAMENTE con el objeto JSON válido sin texto markdown adicional alrededor.`;

    const handleCopyPrompt = () => {
        navigator.clipboard.writeText(AI_PROMPT_TEMPLATE);
        setCopiedPrompt(true);
        setTimeout(() => setCopiedPrompt(false), 2000);
    };

    const handleCopyCurrentJson = () => {
        const exportData = {
            title: formData.title || '',
            category: formData.category || 'Bestiario / Jefes 3D',
            boss_subtitle: formData.boss_subtitle || '',
            boss_tier: formData.boss_tier || 'Jefe Supremo de Mazmorra',
            boss_entity_type: formData.boss_entity_type || 'MythicMobs Plugin',
            boss_mod_name: formData.boss_mod_name || '',
            model_3d_url: formData.model_3d_url || '',
            model_3d_url_phase_2: formData.model_3d_url_phase_2 || '',
            boss_hp: formData.boss_hp || '',
            boss_hp_phase_2: formData.boss_hp_phase_2 || '',
            boss_damage: formData.boss_damage || '',
            boss_damage_phase_2: formData.boss_damage_phase_2 || '',
            boss_armor: formData.boss_armor || '',
            boss_speed: formData.boss_speed || '',
            boss_location: formData.boss_location || '',
            boss_spawn_method: formData.boss_spawn_method || '',
            boss_spawn_command: formData.boss_spawn_command || '',
            boss_kc_reward: formData.boss_kc_reward || 4500,
            boss_drops: formData.boss_drops || [],
            boss_immunities: formData.boss_immunities || [],
            boss_phases: formData.boss_phases || []
        };
        navigator.clipboard.writeText(JSON.stringify(exportData, null, 2));
        setCopiedJson(true);
        setTimeout(() => setCopiedJson(false), 2000);
    };

    const handleImportAiJson = () => {
        try {
            const parsed = JSON.parse(aiJsonInput);
            if (!parsed || typeof parsed !== 'object') {
                throw new Error('Formato JSON inválido.');
            }

            setFormData(prev => ({
                ...prev,
                title: parsed.title || prev.title,
                slug: parsed.slug || (parsed.title ? parsed.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : prev.slug),
                category: parsed.category || 'Bestiario / Jefes 3D',
                description: parsed.description || prev.description,
                content: parsed.content || prev.content || `# ${parsed.title || 'Jefe Supremo'}\n\n${parsed.description || 'Entidad 3D de CrystalTides SMP.'}`,
                model_3d_url: parsed.model_3d_url || prev.model_3d_url,
                model_3d_url_phase_2: parsed.model_3d_url_phase_2 || prev.model_3d_url_phase_2,
                boss_subtitle: parsed.boss_subtitle || prev.boss_subtitle,
                boss_entity_type: parsed.boss_entity_type || prev.boss_entity_type,
                boss_mod_name: parsed.boss_mod_name || prev.boss_mod_name,
                boss_tier: parsed.boss_tier || prev.boss_tier,
                boss_hp: parsed.boss_hp || prev.boss_hp,
                boss_hp_phase_2: parsed.boss_hp_phase_2 || prev.boss_hp_phase_2,
                boss_damage: parsed.boss_damage || prev.boss_damage,
                boss_damage_phase_2: parsed.boss_damage_phase_2 || prev.boss_damage_phase_2,
                boss_armor: parsed.boss_armor || prev.boss_armor,
                boss_speed: parsed.boss_speed || prev.boss_speed,
                boss_location: parsed.boss_location || prev.boss_location,
                boss_spawn_method: parsed.boss_spawn_method || prev.boss_spawn_method,
                boss_spawn_command: parsed.boss_spawn_command || prev.boss_spawn_command,
                boss_kc_reward: parsed.boss_kc_reward || prev.boss_kc_reward,
                boss_drops: Array.isArray(parsed.boss_drops) ? parsed.boss_drops : prev.boss_drops,
                boss_immunities: Array.isArray(parsed.boss_immunities) ? parsed.boss_immunities : prev.boss_immunities,
                boss_phases: Array.isArray(parsed.boss_phases) ? parsed.boss_phases : (Array.isArray(parsed.phases) ? parsed.phases : prev.boss_phases)
            }));

            setImportStatus('✅ Boss importado y cargado en el formulario con éxito.');
            setTimeout(() => {
                setShowAiModal(false);
                setImportStatus(null);
                setAiJsonInput('');
            }, 1200);
        } catch (err: unknown) {
            const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
            setImportStatus(`❌ Error al analizar el JSON: ${errorMsg}`);
        }
    };

    const handleFileUpload = async (file: File, fieldName: keyof WikiArticle, folder: string) => {
        setUploadingField(fieldName);
        try {
            const url = await uploadImage(file, 'admin-assets', folder);
            setFormData(prev => ({ ...prev, [fieldName]: url }));
        } catch {
            const localUrl = URL.createObjectURL(file);
            setFormData(prev => ({ ...prev, [fieldName]: localUrl }));
        } finally {
            setUploadingField(null);
        }
    };

    return (
        <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.25)', padding: '1.2rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
            {/* Top Toolbar Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.8rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#ef4444', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>🐉 Configuración de Entidades, Mods & Bosses 3D</span>
                </div>

                {/* AI & Automation Toolbar Buttons */}
                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                    <button
                        type="button"
                        onClick={() => setShowAiModal(true)}
                        style={{ background: 'rgba(168, 85, 247, 0.2)', border: '1px solid rgba(168, 85, 247, 0.5)', color: '#e9d5ff', padding: '0.35rem 0.65rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                        title="Importar una entidad completa pegando un JSON generado por IA"
                    >
                        <Sparkles size={13} /> ✨ Importar desde IA / JSON
                    </button>
                    <button
                        type="button"
                        onClick={handleCopyCurrentJson}
                        style={{ background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.4)', color: '#bfdbfe', padding: '0.35rem 0.65rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                        title="Copiar la configuración actual del Boss en formato JSON"
                    >
                        {copiedJson ? <Check size={13} /> : <FileCode size={13} />}
                        {copiedJson ? '¡JSON Copiado!' : 'Copiar JSON Boss'}
                    </button>
                </div>
            </div>

            {/* AI Modal Drawer for JSON Import */}
            {showAiModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
                    <div style={{ background: '#121216', border: '1px solid rgba(168, 85, 247, 0.4)', borderRadius: '16px', padding: '1.8rem', width: '100%', maxWidth: '750px', boxShadow: '0 20px 50px rgba(0,0,0,0.9)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 style={{ margin: 0, color: '#e9d5ff', fontSize: '1.1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Bot size={20} className="text-purple-400" /> Asistente IA - Importador & Generador JSON 3D
                            </h3>
                            <button type="button" onClick={() => setShowAiModal(false)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}><X size={18} /></button>
                        </div>

                        <p style={{ fontSize: '0.78rem', color: '#aaa', marginBottom: '1rem', lineHeight: '1.5' }}>
                            Pega aquí la respuesta en formato <strong>JSON</strong> producida por ChatGPT, Gemini, Claude o cualquier modelo IA. Todos los campos (fases, modelo 3D, HP, habilidades y variantes) se auto-completarán automáticamente.
                        </p>

                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.8rem' }}>
                            <button
                                type="button"
                                onClick={handleCopyPrompt}
                                style={{ background: 'rgba(168, 85, 247, 0.15)', border: '1px solid rgba(168, 85, 247, 0.3)', color: '#d8b4fe', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                            >
                                {copiedPrompt ? <Check size={14} /> : <Copy size={14} />}
                                {copiedPrompt ? '¡Prompt Copiado!' : '📋 Copiar Prompt para IA'}
                            </button>
                        </div>

                        <textarea
                            rows={12}
                            value={aiJsonInput}
                            onChange={e => setAiJsonInput(e.target.value)}
                            placeholder='{\n  "title": "Sculk Leviathan",\n  "boss_subtitle": "Terror de las Profundidades",\n  "model_3d_url": "/models/sculk_dragon.gltf",\n  "boss_hp": "1500 HP",\n  "boss_phases": [...]\n}'
                            style={{ width: '100%', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.8rem', color: '#a7f3d0', fontFamily: 'monospace', fontSize: '0.8rem', outline: 'none', boxSizing: 'border-box', marginBottom: '1rem' }}
                        />

                        {importStatus && (
                            <div style={{ padding: '0.6rem 0.8rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 'bold', marginBottom: '1rem', background: importStatus.startsWith('✅') ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)', color: importStatus.startsWith('✅') ? '#86efac' : '#fca5a5', border: '1px solid', borderColor: importStatus.startsWith('✅') ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)' }}>
                                {importStatus}
                            </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem' }}>
                            <button type="button" onClick={() => setShowAiModal(false)} style={{ background: 'transparent', border: 'none', color: '#888', padding: '0.5rem 1rem', cursor: 'pointer', fontSize: '0.8rem' }}>Cancelar</button>
                            <button type="button" onClick={handleImportAiJson} style={{ background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)', border: 'none', color: '#fff', padding: '0.5rem 1.4rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <Sparkles size={14} /> Importar a Formulario
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Navigation Tabs Bar */}
            <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                    <button
                        type="button"
                        onClick={() => setActiveTab('models')}
                        style={{
                            padding: '0.4rem 0.7rem',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            border: '1px solid',
                            borderColor: activeTab === 'models' ? '#ef4444' : 'rgba(255,255,255,0.1)',
                            background: activeTab === 'models' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(0,0,0,0.3)',
                            color: activeTab === 'models' ? '#fca5a5' : '#888',
                            cursor: 'pointer'
                        }}
                    >
                        🧩 1. Origen & Render 3D
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('stats')}
                        style={{
                            padding: '0.4rem 0.7rem',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            border: '1px solid',
                            borderColor: activeTab === 'stats' ? '#ef4444' : 'rgba(255,255,255,0.1)',
                            background: activeTab === 'stats' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(0,0,0,0.3)',
                            color: activeTab === 'stats' ? '#fca5a5' : '#888',
                            cursor: 'pointer'
                        }}
                    >
                        ⚔️ 2. Stats
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('skills')}
                        style={{
                            padding: '0.4rem 0.7rem',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            border: '1px solid',
                            borderColor: activeTab === 'skills' ? '#ef4444' : 'rgba(255,255,255,0.1)',
                            background: activeTab === 'skills' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(0,0,0,0.3)',
                            color: activeTab === 'skills' ? '#fca5a5' : '#888',
                            cursor: 'pointer'
                        }}
                    >
                        🔥 3. Editor N-Fases & Clips
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('media')}
                        style={{
                            padding: '0.4rem 0.7rem',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            border: '1px solid',
                            borderColor: activeTab === 'media' ? '#ef4444' : 'rgba(255,255,255,0.1)',
                            background: activeTab === 'media' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(0,0,0,0.3)',
                            color: activeTab === 'media' ? '#fca5a5' : '#888',
                            cursor: 'pointer'
                        }}
                    >
                        🎵 4. Ritual, Audio & Drops
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('labels')}
                        style={{
                            padding: '0.4rem 0.7rem',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            border: '1px solid',
                            borderColor: activeTab === 'labels' ? '#ef4444' : 'rgba(255,255,255,0.1)',
                            background: activeTab === 'labels' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(0,0,0,0.3)',
                            color: activeTab === 'labels' ? '#fca5a5' : '#888',
                            cursor: 'pointer'
                        }}
                    >
                        🎨 5. Etiquetas Dinámicas & Tema
                    </button>
                </div>

            {activeTab === 'models' && <BossModelsTab formData={formData} setFormData={setFormData} uploadingField={uploadingField} handleFileUpload={handleFileUpload} />}
            {activeTab === 'stats' && <BossStatsTab formData={formData} setFormData={setFormData} />}
            {activeTab === 'skills' && <BossSkillsTab formData={formData} setFormData={setFormData} />}
            {activeTab === 'media' && <BossMediaTab formData={formData} setFormData={setFormData} uploadingField={uploadingField} handleFileUpload={handleFileUpload} />}
            {activeTab === 'labels' && <BossLabelsTab formData={formData} setFormData={setFormData} />}
        </div>
    );
}

// Internal component to handle form state and logic
function WikiArticleForm({ 
    initialData, 
    onSave, 
    onClose, 
    isEditing, 
    saving, 
    t 
}: Readonly<{ 
    initialData: Partial<WikiArticle> | null, 
    onSave: (article: Partial<WikiArticle>) => Promise<void>, 
    onClose: () => void, 
    isEditing: boolean, 
    saving: boolean,
    t: TFunction
}>) {
    const [viewMode, setViewMode] = useState<'editor' | 'preview'>('editor')
    const [formData, setFormData] = useState<Partial<WikiArticle>>(initialData || {
        title: "",
        slug: "",
        content: "",
        category: "General"
    })

    const handleSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault()
        await onSave(formData)
    }

    return (
        <form onSubmit={handleSubmit}>
            {/* Mode Switcher Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '0.8rem' }}>
                <button
                    type="button"
                    onClick={() => setViewMode('editor')}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        background: viewMode === 'editor' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                        border: '1px solid ' + (viewMode === 'editor' ? 'rgba(255, 255, 255, 0.3)' : 'transparent'),
                        color: viewMode === 'editor' ? '#fff' : '#888',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: 'bold'
                    }}
                >
                    <Edit3 size={15} /> Editor
                </button>
                <button
                    type="button"
                    onClick={() => setViewMode('preview')}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        background: viewMode === 'preview' ? 'rgba(239, 68, 68, 0.2)' : 'transparent',
                        border: '1px solid ' + (viewMode === 'preview' ? 'rgba(239, 68, 68, 0.5)' : 'transparent'),
                        color: viewMode === 'preview' ? '#fca5a5' : '#888',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: 'bold'
                    }}
                >
                    <Eye size={15} /> Vista Previa en Vivo
                </button>
            </div>

            {viewMode === 'preview' ? (
                <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '2rem', marginBottom: '1.5rem' }}>
                    <div style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                        Categoría: <span style={{ color: '#fff' }}>{formData.category}</span>
                    </div>
                    <h1 style={{ fontSize: '2rem', fontWeight: '900', color: '#fff', marginBottom: '1.5rem' }}>
                        {formData.title || 'Título de Ejemplo'}
                    </h1>

                    <div style={{ color: '#ddd', fontSize: '0.95rem', lineHeight: '1.7', marginBottom: '2rem' }}>
                        <ReactMarkdown>
                            {formData.content || '_Escribe contenido en el editor para previsualizarlo..._'}
                        </ReactMarkdown>
                    </div>

                    {/* 3D Boss Card Preview */}
                    {(formData.model_3d_url || formData.category === "Bestiario / Jefes 3D") && (
                        <div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#ef4444', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                                Previsualización de Render 3D:
                            </div>
                            <WikiBoss3DCard 
                                modelPath={formData.model_3d_url || '/models/toro_wither.gltf'}
                                modelPathPhase2={formData.model_3d_url_phase_2 || '/models/toro_wither_terror.gltf'}
                                bossName={formData.title || 'Nombre del Jefe'}
                                subtitle={formData.boss_subtitle || formData.description || 'Jefe de Mazmorra In-Game'}
                                hp={formData.boss_hp || '600 HP'}
                                hpPhase2={formData.boss_hp_phase_2 || '800 HP (DarkenSky Activo)'}
                                damage={formData.boss_damage || '35 Daño'}
                                damagePhase2={formData.boss_damage_phase_2 || '50 Daño Crítico (NoDamageTicks: 1)'}
                                armor={formData.boss_armor || '1.0 Resistencia al Empuje'}
                                speed={formData.boss_speed || 'MovementSpeed 0.2 Velocidad de Vuelo (Rango 64)'}
                                location={formData.boss_location || 'Nether / Mazmorra Olvidada'}
                                spawnMethod={formData.boss_spawn_method || 'Invocado con el Cráneo de Tormenta Olvidada en el Altar Ancestral'}
                                description={formData.content || formData.description}
                                drops={formData.boss_drops && formData.boss_drops.length > 0 ? formData.boss_drops : ['Recompensa Mítica']}
                                kcReward={formData.boss_kc_reward || 4500}
                                phases={formData.boss_phases}
                                phase1Attacks={formData.boss_phase_1_attacks}
                                phase2Attacks={formData.boss_phase_2_attacks}
                            />
                        </div>
                    )}
                </div>
            ) : (
                <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                    <label htmlFor="wiki-article-title" style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', color: '#555', marginBottom: '0.5rem', letterSpacing: '1px' }}>{t('admin.wiki.title_label')}</label>
                    <input id="wiki-article-title" 
                        type="text" 
                        required
                        value={formData.title} 
                        onChange={e => setFormData({...formData, title: e.target.value})}
                        placeholder={t('admin.wiki.title_placeholder')}
                        style={{ width: '100%', background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '0.8rem 1rem', color: '#fff', outline: 'none' }}
                    />
                </div>
                <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                    <label htmlFor="wiki-article-slug" style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', color: '#555', marginBottom: '0.5rem', letterSpacing: '1px' }}>{t('admin.wiki.slug_label')}</label>
                    <input id="wiki-article-slug" 
                        type="text" 
                        required
                        value={formData.slug} 
                        onChange={e => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/ /g, '-')})}
                        placeholder={t('admin.wiki.slug_placeholder')}
                        style={{ width: '100%', background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '0.8rem 1rem', color: '#fff', outline: 'none' }}
                    />
                </div>
            </div>

            <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <label htmlFor="wiki-article-category" style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', color: '#555', letterSpacing: '1px' }}>{t('admin.wiki.category_label')}</label>
                    <button
                        type="button"
                        onClick={() => {
                            const newCategory = prompt("Escribe el nombre de la nueva categoría (ej. Eventos & Festivales, Monturas Místicas, etc.):");
                            if (newCategory && newCategory.trim()) {
                                setFormData({ ...formData, category: newCategory.trim().toLowerCase().replace(/ /g, '_') });
                            }
                        }}
                        style={{ fontSize: '0.72rem', color: '#0ea5e9', background: 'rgba(14, 165, 233, 0.1)', border: '1px solid rgba(14, 165, 233, 0.3)', padding: '0.2rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        ✨ + Crear Nueva Categoría
                    </button>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <select id="wiki-article-category" 
                        value={formData.category} 
                        onChange={e => setFormData({...formData, category: e.target.value})}
                        style={{ flex: 1, background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '0.8rem 1rem', color: '#fff', outline: 'none' }}
                    >
                        <option value="mobs_hostiles">🔴 Mobs Hostiles</option>
                        <option value="mobs_pacificos">🟢 Mobs Pacíficos / Domésticables</option>
                        <option value="bosses">🟣 Bosses & Jefes Imperiales</option>
                        <option value="mercaderes">🟡 Mercaderes & NPCs</option>
                        <option value="guias_generales">📘 Guías Generales del Servidor</option>
                        <option value="guias_items">🗡️ Guías de Items & Equipamiento</option>
                        <option value="comandos">⚡ Comandos & Utilidades</option>
                        {!['mobs_hostiles', 'mobs_pacificos', 'bosses', 'mercaderes', 'guias_generales', 'guias_items', 'comandos'].includes(formData.category || '') && (
                            <option value={formData.category}>✨ Personalizada: {formData.category}</option>
                        )}
                    </select>
                    <input
                        type="text"
                        value={formData.category ?? ''}
                        onChange={e => setFormData({ ...formData, category: e.target.value.toLowerCase().replace(/ /g, '_') })}
                        placeholder="ID de Categoría"
                        style={{ width: '180px', background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '0.8rem 1rem', color: '#38bdf8', fontFamily: 'monospace', fontSize: '0.85rem' }}
                        title="ID o slug de categoría"
                    />
                </div>
            </div>

            {/* 3D Boss & Creature Metadata Fields */}
            {(formData.category === "Bestiario / Jefes 3D" || formData.model_3d_url) && (
                <BossMetadataFields formData={formData} setFormData={setFormData} />
            )}

            <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="wiki-article-content" style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', color: '#555', marginBottom: '0.5rem', letterSpacing: '1px' }}>{t('admin.wiki.content_label')}</label>
                <textarea id="wiki-article-content" 
                    required
                    rows={12}
                    value={formData.content} 
                    onChange={e => setFormData({...formData, content: e.target.value})}
                    style={{ width: '100%', background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '0.8rem 1rem', color: '#fff', outline: 'none', fontFamily: 'monospace', fontSize: '0.9rem' }}
                    placeholder={t('admin.wiki.content_placeholder')}
                />
            </div>
            </>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" onClick={onClose} style={{ padding: '0.8rem 2rem', color: '#666', background: 'transparent', border: 'none', cursor: 'pointer' }}>{t('admin.wiki.cancel')}</button>
                <button type="submit" disabled={saving} className="btn-primary" style={{ padding: '0.8rem 3rem', minWidth: '180px', display: 'flex', justifyContent: 'center' }}>
                    {saving ? (
                        <Loader2 className="animate-spin" size={20} />
                    ) : (
                        <>{isEditing ? <><Save style={{marginRight: '8px'}} /> {t('admin.wiki.update_btn')}</> : <><Save style={{marginRight: '8px'}} /> {t('admin.wiki.publish_btn')}</>}</>
                    )}
                </button>
            </div>
        </form>
    );
}

export default function WikiArticleFormModal({ isOpen, onClose, onSave, initialData, isEditing, saving }: Readonly<WikiArticleFormModalProps>) {
    const { t } = useTranslation()

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="form-overlay"
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0, 0, 0, 0.8)',
                        backdropFilter: 'blur(5px)',
                        zIndex: 1000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '2rem'
                    }}
                >
                    <motion.div 
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        className="form-container"
                        style={{
                            background: '#111',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '20px',
                            width: '100%',
                            maxWidth: '1250px',
                            maxHeight: '90vh',
                            overflowY: 'auto',
                            padding: '2.5rem'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h2 style={{color: '#fff', margin: 0}}>{isEditing ? t('admin.wiki.edit_title') : t('admin.wiki.new_title')}</h2>
                            <button aria-label="Action" type="button" onClick={onClose} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer' }}><X size={20} /></button>
                        </div>

                        {/* 
                            Key forces a fresh instance when opening/switching articles (create vs edit). 
                            This ensures state is initialized from initialData prop without needing useEffect sync.
                        */}
                        <WikiArticleForm 
                            key={initialData ? `edit-${initialData.slug}` : 'create-new'}
                            initialData={initialData}
                            onSave={onSave}
                            onClose={onClose}
                            isEditing={isEditing}
                            saving={saving}
                            t={t}
                        />
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
