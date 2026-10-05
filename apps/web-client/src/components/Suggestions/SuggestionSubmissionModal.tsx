import { X } from 'lucide-react';
import SuggestionForm from './SuggestionForm';
import type { SuggestionItem } from './types';

interface SuggestionSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuggestionCreated: (newSuggestion: SuggestionItem) => void;
}

export default function SuggestionSubmissionModal({
  isOpen,
  onClose,
  onSuggestionCreated,
}: Readonly<SuggestionSubmissionModalProps>) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-2xl rounded-[2.5rem] border border-white/10 bg-[#0c0d12] p-6 shadow-2xl">
        <button
          type="button"
          aria-label="Cerrar modal"
          onClick={onClose}
          className="absolute right-6 top-6 flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X size={18} />
        </button>

        <SuggestionForm
          onSuggestionCreated={(suggestion) => {
            onSuggestionCreated(suggestion);
            onClose();
          }}
        />
      </div>
    </div>
  );
}
