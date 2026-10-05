import { RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import { formatTime } from '../../../utils/date';
import { Ticket, Message } from './types';

interface TicketChatBodyProps {
  ticket: Ticket;
  messages: Message[];
  scrollRef: RefObject<HTMLDivElement | null>;
}

export function TicketChatBody({ ticket, messages, scrollRef }: Readonly<TicketChatBodyProps>) {
  const { t } = useTranslation();

  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        background: '#181818',
      }}
    >
      {/* Mensaje original del usuario (Descripción) */}
      <div className="msg-bubble user">
        <div className="msg-header">
          {t('admin.tickets.detail.original_desc', 'Descripción Original')}
        </div>
        <div style={{ whiteSpace: 'pre-wrap' }}>
          {ticket.description || t('admin.tickets.detail.no_desc', 'Sin descripción')}
        </div>
      </div>

      <div style={{ height: '1px', background: '#333', margin: '1rem 0' }}></div>

      {messages.length === 0 && (
        <div style={{ textAlign: 'center', color: '#555', padding: '2rem' }}>
          {t('admin.tickets.detail.no_history', 'No hay historial de chat')}
        </div>
      )}

      {messages.map((msg) => (
        <div key={msg.id} className={`msg-bubble ${msg.is_staff ? 'staff' : 'user'}`}>
          <div className="msg-header">
            {msg.is_staff
              ? t('admin.tickets.staff_label', 'STAFF')
              : t('admin.tickets.table.user', 'USUARIO').toUpperCase()}{' '}
            •{' '}
            {formatTime(msg.created_at, {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
          <div>{msg.message}</div>
        </div>
      ))}

      {/* Referencia invisible para el scroll */}
      <div ref={scrollRef}></div>
    </div>
  );
}
