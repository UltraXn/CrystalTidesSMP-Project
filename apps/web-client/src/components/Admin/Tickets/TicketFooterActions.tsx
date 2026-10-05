import React from 'react';
import { Loader2, Send, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Ticket } from './types';

interface TicketFooterActionsProps {
  ticket: Ticket;
  newMessage: string;
  setNewMessage: (msg: string) => void;
  sending: boolean;
  onSendMessage: (e: React.SyntheticEvent<HTMLFormElement>) => void;
  onAction: (action: string) => void;
}

export function TicketFooterActions({
  ticket,
  newMessage,
  setNewMessage,
  sending,
  onSendMessage,
  onAction,
}: Readonly<TicketFooterActionsProps>) {
  const { t } = useTranslation();

  return (
    <div
      style={{
        padding: '1.5rem',
        borderTop: '1px solid #333',
        background: '#222',
        borderBottomLeftRadius: 'var(--radius)',
        borderBottomRightRadius: 'var(--radius)',
      }}
    >
      {ticket.status !== 'closed' ? (
        <form
          onSubmit={onSendMessage}
          style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}
        >
          <input
            aria-label={t('admin.tickets.detail.reply_placeholder', 'Escribe una respuesta...')}
            className="admin-input"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={t('admin.tickets.detail.reply_placeholder', 'Escribe una respuesta...')}
            style={{ flex: 1, marginBottom: 0 }}
          />
          <button
            aria-label={t('admin.tickets.detail.send_reply', 'Enviar respuesta')}
            aria-busy={sending}
            type="submit"
            className="btn-primary"
            disabled={sending}
            style={{ padding: '0 1.5rem' }}
          >
            {sending ? (
              <Loader2 className="animate-spin" aria-hidden="true" />
            ) : (
              <Send aria-hidden="true" />
            )}
          </button>
        </form>
      ) : (
        <div
          style={{
            padding: '1rem',
            background: '#2a1a1a',
            color: '#888',
            textAlign: 'center',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            border: '1px solid #442222',
          }}
        >
          <Lock style={{ marginRight: '0.5rem', width: '0.8rem' }} />{' '}
          {t(
            'admin.tickets.detail.closed_msg',
            'Este ticket ha sido cerrado y no se pueden enviar más mensajes.',
          )}
        </div>
      )}

      <div
        style={{
          display: 'flex',
          gap: '0.8rem',
          justifyContent: 'flex-end',
          flexWrap: 'wrap',
        }}
      >
        <button type="button" onClick={() => onAction('ban')} className="btn-action ban">
          {t('admin.tickets.actions.ban', 'Banear')}
        </button>
        {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
          <button type="button" onClick={() => onAction('resolve')} className="btn-action resolve">
            {t('admin.tickets.actions.resolve', 'Resolver')}
          </button>
        )}
        {ticket.status !== 'closed' ? (
          <button type="button" onClick={() => onAction('close')} className="btn-action close">
            {t('admin.tickets.actions.close', 'Cerrar')}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onAction('open')}
            className="btn-action"
            style={{ background: '#555' }}
          >
            {t('admin.tickets.actions.reopen', 'Reabrir')}
          </button>
        )}
        <button
          type="button"
          onClick={() => onAction('delete')}
          className="btn-action delete"
          style={{ marginLeft: 'auto' }}
        >
          {t('admin.tickets.actions.delete', 'Eliminar')}
        </button>
      </div>
    </div>
  );
}
