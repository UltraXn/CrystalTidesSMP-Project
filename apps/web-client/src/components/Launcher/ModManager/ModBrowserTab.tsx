import React from 'react';
import { getActiveProfile, type SearchModResult } from '../mockLauncherState';
import { SearchModCard } from './SearchModCard';
import { SearchPagination } from './SearchPagination';
import { SearchFilterSidebar, type ModSource } from './SearchFilterSidebar';
import { SearchModForm } from './SearchModForm';
import { CurseForgeKeyCard } from './CurseForgeKeyCard';

const CONSTANTS = {
  SOURCE_CURSEFORGE: 'curseforge' as const,
  MUTED_WHITE_COLOR: 'rgba(255, 255, 255, 0.4)',
} as const;

interface ModBrowserTabProps {
  selectedSource: ModSource;
  setSelectedSource: (val: ModSource) => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  searchResults: SearchModResult[];
  isSearching: boolean;
  totalResults: number;
  currentPage: number;
  pageSize: number;
  setPageSize: (val: number) => void;
  selectedSort: string;
  setSelectedSort: (val: string) => void;
  installingId: string | null;
  installStatus: Record<string, string>;
  cfApiKeyInput: string;
  setCfApiKeyInput: (val: string) => void;
  hasCfApiKey: boolean;
  selectedVersion: string;
  setSelectedVersion: (val: string) => void;
  selectedLoader: string;
  setSelectedLoader: (val: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: (val: string | null) => void;
  versionsList: string[];
  activeProfile: ReturnType<typeof getActiveProfile>;
  onSearchSubmit: (e: React.SyntheticEvent) => void;
  onPageChange: (newPage: number) => void;
  onInstallMod: (mod: SearchModResult) => void;
  onSaveCfApiKey: () => void;
}

export const ModBrowserTab: React.FC<Readonly<ModBrowserTabProps>> = ({
  selectedSource,
  setSelectedSource,
  searchQuery,
  setSearchQuery,
  searchResults,
  isSearching,
  totalResults,
  currentPage,
  pageSize,
  setPageSize,
  selectedSort,
  setSelectedSort,
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
  versionsList,
  activeProfile,
  onSearchSubmit,
  onPageChange,
  onInstallMod,
  onSaveCfApiKey,
}) => {
  return (
    <div style={{ display: 'flex', gap: 24, alignItems: 'stretch' }}>
      <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <SearchModForm
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedSource={selectedSource}
          selectedSort={selectedSort}
          setSelectedSort={setSelectedSort}
          pageSize={pageSize}
          setPageSize={setPageSize}
          isSearching={isSearching}
          hasResults={searchResults.length > 0}
          onSubmit={onSearchSubmit}
        />

        {selectedSource === CONSTANTS.SOURCE_CURSEFORGE && !hasCfApiKey && (
          <CurseForgeKeyCard
            cfApiKeyInput={cfApiKeyInput}
            setCfApiKeyInput={setCfApiKeyInput}
            onSaveCfApiKey={onSaveCfApiKey}
          />
        )}

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            borderTop: '1.5px solid rgba(255,255,255,0.03)',
            marginTop: 8,
          }}
        >
          {searchResults.length === 0 && !isSearching ? (
            <div style={{ padding: '80px 0', color: CONSTANTS.MUTED_WHITE_COLOR, fontSize: 13 }}>
              {selectedSource === CONSTANTS.SOURCE_CURSEFORGE && !hasCfApiKey
                ? 'Ingrese su clave API de CurseForge arriba para habilitar la búsqueda.'
                : 'No se encontraron resultados. Intenta ajustar los filtros de búsqueda o ingresa otras palabras clave.'}
            </div>
          ) : (
            <>
              {searchResults.map((result, idx) => (
                <SearchModCard
                  key={result.id}
                  result={result}
                  index={idx}
                  status={installStatus[result.id]}
                  isInstalling={installingId === result.id}
                  selectedLoader={selectedLoader}
                  onInstall={onInstallMod}
                />
              ))}

              {totalResults > 0 && (
                <SearchPagination
                  currentPage={currentPage}
                  totalResults={totalResults}
                  pageSize={pageSize}
                  isSearching={isSearching}
                  onPageChange={onPageChange}
                />
              )}
            </>
          )}
        </div>
      </div>

      <SearchFilterSidebar
        selectedSource={selectedSource}
        selectedVersion={selectedVersion}
        selectedLoader={selectedLoader}
        selectedCategory={selectedCategory}
        versionsList={versionsList}
        activeProfile={activeProfile}
        onSourceChange={setSelectedSource}
        onVersionChange={setSelectedVersion}
        onLoaderChange={setSelectedLoader}
        onCategoryChange={setSelectedCategory}
      />
    </div>
  );
};
