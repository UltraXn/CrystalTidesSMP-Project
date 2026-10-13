import { useState, useEffect, useRef, type ReactElement } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Hammer,
  Dices,
  MapPinned,
  Footprints,
  CheckCircle,
  Hourglass,
  Flag,
  LogIn,
  X,
} from 'lucide-react';
import { gsap } from 'gsap';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { m as motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

import Section from '../components/Layout/Section';
import ConfirmationModal from '../components/UI/ConfirmationModal';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabaseClient';

interface ContestEvent {
  id: string | number;
  title: string;
  title_en?: string;
  description: string;
  description_en?: string;
  type: 'hammer' | 'dice' | 'map' | 'running';
  status: 'active' | 'soon' | 'finished';
  start_date?: string;
  end_date?: string;
  winners?: string[];
}

interface ContestCardProps {
  event: ContestEvent;
  onRegister: (eventId: string | number) => void;
  registering: boolean;
  isRegistered: boolean;
  onOpenPodium: (event: ContestEvent) => void;
}

interface PodiumModalProps {
  event: ContestEvent | null;
  onClose: () => void;
}

interface ContestGridProps {
  isLoading: boolean;
  events: ContestEvent[];
  myRegistrations: Array<{ event_id: string }>;
  registeringId: string | number | null;
  onRegister: (id: string | number) => void;
  onOpenPodium: (event: ContestEvent) => void;
}

const CONSTANTS = {
  MC_HEADS_URL: 'https://mc-heads.net/body',
  CARD_SELECTOR: '.contest-card',
  DEFAULT_API_URL: '/api',
} as const;

const ICON_MAP: Record<string, ReactElement> = {
  hammer: <Hammer />,
  dice: <Dices />,
  map: <MapPinned />,
  running: <Footprints />,
};

const STATUS_COLORS: Record<ContestEvent['status'], string> = {
  active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  soon: 'bg-amber-500/20 text-amber-500 border-amber-500/30',
  finished: 'bg-red-500/20 text-red-500 border-red-500/30',
};

const DEFAULT_WINNERS: Record<string, [string, string, string]> = {
  hammer: ['pixiesixer', 'Zeta', 'Churly'],
  dice: ['SendPles', 'Lawchihuahua', 'ZenXeone'],
  map: ['Neroferno', 'Killu', 'Nana_Fubuki'],
  running: ['Churly', 'Zeta', 'SendPles'],
};

const getEventDates = (event: ContestEvent) => {
  const now = new Date();
  if (event.status === 'active') {
    const endDate = event.end_date
      ? new Date(event.end_date)
      : new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000);
    return { label: 'Finaliza en:', date: endDate };
  }
  if (event.status === 'soon') {
    const startDate = event.start_date
      ? new Date(event.start_date)
      : new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000 + 12 * 60 * 60 * 1000);
    return { label: 'Comienza en:', date: startDate };
  }
  return null;
};

const getEventWinners = (event: ContestEvent): [string, string, string] => {
  if (event.winners && event.winners.length >= 3) {
    return [event.winners[0], event.winners[1], event.winners[2]];
  }
  return DEFAULT_WINNERS[event.type] ?? ['Churly', 'Zeta', 'SendPles'];
};

const calculateTimeLeft = (targetDate: Date) => {
  const difference = targetDate.getTime() - Date.now();
  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
};

const CountdownTimer = ({ targetDate }: { targetDate: Date }) => {
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(targetDate));

  useEffect(() => {
    const updateTimer = () => setTimeLeft(calculateTimeLeft(targetDate));
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 font-mono text-sm text-white">
      <div className="flex flex-col items-center">
        <span className="text-sm font-black leading-none">
          {String(timeLeft.days).padStart(2, '0')}
        </span>
        <span className="mt-0.5 text-[8px] font-black uppercase text-gray-500">d</span>
      </div>
      <span className="animate-pulse font-black text-gray-600">:</span>
      <div className="flex flex-col items-center">
        <span className="text-sm font-black leading-none">
          {String(timeLeft.hours).padStart(2, '0')}
        </span>
        <span className="mt-0.5 text-[8px] font-black uppercase text-gray-500">h</span>
      </div>
      <span className="animate-pulse font-black text-gray-600">:</span>
      <div className="flex flex-col items-center">
        <span className="text-sm font-black leading-none">
          {String(timeLeft.minutes).padStart(2, '0')}
        </span>
        <span className="mt-0.5 text-[8px] font-black uppercase text-gray-500">m</span>
      </div>
      <span className="animate-pulse font-black text-gray-600">:</span>
      <div className="text-(--accent) flex flex-col items-center">
        <span className="text-sm font-black leading-none">
          {String(timeLeft.seconds).padStart(2, '0')}
        </span>
        <span className="text-(--accent)/50 mt-0.5 text-[8px] font-black uppercase">s</span>
      </div>
    </div>
  );
};

const getStatusBadge = (status: ContestEvent['status'], label: string) => {
  return (
    <div
      className={`flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest ${STATUS_COLORS[status]}`}
    >
      {status === 'active' && <CheckCircle className="animate-pulse" />}
      {status === 'soon' && <Hourglass className="animate-spin-slow" />}
      {status === 'finished' && <Flag />}
      <span>{label}</span>
    </div>
  );
};

const getCardActionButtonContent = (
  registering: boolean,
  isRegistered: boolean,
  t: (key: string) => string,
): ReactElement => {
  if (registering) {
    return <LogIn className="animate-bounce" />;
  }
  if (isRegistered) {
    return (
      <>
        <CheckCircle className="text-emerald-500" />
        {t('contests.registered_btn')}
      </>
    );
  }
  return (
    <>
      <LogIn />
      {t('contests.register_btn')}
    </>
  );
};

const ContestCard = ({
  event,
  onRegister,
  registering,
  isRegistered,
  onOpenPodium,
}: Readonly<ContestCardProps>) => {
  const { t, i18n } = useTranslation();
  const { id, title, title_en, description, description_en, type, status } = event;

  const statusLabel = t(`contests.status.${status}`);
  const displayTitle = i18n.language === 'en' && title_en ? title_en : title;
  const displayDescription =
    i18n.language === 'en' && description_en ? description_en : description;

  const dates = getEventDates(event);
  const cardIcon = ICON_MAP[type] ?? <Hammer />;
  const isActionDisabled = registering || isRegistered;

  return (
    <div className="contest-card hover:shadow-(--accent)/20 hover:border-(--accent)/30 group relative flex flex-col gap-6 overflow-hidden rounded-3xl border border-white/10 bg-black/40 p-8 backdrop-blur-xl transition-colors duration-500 hover:-translate-y-2 hover:bg-white/5 hover:shadow-2xl">
      <div className="pointer-events-none absolute -bottom-8 -right-8 rotate-12 text-[180px] text-white/5 transition-colors group-hover:scale-110 group-hover:text-white/10">
        {cardIcon}
      </div>

      <div className="flex items-start justify-between">{getStatusBadge(status, statusLabel)}</div>

      <div className="relative z-10 flex flex-col gap-4">
        <div className="text-(--accent) flex size-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-3xl transition-colors group-hover:rotate-12 group-hover:scale-110">
          {cardIcon}
        </div>
        <h3 className="group-hover:text-(--accent) text-2xl font-black text-white transition-colors">
          {displayTitle}
        </h3>
        <p className="line-clamp-3 text-sm/relaxed font-medium italic text-gray-400">
          "{displayDescription}"
        </p>

        {dates && (
          <div className="mt-2 flex flex-col gap-1.5">
            <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">
              {dates.label}
            </span>
            <CountdownTimer targetDate={dates.date} />
          </div>
        )}
      </div>

      <div className="relative z-10 mt-auto">
        {status === 'finished' ? (
          <button
            aria-label="Action"
            type="button"
            onClick={() => onOpenPodium(event)}
            className="bg-linear-to-r flex w-full items-center justify-center gap-2 rounded-2xl border border-amber-500/20 from-amber-500/10 to-orange-500/10 py-4 text-sm font-black uppercase tracking-widest text-amber-300 transition-colors hover:scale-[1.02] hover:border-amber-500/40 hover:from-amber-500/20 hover:to-orange-500/20 active:scale-95"
          >
            {t('contests.view_podium', 'Ver Podio 🏆')}
          </button>
        ) : (
          <button
            type="button"
            className={`flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-black uppercase tracking-widest transition-colors ${
              isActionDisabled
                ? 'cursor-not-allowed bg-white/10 text-white/40'
                : 'hover:bg-(--accent) bg-white text-black shadow-xl shadow-black/50 hover:scale-105 active:scale-95'
            }`}
            onClick={() => !isRegistered && onRegister(id)}
            disabled={isActionDisabled}
          >
            {getCardActionButtonContent(registering, isRegistered, t)}
          </button>
        )}
      </div>
    </div>
  );
};

const PodiumStep = ({ place, winner }: { place: 1 | 2 | 3; winner: string }) => {
  if (place === 1) {
    return (
      <motion.div
        initial={{ y: 70, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 100 }}
        className="z-10 flex w-28 flex-col items-center md:w-32"
      >
        <span className="mb-1 animate-bounce text-2xl">👑</span>
        <img
          src={`${CONSTANTS.MC_HEADS_URL}/${winner}/150`}
          alt="1st Place"
          className="mb-2 h-32 object-contain drop-shadow-[0_8px_15px_rgba(251,191,36,0.3)] filter md:h-36"
        />
        <span className="w-full truncate text-center text-sm font-black text-amber-300">
          {winner}
        </span>
        <div className="bg-linear-to-b mt-2 flex h-24 w-full items-center justify-center rounded-t-xl border-t-2 border-amber-500/40 from-amber-500/20 to-amber-500/5 shadow-lg shadow-amber-500/5">
          <span className="text-3xl font-black text-amber-500">1</span>
        </div>
      </motion.div>
    );
  }

  if (place === 2) {
    return (
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
        className="flex w-24 flex-col items-center md:w-28"
      >
        <img
          src={`${CONSTANTS.MC_HEADS_URL}/${winner}/120`}
          alt="2nd Place"
          className="mb-2 h-28 object-contain drop-shadow-[0_5px_10px_rgba(0,0,0,0.5)] filter md:h-32"
        />
        <span className="w-full truncate text-center text-xs font-black text-gray-300">
          {winner}
        </span>
        <div className="bg-linear-to-b mt-2 flex h-16 w-full items-center justify-center rounded-t-xl border-t-2 border-gray-400/40 from-gray-400/20 to-gray-400/5 shadow-lg">
          <span className="text-2xl font-black text-gray-400">2</span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3, type: 'spring', stiffness: 100 }}
      className="flex w-24 flex-col items-center md:w-28"
    >
      <img
        src={`${CONSTANTS.MC_HEADS_URL}/${winner}/100`}
        alt="3rd Place"
        className="mb-2 h-24 object-contain drop-shadow-[0_5px_10px_rgba(0,0,0,0.5)] filter md:h-28"
      />
      <span className="w-full truncate text-center text-xs font-black text-orange-300/80">
        {winner}
      </span>
      <div className="bg-linear-to-b mt-2 flex h-12 w-full items-center justify-center rounded-t-xl border-t-2 border-orange-600/40 from-orange-600/20 to-orange-600/5 shadow-lg">
        <span className="text-xl font-black text-orange-600">3</span>
      </div>
    </motion.div>
  );
};

const PodiumModal = ({ event, onClose }: Readonly<PodiumModalProps>) => {
  if (!event) return null;

  const winners = getEventWinners(event);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="z-1000 fixed inset-0 flex items-center justify-center bg-black/90 p-4 backdrop-blur-xl"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="relative flex w-full max-w-2xl flex-col items-center gap-6 overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#0a0a0a] p-8 shadow-2xl md:p-12"
      >
        <button
          aria-label="Action"
          type="button"
          onClick={onClose}
          className="absolute right-6 top-6 z-50 flex size-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xl text-white transition-colors hover:rotate-90 hover:bg-white hover:text-black"
        >
          <X />
        </button>

        <div className="text-center">
          <span className="text-(--accent) mb-2 block text-xs font-black uppercase tracking-widest">
            Torneo Finalizado
          </span>
          <h3 className="text-3xl font-black uppercase tracking-tighter text-white">
            {event.title}
          </h3>
          <p className="mx-auto mt-2 max-w-md text-xs italic text-gray-400">
            ¡Felicitaciones a los campeones que conquistaron este desafío!
          </p>
        </div>

        <div className="h-70 relative mt-10 flex w-full items-end justify-center gap-4 pb-6 md:gap-8">
          <PodiumStep place={2} winner={winners[1]} />
          <PodiumStep place={1} winner={winners[0]} />
          <PodiumStep place={3} winner={winners[2]} />
        </div>
      </motion.div>
    </motion.div>
  );
};

const ContestGrid = ({
  isLoading,
  events,
  myRegistrations,
  registeringId,
  onRegister,
  onOpenPodium,
}: Readonly<ContestGridProps>) => {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="col-span-full flex justify-center py-20">
        <span className="animate-pulse text-4xl font-black uppercase tracking-tighter text-white/20">
          Cargando eventos...
        </span>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="bg-white/2 col-span-full flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-white/5 py-20">
        <span className="mb-4 text-sm font-black uppercase tracking-widest text-gray-500">
          {t('contests.no_events')}
        </span>
        <Hourglass className="animate-pulse text-4xl text-gray-700" />
      </div>
    );
  }

  const registrationSet = new Set(myRegistrations.map((r) => String(r.event_id)));

  return (
    <>
      {events.map((event) => (
        <ContestCard
          key={event.id}
          event={event}
          onRegister={onRegister}
          registering={registeringId === event.id}
          isRegistered={registrationSet.has(String(event.id))}
          onOpenPodium={onOpenPodium}
        />
      ))}
    </>
  );
};

export default function Contests() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [registering, setRegistering] = useState<string | number | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedEventForPodium, setSelectedEventForPodium] = useState<ContestEvent | null>(null);

  const apiUrl = import.meta.env.VITE_API_URL || CONSTANTS.DEFAULT_API_URL;
  const confettiTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (confettiTimerRef.current) clearInterval(confettiTimerRef.current);
    };
  }, []);

  const queryClient = useQueryClient();

  const { data: events = [], isLoading } = useQuery<ContestEvent[]>({
    queryKey: ['eventsData'],
    queryFn: async () => {
      const eventsRes = await fetch(`${apiUrl}/events`);
      if (eventsRes.ok) {
        const eventsData = await eventsRes.json();
        return Array.isArray(eventsData) ? eventsData : [];
      }
      return [];
    },
    staleTime: 60_000,
  });

  const { data: myRegistrations = [] } = useQuery<Array<{ event_id: string }>>({
    queryKey: ['myRegistrations', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return [];

      const regRes = await fetch(`${apiUrl}/events/my-registrations?userId=${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (regRes.ok) {
        const regData = await regRes.json();
        if (Array.isArray(regData)) return regData;
      }
      return [];
    },
    enabled: Boolean(user),
  });

  useEffect(() => {
    let ignore = false;
    const timer = setTimeout(() => {
      if (ignore) return;
      const targets = document.querySelectorAll(CONSTANTS.CARD_SELECTOR);
      if (targets.length > 0) {
        gsap.fromTo(
          CONSTANTS.CARD_SELECTOR,
          { y: 20, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            stagger: 0.08,
            ease: 'power2.out',
            clearProps: 'all',
          },
        );
      }
    }, 100);
    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [events]);

  const triggerConfetti = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        if (confettiTimerRef.current) clearInterval(confettiTimerRef.current);
        return;
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: 0.2, y: 0.5 } });
      confetti({ ...defaults, particleCount, origin: { x: 0.8, y: 0.5 } });
    }, 250);
    confettiTimerRef.current = interval;
  };

  const handleRegister = async (eventId: string | number) => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    setRegistering(eventId);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error('No hay sesión activa');

      const res = await fetch(`${apiUrl}/events/${eventId}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: user.id }),
      });

      if (!res.ok) {
        const data = await res.json();
        if (data.error?.includes('Ya estás inscrito')) {
          alert(t('contests.already_registered'));
        } else {
          throw new Error(data.error || t('contests.registration_error'));
        }
      } else {
        triggerConfetti();
        queryClient.setQueryData<Array<{ event_id: string }>>(
          ['myRegistrations', user?.id],
          (prev) => [...(prev ?? []), { event_id: String(eventId) }],
        );
      }
    } catch (error: unknown) {
      console.error('Registration error:', error);
      const msg = error instanceof Error ? error.message : String(error);
      alert(msg);
    } finally {
      setRegistering(null);
    }
  };

  return (
    <div className="min-h-screen pt-24">
      <Section title={t('contests.title')}>
        <div className="mx-auto mb-16 max-w-3xl rounded-2xl border border-white/10 bg-white/5 p-8 text-center shadow-xl backdrop-blur-xl">
          <p className="text-lg/relaxed text-gray-300">{t('contests.intro')}</p>
        </div>

        <div className="grid grid-cols-1 gap-8 px-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <ContestGrid
            isLoading={isLoading}
            events={events}
            myRegistrations={myRegistrations}
            registeringId={registering}
            onRegister={handleRegister}
            onOpenPodium={setSelectedEventForPodium}
          />
        </div>

        <ConfirmationModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onConfirm={() => {
            setShowLoginModal(false);
            navigate('/login');
          }}
          title={t('login.title')}
          message={t('contests.login_required')}
          confirmText={t('login.sign_in_verb')}
          cancelText={t('common.cancel', 'Cancelar')}
        />
      </Section>

      <AnimatePresence>
        {selectedEventForPodium && (
          <PodiumModal
            event={selectedEventForPodium}
            onClose={() => setSelectedEventForPodium(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
