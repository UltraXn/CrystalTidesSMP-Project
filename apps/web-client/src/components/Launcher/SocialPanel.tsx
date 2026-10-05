import React, { useState } from 'react';
import type { FriendItem, ChatMessage } from './Social/socialPanelData';
import { DEFAULT_FRIENDS, INITIAL_MESSAGES } from './Social/socialPanelData';
import { SocialPanelHeader } from './Social/SocialPanelHeader';
import { FriendListItem } from './Social/FriendListItem';
import { ActiveChatOverlay } from './Social/ActiveChatOverlay';

export type { FriendItem };

export const SocialPanel: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'friends' | 'requests'>('friends');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFriend, setSelectedFriend] = useState<FriendItem | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState('');

  if (!isOpen) return null;

  const onlineFriends = DEFAULT_FRIENDS.filter((f) => f.status !== 'offline');
  const offlineFriends = DEFAULT_FRIENDS.filter((f) => f.status === 'offline');

  const filteredOnline = onlineFriends.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleSendMessage = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    const now = new Date();
    const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
    setMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}-${prev.length}`,
        sender: 'me',
        text: inputValue,
        time: timeStr,
      },
    ]);
    setInputValue('');

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}-${prev.length}`,
          sender: 'them',
          text: '¡Perfecto! Nos vemos adentro.',
          time: `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`,
        },
      ]);
    }, 1200);
  };

  return (
    <aside
      aria-label="Panel Social de CrystalTides"
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        width: 320,
        backgroundColor: '#070409',
        borderLeft: '1px solid rgba(45, 212, 191, 0.2)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 50,
        boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Header */}
      <SocialPanelHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onlineCount={onlineFriends.length}
        onClose={onClose}
      />

      {/* Search Input */}
      <div style={{ padding: '12px 16px' }}>
        <input
          type="text"
          aria-label="Buscar un jugador en la lista de amigos"
          placeholder="Buscar un jugador..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 10,
            padding: '8px 12px',
            color: '#FFF',
            fontSize: 12,
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Friends List */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '0 12px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}
      >
        <div
          style={{
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'rgba(255, 255, 255, 0.4)',
            padding: '8px 4px 4px',
          }}
        >
          En Línea ({filteredOnline.length})
        </div>

        {filteredOnline.map((friend) => (
          <FriendListItem
            key={friend.id}
            friend={friend}
            isSelected={selectedFriend?.id === friend.id}
            onSelect={setSelectedFriend}
          />
        ))}

        {/* Offline friends */}
        {offlineFriends.length > 0 && (
          <>
            <div
              style={{
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'rgba(255, 255, 255, 0.3)',
                padding: '16px 4px 4px',
              }}
            >
              Desconectados ({offlineFriends.length})
            </div>
            {offlineFriends.map((f) => (
              <div
                key={f.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '6px 10px',
                  opacity: 0.45,
                }}
              >
                <img
                  src={f.avatar}
                  alt={f.name}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    filter: 'grayscale(1)',
                  }}
                />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#FFF' }}>{f.name}</span>
                  <span style={{ fontSize: 9.5, color: '#888' }}>{f.activity}</span>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* 💬 Active Chat Overlay */}
      {selectedFriend && (
        <ActiveChatOverlay
          friend={selectedFriend}
          messages={messages}
          inputValue={inputValue}
          onInputChange={setInputValue}
          onSendMessage={handleSendMessage}
          onClose={() => setSelectedFriend(null)}
        />
      )}
    </aside>
  );
};
