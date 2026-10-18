import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addTicketMessageFormSchema, type AddTicketMessageFormValues } from '@crystaltides/shared';
import { m as motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabaseClient';
import { Send, ArrowLeft, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface TicketDetailData {
  id: string;
  subject: string;
  status: string;
  category: string;
  created_at: string;
}

interface TicketMessage {
  id: string;
  user_id: string;
  message: string;
  is_staff: boolean;
  created_at: string;
}

const CONSTANTS = {
  STATUS_OPEN: 'open',
  STATUS_CLOSED: 'closed',
  SUPPORT_ROUTE: '/support',
  TABLE_TICKETS: 'tickets',
  TABLE_MESSAGES: 'ticket_messages',
} as const;

const STATUS_COLOR_MAP: Record<string, string> = {
  [CONSTANTS.STATUS_OPEN]: '#2ecc71',
  [CONSTANTS.STATUS_CLOSED]: '#95a5a6',
};

function appendUniqueMessage(prev: TicketMessage[], incoming: TicketMessage): TicketMessage[] {
  if (prev.some((m) => m.id === incoming.id)) return prev;
  return [...prev, incoming];
}

function getStatusColor(status?: string): string {
  if (!status) return '#95a5a6';
  return STATUS_COLOR_MAP[status.toLowerCase()] ?? '#95a5a6';
}

interface TicketStatusBadgeProps {
  status?: string;
}

function TicketStatusBadge({ status }: Readonly<TicketStatusBadgeProps>) {
  const currentStatus = status ?? CONSTANTS.STATUS_OPEN;
  const badgeColor = getStatusColor(currentStatus);

  return (
    <span
      className={`badge ${currentStatus}`}
      style={{
        padding: '0.2rem 0.6rem',
        borderRadius: '1rem',
        fontSize: '0.7rem',
        background: badgeColor,
        color: '#000',
        fontWeight: 'bold',
        marginTop: '0.3rem',
        display: 'inline-block',
      }}
    >
      {currentStatus.toUpperCase()}
    </span>
  );
}

interface TicketHeaderProps {
  subject?: string;
  ticketId?: string;
  status?: string;
  onBack: () => void;
}

function TicketHeader({ subject, ticketId, status, onBack }: Readonly<TicketHeaderProps>) {
  return (
    <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <button
        aria-label="Action"
        type="button"
        onClick={onBack}
        style={{
          background: 'none',
          border: 'none',
          color: 'white',
          fontSize: '1.2rem',
          cursor: 'pointer',
        }}
      >
        <ArrowLeft />
      </button>
      <div>
        <h2 style={{ margin: 0 }}>
          {subject}{' '}
          <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>#{ticketId?.slice(0, 6)}</span>
        </h2>
        <TicketStatusBadge status={status} />
      </div>
    </div>
  );
}

interface MessageBubbleProps {
  message: TicketMessage;
  isMe: boolean;
}

function MessageBubble({ message, isMe }: Readonly<MessageBubbleProps>) {
  const formattedTime = new Date(message.created_at).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        alignSelf: isMe ? 'flex-end' : 'flex-start',
        maxWidth: '70%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: isMe ? 'flex-end' : 'flex-start',
      }}
    >
      <div
        style={{
          background: isMe ? 'var(--accent)' : '#2c3e50',
          color: 'white',
          padding: '0.8rem 1.2rem',
          borderRadius: isMe ? '1rem 1rem 0 1rem' : '1rem 1rem 1rem 0',
          position: 'relative',
          boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
        }}
      >
        {message.is_staff && (
          <div
            style={{
              position: 'absolute',
              top: '-10px',
              left: '-10px',
              background: '#e74c3c',
              color: 'white',
              padding: '0.2rem 0.5rem',
              borderRadius: '0.5rem',
              fontSize: '0.6rem',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '0.2rem',
            }}
          >
            <Shield size={10} /> STAFF
          </div>
        )}
        {message.message}
      </div>
      <span style={{ fontSize: '0.65rem', color: 'var(--muted)', marginTop: '0.3rem' }}>
        {formattedTime}
      </span>
    </motion.div>
  );
}

interface ConversationThreadProps {
  messages: TicketMessage[];
  currentUserId?: string;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

function ConversationThread({
  messages,
  currentUserId,
  messagesEndRef,
}: Readonly<ConversationThreadProps>) {
  return (
    <div
      style={{
        flex: 1,
        padding: '1.5rem',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      {messages.map((msg) => (
        <MessageBubble
          key={msg.id}
          message={msg}
          isMe={Boolean(currentUserId && msg.user_id === currentUserId)}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}

interface TicketReplyBoxProps {
  isClosed: boolean;
  onSendMessage: (data: AddTicketMessageFormValues) => Promise<void>;
}

function TicketReplyBox({ isClosed, onSendMessage }: Readonly<TicketReplyBoxProps>) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<AddTicketMessageFormValues>({
    resolver: zodResolver(addTicketMessageFormSchema),
  });

  const handleFormSubmit = async (data: AddTicketMessageFormValues) => {
    await onSendMessage(data);
    reset();
  };

  const isDisabled = isClosed || isSubmitting;
  const placeholder = isClosed ? t('support.ticket_closed') : t('support.type_message');

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      style={{
        padding: '1rem',
        background: 'var(--card-bg)',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        gap: '1rem',
      }}
    >
      <input
        aria-label="Input field"
        type="text"
        placeholder={placeholder}
        {...register('message')}
        disabled={isDisabled}
        style={{
          flex: 1,
          padding: '0.8rem',
          borderRadius: '2rem',
          background: '#0f0f1a',
          border: '1px solid #333',
          color: 'white',
        }}
      />
      <button
        aria-label="Action"
        type="submit"
        disabled={isDisabled}
        className="cta-button"
        style={{
          width: '45px',
          height: '45px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
        }}
      >
        <Send size={18} />
      </button>
    </form>
  );
}

export default function TicketDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const [ticket, setTicket] = useState<TicketDetailData | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  }, []);

  const fetchTicketData = useCallback(async () => {
    if (!id) return;
    try {
      const { data: ticketData, error: ticketError } = await supabase
        .from(CONSTANTS.TABLE_TICKETS)
        .select('*')
        .eq('id', id)
        .single();

      if (ticketError) throw ticketError;
      setTicket(ticketData);

      const { data: msgs, error: msgsError } = await supabase
        .from(CONSTANTS.TABLE_MESSAGES)
        .select('*')
        .eq('ticket_id', id)
        .order('created_at', { ascending: true });

      if (msgsError) throw msgsError;
      setMessages(msgs || []);
      setLoading(false);
      scrollToBottom();
    } catch (error) {
      console.error('Error fetching details:', error);
      navigate(CONSTANTS.SUPPORT_ROUTE);
    }
  }, [id, navigate, scrollToBottom]);

  useEffect(() => {
    let isMounted = true;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    if (id && user) {
      Promise.resolve().then(() => {
        if (isMounted) fetchTicketData();
      });

      channel = supabase
        .channel(`ticket_chat_${id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: CONSTANTS.TABLE_MESSAGES,
            filter: `ticket_id=eq.${id}`,
          },
          (payload: { new: TicketMessage }) => {
            setMessages((prev) => appendUniqueMessage(prev, payload.new));
          },
        )
        .subscribe();
    }

    return () => {
      isMounted = false;
      if (channel) {
        channel.unsubscribe();
        supabase.removeChannel(channel);
      }
    };
  }, [id, user, fetchTicketData]);

  const handleSendMessage = async (data: AddTicketMessageFormValues): Promise<void> => {
    if (!user || !id) return;

    try {
      const { data: messageData, error } = await supabase
        .from(CONSTANTS.TABLE_MESSAGES)
        .insert([
          {
            ticket_id: id,
            user_id: user.id,
            message: data.message,
            is_staff: false,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      if (messageData) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === messageData.id)) return prev;
          return [...prev, messageData as TicketMessage];
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '6rem' }}>
        {t('common.loading')}
      </div>
    );
  }

  const isClosed = ticket?.status === CONSTANTS.STATUS_CLOSED;

  return (
    <div
      className="container"
      style={{ paddingTop: '6rem', minHeight: '90vh', display: 'flex', flexDirection: 'column' }}
    >
      <TicketHeader
        subject={ticket?.subject}
        ticketId={id}
        status={ticket?.status}
        onBack={() => navigate(CONSTANTS.SUPPORT_ROUTE)}
      />

      <div
        className="chat-window"
        style={{
          flex: 1,
          background: 'rgba(0,0,0,0.3)',
          borderRadius: '1rem',
          border: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <ConversationThread
          messages={messages}
          currentUserId={user?.id}
          messagesEndRef={messagesEndRef}
        />

        <TicketReplyBox isClosed={isClosed} onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
}
