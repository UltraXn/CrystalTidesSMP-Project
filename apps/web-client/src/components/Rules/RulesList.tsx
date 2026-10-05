import React from 'react';
import Loader from '../UI/Loader';
import type { ProcessedRule, TranslateFn } from './rulesData';
import { RuleCard } from './RuleCard';

export interface RulesListProps {
  loading: boolean;
  rules: ProcessedRule[];
  expandedRuleId: number | null;
  isStaff: boolean;
  language: string;
  onToggleExpand: (id: number) => void;
  onEdit: (rule: ProcessedRule) => void;
  onDelete: (id: number) => void;
  onCopyCommand: (cmd: string) => void;
  t: TranslateFn;
}

export const RulesList: React.FC<Readonly<RulesListProps>> = ({
  loading,
  rules,
  expandedRuleId,
  isStaff,
  language,
  onToggleExpand,
  onEdit,
  onDelete,
  onCopyCommand,
  t,
}) => {
  if (loading) {
    return (
      <div className="py-20">
        <Loader text={t('rules.loading') || 'Cargando normativas...'} />
      </div>
    );
  }

  if (rules.length === 0) {
    return (
      <div className="py-20 text-center text-sm font-bold uppercase tracking-widest text-gray-500">
        No se encontraron normas para tu búsqueda.
      </div>
    );
  }

  return (
    <div className="mx-auto grid w-full grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {rules.map((rule) => (
        <RuleCard
          key={rule.id}
          rule={rule}
          isExpanded={expandedRuleId === rule.id}
          isStaff={isStaff}
          language={language}
          onToggleExpand={() => onToggleExpand(rule.id)}
          onEdit={onEdit}
          onDelete={onDelete}
          onCopyCommand={onCopyCommand}
          t={t}
        />
      ))}
    </div>
  );
};
