import React from 'react';
import { X, Save, Languages, Loader2 } from 'lucide-react';
import type { Rule } from '../../services/ruleService';
import type { TranslationField, TranslateFn } from './rulesData';
import {
  LANG_ES,
  LANG_EN,
  FIELD_TITLE,
  FIELD_TITLE_EN,
  FIELD_CONTENT,
  FIELD_CONTENT_EN,
  UI_CLASSES,
  CATEGORY_COLORS,
} from './rulesData';

export interface RuleEditorFormProps {
  formData: Partial<Rule>;
  editRuleId: number | null;
  translating: string | null;
  onFormChange: (updated: Partial<Rule>) => void;
  onClose: () => void;
  onSave: () => void;
  onTranslate: (
    text: string,
    toLang: typeof LANG_ES | typeof LANG_EN,
    field: TranslationField,
  ) => void;
  t: TranslateFn;
}

export const RuleEditorForm: React.FC<Readonly<RuleEditorFormProps>> = ({
  formData,
  editRuleId,
  translating,
  onFormChange,
  onClose,
  onSave,
  onTranslate,
  t,
}) => {
  const isUpdating = Boolean(editRuleId);

  return (
    <div className="mx-auto mb-20 w-full max-w-4xl rounded-3xl border border-white/10 bg-[#0a0a0a] p-8 shadow-2xl backdrop-blur-3xl">
      <div className="mb-10 flex items-center justify-between border-b border-white/5 pb-6">
        <h3 className="text-(--accent) text-2xl font-black uppercase tracking-widest">
          {isUpdating ? t('rules.editing', 'Editando Norma') : t('rules.new_norm', 'Nueva Norma')}
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase text-white/50 transition-colors hover:text-white"
        >
          <X size={14} /> {t('rules.close', 'Cerrar')}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8 text-left md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="rules-category" className={`ml-4 ${UI_CLASSES.label}`}>
            {t('rules.category', 'Categoría')}
          </label>
          <input
            id="rules-category"
            type="text"
            list="category-suggestions"
            className={UI_CLASSES.input}
            value={formData.category}
            onChange={(e) => onFormChange({ ...formData, category: e.target.value })}
            placeholder={t('rules.cat_placeholder', 'Ej: PvP, Chat, Construcción...')}
          />
          <datalist id="category-suggestions">
            {Object.keys(CATEGORY_COLORS).map((c) => (
              <option key={c} value={c} label={c}>
                {c}
              </option>
            ))}
          </datalist>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="rules-sort-order" className={`ml-4 ${UI_CLASSES.label}`}>
            {t('rules.sort_order', 'Orden de Visualización')}
          </label>
          <input
            id="rules-sort-order"
            type="number"
            className={UI_CLASSES.input}
            value={formData.sort_order}
            onChange={(e) =>
              onFormChange({
                ...formData,
                sort_order: Number.parseInt(e.target.value, 10) || 0,
              })
            }
          />
        </div>

        {/* Title Spanish */}
        <div className="flex flex-col gap-2 md:col-span-2">
          <div className="flex items-center justify-between px-4">
            <label htmlFor="rules-title-es" className={UI_CLASSES.label}>
              {t('rules.title_es', 'Título (Español)')}
            </label>
            <button
              type="button"
              className={UI_CLASSES.translateBtn}
              onClick={() => onTranslate(formData.title || '', LANG_EN, FIELD_TITLE_EN)}
              disabled={Boolean(translating) || !formData.title}
            >
              {translating === FIELD_TITLE_EN ? (
                <Loader2 className="animate-spin" size={14} />
              ) : (
                <Languages className="mr-1 inline" size={14} />
              )}{' '}
              {t('rules.translate_to_en', 'Traducir a EN')}
            </button>
          </div>
          <input
            id="rules-title-es"
            type="text"
            className={UI_CLASSES.input}
            value={formData.title}
            onChange={(e) => onFormChange({ ...formData, title: e.target.value })}
            placeholder={t('rules.title_placeholder_es', 'Título en español')}
          />
        </div>

        {/* Title English */}
        <div className="flex flex-col gap-2 md:col-span-2">
          <div className="flex items-center justify-between px-4">
            <label htmlFor="rules-title-en" className={UI_CLASSES.label}>
              {t('rules.title_en', 'Título (Inglés)')}{' '}
              <span className="opacity-40">({t('common.optional', 'Opcional')})</span>
            </label>
            <button
              type="button"
              className={UI_CLASSES.translateBtn}
              onClick={() => onTranslate(formData.title_en || '', LANG_ES, FIELD_TITLE)}
              disabled={Boolean(translating) || !formData.title_en}
            >
              {translating === FIELD_TITLE ? (
                <Loader2 className="animate-spin" size={14} />
              ) : (
                <Languages className="mr-1 inline" size={14} />
              )}{' '}
              {t('rules.translate_to_es', 'Traducir a ES')}
            </button>
          </div>
          <input
            id="rules-title-en"
            type="text"
            className={UI_CLASSES.input}
            value={formData.title_en}
            onChange={(e) => onFormChange({ ...formData, title_en: e.target.value })}
            placeholder={t('rules.title_placeholder_en', 'English title')}
          />
        </div>

        {/* Content Spanish */}
        <div className="flex flex-col gap-2 md:col-span-2">
          <div className="flex items-center justify-between px-4">
            <label htmlFor="rules-content-es" className={UI_CLASSES.label}>
              {t('rules.content_es', 'Contenido (Español)')}
            </label>
            <button
              type="button"
              className={UI_CLASSES.translateBtn}
              onClick={() => onTranslate(formData.content || '', LANG_EN, FIELD_CONTENT_EN)}
              disabled={Boolean(translating) || !formData.content}
            >
              {translating === FIELD_CONTENT_EN ? (
                <Loader2 className="animate-spin" size={14} />
              ) : (
                <Languages className="mr-1 inline" size={14} />
              )}{' '}
              {t('rules.translate_to_en', 'Traducir a EN')}
            </button>
          </div>
          <textarea
            id="rules-content-es"
            rows={4}
            className={UI_CLASSES.textarea}
            value={formData.content}
            onChange={(e) => onFormChange({ ...formData, content: e.target.value })}
            placeholder={t('rules.content_placeholder_es', 'Contenido en español...')}
          />
        </div>

        {/* Content English */}
        <div className="flex flex-col gap-2 md:col-span-2">
          <div className="flex items-center justify-between px-4">
            <label htmlFor="rules-content-en" className={UI_CLASSES.label}>
              {t('rules.content_en', 'Contenido (Inglés)')}{' '}
              <span className="opacity-40">({t('common.optional', 'Opcional')})</span>
            </label>
            <button
              type="button"
              className={UI_CLASSES.translateBtn}
              onClick={() => onTranslate(formData.content_en || '', LANG_ES, FIELD_CONTENT)}
              disabled={Boolean(translating) || !formData.content_en}
            >
              {translating === FIELD_CONTENT ? (
                <Loader2 className="animate-spin" size={14} />
              ) : (
                <Languages className="mr-1 inline" size={14} />
              )}{' '}
              {t('rules.translate_to_es', 'Traducir a ES')}
            </button>
          </div>
          <textarea
            id="rules-content-en"
            rows={4}
            className={UI_CLASSES.textarea}
            value={formData.content_en}
            onChange={(e) => onFormChange({ ...formData, content_en: e.target.value })}
            placeholder={t('rules.content_placeholder_en', 'English content...')}
          />
        </div>

        <button
          type="button"
          onClick={onSave}
          className="bg-(--accent) shadow-(--accent)/20 mt-4 rounded-2xl py-5 font-black uppercase tracking-widest text-black shadow-lg transition-colors hover:scale-[1.02] active:scale-95 disabled:opacity-50 md:col-span-2"
          disabled={Boolean(translating)}
        >
          <Save className="mr-2 inline" size={18} />{' '}
          {isUpdating
            ? t('rules.update_btn', 'ACTUALIZAR NORMA')
            : t('rules.publish_btn', 'PUBLICAR NORMA')}
        </button>
      </div>
    </div>
  );
};
