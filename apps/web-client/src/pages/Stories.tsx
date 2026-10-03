import { useState, useCallback, useEffect, type MouseEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { HelpCircle, X, Compass, Copy } from 'lucide-react';
import Section from '../components/Layout/Section';
import { useTranslation } from 'react-i18next';
import { m as motion, AnimatePresence } from 'framer-motion';
import { getLocations, type WorldLocation } from '../services/locationService';
import Loader from '../components/UI/Loader';

const DEFAULT_TP_Y_COORDINATE = '70';
const TOAST_DURATION_MS = 2500;

/**
 * Parses a coordinate string to create a valid Minecraft /tp command.
 */
function getTpCommand(coordsStr: string): string {
  const matches = coordsStr.match(/-?\d+/g);
  if (matches && matches.length >= 2) {
    const x = matches[0];
    const y = matches.length >= 3 ? matches[1] : DEFAULT_TP_Y_COORDINATE;
    const z = matches.length >= 3 ? matches[2] : matches[1];
    return `/tp ${x} ${y} ${z}`;
  }
  return `/tp ${coordsStr}`;
}

/**
 * Splits text into its initial letter and remaining body for dropcap typography.
 */
function splitStoryText(text: string): { first: string; rest: string } {
  if (!text) return { first: '', rest: '' };
  const trimmed = text.trim();
  return {
    first: trimmed.charAt(0),
    rest: trimmed.slice(1),
  };
}

interface StoryDropcapTextProps {
  readonly text: string;
}

function StoryDropcapText({ text }: Readonly<StoryDropcapTextProps>) {
  const { first, rest } = splitStoryText(text);
  return (
    <p className="whitespace-pre-line text-justify font-serif text-lg italic leading-relaxed text-amber-100/70">
      {first && (
        <span className="float-left mr-3 mt-1.5 border-b-2 border-amber-400/40 pb-1 font-serif text-5xl font-black leading-none text-amber-400 md:text-6xl">
          {first}
        </span>
      )}
      {rest}
    </p>
  );
}

function CodexCornerDecorations() {
  return (
    <>
      <div className="pointer-events-none absolute left-4 top-4 z-30 h-8 w-8 rounded-tl-lg border-l-2 border-t-2 border-amber-500/30" />
      <div className="pointer-events-none absolute right-4 top-4 z-30 h-8 w-8 rounded-tr-lg border-r-2 border-t-2 border-amber-500/30" />
      <div className="pointer-events-none absolute bottom-4 left-4 z-30 h-8 w-8 rounded-bl-lg border-b-2 border-l-2 border-amber-500/30" />
      <div className="pointer-events-none absolute bottom-4 right-4 z-30 h-8 w-8 rounded-br-lg border-b-2 border-r-2 border-amber-500/30" />
    </>
  );
}

interface StoryAuthorsListProps {
  readonly authors?: WorldLocation['authors'];
}

function StoryAuthorsList({ authors }: Readonly<StoryAuthorsListProps>) {
  const { t } = useTranslation();
  if (!authors || authors.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-3">
      {authors.map((auth) => (
        <div
          key={auth.name}
          className="group/author flex items-center gap-3 rounded-2xl border border-amber-500/10 bg-amber-500/5 px-4 py-2 transition-colors hover:bg-amber-500/10"
        >
          <img
            src={`https://minotar.net/helm/${auth.name}/100.png`}
            alt={auth.name}
            className="sepia-15 h-8 w-8 rounded-lg shadow-lg filter"
          />
          <div className="flex flex-col">
            <span className="text-[8px] font-black uppercase tracking-widest text-amber-500/60">
              {t(`stories.roles.${auth.role}`)}
            </span>
            <span className="text-xs font-bold text-amber-100/90 transition-colors group-hover/author:text-amber-400">
              {auth.name}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

interface StoryCardProps {
  readonly place: WorldLocation;
  readonly onSelect: (id: number) => void;
  readonly onCopyCoords: (coords: string) => void;
}

function StoryCard({ place, onSelect, onCopyCoords }: Readonly<StoryCardProps>) {
  const handleCoordsClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onCopyCoords(place.coords || '');
  };

  return (
    <article className="hover:shadow-(--accent)/10 hover:border-(--accent)/30 group relative w-full overflow-hidden rounded-3xl border border-white/5 bg-[#0a0a0a] text-left transition-colors duration-500 hover:-translate-y-2 hover:bg-white/5 hover:shadow-2xl">
      {/* Invisible overlay button to open detail */}
      <button
        type="button"
        aria-label={`Ver historia: ${place.title}`}
        onClick={() => onSelect(place.id)}
        className="absolute inset-0 z-10 cursor-pointer"
      />
      <div className="relative aspect-video w-full overflow-hidden bg-white/5">
        {place.is_coming_soon ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="bg-linear-to-b absolute inset-0 from-transparent to-black/60" />
            <HelpCircle className="relative z-10 animate-pulse text-6xl text-white/10" />
            <span className="relative z-10 mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-white/20">
              Clasificado
            </span>
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={handleCoordsClick}
              className="hover:bg-(--accent) text-(--accent) group/coords absolute left-4 top-4 z-20 flex items-center gap-2 rounded-full border border-white/10 bg-black/80 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest backdrop-blur-md transition-colors hover:text-black"
              title="Haz clic para copiar comando /tp"
            >
              <Compass className="h-3.5 w-3.5 transition-transform duration-500 group-hover/coords:rotate-180" />
              <span>{place.coords}</span>
              <Copy className="ml-1 h-3 w-3 opacity-40 group-hover/coords:opacity-100" />
            </button>
            <img
              src={place.image_url || ''}
              alt={place.title}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="bg-linear-to-t absolute inset-0 from-[#0a0a0a] via-transparent to-transparent opacity-60 transition-opacity group-hover:opacity-40" />
          </>
        )}
      </div>
      <div className="flex flex-col gap-3 p-8">
        <h3
          className={`text-2xl font-black transition-colors ${
            place.is_coming_soon ? 'text-gray-700' : 'group-hover:text-(--accent) text-white'
          }`}
        >
          {place.title}
        </h3>
        <p className="line-clamp-2 text-sm font-medium italic leading-relaxed text-gray-400">
          "{place.description}"
        </p>
      </div>
    </article>
  );
}

interface StoryModalProps {
  readonly place: WorldLocation;
  readonly onClose: () => void;
  readonly onCopyCoords: (coords: string) => void;
}

function StoryModal({ place, onClose, onCopyCoords }: Readonly<StoryModalProps>) {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="z-1000 fixed inset-0 flex items-center justify-center bg-black/95 p-4 backdrop-blur-xl md:p-8"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="relative flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-[2.5rem] border border-amber-500/20 bg-[#120f0a] shadow-[0_0_80px_rgba(0,0,0,0.8)] shadow-black md:flex-row"
      >
        <CodexCornerDecorations />

        <button
          aria-label={t('common.close', 'Cerrar')}
          type="button"
          onClick={onClose}
          className="absolute right-6 top-6 z-50 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-amber-500/20 bg-black/40 text-xl text-amber-500/70 transition-colors hover:rotate-90 hover:bg-amber-500 hover:text-black"
        >
          <X />
        </button>

        {/* Media Section */}
        <div className="h-75 relative w-full overflow-hidden bg-white/5 md:h-auto md:w-1/2">
          {place.is_coming_soon ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <HelpCircle className="animate-pulse text-9xl text-white/5" />
            </div>
          ) : (
            <img
              src={place.image_url || ''}
              alt={place.title}
              className="sepia-20 brightness-85 h-full w-full object-cover filter transition-colors duration-700 hover:scale-105"
            />
          )}
          <div className="bg-linear-to-t md:bg-linear-to-r absolute inset-0 from-[#120f0a] via-transparent to-transparent" />
        </div>

        {/* Content Section */}
        <div className="custom-scrollbar flex w-full flex-col gap-8 overflow-y-auto p-8 md:w-1/2 md:p-12">
          <div className="flex flex-col gap-4">
            <button
              aria-label="Copiar coordenadas /tp"
              type="button"
              onClick={() => onCopyCoords(place.coords || '')}
              className="group/modal-coords flex cursor-pointer items-center gap-2 self-start rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-2 font-mono text-xs tracking-widest text-amber-400 transition-colors hover:bg-amber-500 hover:text-black"
            >
              <Compass className="h-4 w-4 transition-transform duration-500 group-hover/modal-coords:rotate-180" />
              <span>{place.coords}</span>
              <Copy className="ml-1 h-3.5 w-3.5 opacity-50 group-hover/modal-coords:opacity-100" />
            </button>

            <h2 className="mb-2 font-serif text-4xl font-black uppercase leading-none tracking-tighter text-amber-100 md:text-5xl">
              {place.title}
            </h2>

            <StoryAuthorsList authors={place.authors} />
          </div>

          <div className="h-px w-full bg-amber-500/10" />

          <StoryDropcapText text={place.long_description || ''} />
        </div>
      </motion.div>
    </motion.div>
  );
}

function EmptyStories() {
  return (
    <div className="bg-white/2 flex flex-col items-center justify-center gap-6 rounded-3xl border-2 border-dashed border-white/5 py-20 text-center">
      <HelpCircle size={40} className="text-white/10" />
      <p className="text-sm font-bold uppercase tracking-widest text-gray-500">
        Aún no hay historias registradas en el servidor.
      </p>
    </div>
  );
}

interface ToastNotificationProps {
  readonly message: string | null;
}

function ToastNotification({ message }: Readonly<ToastNotificationProps>) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className="z-1000 fixed bottom-10 right-10 flex items-center gap-3 rounded-2xl border border-amber-500/30 bg-[#120f0a] px-6 py-4 text-xs font-black uppercase tracking-widest text-amber-100 shadow-2xl backdrop-blur-md"
        >
          <span className="h-2.5 w-2.5 animate-ping rounded-full bg-amber-500" />
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function Stories() {
  const { t } = useTranslation();
  const [selectedPlaceId, setSelectedPlaceId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { data: locations = [], isLoading: loading } = useQuery<WorldLocation[]>({
    queryKey: ['worldLocations'],
    queryFn: getLocations,
  });

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const copyCoords = useCallback((coords: string) => {
    const tpCmd = getTpCommand(coords);
    navigator.clipboard.writeText(tpCmd);
    setToastMessage(`Comando copiado: ${tpCmd}`);
  }, []);

  const selectedPlace = locations.find((p) => p.id === selectedPlaceId);

  return (
    <Section title={t('stories.title')}>
      <Section>
        <div className="mx-auto mb-16 max-w-3xl rounded-2xl border border-white/10 bg-white/5 p-8 text-center shadow-xl backdrop-blur-xl">
          <p className="text-lg leading-relaxed text-gray-300">{t('stories.intro')}</p>
        </div>

        {loading ? (
          <div className="flex justify-center p-20">
            <Loader />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 px-4 md:grid-cols-2 lg:grid-cols-3">
            {locations.map((place) => (
              <StoryCard
                key={place.id}
                place={place}
                onSelect={setSelectedPlaceId}
                onCopyCoords={copyCoords}
              />
            ))}
          </div>
        )}

        {!loading && locations.length === 0 && <EmptyStories />}
      </Section>

      {/* Codex Modal Lightbox */}
      <AnimatePresence>
        {selectedPlace && (
          <StoryModal
            place={selectedPlace}
            onClose={() => setSelectedPlaceId(null)}
            onCopyCoords={copyCoords}
          />
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <ToastNotification message={toastMessage} />
    </Section>
  );
}
