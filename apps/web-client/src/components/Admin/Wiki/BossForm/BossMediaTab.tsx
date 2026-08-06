import React from 'react';
import { Loader2, Upload } from 'lucide-react';
import { WikiArticle } from '../../../../services/wikiService';

interface BossMediaTabProps {
    formData: Partial<WikiArticle>;
    setFormData: React.Dispatch<React.SetStateAction<Partial<WikiArticle>>>;
    uploadingField: string | null;
    handleFileUpload: (file: File, fieldName: keyof WikiArticle, folder: string) => Promise<void>;
}

export function BossMediaTab({ formData, setFormData, uploadingField, handleFileUpload }: Readonly<BossMediaTabProps>) {
    return (
        <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                    <label htmlFor="boss_location_input" style={{ display: 'block', fontSize: '0.7rem', color: '#aaa', marginBottom: '0.3rem' }}>Hábitat / Dimensión / Mazmorra</label>
                    <input
                        id="boss_location_input"
                        type="text"
                        value={formData.boss_location ?? ''}
                        onChange={e => setFormData({ ...formData, boss_location: e.target.value })}
                        placeholder="ej. Nether / Mazmorra del Sculk / End Citadel"
                        style={{ width: '100%', background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px', padding: '0.6rem 0.8rem', color: '#fff', fontSize: '0.85rem' }}
                    />
                </div>

                <div>
                    <label htmlFor="boss_spawn_method_input" style={{ display: 'block', fontSize: '0.7rem', color: '#aaa', marginBottom: '0.3rem' }}>Método de Aparición / Ritual</label>
                    <input
                        id="boss_spawn_method_input"
                        type="text"
                        value={formData.boss_spawn_method ?? ''}
                        onChange={e => setFormData({ ...formData, boss_spawn_method: e.target.value })}
                        placeholder="ej. Altar Wither + 3 Almas Ancestrales"
                        style={{ width: '100%', background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px', padding: '0.6rem 0.8rem', color: '#fff', fontSize: '0.85rem' }}
                    />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                    <label htmlFor="boss_spawn_command_input" style={{ display: 'block', fontSize: '0.7rem', color: '#aaa', marginBottom: '0.3rem' }}>Comando de Invocación Staff / Admin</label>
                    <input
                        id="boss_spawn_command_input"
                        type="text"
                        value={formData.boss_spawn_command ?? ''}
                        onChange={e => setFormData({ ...formData, boss_spawn_command: e.target.value })}
                        placeholder="ej. /mm mobs spawn ToroWither 1 Nether"
                        style={{ width: '100%', background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px', padding: '0.6rem 0.8rem', color: '#fff', fontSize: '0.85rem' }}
                    />
                </div>

                <div>
                    <label htmlFor="boss_kc_reward_input" style={{ display: 'block', fontSize: '0.7rem', color: '#aaa', marginBottom: '0.3rem' }}>Recompensa de Monedas / KC Reward</label>
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

            <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="boss_drops_input" style={{ display: 'block', fontSize: '0.7rem', color: '#aaa', marginBottom: '0.3rem' }}>Catálogo de Drops & Botín de Caza (separados por comas)</label>
                <input
                    id="boss_drops_input"
                    type="text"
                    value={Array.isArray(formData.boss_drops) ? formData.boss_drops.join(', ') : (formData.boss_drops ?? '')}
                    onChange={e => setFormData({ ...formData, boss_drops: e.target.value.split(',').map(s => s.trim()) })}
                    placeholder="Estrella del Nether (100%), Fragmento Mítico (45%), Corazón Abisal"
                    style={{ width: '100%', background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px', padding: '0.6rem 0.8rem', color: '#fff', fontSize: '0.85rem' }}
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                    <label htmlFor="boss_music_url_input" style={{ display: 'block', fontSize: '0.7rem', color: '#aaa', marginBottom: '0.3rem' }}>Música de Fondo / Tema de Combate (.ogg / .mp3)</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input
                            id="boss_music_url_input"
                            type="text"
                            value={formData.boss_music_url ?? ''}
                            onChange={e => setFormData({ ...formData, boss_music_url: e.target.value })}
                            placeholder="/audio/boss_theme.ogg"
                            style={{ flex: 1, background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px', padding: '0.6rem 0.8rem', color: '#fff', fontSize: '0.85rem' }}
                        />
                        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#fca5a5', padding: '0.6rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                            {uploadingField === 'boss_music_url' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                            <span>{uploadingField === 'boss_music_url' ? 'Subiendo...' : 'Subir Audio'}</span>
                            <input type="file" accept=".mp3,.ogg,.wav" style={{ display: 'none' }} onChange={e => {
                                const file = e.target.files?.[0];
                                if (file) handleFileUpload(file, 'boss_music_url', 'audio');
                            }} />
                        </label>
                    </div>
                </div>

                <div>
                    <label htmlFor="boss_sound_spawn_input" style={{ display: 'block', fontSize: '0.7rem', color: '#aaa', marginBottom: '0.3rem' }}>Líneas de Voz / Rugidos Míticos</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input
                            id="boss_sound_spawn_input"
                            type="text"
                            value={formData.boss_sound_spawn ?? ''}
                            onChange={e => setFormData({ ...formData, boss_sound_spawn: e.target.value })}
                            placeholder="/audio/roar.ogg"
                            style={{ flex: 1, background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px', padding: '0.6rem 0.8rem', color: '#fff', fontSize: '0.85rem' }}
                        />
                        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#fca5a5', padding: '0.6rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                            {uploadingField === 'boss_sound_spawn' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                            <span>{uploadingField === 'boss_sound_spawn' ? 'Subiendo...' : 'Subir Rugido'}</span>
                            <input type="file" accept=".mp3,.ogg,.wav" style={{ display: 'none' }} onChange={e => {
                                const file = e.target.files?.[0];
                                if (file) handleFileUpload(file, 'boss_sound_spawn', 'audio');
                            }} />
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
}
