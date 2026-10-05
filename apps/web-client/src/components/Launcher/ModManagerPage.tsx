import React from 'react';
import { CrystalPageHeader } from './CrystalPageHeader';
import { useModManager } from './ModManager/useModManager';
import { InstalledModsTab } from './ModManager/InstalledModsTab';
import { SyncOfficialModsTab } from './ModManager/SyncOfficialModsTab';
import { ModBrowserTab } from './ModManager/ModBrowserTab';

const CONSTANTS = {
  BOX_BORDER_BOX: 'border-box' as const,
} as const;

export const ModManagerPage: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    isSyncing,
    syncStatus,
    syncProgress,
    syncError,
    modsList,
    isLoadingMods,
    installedMods,
    modsRegistry,
    isLoadingInstalled,
    installedFilter,
    setInstalledFilter,
    busyModFile,
    selectedSource,
    setSelectedSource,
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    installingId,
    installStatus,
    cfApiKeyInput,
    setCfApiKeyInput,
    hasCfApiKey,
    selectedVersion,
    setSelectedVersion,
    selectedLoader,
    setSelectedLoader,
    selectedCategory,
    setSelectedCategory,
    selectedSort,
    setSelectedSort,
    versionsList,
    totalResults,
    currentPage,
    pageSize,
    setPageSize,
    activeProfile,
    loadInstalled,
    handlePageChange,
    handleSearchSubmit,
    handleSaveCfApiKey,
    handleSyncMods,
    handleInstallMod,
    handleToggleMod,
    handleDeleteMod,
    handleOpenModsFolder,
  } = useModManager();

  return (
    <div
      style={{
        padding: '24px 32px',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        boxSizing: CONSTANTS.BOX_BORDER_BOX,
        overflowY: 'auto',
      }}
    >
      <CrystalPageHeader eyebrow="Biblioteca" title="Gestión de Mods" />

      <div
        role="tablist"
        aria-label="Secciones del administrador de mods"
        style={{
          display: 'flex',
          gap: 8,
          padding: 4,
          borderRadius: 10,
          backgroundColor: 'rgba(0, 0, 0, 0.35)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          marginTop: 16,
          marginBottom: 20,
        }}
      >
        <button
          role="tab"
          aria-selected={activeTab === 'installed'}
          aria-label="Ver mods instalados"
          type="button"
          onClick={() => setActiveTab('installed')}
          className={`tab-btn ${activeTab === 'installed' ? 'active' : ''}`}
        >
          📂 Mods Instalados
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'sync'}
          aria-label="Sincronizar mods oficiales"
          type="button"
          onClick={() => setActiveTab('sync')}
          className={`tab-btn ${activeTab === 'sync' ? 'active' : ''}`}
        >
          🔄 Sincronizar Oficiales
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'search'}
          aria-label="Explorar y buscar mods online"
          type="button"
          onClick={() => setActiveTab('search')}
          className={`tab-btn ${activeTab === 'search' ? 'active' : ''}`}
        >
          🌐 Buscar Mods
        </button>
      </div>

      {activeTab === 'installed' && (
        <InstalledModsTab
          installedMods={installedMods}
          modsRegistry={modsRegistry}
          isLoading={isLoadingInstalled}
          filter={installedFilter}
          busyModFile={busyModFile}
          activeProfile={activeProfile}
          onFilterChange={setInstalledFilter}
          onRefresh={loadInstalled}
          onOpenFolder={handleOpenModsFolder}
          onToggleMod={handleToggleMod}
          onDeleteMod={handleDeleteMod}
        />
      )}

      {activeTab === 'sync' && (
        <SyncOfficialModsTab
          isSyncing={isSyncing}
          syncStatus={syncStatus}
          syncProgress={syncProgress}
          syncError={syncError}
          modsList={modsList}
          isLoadingMods={isLoadingMods}
          activeProfileName={activeProfile ? activeProfile.name : 'Ninguno'}
          onSync={handleSyncMods}
        />
      )}

      {activeTab === 'search' && (
        <ModBrowserTab
          selectedSource={selectedSource}
          setSelectedSource={setSelectedSource}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchResults={searchResults}
          isSearching={isSearching}
          totalResults={totalResults}
          currentPage={currentPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
          selectedSort={selectedSort}
          setSelectedSort={setSelectedSort}
          installingId={installingId}
          installStatus={installStatus}
          cfApiKeyInput={cfApiKeyInput}
          setCfApiKeyInput={setCfApiKeyInput}
          hasCfApiKey={hasCfApiKey}
          selectedVersion={selectedVersion}
          setSelectedVersion={setSelectedVersion}
          selectedLoader={selectedLoader}
          setSelectedLoader={setSelectedLoader}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          versionsList={versionsList}
          activeProfile={activeProfile}
          onSearchSubmit={handleSearchSubmit}
          onPageChange={handlePageChange}
          onInstallMod={handleInstallMod}
          onSaveCfApiKey={handleSaveCfApiKey}
        />
      )}
    </div>
  );
};

export default ModManagerPage;
