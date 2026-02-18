import React, { useEffect, useMemo } from "react"
import Section from "../components/Layout/Section"
import { 
    Info, ShieldCheck, MessageSquare, Swords, Trees, 
    Palette, Video, Scale, Shield, Plus, Edit2, 
    Trash2, Save, Gavel, X, UserRound, Globe,
    Users, Loader2, Languages
} from "lucide-react"
import { gsap } from "gsap"
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { useAuth } from "../context/AuthContext"
import { getRules, createRule, updateRule, deleteRule, Rule } from "../services/ruleService"
import { supabase } from "../services/supabaseClient"
import Loader from "../components/UI/Loader"

const API_URL = import.meta.env.VITE_API_URL || '/api';

const CATEGORY_CONFIG: Record<string, { icon: React.ReactNode, color: string }> = {
    'General': { icon: <Info size={18} />, color: '#6366f1' },
    'Comportamiento': { icon: <ShieldCheck size={18} />, color: '#f87171' },
    'Chat': { icon: <MessageSquare size={18} />, color: '#4ade80' },
    'PvP': { icon: <Swords size={18} />, color: '#fb923c' },
    'Construcción': { icon: <Trees size={18} />, color: '#2dd4bf' },
    'Modificaciones': { icon: <Palette size={18} />, color: '#a78bfa' },
    'Staff': { icon: <Scale size={18} />, color: '#f472b6' },
    'Seguridad': { icon: <Shield size={18} />, color: '#10b981' },
    'Contenido': { icon: <Video size={18} />, color: '#fcd34d' },
    'Economía': { icon: <Scale size={18} />, color: '#34d399' },
    'Mundo': { icon: <Globe size={18} />, color: '#60a5fa' },
    'Cuenta': { icon: <UserRound size={18} />, color: '#94a3b8' },
    'Discord': { icon: <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 640 512" height="18" width="18" xmlns="http://www.w3.org/2000/svg"><path d="M524.531,69.836a1.5,1.5,0,0,0-.764-.7A485.065,485.065,0,0,0,404.081,32.03a1.816,1.816,0,0,0-1.923.91,337.461,337.461,0,0,0-14.9,30.6,447.848,447.848,0,0,0-134.426,0,309.541,309.541,0,0,0-15.135-30.6,1.89,1.89,0,0,0-1.924-.91A483.689,483.689,0,0,0,116.085,69.137a1.712,1.712,0,0,0-.788.676C39.068,183.651,18.186,294.69,28.43,404.354a2.016,2.016,0,0,0,.765,1.375A487.666,487.666,0,0,0,176.02,479.918a1.9,1.9,0,0,0,2.063-.676A348.2,348.2,0,0,0,208.12,430.4a1.86,1.86,0,0,0-1.019-2.588,321.173,321.173,0,0,1-45.868-21.853,1.885,1.885,0,0,1-.185-3.126c3.082-2.309,6.166-4.711,9.109-7.137a1.819,1.819,0,0,1,1.9-.256c96.229,43.917,200.41,43.917,295.5,0a1.812,1.812,0,0,1,1.924.233c2.944,2.426,6.027,4.851,9.132,7.16a1.884,1.884,0,0,1-.162,3.126,301.407,301.407,0,0,1-45.89,21.83,1.875,1.875,0,0,0-1,2.611,391.055,391.055,0,0,0,30.014,48.815,1.864,1.864,0,0,0,2.063.7A486.048,486.048,0,0,0,610.7,405.729a1.882,1.882,0,0,0,.765-1.352C623.729,277.594,590.8,167.234,524.531,69.836ZM222.491,337.58c-28.972,0-52.844-26.587-52.844-59.239S193.056,219.1,222.491,219.1c29.665,0,53.306,26.82,52.843,59.239C275.334,310.993,251.924,337.58,222.491,337.58Zm195.38,0c-28.971,0-52.843-26.587-52.843-59.239S388.437,219.1,417.871,219.1c29.667,0,53.307,26.82,52.844,59.239C470.715,310.993,447.538,337.58,417.871,337.58Z"></path></svg>, color: '#5865F2' },
    'Estética': { icon: <Palette size={18} />, color: '#f472b6' },
    'Comunidad': { icon: <Users size={18} />, color: '#fb7185' },
}

const DEFAULT_ICON_CONFIG = { icon: <Gavel size={18} />, color: '#94a3b8' };

export default function Rules() {
    const { t, i18n } = useTranslation()
    const { user } = useAuth()
    const queryClient = useQueryClient()
    const [activeFilter, setActiveFilter] = React.useState<string | null>(null);

    // Admin State
    const [isEditing, setIsEditing] = React.useState(false)
    const [editRuleId, setEditRuleId] = React.useState<number | null>(null)
    const [formData, setFormData] = React.useState<Partial<Rule>>({ 
        category: 'General', title: '', title_en: '', content: '', content_en: '', color: '', sort_order: 0 
    })
    const [translating, setTranslating] = React.useState<string | null>(null);

    const isStaff = ['admin','developer', 'neroferno', 'killu', 'helper'].includes(user?.user_metadata?.role?.toLowerCase() || '');

    const { data: rules = [], isLoading } = useQuery<Rule[]>({
        queryKey: ['rules'],
        queryFn: getRules
    })

    const saveMutation = useMutation({
        mutationFn: async ({ id, data, token }: { id: number | null, data: Partial<Rule>, token: string }) => {
            if (id) return updateRule(id, data, token);
            return createRule(data as Omit<Rule, 'id'>, token);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rules'] });
            setIsEditing(false);
            setEditRuleId(null);
            setFormData({ category: 'General', title: '', title_en: '', content: '', content_en: '', color: '', sort_order: 0 });
        }
    })

    const deleteMutation = useMutation({
        mutationFn: async ({ id, token }: { id: number, token: string }) => deleteRule(id, token),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rules'] })
    })

    const processedRules = useMemo(() => {
        const sorted = [...rules].sort((a, b) => {
            if ((a.sort_order || 0) !== (b.sort_order || 0)) return (a.sort_order || 0) - (b.sort_order || 0);
            return (a.category || '').localeCompare(b.category || '');
        });
        return sorted.map((rule, idx) => ({ ...rule, globalIndex: idx + 1 }));
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
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ text, targetLang: toLang })
            });
            const data = await res.json();
            if (data.success) setFormData(prev => ({ ...prev, [field]: data.translatedText }));
        } catch (error) { console.error("Translation fail", error); } finally { setTranslating(null); }
    };

    useEffect(() => {
        if (filteredRules.length === 0) return;
        gsap.fromTo('.rule-card-premium', { opacity: 0, scale: 0.95, y: 30 }, {
            opacity: 1, scale: 1, y: 0, stagger: 0.08, duration: 0.6, ease: "power3.out", clearProps: "all"
        });
    }, [filteredRules]);

    const handleSave = async () => {
        const token = (await supabase.auth.getSession()).data.session?.access_token;
        if (!token) return;
        saveMutation.mutate({ id: editRuleId, data: formData, token });
    };

    const handleDelete = async (id: number) => {
        if (!confirm(t('common.confirm_delete'))) return;
        const token = (await supabase.auth.getSession()).data.session?.access_token;
        if (!token) return;
        deleteMutation.mutate({ id, token });
    };

    const categories = Array.from(new Set(rules.map(r => r.category || 'General')));

    return (
        <Section title={t('rules.title') || "Normas del Servidor"}>
            <div className="flex flex-col items-center w-full pb-20 relative z-10">
                <div className="w-full max-w-3xl mx-auto text-center mb-16">
                    <p className="text-gray-400 text-lg leading-relaxed mb-12">
                        {t('rules.intro') || "Para mantener una comunidad sana y divertida, es fundamental respetar estas normas de convivencia."}
                    </p>

                    <div className="flex flex-wrap justify-center gap-2 mb-8 p-1.5 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl shadow-2xl">
                        <button onClick={() => setActiveFilter(null)} className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2 ${!activeFilter ? 'bg-(--accent) text-black shadow-lg shadow-(--accent)/30' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                            <Scale size={14} /> {t('rules.all', 'Todas')}
                        </button>
                        {categories.map(cat => {
                            const config = CATEGORY_CONFIG[cat] || DEFAULT_ICON_CONFIG;
                            return (
                                <button key={cat} onClick={() => setActiveFilter(cat)} className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2 ${activeFilter === cat ? 'bg-(--accent) text-black shadow-lg shadow-(--accent)/30' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                                    {config.icon} {t(`rules.categories.${cat.toLowerCase()}`, cat)}
                                </button>
                            );
                        })}
                    </div>

                    {isStaff && !isEditing && (
                        <button onClick={() => { setIsEditing(true); setEditRuleId(null); setFormData({ category: 'General', title: '', title_en: '', content: '', content_en: '', color: '', sort_order: 0 }); }} className="bg-white text-black px-10 py-4 rounded-full font-black uppercase tracking-widest text-sm transition-all hover:bg-(--accent) hover:scale-105 shadow-xl">
                            <Plus className="inline mr-2" size={16} /> {t('rules.new_rule', 'Nueva Normativa')}
                        </button>
                    )}
                </div>

                {isEditing && (
                    <div className="w-full max-w-4xl mx-auto bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 mb-20 shadow-2xl backdrop-blur-3xl">
                        <div className="flex justify-between items-center mb-10 border-b border-white/5 pb-6">
                            <h3 className="text-2xl font-black uppercase tracking-widest text-(--accent)">
                                {editRuleId ? t('rules.editing') : t('rules.new_norm')}
                            </h3>
                            <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-xs font-bold uppercase text-white/50 hover:text-white transition-colors flex items-center gap-2">
                                <X size={14} /> {t('rules.close')}
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">{t('rules.category')}</label>
                                <input type="text" list="category-suggestions" className="bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-(--accent)" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
                                <datalist id="category-suggestions">{Object.keys(CATEGORY_CONFIG).map(c => <option key={c} value={c} />)}</datalist>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">{t('rules.sort_order')}</label>
                                <input type="number" className="bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-(--accent)" value={formData.sort_order} onChange={e => setFormData({...formData, sort_order: parseInt(e.target.value) || 0})} />
                            </div>

                            <div className="md:col-span-2 flex flex-col gap-2">
                                <div className="flex justify-between items-center px-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">{t('rules.title_es')}</label>
                                    <button type="button" className="text-[10px] font-black uppercase tracking-widest bg-(--accent)/10 text-(--accent) px-3 py-1 rounded-full border border-(--accent)/20 hover:bg-(--accent) hover:text-black transition-all" onClick={() => handleTranslate(formData.title || '', 'en', 'title_en')} disabled={!!translating || !formData.title}>
                                        {translating === 'title_en' ? <Loader2 className="animate-spin" size={14} /> : <Languages className="inline mr-1" size={14} />} {t('rules.translate_to_en')}
                                    </button>
                                </div>
                                <input type="text" className="bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                            </div>

                            <div className="md:col-span-2 flex flex-col gap-2">
                                <div className="flex justify-between items-center px-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">{t('rules.title_en')}</label>
                                    <button type="button" className="text-[10px] font-black uppercase tracking-widest bg-(--accent)/10 text-(--accent) px-3 py-1 rounded-full border border-(--accent)/20" onClick={() => handleTranslate(formData.title_en || '', 'es', 'title')} disabled={!!translating || !formData.title_en}>
                                        {translating === 'title' ? <Loader2 className="animate-spin" size={14} /> : <Languages className="inline mr-1" size={14} />} {t('rules.translate_to_es')}
                                    </button>
                                </div>
                                <input type="text" className="bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none" value={formData.title_en} onChange={e => setFormData({...formData, title_en: e.target.value})} />
                            </div>

                            <div className="md:col-span-2 flex flex-col gap-2">
                                <div className="flex justify-between items-center px-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">{t('rules.content_es')}</label>
                                    <button type="button" className="text-[10px] font-black uppercase tracking-widest bg-(--accent)/10 text-(--accent) px-3 py-1 rounded-full" onClick={() => handleTranslate(formData.content || '', 'en', 'content_en')} disabled={!!translating || !formData.content}>
                                        {translating === 'content_en' ? <Loader2 className="animate-spin" size={14} /> : <Languages className="inline mr-1" size={14} />} {t('rules.translate_to_en')}
                                    </button>
                                </div>
                                <textarea rows={4} className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none resize-none" value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} />
                            </div>

                            <div className="md:col-span-2 flex flex-col gap-2">
                                <div className="flex justify-between items-center px-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">{t('rules.content_en')}</label>
                                    <button type="button" className="text-[10px] font-black uppercase tracking-widest bg-(--accent)/10 text-(--accent) px-3 py-1 rounded-full" onClick={() => handleTranslate(formData.content_en || '', 'es', 'content')} disabled={!!translating || !formData.content_en}>
                                        {translating === 'content' ? <Loader2 className="animate-spin" size={14} /> : <Languages className="inline mr-1" size={14} />} {t('rules.translate_to_es')}
                                    </button>
                                </div>
                                <textarea rows={4} className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none resize-none" value={formData.content_en} onChange={e => setFormData({...formData, content_en: e.target.value})} />
                            </div>

                            <button onClick={handleSave} className="md:col-span-2 bg-(--accent) text-black py-5 rounded-2xl font-black uppercase tracking-widest mt-4 disabled:opacity-50" disabled={saveMutation.isPending || !!translating}>
                                <Save className="inline mr-2" size={18} /> {saveMutation.isPending ? t('common.saving') : (editRuleId ? t('rules.update_btn') : t('rules.publish_btn'))}
                            </button>
                        </div>
                    </div>
                )}

                {isLoading ? <Loader text={t('rules.loading')} /> : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-[1400px] mx-auto">
                        {filteredRules.map((rule) => {
                            const config = CATEGORY_CONFIG[rule.category || 'General'] || DEFAULT_ICON_CONFIG;
                            const accent = rule.color || config.color;
                            return (
                                <div key={rule.id} className="rule-card-premium relative p-8 bg-black/60 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden hover:-translate-y-2 group">
                                    <div className="absolute top-8 right-8 text-5xl font-black text-white/5 font-sans select-none">#{String(rule.globalIndex).padStart(2, '0')}</div>
                                    {isStaff && (
                                        <div className="absolute top-4 right-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                            <button onClick={() => { setFormData(rule); setEditRuleId(rule.id); setIsEditing(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center hover:bg-emerald-500 hover:text-black"><Edit2 size={14} /></button>
                                            <button onClick={() => handleDelete(rule.id)} className="w-8 h-8 rounded-lg bg-red-500/20 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-black"><Trash2 size={14} /></button>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.15em]" style={{ color: accent }}>
                                        <span className="text-lg">{config.icon}</span> 
                                        <span>{t(`rules.categories.${(rule.category || 'General').toLowerCase()}`, rule.category || 'General')}</span>
                                    </div>
                                    <h3 className="text-2xl font-black text-white leading-tight m-0 group-hover:text-(--accent)">
                                        {(i18n.language === 'en' && rule.title_en) ? rule.title_en : rule.title}
                                    </h3>
                                    <div className="text-gray-400 text-sm leading-relaxed grow font-medium">
                                        {(i18n.language === 'en' && rule.content_en) ? rule.content_en : rule.content}
                                    </div>
                                    <div className="flex items-center justify-between pt-6 mt-4 border-t border-white/5">
                                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xl transition-all group-hover:scale-110" style={{ color: accent }}>{config.icon}</div>
                                        <div className="flex-1 h-px bg-white/5 mx-4"></div>
                                    </div>
                                    <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: accent }}></div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </Section>
    )
}
