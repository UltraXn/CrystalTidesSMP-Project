import React from 'react';
import { X } from 'lucide-react';

interface SocialPanelHeaderProps {
  activeTab: 'friends' | 'requests';
  setActiveTab: (tab: 'friends' | 'requests') => void;
  onlineCount: number;
  onClose: () => void;
}

export const SocialPanelHeader: React.FC<Readonly<SocialPanelHeaderProps>> = ({
  activeTab,
  setActiveTab,
  onlineCount,
  onClose,
}) => {
  return (
    <div
      style={{
        padding: '16px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
      }}
    >
      <div
        role="tablist"
        aria-label="Secciones del panel social"
        style={{ display: 'flex', gap: 14, alignItems: 'center' }}
      >
        <button
          role="tab"
          aria-selected={activeTab === 'friends'}
          aria-label={`Amigos (${onlineCount} conectados)`}
          type="button"
          onClick={() => setActiveTab('friends')}
          style={{
            background: 'none',
            border: 'none',
            fontSize: 14,
            fontWeight: 800,
            color: activeTab === 'friends' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.4)',
            cursor: 'pointer',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span>Amigos</span>{' '}
          <span
            style={{
              fontSize: 10,
              padding: '2px 6px',
              borderRadius: 999,
              backgroundColor: 'rgba(45, 212, 191, 0.15)',
              color: '#2dd4bf',
              fontWeight: 900,
            }}
          >
            {onlineCount}
          </span>
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'requests'}
          aria-label="Solicitudes de amistad"
          type="button"
          onClick={() => setActiveTab('requests')}
          style={{
            background: 'none',
            border: 'none',
            fontSize: 14,
            fontWeight: 800,
            color: activeTab === 'requests' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.4)',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          Solicitudes
        </button>
      </div>

      <button
        aria-label="Cerrar panel social"
        type="button"
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: 'rgba(255, 255, 255, 0.5)',
          cursor: 'pointer',
          padding: 4,
          display: 'flex',
        }}
      >
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  );
};
