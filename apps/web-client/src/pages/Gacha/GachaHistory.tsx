import React from 'react';
import { X, Clock, Star, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { GachaHistoryEntry } from './types';
import { getGachaFailsafeImage } from './gachaDisplayUtils';

interface GachaHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  history: GachaHistoryEntry[];
  loading: boolean;
  RARITY_ICONS: Record<string, React.ElementType>;
  RARITY_COLORS: Record<string, string>;
  tierColor: string;
}

const formatTime = (dateStr?: string) => {
  if (!dateStr) return 'Ahora mismo';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return 'Ahora mismo';
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Ahora mismo';
  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours} h`;
  return `Hace ${diffDays} d`;
};

const getFailsafeImg = (name: string) => getGachaFailsafeImage(name);

export const GachaHistory: React.FC<Readonly<GachaHistoryProps>> = ({
  isOpen,
  onClose,
  onOpen,
  history,
  loading,
  RARITY_ICONS,
  RARITY_COLORS,
  tierColor,
}) => {
  const { t } = useTranslation();

  const renderHistoryContent = () => {
    if (loading) {
      return (
        <output aria-live="polite" className="history-loader block">
          <div className="spinner" style={{ borderTopColor: tierColor }}></div>
          <p>Cargando historial...</p>
        </output>
      );
    }

    if (history.length === 0) {
      return (
        <output aria-live="polite" className="history-empty block">
          <Trash2 size={48} opacity={0.2} aria-hidden="true" />
          <p>No tienes premios registrados aún.</p>
          <span>¡Prueba suerte en la máquina!</span>
        </output>
      );
    }

    return (
      <div className="history-list custom-scrollbar">
        {history.map((item) => {
          const Icon = RARITY_ICONS[item.rarity] || Star;
          const color = RARITY_COLORS[item.rarity] || '#fff';
          const activeImg = item.image_url ?? getFailsafeImg(item.reward_name);

          return (
            <div
              key={item.id}
              className="history-card"
              style={
                {
                  '--rarity-indicator-color': color,
                } as React.CSSProperties
              }
            >
              <div className="card-rarity-indicator"></div>
              <div className="card-icon">
                {activeImg ? (
                  <img
                    src={activeImg}
                    alt={item.reward_name}
                    style={{
                      width: '32px',
                      height: '32px',
                      objectFit: 'contain',
                      imageRendering: 'pixelated',
                    }}
                  />
                ) : (
                  <Icon size={24} style={{ color }} />
                )}
              </div>
              <div className="card-info">
                <span className="reward-name">{item.reward_name}</span>
                <div className="reward-meta">
                  <span className="rarity-tag" style={{ color }}>
                    {item.rarity?.toUpperCase()}
                  </span>
                  <span className="time-tag">{formatTime(item.created_at || item.roll_time)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div
      className={`gacha-history-overlay ${isOpen ? 'active' : ''}`}
      style={{ '--tier-accent-color': tierColor } as React.CSSProperties}
    >
      {isOpen && (
        <button
          type="button"
          aria-label={t('common.close', 'Cerrar')}
          tabIndex={-1}
          onClick={onClose}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            background: 'transparent',
            border: 'none',
            cursor: 'default',
            padding: 0,
            margin: 0,
          }}
        />
      )}
      <section
        aria-label={t('gacha.history_title', 'Historial de Premios')}
        className="gacha-history-drawer"
      >
        <button
          type="button"
          className="history-handle-btn"
          aria-label={
            isOpen
              ? t('common.close', 'Cerrar historial')
              : t('gacha.open_history', 'Abrir historial')
          }
          aria-expanded={isOpen}
          onClick={(e) => {
            e.stopPropagation();
            if (isOpen) {
              onClose();
            } else {
              onOpen();
            }
          }}
          style={{ '--tier-accent-color': tierColor } as React.CSSProperties}
        >
          <Clock size={18} aria-hidden="true" />
          <span>Historial</span>
        </button>
        <div className="history-header">
          <div className="header-title">
            <Clock size={20} aria-hidden="true" style={{ color: tierColor }} />
            <h2>{t('gacha.history_title', 'Historial de Premios')}</h2>
          </div>
          <button
            aria-label={t('common.close', 'Cerrar historial')}
            type="button"
            className="close-btn"
            onClick={onClose}
          >
            <X size={24} aria-hidden="true" />
          </button>
        </div>

        <div className="history-content">{renderHistoryContent()}</div>

        <div className="history-footer">
          <p>Se muestran los últimos 20 premios</p>
        </div>
      </section>
    </div>
  );
};
