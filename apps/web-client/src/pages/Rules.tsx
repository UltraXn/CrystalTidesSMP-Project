import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { m as motion, AnimatePresence } from 'framer-motion';
import Section from '../components/Layout/Section';
import { useAuth } from '../context/AuthContext';
import { useSEO } from '../hooks/useSEO';
import { INITIAL_FORM_DATA } from '../components/Rules/rulesData';
import { RulesSearchBar } from '../components/Rules/RulesSearchBar';
import { RulesFilterBar } from '../components/Rules/RulesFilterBar';
import { RuleEditorForm } from '../components/Rules/RuleEditorForm';
import { RulesList } from '../components/Rules/RulesList';
import { RulesAmbientLighting } from '../components/Rules/RulesAmbientLighting';
import { useRulesManagement } from '../components/Rules/useRulesManagement';

export default function Rules() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();

  useSEO({
    title: 'Reglamento Oficial y Normas de Convivencia',
    description:
      'Consulta el reglamento oficial de CrystalTides SMP 1.21+. Normas sobre PvP, construcciones, fair play y convivencia comunitaria.',
    keywords:
      'reglas minecraft, reglamento smp, normas servidor minecraft, fair play minecraft, pvp reglas',
    canonical: 'https://crystaltidessmp.net/rules',
  });

  const {
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
  } = useRulesManagement(user, t);

  return (
    <div className="relative w-full">
      <Section title={t('rules.title') || 'Normas del Servidor'} headingLevel="h1">
        <div className="relative z-10 flex w-full flex-col items-center pb-20">
          <div className="mx-auto mb-12 w-full max-w-5xl space-y-6 text-center">
            <p className="mx-auto max-w-3xl text-base/relaxed text-gray-400 md:text-lg">
              {t('rules.intro') ||
                'Para mantener una comunidad sana y divertida, es fundamental respetar estas normas de convivencia. El incumplimiento puede llevar a sanciones severas.'}
            </p>

            <RulesSearchBar
              searchTerm={searchTerm}
              onSearchChange={(value) => {
                setSearchTerm(value);
                setExpandedRuleId(null);
              }}
              onClear={() => setSearchTerm('')}
              placeholderText={t(
                'rules.search_placeholder',
                'Buscar normas... (ej: pvp, chat, insultos)',
              )}
            />

            <RulesFilterBar
              categories={categories}
              activeFilter={activeFilter}
              onSelectCategory={(cat) => {
                setActiveFilter(cat);
                setExpandedRuleId(null);
              }}
              allLabel={t('rules.all', 'Todas')}
              t={t}
            />

            {isStaff && !isEditing && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(true);
                    setEditRuleId(null);
                    setFormData(INITIAL_FORM_DATA);
                  }}
                  className="hover:bg-(--accent) cursor-pointer rounded-full bg-white px-8 py-3.5 text-xs font-black uppercase tracking-widest text-black shadow-xl transition-colors hover:scale-105"
                >
                  <Plus className="mr-2 inline" size={16} />{' '}
                  {t('rules.new_rule', 'Nueva Normativa')}
                </button>
              </div>
            )}
          </div>

          {isEditing && (
            <RuleEditorForm
              formData={formData}
              editRuleId={editRuleId}
              translating={translating}
              onFormChange={setFormData}
              onClose={() => setIsEditing(false)}
              onSave={handleSave}
              onTranslate={handleTranslate}
              t={t}
            />
          )}

          <RulesList
            loading={loading}
            rules={filteredRules}
            expandedRuleId={expandedRuleId}
            isStaff={isStaff}
            language={i18n.language}
            onToggleExpand={toggleExpandRule}
            onEdit={startEdit}
            onDelete={handleDelete}
            onCopyCommand={handleCopyCommand}
            t={t}
          />
        </div>
      </Section>

      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="z-1000 border-(--accent)/30 fixed bottom-10 right-10 flex items-center gap-3 rounded-2xl border bg-black/90 px-6 py-4 text-xs font-black uppercase tracking-widest text-white shadow-2xl backdrop-blur-md"
          >
            <span className="bg-(--accent) size-2.5 animate-ping rounded-full" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <RulesAmbientLighting />
    </div>
  );
}
