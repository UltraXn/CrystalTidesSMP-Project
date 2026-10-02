import { Link } from 'react-router-dom';
import { User, Lock, Send, X, Image as ImageIcon } from 'lucide-react';
import type { useAuth } from '../../context/AuthContext';
import type { useTranslation } from 'react-i18next';
import type { PendingImageRepl } from '../../types/forum';

interface ForumReplySectionProps {
  readonly user: ReturnType<typeof useAuth>['user'];
  readonly threadLocked: boolean;
  readonly isAdmin: boolean;
  readonly newComment: string;
  readonly setNewComment: React.Dispatch<React.SetStateAction<string>>;
  readonly pendingImageRepl: PendingImageRepl | null;
  readonly clearReplImage: () => void;
  readonly handleReplImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  readonly handlePostComment: (e: React.SyntheticEvent<HTMLFormElement>) => void;
  readonly t: ReturnType<typeof useTranslation>['t'];
}

export default function ForumReplySection({
  user,
  threadLocked,
  isAdmin,
  newComment,
  setNewComment,
  pendingImageRepl,
  clearReplImage,
  handleReplImageSelect,
  handlePostComment,
  t,
}: Readonly<ForumReplySectionProps>) {
  if (!user) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '2rem',
          background: 'rgba(0,0,0,0.2)',
          borderRadius: '8px',
        }}
      >
        <p style={{ color: 'var(--muted)', marginBottom: '1rem' }}>
          {t('forum_thread.login_to_reply')}
        </p>
        <Link to="/login" className="btn-secondary">
          {t('forum_thread.login')}
        </Link>
      </div>
    );
  }

  if (threadLocked && !isAdmin) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '2rem',
          background: 'rgba(239, 68, 68, 0.05)',
          borderRadius: '8px',
          border: '1px solid rgba(239, 68, 68, 0.2)',
        }}
      >
        <Lock size={30} style={{ color: '#ef4444', marginBottom: '1rem' }} />
        <h4 style={{ color: '#fff', margin: '0 0 0.5rem 0' }}>Tema Cerrado</h4>
        <p style={{ color: '#888', margin: 0 }}>
          Este tema ha sido bloqueado por un moderador y no admite más respuestas.
        </p>
      </div>
    );
  }

  const isSubmitDisabled = !newComment.trim() && !pendingImageRepl;

  return (
    <form
      onSubmit={handlePostComment}
      style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}
    >
      <div
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: '#333',
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        {user.user_metadata?.avatar_url ? (
          <img
            src={user.user_metadata.avatar_url}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            alt="user"
          />
        ) : (
          <User color="#888" style={{ padding: '8px' }} />
        )}
      </div>
      <div
        style={{
          flexGrow: 1,
          background: 'rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '8px',
          overflow: 'hidden',
          transition: 'border-color 0.2s',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
        }}
      >
        <textarea
          aria-label={t('forum_thread.write_reply', 'Escribir respuesta...')}
          className="form-textarea"
          placeholder={t('forum_thread.write_reply')}
          rows={3}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          style={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            padding: '1rem',
            color: '#fff',
            resize: 'vertical',
            minHeight: '80px',
            outline: 'none',
          }}
        />

        {pendingImageRepl && (
          <div style={{ padding: '0 1rem 1rem 1rem' }}>
            <div
              style={{
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '4px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '1rem',
                border: '1px solid var(--accent)',
                padding: '0.5rem',
              }}
            >
              <img
                src={pendingImageRepl.preview}
                style={{
                  height: '50px',
                  borderRadius: '4px',
                  objectFit: 'cover',
                }}
                alt="preview"
              />
              <div style={{ fontSize: '0.8rem', color: '#ccc' }}>
                <div style={{ fontWeight: 'bold', color: '#fff' }}>Imagen lista</div>
              </div>
              <button
                aria-label={t('common.remove', 'Eliminar imagen')}
                type="button"
                onClick={clearReplImage}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#ef4444',
                  cursor: 'pointer',
                  padding: '0 0.5rem',
                  fontSize: '1.1rem',
                }}
              >
                <X />
              </button>
            </div>
          </div>
        )}

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.5rem 1rem',
            background: 'rgba(255,255,255,0.02)',
            borderTop: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <label
            title="Adjuntar imagen"
            className="hover:bg-white/10 hover:text-white"
            style={{
              cursor: 'pointer',
              color: pendingImageRepl ? 'var(--accent)' : '#aaa',
              fontSize: '1.2rem',
              padding: '0.5rem',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.2s, background-color 0.2s, border-color 0.2s, opacity 0.2s',
            }}
          >
            <ImageIcon />
            <input
              aria-label={t('create_thread.form.attach_image', 'Adjuntar imagen')}
              type="file"
              accept="image/*"
              onChange={handleReplImageSelect}
              style={{ display: 'none' }}
            />
          </label>

          <button
            type="submit"
            disabled={isSubmitDisabled}
            style={{
              background: isSubmitDisabled ? '#444' : 'var(--accent)',
              color: isSubmitDisabled ? '#888' : '#000',
              border: 'none',
              padding: '0.4rem 1.2rem',
              borderRadius: '4px',
              fontWeight: 'bold',
              fontSize: '0.9rem',
              cursor: isSubmitDisabled ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'transform 0.1s',
            }}
          >
            <Send size={12} /> {t('forum_thread.publish')}
          </button>
        </div>
      </div>
    </form>
  );
}
