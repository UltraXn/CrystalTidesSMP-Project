import { Plus, Filter, X, Box, Layers, RotateCcw } from 'lucide-react';
import { WIKI_CATEGORIES } from '../../../services/wikiService';

const INLINE_FLEX = 'inline-flex';

interface WikiFiltersBarProps {
  availableMods: string[];
  selectedMod: string;
  setSelectedMod: (mod: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  has3dOnly: boolean;
  setHas3dOnly: (val: boolean) => void;
  isFiltered: boolean;
  resetFilters: () => void;
  filteredCount: number;
  totalCount: number;
}

export function WikiFiltersBar({
  availableMods,
  selectedMod,
  setSelectedMod,
  selectedCategory,
  setSelectedCategory,
  has3dOnly,
  setHas3dOnly,
  isFiltered,
  resetFilters,
  filteredCount,
  totalCount,
}: Readonly<WikiFiltersBarProps>) {
  const handleAddNewMod = () => {
    const newMod = prompt(
      "Escribe el nombre del nuevo Mod para registrar como filtro en el servidor (ej. Twilight Forest, Alex's Mobs, Create Mod):",
    );
    if (newMod?.trim()) {
      const modName = newMod.trim();
      const saved = JSON.parse(localStorage.getItem('crystaltides_custom_mods') ?? '[]');
      if (!saved.includes(modName)) {
        const updated = [...saved, modName];
        localStorage.setItem('crystaltides_custom_mods', JSON.stringify(updated));
      }
      setSelectedMod(modName);
    }
  };

  return (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.8rem',
          flexWrap: 'wrap',
          background: 'rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '10px',
          padding: '0.75rem 1rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: '#0ea5e9',
            fontSize: '0.8rem',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          <Filter size={14} /> Filtros:
        </div>

        {/* Mod Filter Selector & Management Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Layers size={13} style={{ color: '#aaa' }} />
          <select
            aria-label="Filtrar por Mod"
            value={selectedMod}
            onChange={(e) => setSelectedMod(e.target.value)}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '6px',
              padding: '0.4rem 0.7rem',
              color: '#fff',
              fontSize: '0.8rem',
              outline: 'none',
            }}
          >
            <option value="all" style={{ background: '#111' }}>
              📦 Todos los Mods ({availableMods.length})
            </option>
            {availableMods.map((modName) => (
              <option key={modName} value={modName} style={{ background: '#111' }}>
                {modName}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleAddNewMod}
            style={{
              display: INLINE_FLEX,
              alignItems: 'center',
              gap: '0.3rem',
              padding: '0.4rem 0.6rem',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 'bold',
              background: 'rgba(14, 165, 233, 0.15)',
              border: '1px solid rgba(14, 165, 233, 0.3)',
              color: '#38bdf8',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
            title="Agregar un nuevo filtro de Mod al servidor"
          >
            <Plus size={13} /> + Mod
          </button>
        </div>

        {/* Category Filter Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <select
            aria-label="Filtrar por categoría"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '6px',
              padding: '0.4rem 0.7rem',
              color: '#fff',
              fontSize: '0.8rem',
              outline: 'none',
            }}
          >
            <option value="all" style={{ background: '#111' }}>
              🏷️ Todas las Categorías
            </option>
            {WIKI_CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id} style={{ background: '#111' }}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* 3D Model Toggle Filter */}
        <button
          type="button"
          onClick={() => setHas3dOnly(!has3dOnly)}
          style={{
            display: INLINE_FLEX,
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.4rem 0.7rem',
            borderRadius: '6px',
            fontSize: '0.78rem',
            fontWeight: 'bold',
            border: '1px solid',
            borderColor: has3dOnly ? '#ef4444' : 'rgba(255,255,255,0.15)',
            background: has3dOnly ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.05)',
            color: has3dOnly ? '#fca5a5' : '#aaa',
            cursor: 'pointer',
          }}
        >
          <Box size={13} /> Solo Renders 3D
        </button>

        {/* Reset Filters Button */}
        {isFiltered && (
          <button
            type="button"
            onClick={resetFilters}
            style={{
              display: INLINE_FLEX,
              alignItems: 'center',
              gap: '0.3rem',
              padding: '0.4rem 0.6rem',
              borderRadius: '6px',
              fontSize: '0.75rem',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#ef4444',
              cursor: 'pointer',
              marginLeft: 'auto',
            }}
            title="Limpiar todos los filtros"
          >
            <RotateCcw size={12} /> Limpiar ({filteredCount}/{totalCount})
          </button>
        )}
      </div>

      {/* Filter Badges Pills */}
      {isFiltered && (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {selectedMod !== 'all' && (
            <span
              style={{
                display: INLINE_FLEX,
                alignItems: 'center',
                gap: '0.3rem',
                background: 'rgba(14, 165, 233, 0.15)',
                border: '1px solid rgba(14, 165, 233, 0.3)',
                color: '#38bdf8',
                padding: '0.2rem 0.6rem',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: 'bold',
              }}
            >
              Mod: {selectedMod}
              <X size={12} style={{ cursor: 'pointer' }} onClick={() => setSelectedMod('all')} />
            </span>
          )}
          {selectedCategory !== 'all' && (
            <span
              style={{
                display: INLINE_FLEX,
                alignItems: 'center',
                gap: '0.3rem',
                background: 'rgba(168, 85, 247, 0.15)',
                border: '1px solid rgba(168, 85, 247, 0.3)',
                color: '#c084fc',
                padding: '0.2rem 0.6rem',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: 'bold',
              }}
            >
              Cat:{' '}
              {WIKI_CATEGORIES.find((c) => c.id === selectedCategory)?.name ?? selectedCategory}
              <X
                size={12}
                style={{ cursor: 'pointer' }}
                onClick={() => setSelectedCategory('all')}
              />
            </span>
          )}
          {has3dOnly && (
            <span
              style={{
                display: INLINE_FLEX,
                alignItems: 'center',
                gap: '0.3rem',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                padding: '0.2rem 0.6rem',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: 'bold',
              }}
            >
              Solo 3D
              <X size={12} style={{ cursor: 'pointer' }} onClick={() => setHas3dOnly(false)} />
            </span>
          )}
        </div>
      )}
    </>
  );
}
