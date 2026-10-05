import { Pin, Lock, Unlock, Edit, Trash2, Check, X } from 'lucide-react';

interface ForumThreadActionButtonsProps {
  readonly isTopic: boolean;
  readonly isOwnerOrAdmin: boolean;
  readonly isEditingThread: boolean;
  readonly isAdmin: boolean;
  readonly pinned: boolean;
  readonly locked: boolean;
  readonly onTogglePin: () => void;
  readonly onToggleLock: () => void;
  readonly onStartEditThread: () => void;
  readonly onDeleteThread: () => void;
  readonly onUpdateThread: () => void;
  readonly onCancelEditThread: () => void;
}

export default function ForumThreadActionButtons({
  isTopic,
  isOwnerOrAdmin,
  isEditingThread,
  isAdmin,
  pinned,
  locked,
  onTogglePin,
  onToggleLock,
  onStartEditThread,
  onDeleteThread,
  onUpdateThread,
  onCancelEditThread,
}: Readonly<ForumThreadActionButtonsProps>) {
  if (isEditingThread) {
    return (
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onUpdateThread}
          className="btn-primary"
          style={{
            padding: '0.5rem 1rem',
            display: 'flex',
            gap: '0.5rem',
            fontSize: '0.8rem',
          }}
        >
          <Check size={16} /> Guardar
        </button>
        <button
          type="button"
          onClick={onCancelEditThread}
          className="btn-secondary"
          style={{
            padding: '0.5rem 1rem',
            display: 'flex',
            gap: '0.5rem',
            fontSize: '0.8rem',
          }}
        >
          <X size={16} /> Cancelar
        </button>
      </div>
    );
  }

  if (!isTopic || !isOwnerOrAdmin) return null;

  return (
    <div className="flex items-center gap-3">
      {/* Mod Tools - Only for Staff */}
      {isAdmin && (
        <div className="flex items-center gap-2 rounded-lg border border-white/5 bg-black/20 p-1.5">
          <button
            type="button"
            onClick={onTogglePin}
            className="rounded-sm p-1 transition-colors hover:bg-white/5"
            title={pinned ? 'Desfijar' : 'Fijar'}
          >
            <Pin
              size={14}
              className={pinned ? 'text-(--accent)' : 'text-gray-500'}
              style={{
                transform: pinned ? 'rotate(0deg)' : 'rotate(45deg)',
                transition: 'color 0.3s, background-color 0.3s, border-color 0.3s, opacity 0.3s',
              }}
            />
          </button>
          <button
            type="button"
            onClick={onToggleLock}
            className="rounded-sm p-1 transition-colors hover:bg-white/5"
            title={locked ? 'Desbloquear' : 'Bloquear'}
          >
            {locked ? (
              <Lock size={14} className="text-red-500" />
            ) : (
              <Unlock size={14} className="text-gray-500" />
            )}
          </button>
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onStartEditThread}
          className="bg-(--accent)/10 hover:bg-(--accent)/20 text-(--accent) rounded-xl p-2 transition-colors"
          title="Editar"
        >
          <Edit size={16} />
        </button>
        <button
          type="button"
          onClick={onDeleteThread}
          className="rounded-xl bg-red-500/10 p-2 text-red-500 transition-colors hover:bg-red-500/20"
          title="Eliminar"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
