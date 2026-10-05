import { useTranslation } from 'react-i18next';
import { Plus, Search } from 'lucide-react';
import { WikiArticle } from '../../services/wikiService';
import WikiArticleList from './Wiki/WikiArticleList';
import WikiArticleFormModal from './Wiki/WikiArticleFormModal';
import ConfirmationModal from '../UI/ConfirmationModal';
import { useWikiManager } from './Wiki/useWikiManager';
import { WikiFiltersBar } from './Wiki/WikiFiltersBar';

interface WikiManagerProps {
  mockArticles?: WikiArticle[];
}

export default function WikiManager({ mockArticles }: WikiManagerProps = {}) {
  const { t } = useTranslation();
  const {
    loading,
    articles,
    filteredArticles,
    searchTerm,
    setSearchTerm,
    selectedMod,
    setSelectedMod,
    selectedCategory,
    setSelectedCategory,
    has3dOnly,
    setHas3dOnly,
    availableMods,
    isEditing,
    setIsEditing,
    currentArticle,
    editingId,
    saving,
    deleteArticleId,
    setDeleteArticleId,
    handleSave,
    handleDeleteClick,
    handleConfirmDelete,
    startEdit,
    startNew,
    resetFilters,
    isFiltered,
  } = useWikiManager(mockArticles);

  return (
    <div className="wiki-manager">
      {/* Header & Main Actions */}
      <div
        className="manager-header wiki-header"
        style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.2rem' }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <div className="search-box-wrapper" style={{ flex: 1, minWidth: '280px' }}>
            <div className="search-box">
              <Search className="search-icon" size={18} aria-hidden="true" />
              <input
                aria-label={t('admin.wiki.search_placeholder', 'Buscar por título, slug o mod')}
                type="search"
                placeholder={t('admin.wiki.search_placeholder', 'Buscar por título, slug o mod...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <button
            type="button"
            className="btn-primary"
            onClick={startNew}
            style={{ whiteSpace: 'nowrap' }}
          >
            <Plus size={16} aria-hidden="true" /> {t('admin.wiki.create_btn')}
          </button>
        </div>

        <WikiFiltersBar
          availableMods={availableMods}
          selectedMod={selectedMod}
          setSelectedMod={setSelectedMod}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          has3dOnly={has3dOnly}
          setHas3dOnly={setHas3dOnly}
          isFiltered={isFiltered}
          resetFilters={resetFilters}
          filteredCount={filteredArticles.length}
          totalCount={articles.length}
        />
      </div>

      {/* Main Content Area */}
      <WikiArticleList
        articles={filteredArticles}
        loading={loading}
        onEdit={startEdit}
        onDelete={handleDeleteClick}
      />

      {/* Form Modal */}
      {isEditing && (
        <WikiArticleFormModal
          isOpen={isEditing}
          initialData={currentArticle}
          isEditing={Boolean(editingId)}
          saving={saving}
          onSave={handleSave}
          onClose={() => setIsEditing(false)}
        />
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(deleteArticleId)}
        title={t('admin.wiki.delete_title', 'Eliminar Artículo')}
        message={t(
          'admin.wiki.delete_confirm',
          '¿Estás seguro de que deseas eliminar este artículo de la Wiki? Esta acción no se puede deshacer.',
        )}
        confirmText={t('common.delete', 'Eliminar')}
        cancelText={t('common.cancel', 'Cancelar')}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteArticleId(null)}
        isDanger={true}
      />
    </div>
  );
}
