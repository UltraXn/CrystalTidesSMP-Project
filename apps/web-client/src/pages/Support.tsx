import { useState, useEffect, useCallback } from 'react';
import { m as motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabaseClient';
import { Plus, Ticket as TicketIcon, ChevronRight, Clock, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router';
import SectionDivider from '../components/Layout/SectionDivider';
import TicketForm from '../components/Support/TicketForm';
import { CreateTicketFormValues } from '../schemas/ticket';
import Loader from '../components/UI/Loader';

interface Ticket {
  id: string;
  user_id: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  created_at: string;
}

const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DISCORD: 'https://discord.com/invite/TDmwYNnvyT',
  TICKET_DETAIL: (id: string) => `/support/${id}`,
} as const;

const THEME = {
  MUTED: 'var(--muted)',
  ACCENT: 'var(--accent)',
  ACCENT_SOFT: 'var(--accent-soft)',
  BORDER_MUTED: 'rgba(255, 255, 255, 0.05)',
  DISCORD_BLUE: '#5865F2',
} as const;

const STATUS_COLORS: Record<string, string> = {
  open: '#2ecc71',
  closed: '#95a5a6',
  answered: '#f39c12',
  default: '#3498db',
};

function getStatusColor(status: string): string {
  return STATUS_COLORS[status] ?? STATUS_COLORS.default;
}

function formatCategoryLabel(
  category: string | undefined,
  t: ReturnType<typeof useTranslation>['t'],
): string {
  const rawCategory = category || 'General';
  const translationKey = rawCategory.toLowerCase().replace(' ', '_');
  const fallbackLabel = rawCategory.charAt(0).toUpperCase() + rawCategory.slice(1);
  return t(`support.categories.${translationKey}`, fallbackLabel);
}

async function createTicketRecord(userId: string, data: CreateTicketFormValues) {
  const { data: ticketData, error: ticketError } = await supabase
    .from('tickets')
    .insert([
      {
        user_id: userId,
        subject: data.title,
        category: data.category,
        priority: data.priority,
        status: 'open',
        description: data.description,
      },
    ])
    .select()
    .single();

  if (ticketError) throw ticketError;

  const { error: msgError } = await supabase.from('ticket_messages').insert([
    {
      ticket_id: ticketData.id,
      user_id: userId,
      message: data.description,
    },
  ]);

  if (msgError) throw msgError;

  return ticketData;
}

function DiscordIcon() {
  return (
    <svg
      stroke="currentColor"
      fill="currentColor"
      strokeWidth="0"
      viewBox="0 0 640 512"
      height="20"
      width="20"
      xmlns="http://www.w3.org/2000/svg"
      style={{ color: THEME.DISCORD_BLUE }}
      aria-hidden="true"
    >
      <path d="M524.531,69.836a1.5,1.5,0,0,0-.764-.7A485.065,485.065,0,0,0,404.081,32.03a1.816,1.816,0,0,0-1.923.91,337.461,337.461,0,0,0-14.9,30.6,447.848,447.848,0,0,0-134.426,0,309.541,309.541,0,0,0-15.135-30.6,1.89,1.89,0,0,0-1.924-.91A483.689,483.689,0,0,0,116.085,69.137a1.712,1.712,0,0,0-.788.676C39.068,183.651,18.186,294.69,28.43,404.354a2.016,2.016,0,0,0,.765,1.375A487.666,487.666,0,0,0,176.02,479.918a1.9,1.9,0,0,0,2.063-.676A348.2,348.2,0,0,0,208.12,430.4a1.86,1.86,0,0,0-1.019-2.588,321.173,321.173,0,0,1-45.868-21.853,1.885,1.885,0,0,1-.185-3.126c3.082-2.309,6.166-4.711,9.109-7.137a1.819,1.819,0,0,1,1.9-.256c96.229,43.917,200.41,43.917,295.5,0a1.812,1.812,0,0,1,1.924.233c2.944,2.426,6.027,4.851,9.132,7.16a1.884,1.884,0,0,1-.162,3.126,301.407,301.407,0,0,1-45.89,21.83,1.875,1.875,0,0,0-1,2.611,391.055,391.055,0,0,0,30.014,48.815,1.864,1.864,0,0,0,2.063.7A486.048,486.048,0,0,0,610.7,405.729a1.882,1.882,0,0,0,.765-1.352C623.729,277.594,590.8,167.234,524.531,69.836ZM222.491,337.58c-28.972,0-52.844-26.587-52.844-59.239S193.056,219.1,222.491,219.1c29.665,0,53.306,26.82,52.843,59.239C275.334,310.993,251.924,337.58,222.491,337.58Zm195.38,0c-28.971,0-52.843-26.587-52.843-59.239S388.437,219.1,417.871,219.1c29.667,0,53.307,26.82,52.844,59.239C470.715,310.993,447.538,337.58,417.871,337.58Z" />
    </svg>
  );
}

interface SupportHeroProps {
  onOpenCreateModal: () => void;
}

function SupportHero({ onOpenCreateModal }: Readonly<SupportHeroProps>) {
  const { t } = useTranslation();

  return (
    <section
      className="hero-mini"
      style={{
        padding: '10rem 0 6rem',
        background:
          'radial-gradient(circle at center, rgba(12, 112, 117, 0.1) 0%, rgba(2, 1, 3, 0) 70%)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        borderBottom: `1px solid ${THEME.BORDER_MUTED}`,
      }}
    >
      <div
        className="container"
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      >
        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="gradient-text"
          style={{
            fontSize: 'clamp(2.5rem, 8vw, 4.5rem)',
            marginBottom: '1.5rem',
            fontWeight: 900,
            letterSpacing: '-2px',
          }}
        >
          {t('support.title')}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            color: THEME.MUTED,
            fontSize: '1.2rem',
            maxWidth: '650px',
            margin: '0 0 3rem',
            lineHeight: 1.6,
          }}
        >
          {t('support.subtitle')}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            display: 'flex',
            gap: '1.5rem',
            justifyContent: 'center',
            flexWrap: 'wrap',
            width: '100%',
          }}
        >
          <button
            type="button"
            className="nav-btn"
            onClick={onOpenCreateModal}
            style={{
              padding: '1rem 2.5rem',
              fontSize: '1.1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.8rem',
              borderRadius: '12px',
              textTransform: 'uppercase',
              fontWeight: 'bold',
              color: '#fff',
              background: 'rgba(137, 217, 209, 0.2)',
              border: `1px solid ${THEME.ACCENT}`,
            }}
          >
            <Plus size={18} style={{ color: THEME.ACCENT }} /> {t('support.create_ticket')}
          </button>
          <a
            href={ROUTES.DISCORD}
            target="_blank"
            rel="noreferrer"
            className="nav-btn"
            style={{
              padding: '1rem 2.5rem',
              fontSize: '1.1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.8rem',
              background: 'rgba(88, 101, 242, 0.2)',
              border: '1px solid rgba(88, 101, 242, 0.5)',
              color: '#fff',
              borderRadius: '12px',
              textTransform: 'uppercase',
              fontWeight: 'bold',
            }}
          >
            <DiscordIcon /> {t('support.discord_btn')}
          </a>
        </motion.div>
      </div>
    </section>
  );
}

function Breadcrumbs() {
  const { t } = useTranslation();

  return (
    <div
      className="breadcrumbs"
      style={{
        margin: '2rem 0',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        color: THEME.MUTED,
        fontSize: '0.9rem',
      }}
    >
      <Link to={ROUTES.HOME} style={{ color: 'inherit', textDecoration: 'none' }}>
        {t('navbar.home')}
      </Link>
      <ChevronRight size={10} />
      <span style={{ color: THEME.ACCENT }}>{t('navbar.support')}</span>
    </div>
  );
}

function LoginPrompt() {
  const { t } = useTranslation();

  return (
    <div
      className="login-prompt"
      style={{
        background: 'rgba(231, 76, 60, 0.1)',
        border: '1px solid rgba(231, 76, 60, 0.2)',
        padding: '1.5rem',
        borderRadius: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '2rem',
      }}
    >
      <AlertCircle style={{ color: '#e74c3c' }} size={24} />
      <div>
        <h4 style={{ margin: 0 }}>{t('support.login_required')}</h4>
        <p style={{ margin: 0, fontSize: '0.9rem', color: THEME.MUTED }}>
          {t('support.login_hint')}
        </p>
      </div>
      <Link to={ROUTES.LOGIN} className="nav-btn primary" style={{ marginLeft: 'auto' }}>
        {t('login.submit')}
      </Link>
    </div>
  );
}

interface EmptyTicketsStateProps {
  onCreateTicket: () => void;
}

function EmptyTicketsState({ onCreateTicket }: Readonly<EmptyTicketsStateProps>) {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="empty-state"
      style={{
        textAlign: 'center',
        padding: '6rem 2rem',
        background:
          'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
        borderRadius: '2rem',
        border: '1px dashed rgba(255,255,255,0.1)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
      }}
    >
      <div
        style={{
          width: '100px',
          height: '100px',
          background: THEME.ACCENT_SOFT,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 2rem',
        }}
      >
        <TicketIcon size={48} style={{ color: THEME.ACCENT, opacity: 0.5 }} />
      </div>
      <h3 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>{t('support.no_tickets')}</h3>
      <p
        style={{
          color: THEME.MUTED,
          marginBottom: '2.5rem',
          fontSize: '1.1rem',
          maxWidth: '400px',
          margin: '0 auto 2.5rem',
        }}
      >
        {t('support.create_first')}
      </p>
      <button
        type="button"
        className="nav-btn primary"
        onClick={onCreateTicket}
        style={{ padding: '1rem 3rem', borderRadius: '12px', fontSize: '1.1rem' }}
      >
        {t('support.create_first_btn')}
      </button>
    </motion.div>
  );
}

interface TicketCardProps {
  ticket: Ticket;
  index: number;
  onClick: () => void;
}

function TicketCard({ ticket, index, onClick }: Readonly<TicketCardProps>) {
  const { t } = useTranslation();
  const statusColor = getStatusColor(ticket.status);
  const statusLabel = t(`admin.tickets.status.${ticket.status}`, ticket.status.toUpperCase());
  const formattedCategory = formatCategoryLabel(ticket.category, t);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="ticket-card-premium"
      role="button"
      tabIndex={0}
      style={{
        background: 'rgba(255,255,255,0.02)',
        padding: '2rem',
        borderRadius: '1.5rem',
        border: `1px solid ${THEME.BORDER_MUTED}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        cursor: 'pointer',
        transition:
          'color 0.4s cubic-bezier(0.165, 0.84, 0.44, 1), background-color 0.4s cubic-bezier(0.165, 0.84, 0.44, 1), border-color 0.4s cubic-bezier(0.165, 0.84, 0.44, 1), opacity 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)',
        boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
      }}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      whileHover={{
        y: -5,
        background: 'rgba(255,255,255,0.04)',
        borderColor: THEME.ACCENT,
        boxShadow: '0 20px 30px rgba(0,0,0,0.2)',
      }}
    >
      <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
        <div
          style={{
            width: '4.5rem',
            height: '4.5rem',
            borderRadius: '1.2rem',
            background: `${statusColor}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: `1px solid ${statusColor}30`,
          }}
        >
          <TicketIcon size={28} style={{ color: statusColor }} />
        </div>
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '0.6rem',
              flexWrap: 'wrap',
            }}
          >
            <h3 style={{ fontSize: '1.4rem', margin: 0, fontWeight: 700, color: '#fff' }}>
              {ticket.subject}
            </h3>
            <span
              style={{
                fontSize: '0.7rem',
                padding: '0.3rem 0.8rem',
                borderRadius: '50px',
                background: statusColor,
                color: '#000',
                fontWeight: 900,
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              {statusLabel}
            </span>
          </div>
          <div
            style={{
              fontSize: '0.95rem',
              color: THEME.MUTED,
              display: 'flex',
              alignItems: 'center',
              gap: '1.5rem',
              flexWrap: 'wrap',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={14} style={{ opacity: 0.5 }} />{' '}
              {new Date(ticket.created_at).toLocaleDateString('es-ES', {
                timeZone: 'UTC',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
              })}
            </span>
            <span style={{ color: 'rgba(255,255,255,0.1)' }}>|</span>
            <span style={{ color: THEME.ACCENT, fontWeight: 600 }}>{formattedCategory}</span>
            <span style={{ color: 'rgba(255,255,255,0.1)' }}>|</span>
            <span style={{ fontFamily: 'monospace', opacity: 0.4 }}>
              #{String(ticket.id).slice(0, 8).toUpperCase()}
            </span>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
        <div
          className="arrow-icon"
          style={{
            width: '3rem',
            height: '3rem',
            borderRadius: '50%',
            background: THEME.BORDER_MUTED,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: THEME.MUTED,
            transition:
              'color 0.3s ease, background-color 0.3s ease, border-color 0.3s ease, opacity 0.3s ease',
          }}
        >
          <ChevronRight size={20} />
        </div>
      </div>
    </motion.div>
  );
}

interface TicketsSectionProps {
  tickets: Ticket[];
  onCreateTicket: () => void;
  onSelectTicket: (ticketId: string) => void;
}

function TicketsSection({
  tickets,
  onCreateTicket,
  onSelectTicket,
}: Readonly<TicketsSectionProps>) {
  const { t } = useTranslation();

  return (
    <div className="tickets-section" style={{ padding: '2rem 0' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
        }}
      >
        <h2
          style={{
            fontSize: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            margin: 0,
          }}
        >
          <div
            style={{
              width: '3rem',
              height: '3rem',
              background: THEME.ACCENT_SOFT,
              borderRadius: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <TicketIcon size={20} style={{ color: THEME.ACCENT }} />
          </div>
          {t('support.your_tickets')}
        </h2>
        <div
          style={{
            padding: '0.5rem 1rem',
            background: THEME.BORDER_MUTED,
            borderRadius: '50px',
            fontSize: '0.9rem',
            color: THEME.MUTED,
          }}
        >
          {tickets.length} {t('support.total')}
        </div>
      </div>

      {tickets.length === 0 ? (
        <EmptyTicketsState onCreateTicket={onCreateTicket} />
      ) : (
        <div
          className="tickets-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(100%, 1fr))',
            gap: '1.5rem',
          }}
        >
          {tickets.map((ticket, index) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              index={index}
              onClick={() => onSelectTicket(ticket.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTicketFormValues) => Promise<void>;
}

function CreateTicketModal({ isOpen, onClose, onSubmit }: Readonly<CreateTicketModalProps>) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="modal-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
          role="button"
          tabIndex={0}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              onClose();
            }
          }}
          onKeyDown={(e) => {
            if ((e.key === 'Escape' || e.key === 'Enter') && e.target === e.currentTarget) {
              onClose();
            }
          }}
        >
          <div>
            <TicketForm onClose={onClose} onSubmit={onSubmit} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function Support() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchTickets = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error('Error loading tickets:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    let isMounted = true;
    Promise.resolve().then(() => {
      if (!isMounted) return;
      if (user) {
        fetchTickets();
      } else {
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [user, fetchTickets]);

  const handleCreateTicket = async (data: CreateTicketFormValues) => {
    if (!user) return;

    try {
      await createTicketRecord(user.id, data);
      setShowCreateModal(false);
      fetchTickets();
    } catch (error) {
      console.error('Error creating ticket:', error);
      alert(t('support.error_create', 'Error creating ticket. Please try again.'));
    }
  };

  const handleOpenCreateModal = () => {
    if (user) {
      setShowCreateModal(true);
    } else {
      navigate(ROUTES.LOGIN);
    }
  };

  if (loading) return <Loader fullScreen text={t('common.loading')} />;

  return (
    <div
      className="support-page"
      style={{ marginBottom: '4rem', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}
    >
      <SupportHero onOpenCreateModal={handleOpenCreateModal} />
      <SectionDivider />

      <div className="container">
        <Breadcrumbs />

        {!user && <LoginPrompt />}

        {user && (
          <TicketsSection
            tickets={tickets}
            onCreateTicket={handleOpenCreateModal}
            onSelectTicket={(ticketId) => navigate(ROUTES.TICKET_DETAIL(ticketId))}
          />
        )}
      </div>

      <CreateTicketModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateTicket}
      />
    </div>
  );
}
