import { Edit2, Trash2, Ghost } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { WorldLocation } from '../../../services/locationService';

interface LocationCardProps {
  location: WorldLocation;
  onEdit: (loc: WorldLocation) => void;
  onDelete: (id: number) => void;
}

export function LocationCard({ location, onEdit, onDelete }: Readonly<LocationCardProps>) {
  const { t } = useTranslation();

  return (
    <div
      className="admin-card hover-lift"
      style={{
        margin: 0,
        overflow: 'hidden',
        background: 'rgba(10, 10, 15, 0.4)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '24px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ height: '180px', position: 'relative', overflow: 'hidden' }}>
        {location.is_coming_soon ? (
          <div
            style={{
              height: '100%',
              background: 'rgba(0,0,0,0.4)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'rgba(255,255,255,0.2)',
            }}
          >
            <Ghost size={40} />
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: '900',
                textTransform: 'uppercase',
                marginTop: '10px',
              }}
            >
              Protocol Mystery
            </span>
          </div>
        ) : (
          <img
            src={location.image_url || ''}
            alt={location.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }}
          />
        )}
        <div
          style={{ position: 'absolute', top: '15px', right: '15px', display: 'flex', gap: '8px' }}
        >
          <button
            aria-label={t(
              'locations_manager.edit_location',
              `Editar localización: ${location.title}`,
            )}
            type="button"
            onClick={() => onEdit(location)}
            style={{
              padding: '8px',
              background: 'rgba(255,255,255,0.1)',
              color: '#fff',
              borderRadius: '10px',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.1)',
              cursor: 'pointer',
            }}
          >
            <Edit2 size={14} aria-hidden="true" />
          </button>
          <button
            aria-label={t(
              'locations_manager.delete_location',
              `Eliminar localización: ${location.title}`,
            )}
            type="button"
            onClick={() => onDelete(location.id)}
            style={{
              padding: '8px',
              background: 'rgba(239, 68, 68, 0.2)',
              color: '#ef4444',
              borderRadius: '10px',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              cursor: 'pointer',
            }}
          >
            <Trash2 size={14} aria-hidden="true" />
          </button>
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: '15px',
            left: '15px',
            background: 'rgba(0,0,0,0.6)',
            padding: '4px 10px',
            borderRadius: '8px',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            color: 'var(--accent)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          {location.coords}
        </div>
      </div>
      <div style={{ padding: '1.5rem', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <h5 style={{ margin: '0 0 10px 0', fontSize: '1.1rem', fontWeight: '800', color: '#fff' }}>
          {location.title}
        </h5>
        <p
          style={{
            margin: 0,
            fontSize: '0.85rem',
            color: 'rgba(255,255,255,0.4)',
            lineHeight: '1.5',
            fontStyle: 'italic',
          }}
        >
          {location.description}
        </p>

        <div
          style={{
            marginTop: '2rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid rgba(255,255,255,0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', marginLeft: '5px' }}>
              {location.authors?.slice(0, 3).map((auth) => (
                <img
                  key={auth.name}
                  src={`https://minotar.net/helm/${auth.name}/24.png`}
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '4px',
                    border: '2px solid #0a0a0f',
                    marginLeft: '-8px',
                  }}
                  title={auth.name}
                  alt=""
                />
              ))}
            </div>
            <span
              style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', fontWeight: '700' }}
            >
              #{location.sort_order}
            </span>
          </div>
          <span
            style={{
              fontSize: '0.7rem',
              color: 'rgba(255,255,255,0.2)',
              fontWeight: '900',
              textTransform: 'uppercase',
            }}
          >
            {t('admin.locations.lore_entry', 'Entrada de Lore')}
          </span>
        </div>
      </div>
    </div>
  );
}
