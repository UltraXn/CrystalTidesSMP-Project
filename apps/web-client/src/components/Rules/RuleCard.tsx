import React from 'react';
import { m as motion, AnimatePresence } from 'framer-motion';
import { Edit2, Trash2 } from 'lucide-react';
import type { ProcessedRule, RuleExamplesData, TranslateFn } from './rulesData';
import {
  DEFAULT_CATEGORY,
  LANG_EN,
  getCategoryColor,
  getRuleSeverity,
  getRuleExamples,
  getRuleCommands,
} from './rulesData';
import { CategoryIcon } from './CategoryIcon';

// Subcomponent: Rule Expandable Details
interface RuleExpandedContentProps {
  examples: RuleExamplesData;
  commands: string[];
  t: TranslateFn;
  onCopyCommand: (cmd: string) => void;
}

export const RuleExpandedContent: React.FC<Readonly<RuleExpandedContentProps>> = ({
  examples,
  commands,
  t,
  onCopyCommand,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="flex flex-col gap-5 overflow-hidden border-t border-white/5 pt-6 text-left"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="grid grid-cols-1 gap-3">
        <div className="rounded-2xl border border-emerald-500/10 bg-emerald-500/5 p-4">
          <div className="mb-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-400">
            {t('rules.allowed', 'PERMITIDO')}
          </div>
          <div className="text-xs/relaxed font-medium text-gray-300">{examples.allowed}</div>
        </div>
        <div className="rounded-2xl border border-red-500/10 bg-red-500/5 p-4">
          <div className="mb-1.5 text-[10px] font-black uppercase tracking-widest text-red-400">
            {t('rules.forbidden', 'PROHIBIDO / SANCIONABLE')}
          </div>
          <div className="text-xs/relaxed font-medium text-gray-300">{examples.forbidden}</div>
        </div>
      </div>

      {commands.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="ml-1 text-[10px] font-black uppercase tracking-widest text-gray-500">
            {t('rules.useful_commands', 'COMANDOS ÚTILES')}
          </div>
          <div className="flex flex-wrap gap-2">
            {commands.map((cmd) => (
              <button
                type="button"
                key={cmd}
                onClick={() => onCopyCommand(cmd)}
                className="hover:bg-(--accent)/15 hover:border-(--accent)/30 hover:text-(--accent) group/cmd flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-xs text-gray-300 transition-colors"
              >
                <span>{cmd}</span>
                <span className="text-[9px] opacity-30 transition-opacity group-hover/cmd:opacity-100">
                  ({t('common.copy', 'Copiar')})
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

// Subcomponent: Rule Card
export interface RuleCardProps {
  rule: ProcessedRule;
  isExpanded: boolean;
  isStaff: boolean;
  language: string;
  onToggleExpand: () => void;
  onEdit: (rule: ProcessedRule) => void;
  onDelete: (id: number) => void;
  onCopyCommand: (cmd: string) => void;
  t: TranslateFn;
}

export const RuleCard: React.FC<Readonly<RuleCardProps>> = ({
  rule,
  isExpanded,
  isStaff,
  language,
  onToggleExpand,
  onEdit,
  onDelete,
  onCopyCommand,
  t,
}) => {
  const categoryName = rule.category || DEFAULT_CATEGORY;
  const accent = rule.color || getCategoryColor(categoryName);
  const severity = getRuleSeverity(categoryName, rule.title, t);
  const examples = getRuleExamples(categoryName, rule.title, language);
  const commands = getRuleCommands(categoryName);

  const displayTitle = language === LANG_EN && rule.title_en ? rule.title_en : rule.title;
  const displayContent = language === LANG_EN && rule.content_en ? rule.content_en : rule.content;

  const cardBorderClass = isExpanded
    ? 'border-(--accent)/50 shadow-(--accent)/5 shadow-2xl'
    : 'hover:border-(--accent)/30 border-white/5';

  return (
    <article
      className={`rule-card-premium group relative flex size-full flex-col gap-6 overflow-hidden rounded-3xl border bg-black/60 p-8 text-left backdrop-blur-xl transition-colors duration-300 hover:-translate-y-1 hover:shadow-2xl ${cardBorderClass}`}
    >
      <button
        type="button"
        aria-label={isExpanded ? 'Colapsar regla' : 'Expandir regla'}
        aria-expanded={isExpanded}
        onClick={onToggleExpand}
        className="absolute inset-0 z-10 cursor-pointer"
      />
      <div className="pointer-events-none absolute right-8 top-8 select-none font-sans text-5xl font-black text-white/5 transition-colors group-hover:scale-110 group-hover:text-white/10">
        #{String(rule.globalIndex).padStart(2, '0')}
      </div>

      {isStaff && (
        <div className="absolute right-20 top-4 z-20 flex gap-2 opacity-0 transition-colors group-hover:opacity-100">
          <button
            aria-label={t('common.edit', 'Editar')}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(rule);
            }}
            className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 transition-colors hover:bg-emerald-500 hover:text-black"
          >
            <Edit2 size={14} />
          </button>
          <button
            aria-label={t('common.delete', 'Eliminar')}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(rule.id);
            }}
            className="flex size-8 items-center justify-center rounded-lg bg-red-500/20 text-red-500 transition-colors hover:bg-red-500 hover:text-black"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div
          className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.15em]"
          style={{ color: accent }}
        >
          <span className="group-hover:scale-115 text-lg transition-transform duration-300 group-hover:rotate-12">
            <CategoryIcon category={categoryName} size={18} />
          </span>
          <span>{t(`rules.categories.${categoryName.toLowerCase()}`, categoryName)}</span>
        </div>
        <div
          className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-widest ${severity.class}`}
        >
          <span
            className="size-1.5 rounded-full bg-emerald-400"
            style={{ backgroundColor: severity.color }}
          />
          {severity.label}
        </div>
      </div>

      <h3 className="group-hover:text-(--accent) m-0 text-2xl/tight font-black text-white transition-colors">
        {displayTitle}
      </h3>

      <div className="grow text-sm/relaxed font-medium text-gray-400">{displayContent}</div>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <RuleExpandedContent
            examples={examples}
            commands={commands}
            t={t}
            onCopyCommand={onCopyCommand}
          />
        )}
      </AnimatePresence>

      <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-6">
        <div
          className="flex size-10 items-center justify-center rounded-xl bg-white/5 text-xl transition-colors group-hover:-rotate-12 group-hover:scale-110"
          style={{ color: accent }}
        >
          <CategoryIcon category={categoryName} size={20} />
        </div>
        <div className="group-hover:text-(--accent) text-[10px] font-black uppercase tracking-widest text-gray-500 transition-colors">
          {isExpanded
            ? t('rules.view_less', 'Ver menos ↑')
            : t('rules.view_more', 'Ver detalles ↓')}
        </div>
      </div>

      <div className="absolute inset-y-0 left-0 w-1" style={{ backgroundColor: accent }} />
    </article>
  );
};
