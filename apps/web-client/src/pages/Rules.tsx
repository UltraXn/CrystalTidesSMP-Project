import React, { useEffect, useState, useMemo } from "react"
import Section from "../components/Layout/Section"
import { 
    FaUserShield, FaCommentDots, FaHammer, FaTree, 
    FaPaintBrush, FaVideo, FaShieldAlt, FaPlus, FaEdit, 
    FaTrash, FaSave, FaGavel, FaInfoCircle, FaTimes,
    FaBalanceScale, FaUserSecret, FaGlobeAmericas, FaBullhorn,
    FaLanguage, FaSpinner, FaPalette, FaUsers
} from "react-icons/fa"
import { gsap } from "gsap"
import { useTranslation } from 'react-i18next'
import { useAuth } from "../context/AuthContext"
import { getRules, createRule, updateRule, deleteRule, Rule } from "../services/ruleService"
import { supabase } from "../services/supabaseClient"
import Loader from "../components/UI/Loader"
import "../styles/rules.css" // Import custom premium styles
const API_URL = import.meta.env.VITE_API_URL || '/api';

// Icon mapping based on Category - Enhanced for beauty
const CATEGORY_CONFIG: Record<string, { icon: React.ReactNode, color: string }> = {
    'General': { icon: <FaInfoCircle />, color: '#6366f1' }, // Indigo
    'Comportamiento': { icon: <FaUserShield />, color: '#f87171' }, // Red
    'Chat': { icon: <FaCommentDots />, color: '#4ade80' }, // Green
    'PvP': { icon: <FaHammer />, color: '#fb923c' }, // Orange
    'Construcción': { icon: <FaTree />, color: '#2dd4bf' }, // Teal
    'Modificaciones': { icon: <FaPaintBrush />, color: '#a78bfa' }, // Purple
    'Staff': { icon: <FaBalanceScale />, color: '#f472b6' }, // Pink
    'Seguridad': { icon: <FaShieldAlt />, color: '#10b981' }, // Emerald
    'Contenido': { icon: <FaVideo />, color: '#fcd34d' }, // Amber
    'Economía': { icon: <FaBalanceScale />, color: '#34d399' }, // Emerald
    'Mundo': { icon: <FaGlobeAmericas />, color: '#60a5fa' }, // Blue
    'Cuenta': { icon: <FaUserSecret />, color: '#94a3b8' }, // Gray
    'Discord': { icon: <FaBullhorn />, color: '#5865F2' }, // Discord Blue
    'Estética': { icon: <FaPalette />, color: '#f472b6' }, // Pink/Rose
    'Comunidad': { icon: <FaUsers />, color: '#fb7185' }, // Rose/Coral
}

const DEFAULT_ICON_CONFIG = { icon: <FaGavel />, color: '#94a3b8' };

export default function Rules() {
    const { t, i18n } = useTranslation()
    const { user } = useAuth()
    const [rules, setRules] = useState<Rule[]>([])
    const [loading, setLoading] = useState(true)
    const [activeFilter, setActiveFilter] = useState<string | null>(null);

    // Admin State
    const [isEditing, setIsEditing] = useState(false)
    const [editRuleId, setEditRuleId] = useState<number | null>(null)
    const [formData, setFormData] = useState<Partial<Rule>>({ 
        category: 'General', 
        title: '', 
        title_en: '', 
        content: '', 
        content_en: '', 
        color: '', 
        sort_order: 0 
    })
    const [translating, setTranslating] = useState<string | null>(null);

    const allowedRoles = ['admin','developer', 'neroferno', 'killu', 'helper'];
    const isStaff = allowedRoles.includes(user?.user_metadata?.role?.toLowerCase() || '');

    const fetchRules = async () => {
        setLoading(true)
        try {
            const data = await getRules();
            setRules(data);
        } catch (err) {
            console.error("Failed to load rules:", err);
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchRules();
    }, []);

    // Process rules: Global Sort & Indexing
    const processedRules = useMemo(() => {
        const sorted = [...rules].sort((a, b) => {
            // Sort by sort_order first, then by category
            if ((a.sort_order || 0) !== (b.sort_order || 0)) {
                return (a.sort_order || 0) - (b.sort_order || 0);
            }
            return (a.category || '').localeCompare(b.category || '');
        });

        return sorted.map((rule, idx) => ({
            ...rule,
            globalIndex: idx + 1
        }));
    }, [rules]);

    const filteredRules = useMemo(() => {
        if (!activeFilter) return processedRules;
        return processedRules.filter(r => r.category === activeFilter);
    }, [processedRules, activeFilter]);

    const handleTranslate = async (text: string, toLang: 'es' | 'en', field: 'title' | 'content' | 'title_en' | 'content_en') => {
        if (!text) return;
        setTranslating(field);
        try {
            const token = (await supabase.auth.getSession()).data.session?.access_token;
            const res = await fetch(`${API_URL}/translation`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ text, targetLang: toLang })
            });
            const data = await res.json();
            if (data.success) {
                setFormData(prev => ({ ...prev, [field]: data.translatedText }));
            }
        } catch (error) {
            console.error("Translation fail", error);
        } finally {
            setTranslating(null);
        }
    };

    // UI Animations
    useEffect(() => {
        if (filteredRules.length === 0) return;
        
        gsap.fromTo('.rule-card-premium', 
            { opacity: 0, scale: 0.95, y: 30 },
            {
                opacity: 1,
                scale: 1,
                y: 0,
                stagger: 0.08,
                duration: 0.6,
                ease: "power3.out",
                clearProps: "all"
            }
        );
    }, [filteredRules]);

    const handleSave = async () => {
        if (!user) return;
        try {
            const token = (await supabase.auth.getSession()).data.session?.access_token;
            if (!token) throw new Error("No token");

            if (editRuleId) {
                await updateRule(editRuleId, formData, token);
            } else {
                await createRule(formData as Omit<Rule, 'id'>, token);
            }
            
            setFormData({ 
                category: 'General', 
                title: '', 
                title_en: '', 
                content: '', 
                content_en: '', 
                color: '', 
                sort_order: 0 
            });
            setEditRuleId(null);
            setIsEditing(false);
            fetchRules();
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            alert("Error al guardar: " + msg);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm(t('common.confirm_delete', '¿Seguro que quieres borrar este elemento?'))) return;
        if (!user) return;
        try {
            const token = (await supabase.auth.getSession()).data.session?.access_token;
            if (!token) throw new Error("No token");
            
            await deleteRule(id, token);
            fetchRules();
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            alert(t('rules.delete_error', 'Error al borrar') + ": " + msg);
        }
    };

    const startEdit = (rule: Rule) => {
        setFormData(rule);
        setEditRuleId(rule.id);
        setIsEditing(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const categories = Array.from(new Set(rules.map(r => r.category || 'General')));

    return (
        <Section title={t('rules.title') || "Normas del Servidor"}>
            <div className="rules-page">
                {/* Header Section */}
                <div className="rules-header">
                    <p className="rules-intro">
                        {t('rules.intro') || "Para mantener una comunidad sana y divertida, es fundamental respetar estas normas de convivencia. El incumplimiento puede llevar a sanciones severas."}
                    </p>

                    {/* Filter Bar */}
                    <div className="rules-filter-bar">
                        <button 
                            onClick={() => setActiveFilter(null)}
                            className={`filter-btn ${!activeFilter ? 'active' : ''}`}
                        >
                            <FaBalanceScale /> {t('rules.all', 'Todas')}
                        </button>
                        {categories.map(cat => {
                            const config = CATEGORY_CONFIG[cat] || DEFAULT_ICON_CONFIG;
                            return (
                                <button 
                                    key={cat}
                                    onClick={() => setActiveFilter(cat)}
                                    className={`filter-btn ${activeFilter === cat ? 'active' : ''}`}
                                >
                                    {config.icon} {t(`rules.categories.${cat.toLowerCase()}`, cat)}
                                </button>
                            );
                        })}
                    </div>

                    {isStaff && !isEditing && (
                        <button 
                            onClick={() => { 
                                setIsEditing(true); 
                                setEditRuleId(null); 
                                setFormData({ 
                                    category: 'General', 
                                    title: '', 
                                    title_en: '', 
                                    content: '', 
                                    content_en: '', 
                                    color: '', 
                                    sort_order: 0 
                                }); 
                            }}
                            className="btn-primary"
                            style={{ padding: '1rem 2.5rem', borderRadius: '100px' }}
                        >
                            <FaPlus /> {t('rules.new_rule', 'Nueva Normativa')}
                        </button>
                    )}
                </div>

                {/* Admin Editor Form */}
                {isEditing && (
                    <div className="rules-admin-form">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                            <h3 style={{ margin: 0, color: 'var(--accent)' }}>
                                {editRuleId ? t('rules.editing', 'Editando Norma') : t('rules.new_norm', 'Nueva Norma')}
                            </h3>
                            <button onClick={() => setIsEditing(false)} className="filter-btn">
                                <FaTimes /> {t('rules.close', 'Cerrar')}
                            </button>
                        </div>
                        
                        <div className="form-grid">
                            <div>
                                <label>{t('rules.category', 'Categoría')}</label>
                                <input 
                                    type="text" 
                                    list="category-suggestions"
                                    value={formData.category}
                                    onChange={e => setFormData({...formData, category: e.target.value})}
                                    placeholder={t('rules.cat_placeholder', 'Ej: PvP, Chat, Construcción...')}
                                />
                                <datalist id="category-suggestions">
                                    {Object.keys(CATEGORY_CONFIG).map(c => <option key={c} value={c} />)}
                                </datalist>
                            </div>
                            
                            <div>
                                <label>{t('rules.sort_order', 'Orden de Visualización')}</label>
                                <input 
                                    type="number" 
                                    value={formData.sort_order}
                                    onChange={e => setFormData({...formData, sort_order: parseInt(e.target.value) || 0})}
                                />
                            </div>

                            <div className="form-full">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <label>{t('rules.title_es', 'Título (Español)')}</label>
                                    <button 
                                        type="button" 
                                        className="btn-translate-premium" 
                                        style={{ padding: '0.2rem 0.8rem', fontSize: '0.7rem' }}
                                        onClick={() => handleTranslate(formData.title || '', 'en', 'title_en')}
                                        disabled={!!translating || !formData.title}
                                    >
                                        {translating === 'title_en' ? <FaSpinner className="spin" /> : <FaLanguage />} {t('rules.translate_to_en', 'Traducir a EN')}
                                    </button>
                                </div>
                                <input 
                                    type="text" 
                                    value={formData.title}
                                    onChange={e => setFormData({...formData, title: e.target.value})}
                                    placeholder={t('rules.title_placeholder_es', 'Título en español')}
                                />
                            </div>

                            <div className="form-full">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <label>{t('rules.title_en', 'Título (Inglés)')} <span style={{ opacity: 0.5 }}>({t('common.optional', 'Opcional')})</span></label>
                                    <button 
                                        type="button" 
                                        className="btn-translate-premium" 
                                        style={{ padding: '0.2rem 0.8rem', fontSize: '0.7rem' }}
                                        onClick={() => handleTranslate(formData.title_en || '', 'es', 'title')}
                                        disabled={!!translating || !formData.title_en}
                                    >
                                        {translating === 'title' ? <FaSpinner className="spin" /> : <FaLanguage />} {t('rules.translate_to_es', 'Traducir a ES')}
                                    </button>
                                </div>
                                <input 
                                    type="text" 
                                    value={formData.title_en}
                                    onChange={e => setFormData({...formData, title_en: e.target.value})}
                                    placeholder={t('rules.title_placeholder_en', 'English title')}
                                />
                            </div>

                            <div className="form-full">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <label>{t('rules.content_es', 'Contenido (Español)')}</label>
                                    <button 
                                        type="button" 
                                        className="btn-translate-premium" 
                                        style={{ padding: '0.2rem 0.8rem', fontSize: '0.7rem' }}
                                        onClick={() => handleTranslate(formData.content || '', 'en', 'content_en')}
                                        disabled={!!translating || !formData.content}
                                    >
                                        {translating === 'content_en' ? <FaSpinner className="spin" /> : <FaLanguage />} {t('rules.translate_to_en', 'Traducir a EN')}
                                    </button>
                                </div>
                                <textarea 
                                    rows={4}
                                    value={formData.content}
                                    onChange={e => setFormData({...formData, content: e.target.value})}
                                    placeholder={t('rules.content_placeholder_es', 'Contenido en español...')}
                                />
                            </div>

                            <div className="form-full">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <label>{t('rules.content_en', 'Contenido (Inglés)')} <span style={{ opacity: 0.5 }}>({t('common.optional', 'Opcional')})</span></label>
                                    <button 
                                        type="button" 
                                        className="btn-translate-premium" 
                                        style={{ padding: '0.2rem 0.8rem', fontSize: '0.7rem' }}
                                        onClick={() => handleTranslate(formData.content_en || '', 'es', 'content')}
                                        disabled={!!translating || !formData.content_en}
                                    >
                                        {translating === 'content' ? <FaSpinner className="spin" /> : <FaLanguage />} {t('rules.translate_to_es', 'Traducir a ES')}
                                    </button>
                                </div>
                                <textarea 
                                    rows={4}
                                    value={formData.content_en}
                                    onChange={e => setFormData({...formData, content_en: e.target.value})}
                                    placeholder={t('rules.content_placeholder_en', 'English content...')}
                                />
                            </div>

                            <button onClick={handleSave} className="rules-save-btn" disabled={!!translating}>
                                <FaSave /> {editRuleId ? t('rules.update_btn', 'ACTUALIZAR NORMA') : t('rules.publish_btn', 'PUBLICAR NORMA')}
                            </button>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="rules-empty">
                        <Loader text={t('rules.loading') || "Cargando normativas..."} />
                    </div>
                ) : (
                    <div className="rules-grid">
                        {filteredRules.map((rule) => {
                            const config = CATEGORY_CONFIG[rule.category || 'General'] || DEFAULT_ICON_CONFIG;
                            const accent = rule.color || config.color;
                            
                            return (
                                <div key={rule.id} className="rule-card-premium">
                                    <div className="rule-card-number">#{String(rule.globalIndex).padStart(2, '0')}</div>
                                    
                                    {isStaff && (
                                        <div className="rule-admin-actions">
                                            <button onClick={() => startEdit(rule)} className="admin-action-btn btn-edit-rule">
                                                <FaEdit />
                                            </button>
                                            <button onClick={() => handleDelete(rule.id)} className="admin-action-btn btn-delete-rule">
                                                <FaTrash />
                                            </button>
                                        </div>
                                    )}

                                    <div className="rule-category-badge" style={{ color: accent }}>
                                        {config.icon} {t(`rules.categories.${(rule.category || 'General').toLowerCase()}`, rule.category || 'General')}
                                    </div>

                                    <h3 className="rule-title-premium">
                                        {(i18n.language === 'en' && rule.title_en) ? rule.title_en : rule.title}
                                    </h3>

                                    <div className="rule-content-premium">
                                        {(i18n.language === 'en' && rule.content_en) ? rule.content_en : rule.content}
                                    </div>

                                    <div className="rule-footer-premium">
                                        <div className="rule-icon-wrapper" style={{ color: accent }}>
                                            {config.icon}
                                        </div>
                                        <div style={{ flexGrow: 1, height: '1px', background: 'rgba(255,255,255,0.05)', margin: '0 1rem' }}></div>
                                    </div>
                                    
                                    {/* Accent Bar */}
                                    <div style={{ 
                                        position: 'absolute', 
                                        left: 0, 
                                        top: 0, 
                                        bottom: 0, 
                                        width: '4px', 
                                        backgroundColor: accent 
                                    }}></div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {!loading && filteredRules.length === 0 && (
                    <div className="rules-empty">
                        {t('rules.no_results', 'No se encontraron normas en esta categoría.')}
                    </div>
                )}
            </div>

            {/* Background Decoration */}
            <div style={{ 
                position: 'fixed', 
                top: 0, 
                left: 0, 
                right: 0, 
                bottom: 0, 
                pointerEvents: 'none', 
                zIndex: -1,
                overflow: 'hidden'
            }}>
                <div style={{ 
                    position: 'absolute', 
                    top: '20%', 
                    right: '-5%', 
                    width: '600px', 
                    height: '600px', 
                    borderRadius: '50%', 
                    background: 'rgba(99, 102, 241, 0.05)', 
                    filter: 'blur(120px)' 
                }}></div>
                <div style={{ 
                    position: 'absolute', 
                    bottom: '10%', 
                    left: '-5%', 
                    width: '500px', 
                    height: '500px', 
                    borderRadius: '50%', 
                    background: 'rgba(137, 217, 209, 0.05)', 
                    filter: 'blur(100px)' 
                }}></div>
            </div>
        </Section>
    )
}
