import { Users, X, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LocationAuthor } from '../../../services/locationService';

const AUTHOR_ROLES = ['architect', 'co_founder', 'staff', 'team', 'builder', 'developer'];

interface LocationAuthorsSectionProps {
  authors?: LocationAuthor[];
  newAuthor: LocationAuthor;
  setNewAuthor: React.Dispatch<React.SetStateAction<LocationAuthor>>;
  onAddAuthor: () => void;
  onRemoveAuthor: (idx: number) => void;
}

export function LocationAuthorsSection({
  authors,
  newAuthor,
  setNewAuthor,
  onAddAuthor,
  onRemoveAuthor,
}: LocationAuthorsSectionProps) {
  const { t } = useTranslation();

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.02)',
        padding: '1.5rem',
        borderRadius: '20px',
        border: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <div
        style={{
          display: 'block',
          marginBottom: '1rem',
          color: 'rgba(255,255,255,0.7)',
          fontSize: '0.9rem',
          fontWeight: '700',
        }}
      >
        <Users style={{ marginRight: '8px' }} />{' '}
        {t('locations_manager.form.authors', 'Arquitectos / Autores')}
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.8rem',
          marginBottom: '1.5rem',
        }}
      >
        {authors?.map((auth, idx) => (
          <div
            key={auth.name}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(59, 130, 246, 0.1)',
              padding: '0.4rem 0.8rem',
              borderRadius: '50px',
              border: '1px solid rgba(59, 130, 246, 0.2)',
            }}
          >
            <img
              src={`https://minotar.net/helm/${auth.name}/24.png`}
              alt=""
              style={{ width: '20px', height: '20px', borderRadius: '4px' }}
            />
            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#fff' }}>
              {auth.name}
            </span>
            <span
              style={{
                fontSize: '0.65rem',
                textTransform: 'uppercase',
                color: '#60a5fa',
                fontWeight: '900',
              }}
            >
              {auth.role}
            </span>
            <button
              aria-label={t('locations_manager.form.remove_author', `Eliminar autor: ${auth.name}`)}
              type="button"
              onClick={() => onRemoveAuthor(idx)}
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(255,255,255,0.3)',
                cursor: 'pointer',
                display: 'flex',
              }}
            >
              <X size={12} aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>

      <div className="author-controls">
        <input
          aria-label={t('locations_manager.form.author_nick', 'Nick del Autor')}
          className="admin-input-premium"
          placeholder={t('locations_manager.form.author_nick', 'Nick del Autor')}
          value={newAuthor.name}
          onChange={(e) => setNewAuthor({ ...newAuthor, name: e.target.value })}
          style={{ flexGrow: 1, padding: '0.8rem' }}
        />
        <select
          aria-label={t('locations_manager.form.author_role', 'Rol del autor')}
          className="admin-select-premium"
          value={newAuthor.role}
          onChange={(e) =>
            setNewAuthor({
              ...newAuthor,
              role: e.target.value as LocationAuthor['role'],
            })
          }
          style={{ width: '140px', padding: '0.8rem' }}
        >
          {AUTHOR_ROLES.map((r) => (
            <option key={r} value={r} style={{ background: '#0b0b10' }}>
              {r}
            </option>
          ))}
        </select>
        <button
          aria-label={t('locations_manager.form.add_author', 'Añadir autor')}
          type="button"
          onClick={onAddAuthor}
          className="modal-btn-primary hover-lift"
          style={{ padding: '0 1.2rem', borderRadius: '12px' }}
        >
          <Plus aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
