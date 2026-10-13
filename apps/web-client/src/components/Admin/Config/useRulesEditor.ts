import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useRules,
  useCreateRule,
  useUpdateRule,
  useDeleteRule,
  useTranslateText,
  Rule,
} from '../../../hooks/useAdminData';

const INITIAL_FORM_DATA: Partial<Rule> = {
  category: 'General',
  title: '',
  title_en: '',
  content: '',
  content_en: '',
  color: '#6366f1',
  sort_order: 0,
};

export function useRulesEditor() {
  const { t } = useTranslation();

  const { data: rulesRaw, isLoading: loading } = useRules();
  const createRuleMutation = useCreateRule();
  const updateRuleMutation = useUpdateRule();
  const deleteRuleMutation = useDeleteRule();
  const translateMutation = useTranslateText();

  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [translatingField, setTranslatingField] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Rule>>(INITIAL_FORM_DATA);

  const rules = useMemo(() => rulesRaw || [], [rulesRaw]);

  const handleTranslate = async (
    text: string,
    toLang: 'es' | 'en',
    field: 'title' | 'content' | 'title_en' | 'content_en',
  ) => {
    if (!text) return;
    setTranslatingField(field);
    translateMutation.mutate(
      { text, targetLang: toLang },
      {
        onSuccess: (translatedText) => {
          setFormData((prev) => ({ ...prev, [field]: translatedText }));
        },
        onError: () => {
          alert(t('admin.settings.rules.translate_error', 'Error al traducir'));
        },
        onSettled: () => setTranslatingField(null),
      },
    );
  };

  const handleCancel = () => {
    setFormData(INITIAL_FORM_DATA);
    setEditingRule(null);
    setIsCreating(false);
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
          onError: () => alert(t('admin.settings.rules.save_error', 'Error al guardar la regla')),
        },
      );
    } else {
      createRuleMutation.mutate(payload as Omit<Rule, 'id'>, {
        onSuccess: () => handleCancel(),
        onError: () => alert(t('admin.settings.rules.save_error', 'Error al guardar la regla')),
      });
    }
  };

  const handleEdit = (rule: Rule) => {
    setFormData({
      ...rule,
      title_en: rule.title_en ?? '',
      content_en: rule.content_en ?? '',
    });
    setEditingRule(rule);
    setIsCreating(true);
  };

  const handleDelete = (id: number) => {
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
      },
    });
  };

  const startCreate = () => {
    setFormData(INITIAL_FORM_DATA);
    setEditingRule(null);
    setIsCreating(true);
  };

  const handleExport = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(rules, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataStr);
    downloadAnchorNode.setAttribute(
      'download',
      `server_rules_${new Date().toISOString().split('T')[0]}.json`,
    );
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
          alert(
            t(
              'admin.settings.rules.import_invalid',
              'Formato de archivo inválido. Debe ser un array de reglas.',
            ),
          );
          return;
        }

        if (!confirm(t('admin.settings.rules.import_confirm', { count: json.length }))) {
          return;
        }

        await Promise.all(
          json.map((rule: Rule) => {
            const ruleData = { ...rule };
            delete (ruleData as { id?: number }).id;
            return createRuleMutation.mutateAsync(ruleData as Omit<Rule, 'id'>);
          }),
        );

        alert(t('admin.settings.rules.import_success', 'Reglas importadas exitosamente'));
      } catch (error) {
        console.error('Error importing:', error);
        alert(
          t(
            'admin.settings.rules.import_error',
            'Error al importar las reglas. Verifica el formato del archivo.',
          ),
        );
      }
    };
    reader.readAsText(file);
    if (e.target) e.target.value = '';
  };

  const groupedRules = useMemo(() => {
    return rules.reduce(
      (acc: Record<string, Rule[]>, rule: Rule) => {
        const cat = rule.category || 'General';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(rule);
        return acc;
      },
      {} as Record<string, Rule[]>,
    );
  }, [rules]);

  const saving = createRuleMutation.isPending || updateRuleMutation.isPending;

  return {
    rules,
    groupedRules,
    loading,
    saving,
    isCreating,
    editingRule,
    formData,
    setFormData,
    deleteConfirmId,
    setDeleteConfirmId,
    translatingField,
    handleTranslate,
    handleSave,
    handleEdit,
    handleDelete,
    confirmDelete,
    handleCancel,
    startCreate,
    handleExport,
    handleImport,
  };
}
