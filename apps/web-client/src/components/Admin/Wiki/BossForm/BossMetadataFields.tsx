import React, { useState } from 'react';
import { Sparkles, Check, FileCode, Bot, X, Copy } from 'lucide-react';
import { WikiArticle } from '../../../../services/wikiService';
import { uploadImage } from '../../../../services/uploadService';
import { BossModelsTab } from './BossModelsTab';
import { BossStatsTab } from './BossStatsTab';
import { BossSkillsTab } from './BossSkillsTab';
import { BossMediaTab } from './BossMediaTab';
import { BossLabelsTab } from './BossLabelsTab';

interface BossMetadataFieldsProps {
    formData: Partial<WikiArticle>;
    setFormData: React.Dispatch<React.SetStateAction<Partial<WikiArticle>>>;
}

type BossTabType = 'models' | 'stats' | 'skills' | 'media' | 'labels';

const TAB_BUTTONS: { id: BossTabType; label: string }[] = [
    { id: 'models', label: '🧩 1. Origen & Render 3D' },
    { id: 'stats', label: '⚔️ 2. Stats' },
    { id: 'skills', label: '🔥 3. Editor N-Fases & Clips' },
    { id: 'media', label: '🎵 4. Ritual, Audio & Drops' },
    { id: 'labels', label: '🎨 5. Etiquetas Dinámicas & Tema' }
];

function BossTabNavigationHeader({
    activeTab,
    setActiveTab
}: Readonly<{
    activeTab: BossTabType;
    setActiveTab: (tab: BossTabType) => void;
}>) {
    return (
        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            {TAB_BUTTONS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            padding: '0.4rem 0.7rem',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            border: '1px solid',
                            borderColor: isActive ? '#ef4444' : 'rgba(255,255,255,0.1)',
                            background: isActive ? 'rgba(239, 68, 68, 0.25)' : 'rgba(0,0,0,0.3)',
                            color: isActive ? '#fca5a5' : '#888',
                            cursor: 'pointer'
                        }}
                    >
                        {tab.label}
                    </button>
                );
            })}
        </div>
    );
}

function parseBossPhases(parsed: Record<string, unknown>, fallback: unknown) {
    if (Array.isArray(parsed.boss_phases)) return parsed.boss_phases;
    if (Array.isArray(parsed.phases)) return parsed.phases;
    return fallback;
}

function parseBossImportData(aiJsonInput: string, prev: Partial<WikiArticle>): Partial<WikiArticle> {
    const parsed = JSON.parse(aiJsonInput);
    if (!parsed || typeof parsed !== 'object') {
        throw new Error('Formato JSON inválido.');
    }

    return {
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
        boss_phases: parseBossPhases(parsed, prev.boss_phases) as WikiArticle['boss_phases']
    };
}

function BossAiJsonModal({
    isOpen,
    onClose,
    setFormData
}: Readonly<{
    isOpen: boolean;
    onClose: () => void;
    setFormData: React.Dispatch<React.SetStateAction<Partial<WikiArticle>>>;
}>) {
    const [aiJsonInput, setAiJsonInput] = useState('');
    const [copiedPrompt, setCopiedPrompt] = useState(false);
    const [importStatus, setImportStatus] = useState<string | null>(null);

    if (!isOpen) return null;

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

    const handleImportAiJson = () => {
        try {
            setFormData(prev => parseBossImportData(aiJsonInput, prev));
            setImportStatus('✅ Boss importado y cargado en el formulario con éxito.');
            setTimeout(() => {
                onClose();
                setImportStatus(null);
                setAiJsonInput('');
            }, 1200);
        } catch (err: unknown) {
            const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
            setImportStatus(`❌ Error al analizar el JSON: ${errorMsg}`);
        }
    };

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
            <div style={{ background: '#121216', border: '1px solid rgba(168, 85, 247, 0.4)', borderRadius: '16px', padding: '1.8rem', width: '100%', maxWidth: '750px', boxShadow: '0 20px 50px rgba(0,0,0,0.9)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ margin: 0, color: '#e9d5ff', fontSize: '1.1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Bot size={20} className="text-purple-400" /> Asistente IA - Importador & Generador JSON 3D
                    </h3>
                    <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}><X size={18} /></button>
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
                    <button type="button" onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#888', padding: '0.5rem 1rem', cursor: 'pointer', fontSize: '0.8rem' }}>Cancelar</button>
                    <button type="button" onClick={handleImportAiJson} style={{ background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)', border: 'none', color: '#fff', padding: '0.5rem 1.4rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Sparkles size={14} /> Importar a Formulario
                    </button>
                </div>
            </div>
        </div>
    );
}

function BossActiveTabRenderer({
    activeTab,
    formData,
    setFormData,
    uploadingField,
    handleFileUpload
}: Readonly<{
    activeTab: BossTabType;
    formData: Partial<WikiArticle>;
    setFormData: React.Dispatch<React.SetStateAction<Partial<WikiArticle>>>;
    uploadingField: string | null;
    handleFileUpload: (file: File, fieldName: keyof WikiArticle, folder: string) => Promise<void>;
}>) {
    switch (activeTab) {
        case 'models':
            return <BossModelsTab formData={formData} setFormData={setFormData} uploadingField={uploadingField} handleFileUpload={handleFileUpload} />;
        case 'stats':
            return <BossStatsTab formData={formData} setFormData={setFormData} />;
        case 'skills':
            return <BossSkillsTab formData={formData} setFormData={setFormData} />;
        case 'media':
            return <BossMediaTab formData={formData} setFormData={setFormData} uploadingField={uploadingField} handleFileUpload={handleFileUpload} />;
        case 'labels':
            return <BossLabelsTab formData={formData} setFormData={setFormData} />;
    }
}

export function BossMetadataFields({ formData, setFormData }: Readonly<BossMetadataFieldsProps>) {
    const [activeTab, setActiveTab] = useState<BossTabType>('models');
    const [uploadingField, setUploadingField] = useState<string | null>(null);
    const [showAiModal, setShowAiModal] = useState(false);
    const [copiedJson, setCopiedJson] = useState(false);

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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.8rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#ef4444', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>🐉 Configuración de Entidades, Mods & Bosses 3D</span>
                </div>

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

            <BossAiJsonModal isOpen={showAiModal} onClose={() => setShowAiModal(false)} setFormData={setFormData} />

            <BossTabNavigationHeader activeTab={activeTab} setActiveTab={setActiveTab} />

            <BossActiveTabRenderer
                activeTab={activeTab}
                formData={formData}
                setFormData={setFormData}
                uploadingField={uploadingField}
                handleFileUpload={handleFileUpload}
            />
        </div>
    );
}
