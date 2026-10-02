import { Trash2 } from 'lucide-react';

interface DeleteModalState {
  type: 'thread' | 'post';
  id: string | number;
}

interface ForumDeleteConfirmModalProps {
  readonly deleteModal: DeleteModalState;
  readonly onClose: () => void;
  readonly onConfirm: () => void;
}

export default function ForumDeleteConfirmModal({
  deleteModal,
  onClose,
  onConfirm,
}: Readonly<ForumDeleteConfirmModalProps>) {
  return (
    <dialog
      open
      aria-labelledby="delete-modal-title"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        backdropFilter: 'blur(5px)',
        border: 'none',
        margin: 0,
        padding: 0,
        maxWidth: 'none',
        maxHeight: 'none',
      }}
    >
      <button
        type="button"
        aria-label="Cerrar modal"
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'transparent',
          border: 'none',
          cursor: 'default',
          padding: 0,
          margin: 0,
        }}
      />
      <div
        tabIndex={-1}
        style={{
          position: 'relative',
          zIndex: 1,
          background: '#1e1e24',
          padding: '2rem',
          borderRadius: '12px',
          border: '1px solid #ef4444',
          maxWidth: '400px',
          width: '90%',
          textAlign: 'center',
          boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
        }}
      >
        <div
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.1)',
            color: '#ef4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            fontSize: '2rem',
          }}
        >
          <Trash2 />
        </div>
        <h3
          id="delete-modal-title"
          style={{ margin: '0 0 0.5rem 0', fontSize: '1.4rem', color: '#fff' }}
        >
          ¿Estás seguro?
        </h3>
        <p style={{ color: '#aaa', marginBottom: '2rem', lineHeight: '1.5' }}>
          {deleteModal.type === 'thread'
            ? 'Esta acción eliminará el post y todos sus comentarios permanentemente.'
            : 'Esta acción eliminará el comentario permanentemente.'}
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button
            aria-label="Cancelar eliminación"
            type="button"
            className="btn-secondary"
            onClick={onClose}
            style={{ flex: 1 }}
          >
            Cancelar
          </button>
          <button
            aria-label="Confirmar eliminación"
            type="button"
            className="btn-primary"
            onClick={onConfirm}
            style={{
              flex: 1,
              background: '#ef4444',
              borderColor: '#ef4444',
              color: '#fff',
            }}
          >
            Eliminar
          </button>
        </div>
      </div>
    </dialog>
  );
}
