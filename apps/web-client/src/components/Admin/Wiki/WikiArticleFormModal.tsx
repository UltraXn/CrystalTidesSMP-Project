import { useState } from "react"
import { m as motion, AnimatePresence } from "framer-motion"
import { Save, X, Loader2, Eye, Edit3 } from "lucide-react"
import ReactMarkdown from "react-markdown"
import WikiBoss3DCard from "../../Wiki/WikiBoss3DCard"

import { useTranslation } from "react-i18next"
import { TFunction } from "i18next"
import { WikiArticle } from "../../../services/wikiService"
import { BossMetadataFields } from "./BossForm/BossMetadataFields"

interface WikiArticleFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (article: Partial<WikiArticle>) => Promise<void>;
    initialData: Partial<WikiArticle> | null;
    isEditing: boolean;
    saving: boolean;
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
                            if (newCategory?.trim()) {
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
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="wiki-article-modal-title"
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
                            <h2 id="wiki-article-modal-title" style={{color: '#fff', margin: 0}}>{isEditing ? t('admin.wiki.edit_title') : t('admin.wiki.new_title')}</h2>
                            <button aria-label={t('common.close', 'Cerrar ventana')} type="button" onClick={onClose} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer' }}><X size={20} aria-hidden="true" /></button>
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
