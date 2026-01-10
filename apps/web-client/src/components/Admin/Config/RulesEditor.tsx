import { useState, useMemo } from 'react';
import { Plus, Trash2, Save, Edit2, X, FileOutput, FileInput, Languages, Loader2 } from 'lucide-react';
import ConfirmationModal from '../../UI/ConfirmationModal';
import { useTranslation } from 'react-i18next';
import { 
    useRules, 
    useCreateRule, 
    useUpdateRule, 
    useDeleteRule, 
    useTranslateText,
    Rule 
} from '../../../hooks/useAdminData';

const CATEGORY_OPTIONS = [
    'General',
    'Comportamiento',
    'Chat',
    'PvP',
    'Construcción',
    'Clientes',
    'Staff',
    'Cuenta'
];

export default function RulesEditor() {
    const { t } = useTranslation();
    
    // TanStack Query Hooks
    const { data: rulesRaw, isLoading: loading } = useRules();
    const createRuleMutation = useCreateRule();
    const updateRuleMutation = useUpdateRule();
    const deleteRuleMutation = useDeleteRule();
    const translateMutation = useTranslateText();

    const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
    const [editingRule, setEditingRule] = useState<Rule | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    
    // Translation internal state for feedback
    const [translatingField, setTranslatingField] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState<Partial<Rule>>({
        category: 'General',
        title: '',
        title_en: '',
        content: '',
        content_en: '',
        color: '#6366f1',
        sort_order: 0
    });

    const rules = useMemo(() => rulesRaw || [], [rulesRaw]);

    const handleTranslate = async (text: string, toLang: 'es' | 'en', field: 'title' | 'content' | 'title_en' | 'content_en') => {
        if (!text) return;
        setTranslatingField(field);
        translateMutation.mutate({ text, targetLang: toLang }, {
            onSuccess: (translatedText) => {
                setFormData(prev => ({ ...prev, [field]: translatedText }));
            },
            onError: () => {
                alert(t('admin.settings.rules.translate_error', 'Error al traducir'));
            },
            onSettled: () => setTranslatingField(null)
        });
    };

    const handleSave = async () => {
        if (!formData.title || !formData.content) {
            alert(t('admin.settings.rules.validation_error', 'Por favor completa título y contenido'));
            return;
        }

        const payload = { ...formData } as Partial<Rule>;

        if (editingRule) {
            updateRuleMutation.mutate(
                { id: editingRule.id, payload },
                {
                    onSuccess: () => handleCancel(),
                    onError: () => alert(t('admin.settings.rules.save_error', 'Error al guardar la regla'))
                }
            );
        } else {
            createRuleMutation.mutate(
                payload as Omit<Rule, 'id'>,
                {
                    onSuccess: () => handleCancel(),
                    onError: () => alert(t('admin.settings.rules.save_error', 'Error al guardar la regla'))
                }
            );
        }
    };

    const handleEdit = (rule: Rule) => {
        setFormData({
            ...rule,
            title_en: rule.title_en || '',
            content_en: rule.content_en || ''
        });
        setEditingRule(rule);
        setIsCreating(true);
    };

    const handleDelete = async (id: number) => {
        setDeleteConfirmId(id);
    };

    const confirmDelete = async () => {
        if (!deleteConfirmId) return;

        deleteRuleMutation.mutate(deleteConfirmId, {
            onSuccess: () => {
                setDeleteConfirmId(null);
            },
            onError: () => {
                alert(t('admin.settings.rules.delete_error', 'Error al borrar la regla'));
            }
        });
    };

    const handleCancel = () => {
        setFormData({ category: 'General', title: '', title_en: '', content: '', content_en: '', color: '#6366f1', sort_order: 0 });
        setEditingRule(null);
        setIsCreating(false);
    };

    const startCreate = () => {
        setFormData({ category: 'General', title: '', title_en: '', content: '', content_en: '', color: '#6366f1', sort_order: 0 });
        setEditingRule(null);
        setIsCreating(true);
    };

    const handleExport = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(rules, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `server_rules_${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (ev) => {
            try {
                const json = JSON.parse(ev.target?.result as string);
                if (!Array.isArray(json)) {
                    alert(t('admin.settings.rules.import_invalid', 'Formato de archivo inválido. Debe ser un array de reglas.'));
                    return;
                }

                // Confirm import
                if (!confirm(t('admin.settings.rules.import_confirm', { count: json.length }))) {
                    return;
                }

                // Import sequential to avoid race conditions and since we don't have a bulk API yet
                for (const rule of json) {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { id, ...ruleData } = rule;
                    // Note: This is sequential and could be slow for many rules, but fine for typical counts.
                    // Ideally we'd use Promise.all or a batch endpoint.
                    await createRuleMutation.mutateAsync(ruleData as Omit<Rule, 'id'>);
                }

                alert(t('admin.settings.rules.import_success', 'Reglas importadas exitosamente'));
            } catch (error) {
                console.error('Error importing:', error);
                alert(t('admin.settings.rules.import_error', 'Error al importar las reglas. Verifica el formato del archivo.'));
            }
        };
        reader.readAsText(file);
        if (e.target) e.target.value = '';
    };

    const groupedRules = useMemo(() => {
        return rules.reduce((acc: Record<string, Rule[]>, rule: Rule) => {
            const cat = rule.category || 'General';
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push(rule);
            return acc;
        }, {} as Record<string, Rule[]>);
    }, [rules]);

    const saving = createRuleMutation.isPending || updateRuleMutation.isPending;

    if (loading) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
                {t('admin.settings.rules.loading', 'Cargando reglas del servidor...')}
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900, color: '#fff' }}>
                        {t('admin.settings.rules.title_editor', 'Editor de Reglas del Servidor')}
                    </h3>
                    <p style={{ margin: '0.5rem 0 0', color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>
                        {t('admin.settings.rules.desc_editor', 'Gestiona las normativas que se muestran en /reglas')}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <button
                        onClick={handleExport}
                        className="modal-btn-secondary"
                        style={{ height: '48px', padding: '0 1.5rem', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        title={t('admin.settings.rules.export_title')}
                    >
                        <FileOutput size={18} /> {t('admin.settings.rules.export_btn', 'Exportar')}
                    </button>
                    <label
                        className="modal-btn-secondary"
                        style={{ height: '48px', padding: '0 1.5rem', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
                        title={t('admin.settings.rules.import_title')}
                    >
                        <FileInput size={18} /> {t('admin.settings.rules.import_btn', 'Importar')}
                        <input
                            type="file"
                            accept=".json"
                            onChange={handleImport}
                            style={{ display: 'none' }}
                        />
                    </label>
                    {!isCreating && (
                        <button
                            onClick={startCreate}
                            className="modal-btn-primary"
                            style={{ height: '48px', padding: '0 1.5rem', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            <Plus size={18} /> {t('admin.settings.rules.new_rule', 'Nueva Regla')}
                        </button>
                    )}
                </div>
            </div>

            {/* Create/Edit Form Modal */}
            {isCreating && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(5px)',
                    zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem'
                }} onClick={(e) => {
                    if (e.target === e.currentTarget) handleCancel();
                }}>
                    <div className="admin-card" style={{ 
                        background: 'rgba(20, 20, 25, 0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '24px', padding: '2rem', width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto'
                    }}>
                        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                {editingRule ? <><Edit2 size={18} /> {t('admin.settings.rules.edit_title')}</> : <><Plus size={18} /> {t('admin.settings.rules.new_title')}</>}
                            </h4>
                            <button onClick={handleCancel} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                            <div>
                                <label className="admin-label-premium">{t('admin.settings.rules.category_label')}</label>
                                <select
                                    className="admin-select-premium"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                >
                                    {CATEGORY_OPTIONS.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="admin-label-premium">{t('admin.settings.rules.order_label', 'Orden (Prioridad)')}</label>
                                <input
                                    type="number"
                                    className="admin-input-premium"
                                    value={formData.sort_order}
                                    onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                            <div>
                                <label className="admin-label-premium">{t('admin.settings.rules.color_label', 'Color Representativo')}</label>
                                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                    <input
                                        type="color"
                                        value={formData.color || '#6366f1'}
                                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                        style={{ width: '48px', height: '48px', padding: '0', border: 'none', borderRadius: '10px', background: 'none', cursor: 'pointer' }}
                                    />
                                    <input
                                        type="text"
                                        className="admin-input-premium"
                                        value={formData.color || '#6366f1'}
                                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                        placeholder="#HEX"
                                        style={{ flex: 1, fontFamily: 'monospace' }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Spanish fields and translations as before, updating with t() if available */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <label className="admin-label-premium" style={{ marginBottom: 0 }}>{t('admin.settings.rules.title_es', 'Título (Español)')}</label>
                                <button type="button" className="modal-btn-secondary" style={{ padding: '0.2rem 0.8rem', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                                    onClick={() => handleTranslate(formData.title || '', 'en', 'title_en')} disabled={translateMutation.isPending || !formData.title}>
                                    {translatingField === 'title_en' ? <Loader2 className="spin" size={12} /> : <Languages size={12} />} {t('admin.settings.rules.translate_to_en', 'Traducir a EN')}
                                </button>
                            </div>
                            <input type="text" className="admin-input-premium" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Ej: PVP Consensuado" />
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <label className="admin-label-premium" style={{ marginBottom: 0 }}>{t('admin.settings.rules.title_en', 'Título (Inglés)')}</label>
                                <button type="button" className="modal-btn-secondary" style={{ padding: '0.2rem 0.8rem', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                                    onClick={() => handleTranslate(formData.title_en || '', 'es', 'title')} disabled={translateMutation.isPending || !formData.title_en}>
                                    {translatingField === 'title' ? <Loader2 className="spin" size={12} /> : <Languages size={12} />} {t('admin.settings.rules.translate_to_es', 'Traducir a ES')}
                                </button>
                            </div>
                            <input type="text" className="admin-input-premium" value={formData.title_en || ''} onChange={(e) => setFormData({ ...formData, title_en: e.target.value })} placeholder="Ex: Consensual PVP" />
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <label className="admin-label-premium" style={{ marginBottom: 0 }}>{t('admin.settings.rules.content_es', 'Contenido (Español)')}</label>
                                <button type="button" className="modal-btn-secondary" style={{ padding: '0.2rem 0.8rem', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                                    onClick={() => handleTranslate(formData.content || '', 'en', 'content_en')} disabled={translateMutation.isPending || !formData.content}>
                                    {translatingField === 'content_en' ? <Loader2 className="spin" size={12} /> : <Languages size={12} />} {t('admin.settings.rules.translate_to_en', 'Traducir a EN')}
                                </button>
                            </div>
                            <textarea className="admin-textarea-premium" rows={5} value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} placeholder="Descripción detallada de la regla..." />
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <label className="admin-label-premium" style={{ marginBottom: 0 }}>{t('admin.settings.rules.content_en', 'Contenido (Inglés)')}</label>
                                <button type="button" className="modal-btn-secondary" style={{ padding: '0.2rem 0.8rem', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                                    onClick={() => handleTranslate(formData.content_en || '', 'es', 'content')} disabled={translateMutation.isPending || !formData.content_en}>
                                    {translatingField === 'content' ? <Loader2 className="spin" size={12} /> : <Languages size={12} />} {t('admin.settings.rules.translate_to_es', 'Traducir a ES')}
                                </button>
                            </div>
                            <textarea className="admin-textarea-premium" rows={5} value={formData.content_en || ''} onChange={(e) => setFormData({ ...formData, content_en: e.target.value })} placeholder="Detailed description of the rule..." />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                            <button onClick={handleCancel} className="modal-btn-secondary" style={{ height: '48px', padding: '0 1.5rem' }}>{t('admin.settings.rules.cancel_btn', 'Cancelar')}</button>
                            <button onClick={handleSave} className="modal-btn-primary" style={{ height: '48px', padding: '0 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }} disabled={saving}>
                                <Save size={18} /> {saving ? t('admin.settings.saving', 'Guardando...') : t('admin.settings.rules.save_btn', 'Guardar Regla')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Rules List grouped by category */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {Object.entries(groupedRules).length === 0 ? (
                    <div className="admin-card" style={{ background: 'rgba(15, 15, 20, 0.4)', border: '1px dashed rgba(255, 255, 255, 0.1)', borderRadius: '24px', padding: '3rem', textAlign: 'center' }}>
                        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '1rem' }}>
                            {t('admin.settings.rules.no_rules', 'No hay reglas definidas. Crea la primera regla.')}
                        </p>
                    </div>
                ) : (
                    (Object.entries(groupedRules) as [string, Rule[]][]).map(([category, categoryRules]) => (
                        <div key={category}>
                            <h4 style={{ margin: '0 0 1rem', fontSize: '1.1rem', fontWeight: 800, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                {category}
                            </h4>
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                {categoryRules.sort((a: Rule, b: Rule) => (a.sort_order || 0) - (b.sort_order || 0)).map((rule: Rule) => (
                                    <div key={rule.id} className="admin-card" style={{ background: 'rgba(15, 15, 20, 0.4)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '16px', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                                <span style={{ background: `${rule.color || 'var(--accent)'}20`, color: rule.color || 'var(--accent)', padding: '2px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 800, border: `1px solid ${rule.color || 'var(--accent)'}40` }}>
                                                    #{rule.sort_order}
                                                </span>
                                                <h5 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#fff' }}>{rule.title}</h5>
                                                {rule.title_en && <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', fontStyle: 'italic', marginLeft: '0.5rem' }}>({rule.title_en})</span>}
                                            </div>
                                            <p style={{ margin: 0, fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', lineHeight: '1.5' }}>{rule.content}</p>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                                            <button onClick={() => handleEdit(rule)} className="hover-lift" style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'rgba(255, 255, 255, 0.7)', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer' }}>
                                                <Edit2 size={18} />
                                            </button>
                                            <button onClick={() => handleDelete(rule.id)} className="hover-lift" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer' }}>
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <ConfirmationModal
                isOpen={!!deleteConfirmId}
                title={t('admin.settings.rules.confirm_delete_title', 'Confirmar Eliminación')}
                message={t('admin.settings.rules.confirm_delete_msg', '¿Estás seguro de que quieres eliminar esta regla?')}
                onConfirm={confirmDelete}
                onClose={() => setDeleteConfirmId(null)}
                isDanger={true}
            />
        </div>
    );
}
