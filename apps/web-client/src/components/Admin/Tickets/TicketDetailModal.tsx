import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

import { useTranslation } from 'react-i18next';
import { supabase } from '../../../services/supabaseClient';
import { getAuthHeaders } from '../../../services/adminAuth';
import { Ticket, Message, AlertData, ConfirmData } from './types';
import { PriorityBadge, StatusBadge, CustomAlert, CustomConfirm } from './Shared';
import BanUserModal from './BanUserModal';
import { useTicketChat } from './useTicketChat';
import { TicketChatBody } from './TicketChatBody';
import { TicketFooterActions } from './TicketFooterActions';

interface TicketDetailModalProps {
  ticket: Ticket;
  onClose: () => void;
  refreshTickets: () => void;
  mockMessages?: Message[];
  user: { id: string } | null;
}

export default function TicketDetailModal({
  ticket,
  onClose,
  refreshTickets,
  mockMessages,
  user,
}: Readonly<TicketDetailModalProps>) {
  const { t } = useTranslation();
  const [showBanModal, setShowBanModal] = useState(false);
  const [alert, setAlert] = useState<AlertData | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmData | null>(null);

  const API_URL = import.meta.env.VITE_API_URL;

  const { messages, newMessage, setNewMessage, sending, scrollRef, handleSendMessage } =
    useTicketChat(ticket, user, mockMessages);

  const handleAction = async (action: string) => {
    if (action === 'ban') {
      setShowBanModal(true);
      return;
    }

    if (action === 'delete') {
      setConfirmAction({
        message: t('admin.tickets.detail.delete_confirm', '¿Estás seguro de eliminar este ticket?'),
        onConfirm: () => {
          void handleAction('force_delete');
        },
      });
      return;
    }

    let method = 'PATCH';
    let body: Record<string, string> | undefined = {};
    let url = `${API_URL}/tickets/${ticket.id}/status`;

    if (action === 'resolve') body = { status: 'resolved' };
    if (action === 'close') body = { status: 'closed' };
    if (action === 'open') body = { status: 'open' };
    if (action === 'delete' || action === 'force_delete') {
      method = 'DELETE';
      url = `${API_URL}/tickets/${ticket.id}`;
      body = undefined;
    }

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const headers = {
        'Content-Type': 'application/json',
        ...getAuthHeaders(session?.access_token ?? null),
      };

      const res = await fetch(url, {
        method: method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      if (res.ok) {
        refreshTickets();
        onClose();
      } else {
        setAlert({ message: t('admin.alerts.error_title', 'Error'), type: 'error' });
      }
    } catch (error) {
      setAlert({
        message:
          t('admin.alerts.error_title', 'Error') +
          ': ' +
          (error instanceof Error ? error.message : String(error)),
        type: 'error',
      });
    }
  };

  return createPortal(
    <dialog
      open
      aria-labelledby="ticket-modal-title"
      className="modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: 'none',
        margin: 0,
        padding: 0,
        width: '100vw',
        height: '100vh',
        maxWidth: 'none',
        maxHeight: 'none',
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(10px)',
      }}
    >
      {showBanModal && (
        <BanUserModal
          ticket={ticket}
          onClose={() => setShowBanModal(false)}
          onSuccess={() => {
            setShowBanModal(false);
            refreshTickets();
            setAlert({
              message: t('admin.tickets.ban_modal.success', 'Usuario baneado correctamente'),
              type: 'success',
            });
          }}
        />
      )}

      {!showBanModal && (
        <div className="modal-content" style={{ maxHeight: '85vh', height: '85vh' }}>
          {/* Header Modal */}
          <div
            style={{
              padding: '1.5rem',
              borderBottom: '1px solid #333',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              background: '#222',
              borderTopLeftRadius: 'var(--radius)',
              borderTopRightRadius: 'var(--radius)',
            }}
          >
            <div>
              <h2 id="ticket-modal-title" style={{ margin: 0, fontSize: '1.4rem', color: '#fff' }}>
                {ticket.subject}
              </h2>
              <div
                style={{
                  display: 'flex',
                  gap: '0.8rem',
                  marginTop: '0.5rem',
                  alignItems: 'center',
                }}
              >
                <span style={{ color: '#888', fontFamily: 'monospace' }}>#{ticket.id}</span>
                <PriorityBadge priority={ticket.priority} />
                <StatusBadge status={ticket.status} />
              </div>
            </div>
            <button
              aria-label={t('common.close', 'Cerrar ticket')}
              type="button"
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#aaa',
                cursor: 'pointer',
                padding: '0.5rem',
              }}
            >
              <X size={22} aria-hidden="true" />
            </button>
          </div>

          {/* Chat Body (Scrollable) */}
          <TicketChatBody ticket={ticket} messages={messages} scrollRef={scrollRef} />

          {/* Footer Actions & Reply */}
          <TicketFooterActions
            ticket={ticket}
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            sending={sending}
            onSendMessage={handleSendMessage}
            onAction={handleAction}
          />
        </div>
      )}
      {alert && (
        <CustomAlert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />
      )}
      {confirmAction && (
        <CustomConfirm
          message={confirmAction.message}
          onConfirm={() => {
            setConfirmAction(null);
            confirmAction.onConfirm();
          }}
          onCancel={() => setConfirmAction(null)}
        />
      )}
    </dialog>,
    document.body,
  );
}
