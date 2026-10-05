import { useState, useEffect, useMemo, useCallback } from 'react';
import type { User } from '@supabase/supabase-js';
import { gsap } from 'gsap';
import { getRules, createRule, updateRule, deleteRule, Rule } from '../../services/ruleService';
import { supabase } from '../../services/supabaseClient';
import type { ProcessedRule, TranslateFn, TranslationField } from './rulesData';
import { API_URL, DEFAULT_CATEGORY, LANG_ES, LANG_EN, INITIAL_FORM_DATA } from './rulesData';

export function useRulesManagement(user: User | null, t: TranslateFn) {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRuleId, setExpandedRuleId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Admin State
  const [isEditing, setIsEditing] = useState(false);
  const [editRuleId, setEditRuleId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<Rule>>(INITIAL_FORM_DATA);
  const [translating, setTranslating] = useState<string | null>(null);

  const allowedRoles = useMemo(() => ['admin', 'developer', 'neroferno', 'killu', 'helper'], []);
  const userRole = (user?.user_metadata?.role as string | undefined)?.toLowerCase() || '';
  const isStaff = allowedRoles.includes(userRole);

  const fetchRules = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getRules();
      setRules(data);
    } catch (err) {
      console.error('Failed to load rules:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const processedRules: ProcessedRule[] = useMemo(() => {
    const sorted = [...rules].sort((a, b) => {
      const orderA = a.sort_order || 0;
      const orderB = b.sort_order || 0;
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      return (a.category || '').localeCompare(b.category || '');
    });

    return sorted.map((rule, idx) => ({
      ...rule,
      globalIndex: idx + 1,
    }));
  }, [rules]);

  const filteredRules = useMemo(() => {
    let result = processedRules;
    if (activeFilter) {
      result = result.filter((r) => r.category === activeFilter);
    }

    const term = searchTerm.trim().toLowerCase();
    if (term) {
      result = result.filter((r) => {
        const titleMatch = r.title.toLowerCase().includes(term);
        const titleEnMatch = Boolean(r.title_en?.toLowerCase().includes(term));
        const contentMatch = r.content.toLowerCase().includes(term);
        const contentEnMatch = Boolean(r.content_en?.toLowerCase().includes(term));
        const categoryMatch = (r.category || '').toLowerCase().includes(term);
        return titleMatch || titleEnMatch || contentMatch || contentEnMatch || categoryMatch;
      });
    }

    return result;
  }, [processedRules, activeFilter, searchTerm]);

  useEffect(() => {
    if (filteredRules.length === 0) return;

    gsap.fromTo(
      '.rule-card-premium',
      { opacity: 0, scale: 0.95, y: 30 },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        stagger: 0.05,
        duration: 0.5,
        ease: 'power3.out',
        clearProps: 'transform,opacity',
      },
    );
  }, [filteredRules]);

  const handleTranslate = useCallback(
    async (text: string, toLang: typeof LANG_ES | typeof LANG_EN, field: TranslationField) => {
      if (!text) return;
      setTranslating(field);
      try {
        const token = (await supabase.auth.getSession()).data.session?.access_token;
        const res = await fetch(`${API_URL}/translation`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ text, targetLang: toLang }),
        });
        if (!res.ok) throw new Error('Translation failed');
        const data = await res.json();
        if (data.success) {
          setFormData((prev) => ({ ...prev, [field]: data.translatedText }));
        }
      } catch (error) {
        console.error('Translation fail', error);
      } finally {
        setTranslating(null);
      }
    },
    [],
  );

  const handleSave = useCallback(async () => {
    if (!user) return;
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      if (!token) throw new Error('No token');

      if (editRuleId) {
        await updateRule(editRuleId, formData, token);
      } else {
        await createRule(formData as Omit<Rule, 'id'>, token);
      }

      setFormData(INITIAL_FORM_DATA);
      setEditRuleId(null);
      setIsEditing(false);
      fetchRules();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert('Error al guardar: ' + msg);
    }
  }, [user, editRuleId, formData, fetchRules]);

  const handleDelete = useCallback(
    async (id: number) => {
      const confirmDelete = confirm(
        t('common.confirm_delete', '¿Seguro que quieres borrar este elemento?'),
      );
      if (!confirmDelete || !user) return;

      try {
        const token = (await supabase.auth.getSession()).data.session?.access_token;
        if (!token) throw new Error('No token');

        await deleteRule(id, token);
        fetchRules();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        alert(t('rules.delete_error', 'Error al borrar') + ': ' + msg);
      }
    },
    [t, user, fetchRules],
  );

  const startEdit = useCallback((rule: Rule) => {
    setFormData(rule);
    setEditRuleId(rule.id);
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 2500);
  }, []);

  const handleCopyCommand = useCallback(
    (cmd: string) => {
      navigator.clipboard.writeText(cmd);
      showToast(`${t('rules.copied', 'Copiado al portapapeles:')} ${cmd}`);
    },
    [showToast, t],
  );

  const toggleExpandRule = useCallback((id: number) => {
    setExpandedRuleId((prev) => (prev === id ? null : id));
  }, []);

  const categories = useMemo(
    () => Array.from(new Set(rules.map((r) => r.category || DEFAULT_CATEGORY))),
    [rules],
  );

  return {
    rules,
    loading,
    activeFilter,
    searchTerm,
    expandedRuleId,
    toastMessage,
    isEditing,
    editRuleId,
    formData,
    translating,
    isStaff,
    filteredRules,
    categories,
    setActiveFilter,
    setSearchTerm,
    setExpandedRuleId,
    setIsEditing,
    setEditRuleId,
    setFormData,
    handleTranslate,
    handleSave,
    handleDelete,
    startEdit,
    handleCopyCommand,
    toggleExpandRule,
  };
}
