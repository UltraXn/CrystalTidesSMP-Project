import React from 'react';
import { Loader2, Upload } from 'lucide-react';
import { WikiArticle } from '../../../../services/wikiService';

interface BossModelsTabProps {
    formData: Partial<WikiArticle>;
    setFormData: React.Dispatch<React.SetStateAction<Partial<WikiArticle>>>;
    uploadingField: string | null;
    handleFileUpload: (file: File, fieldName: keyof WikiArticle, folder: string) => Promise<void>;
}

export function BossModelsTab({ formData, setFormData, uploadingField, handleFileUpload }: Readonly<BossModelsTabProps>) {
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
