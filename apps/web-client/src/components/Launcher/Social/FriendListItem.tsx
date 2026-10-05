import React from 'react';
import { MessageSquare } from 'lucide-react';
import type { FriendItem } from './socialPanelData';
import { getStatusColor, getStatusTextColor } from './socialPanelData';

interface FriendListItemProps {
  friend: FriendItem;
  isSelected: boolean;
  onSelect: (friend: FriendItem) => void;
}

export const FriendListItem: React.FC<Readonly<FriendListItemProps>> = ({
  friend,
  isSelected,
  onSelect,
}) => {
  return (
    <button
      type="button"
      onClick={() => onSelect(friend)}
      style={{
        width: '100%',
        textAlign: 'left',
        font: 'inherit',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 10px',
        borderRadius: 10,
        backgroundColor: isSelected ? 'rgba(45, 212, 191, 0.15)' : 'rgba(255, 255, 255, 0.02)',
        border: isSelected ? '1px solid rgba(45, 212, 191, 0.4)' : '1px solid transparent',
        cursor: 'pointer',
        transition: 'background-color 150ms ease, border-color 150ms ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Avatar + Status Indicator */}
        <div style={{ position: 'relative', width: 32, height: 32 }}>
          <img
            src={friend.avatar}
            alt={friend.name}
            style={{
              width: '100%',
              height: '100%',
              borderRadius: 8,
              backgroundColor: '#1a1222',
            }}
            onError={(e) => {
              e.currentTarget.src = 'https://mc-heads.net/avatar/Steve/64';
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: -2,
              right: -2,
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: getStatusColor(friend.status),
              boxShadow: '0 0 6px rgba(0,0,0,0.8)',
            }}
          />
        </div>

        {/* Name & Activity */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#FFFFFF' }}>{friend.name}</span>
          <span
            style={{
              fontSize: 10,
              color: getStatusTextColor(friend.status),
            }}
          >
            {friend.activity}
          </span>
        </div>
      </div>

      {/* Chat action indicator */}
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: 6,
          color: 'rgba(255, 255, 255, 0.6)',
          padding: 6,
          display: 'flex',
        }}
      >
        <MessageSquare size={13} aria-hidden="true" />
      </div>
    </button>
  );
};
