import React from 'react';
import { Search, X } from 'lucide-react';

interface RulesSearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onClear: () => void;
  placeholderText: string;
}

export const RulesSearchBar: React.FC<Readonly<RulesSearchBarProps>> = ({
  searchTerm,
  onSearchChange,
  onClear,
  placeholderText,
}) => {
  return (
    <div className="group relative mx-auto w-full max-w-2xl">
      <Search
        className="group-focus-within:text-(--accent) absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 transition-colors"
        size={20}
      />
      <input
        aria-label="Input field"
        type="text"
        placeholder={placeholderText}
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-13 focus:border-(--accent) focus:ring-(--accent)/20 w-full rounded-2xl border border-white/15 bg-black/60 py-4 pr-12 text-base text-white shadow-2xl backdrop-blur-xl transition-colors placeholder:text-gray-500 focus:outline-none focus:ring-2"
      />
      {searchTerm && (
        <button
          aria-label="Action"
          type="button"
          onClick={onClear}
          className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 transition-colors hover:text-white"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
};
