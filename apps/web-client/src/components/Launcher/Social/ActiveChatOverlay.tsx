import React from 'react';
import { X, Send, CheckCheck } from 'lucide-react';
import type { ChatMessage, FriendItem } from './socialPanelData';

interface ActiveChatOverlayProps {
  friend: FriendItem;
  messages: ChatMessage[];
  inputValue: string;
  onInputChange: (val: string) => void;
  onSendMessage: (e: React.SyntheticEvent<HTMLFormElement>) => void;
  onClose: () => void;
}

export const ActiveChatOverlay: React.FC<Readonly<ActiveChatOverlayProps>> = ({
  friend,
  messages,
  inputValue,
  onInputChange,
  onSendMessage,
  onClose,
}) => {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 12,
        right: 12,
        left: 12,
        height: 290,
        backgroundColor: '#0d0714',
        border: '1px solid rgba(45, 212, 191, 0.35)',
        borderRadius: 14,
        boxShadow: '0 16px 36px rgba(0, 0, 0, 0.9)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        zIndex: 60,
      }}
    >
      {/* Chat Header */}
      <div
        style={{
          padding: '10px 12px',
          backgroundColor: 'rgba(45, 212, 191, 0.12)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <img src={friend.avatar} alt="" style={{ width: 24, height: 24, borderRadius: 6 }} />
          <div>
            <div style={{ fontSize: 11.5, fontWeight: 800, color: '#FFF' }}>{friend.name}</div>
            <div style={{ fontSize: 9, color: '#2dd4bf' }}>{friend.activity}</div>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar chat"
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(255, 255, 255, 0.6)',
            cursor: 'pointer',
            padding: 2,
          }}
        >
          <X size={14} />
        </button>
      </div>

      {/* Messages Body */}
      <div
        style={{
          flex: 1,
          padding: '10px 12px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        {messages.map((m) => (
          <div
            key={m.id}
            style={{
              alignSelf: m.sender === 'me' ? 'flex-end' : 'flex-start',
              maxWidth: '85%',
              backgroundColor:
                m.sender === 'me' ? 'rgba(45, 212, 191, 0.25)' : 'rgba(255, 255, 255, 0.06)',
              border:
                m.sender === 'me'
                  ? '1px solid rgba(45, 212, 191, 0.45)'
                  : '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 10,
              padding: '6px 10px',
            }}
          >
            <div style={{ fontSize: 11, color: '#FFF', lineHeight: 1.35 }}>{m.text}</div>
            <div
              style={{
                fontSize: 8.5,
                color: 'rgba(255, 255, 255, 0.4)',
                textAlign: 'right',
                marginTop: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: 3,
              }}
            >
              {m.time}
              {m.sender === 'me' && <CheckCheck size={10} color="#2dd4bf" />}
            </div>
          </div>
        ))}
      </div>

      {/* Input Footer */}
      <form
        onSubmit={onSendMessage}
        style={{
          padding: '8px 10px',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
        }}
      >
        <input
          type="text"
          aria-label={`Escribir mensaje para ${friend.name}`}
          placeholder={`Enviar mensaje a ${friend.name}...`}
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          style={{
            flex: 1,
            backgroundColor: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#FFF',
            fontSize: 11,
          }}
        />
        <button
          aria-label="Enviar mensaje"
          type="submit"
          style={{
            background: 'linear-gradient(135deg, #2dd4bf, #0d9488)',
            border: 'none',
            borderRadius: 6,
            padding: '4px 8px',
            color: '#022c22',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
          }}
        >
          <Send size={12} aria-hidden="true" />
        </button>
      </form>
    </div>
  );
};
