import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { m as motion } from 'framer-motion';
import { User, Medal, Gamepad2, Home, Twitter, Twitch, Youtube } from 'lucide-react';
import Loader from '../components/UI/Loader';
import { MEDAL_ICONS } from '../utils/MedalIcons';
import MarkdownRenderer from '../components/UI/MarkdownRenderer';
import ProfileWall from '../components/User/ProfileWall';
import SkinViewer from '../components/User/SkinViewer';
import { useAuth } from '../context/AuthContext';
import { isAdmin as checkIsAdmin } from '../utils/roleUtils';
import { supabase } from '../services/supabaseClient';
import Toast, { ToastType } from '../components/UI/Toast';
import ProfileHeader from '../components/User/ProfileHeader';
import PlayerStatsGrid from '../components/User/PlayerStatsGrid';
import '../styles/pages/public_profile.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const CONSTANTS = {
  MIME_JSON: 'application/json',
  TOAST_SUCCESS: 'success' as ToastType,
  TOAST_ERROR: 'error' as ToastType,
  TOAST_INFO: 'info' as ToastType,
} as const;

interface MedalDefinition {
  id: string | number;
  name: string;
  description: string;
  icon: string;
  color: string;
  image_url?: string;
  name_en?: string;
  description_en?: string;
}

interface Profile {
  id: string;
  username: string;
  avatar_url?: string;
  profile_banner_url?: string;
  role: string;
  created_at: string;
  medals?: (string | number)[];
  public_stats: boolean;
  bio?: string;
  social_discord?: string;
  social_twitter?: string;
  social_twitch?: string;
  social_youtube?: string;
  minecraft_uuid?: string;
  minecraft_nick?: string;
  original_username?: string;
  avatar_preference?: 'minecraft' | 'social';
  reputation?: number;
  status_message?: string;
  full_name?: string;
}

export interface PlayerStats {
  playtime: string;
  kills: number;
  mob_kills: number;
  deaths: number;
  money: string;
  blocks_mined: string;
  blocks_placed: string;
}

interface ToastState {
  visible: boolean;
  message: string;
  type: ToastType;
}

async function fetchMedalDefinitions(medals?: (string | number)[]): Promise<MedalDefinition[]> {
  if (!medals || medals.length === 0) return [];
  try {
    const resSettings = await fetch(`${API_URL}/settings`);
    if (!resSettings.ok) return [];

    const cType = resSettings.headers.get('content-type');
    if (!cType?.includes(CONSTANTS.MIME_JSON)) return [];

    const settings = await resSettings.json();
    if (!settings.medal_definitions) return [];

    const parsed =
      typeof settings.medal_definitions === 'string'
        ? JSON.parse(settings.medal_definitions)
        : settings.medal_definitions;

    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('Failed to parse medals', error);
    return [];
  }
}

async function fetchProfileData(
  username: string,
  notFoundMsg: string,
): Promise<{ profile: Profile; medalDefinitions: MedalDefinition[] }> {
  const resUser = await fetch(`${API_URL}/users/profile/${username}`);
  if (!resUser.ok) {
    if (resUser.status === 404) throw new Error(notFoundMsg);
    throw new Error('Error loading profile');
  }

  const contentType = resUser.headers.get('content-type');
  if (!contentType?.includes(CONSTANTS.MIME_JSON)) {
    throw new Error('Invalid response format from server');
  }

  const response = await resUser.json();
  if (!response.success || !response.data) {
    throw new Error('Invalid response format');
  }

  const userData: Profile = response.data;
  const medalDefs = await fetchMedalDefinitions(userData.medals);
  return { profile: userData, medalDefinitions: medalDefs };
}

async function fetchStatsData(identifier: string): Promise<PlayerStats | null> {
  const resStats = await fetch(`${API_URL}/player-stats/${identifier}`);
  if (!resStats.ok) return null;

  const contentType = resStats.headers.get('content-type');
  if (!contentType?.includes(CONSTANTS.MIME_JSON)) return null;

  const response = await resStats.json();
  return response.success && response.data ? response.data : response;
}

async function postKarmaUpdate(profileId: string): Promise<number> {
  const sessionRes = await supabase.auth.getSession();
  const token = sessionRes.data.session?.access_token;

  const res = await fetch(`${API_URL}/users/${profileId}/karma`, {
    method: 'POST',
    headers: {
      'Content-Type': CONSTANTS.MIME_JSON,
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Error ${res.status}`);
  }

  const contentType = res.headers.get('content-type');
  if (!contentType?.includes(CONSTANTS.MIME_JSON)) {
    throw new Error('Invalid response from server');
  }

  const data = await res.json();
  if (typeof data.newReputation === 'number') {
    return data.newReputation;
  }
  throw new Error(data.error || 'Failed to update karma');
}

function getStatsIdentifier(profile: Profile | null, fallbackUsername?: string): string | null {
  if (!profile?.public_stats) return null;
  return (
    profile.minecraft_uuid ||
    profile.minecraft_nick ||
    profile.original_username ||
    fallbackUsername ||
    null
  );
}

function getSocialUrl(platform: 'twitter' | 'twitch' | 'youtube', value: string): string {
  if (value.startsWith('http')) return value;
  const platformPrefixMap: Record<'twitter' | 'twitch' | 'youtube', string> = {
    twitter: 'https://twitter.com/',
    twitch: 'https://twitch.tv/',
    youtube: 'https://youtube.com/@',
  };
  return `${platformPrefixMap[platform]}${value}`;
}

function ProfileNotFound({ onBackHome }: Readonly<{ onBackHome: () => void }>) {
  const { t } = useTranslation();
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '2rem',
        minHeight: '80vh',
        textAlign: 'center',
        padding: '2rem',
        width: '100%',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          width: '120px',
          height: '120px',
          background: 'rgba(255, 68, 68, 0.1)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid rgba(255, 68, 68, 0.2)',
          marginBottom: '1rem',
          boxShadow: '0 0 40px rgba(255, 68, 68, 0.1)',
        }}
      >
        <User size={50} style={{ color: '#ff4444', opacity: 0.8 }} />
      </motion.div>

      <div style={{ maxWidth: '450px' }}>
        <h2
          style={{
            fontSize: '2.5rem',
            fontWeight: 800,
            marginBottom: '1rem',
            background: 'linear-gradient(to bottom, #fff, #888)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {t('profile.not_found_title', '¿A dónde se fue?')}
        </h2>
        <p
          style={{
            color: 'var(--muted)',
            fontSize: '1.1rem',
            lineHeight: 1.6,
            marginBottom: '2.5rem',
          }}
        >
          {t(
            'profile.not_found_desc',
            'No hemos podido encontrar a ningún usuario con ese nombre. Quizás se ha perdido en el mar o nunca existió.',
          )}
        </p>

        <button
          type="button"
          className="nav-btn primary"
          onClick={onBackHome}
          style={{
            padding: '1rem 2.5rem',
            fontSize: '1rem',
            borderRadius: '12px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.8rem',
          }}
        >
          <Home size={18} /> {t('common.back_home', 'Volver al Inicio')}
        </button>
      </div>
    </div>
  );
}

interface SocialLinksProps {
  discord?: string;
  twitter?: string;
  twitch?: string;
  youtube?: string;
  onCopyDiscord: (tag: string) => void;
}

function SocialLinks({
  discord,
  twitter,
  twitch,
  youtube,
  onCopyDiscord,
}: Readonly<SocialLinksProps>) {
  const { t } = useTranslation();

  return (
    <div style={{ width: '200px' }}>
      <h4
        style={{
          fontSize: '0.7rem',
          textTransform: 'uppercase',
          color: '#444',
          letterSpacing: '1px',
          marginBottom: '1rem',
        }}
      >
        Social
      </h4>
      <div style={{ display: 'flex', gap: '0.8rem' }}>
        {discord && (
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            role="button"
            tabIndex={0}
            style={{ cursor: 'pointer' }}
            onClick={() => onCopyDiscord(discord)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onCopyDiscord(discord);
              }
            }}
            title={discord}
          >
            <svg
              stroke="currentColor"
              fill="currentColor"
              strokeWidth="0"
              viewBox="0 0 640 512"
              height="20"
              width="20"
              xmlns="http://www.w3.org/2000/svg"
              style={{ color: '#5865F2' }}
            >
              <title>{discord}</title>
              <path d="M524.531,69.836a1.5,1.5,0,0,0-.764-.7A485.065,485.065,0,0,0,404.081,32.03a1.816,1.816,0,0,0-1.923.91,337.461,337.461,0,0,0-14.9,30.6,447.848,447.848,0,0,0-134.426,0,309.541,309.541,0,0,0-15.135-30.6,1.89,1.89,0,0,0-1.924-.91A483.689,483.689,0,0,0,116.085,69.137a1.712,1.712,0,0,0-.788.676C39.068,183.651,18.186,294.69,28.43,404.354a2.016,2.016,0,0,0,.765,1.375A487.666,487.666,0,0,0,176.02,479.918a1.9,1.9,0,0,0,2.063-.676A348.2,348.2,0,0,0,208.12,430.4a1.86,1.86,0,0,0-1.019-2.588,321.173,321.173,0,0,1-45.868-21.853,1.885,1.885,0,0,1-.185-3.126c3.082-2.309,6.166-4.711,9.109-7.137a1.819,1.819,0,0,1,1.9-.256c96.229,43.917,200.41,43.917,295.5,0a1.812,1.812,0,0,1,1.924.233c2.944,2.426,6.027,4.851,9.132,7.16a1.884,1.884,0,0,1-.162,3.126,301.407,301.407,0,0,1-45.89,21.83,1.875,1.875,0,0,0-1,2.611,391.055,391.055,0,0,0,30.014,48.815,1.864,1.864,0,0,0,2.063.7A486.048,486.048,0,0,0,610.7,405.729a1.882,1.882,0,0,0,.765-1.352C623.729,277.594,590.8,167.234,524.531,69.836ZM222.491,337.58c-28.972,0-52.844-26.587-52.844-59.239S193.056,219.1,222.491,219.1c29.665,0,53.306,26.82,52.843,59.239C275.334,310.993,251.924,337.58,222.491,337.58Zm195.38,0c-28.971,0-52.843-26.587-52.843-59.239S388.437,219.1,417.871,219.1c29.667,0,53.307,26.82,52.844,59.239C470.715,310.993,447.538,337.58,417.871,337.58Z" />
            </svg>
          </motion.div>
        )}
        {twitter && (
          <motion.a
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            href={getSocialUrl('twitter', twitter)}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#1d9bf0' }}
            title={t('profile.visit_twitter', 'Visitar Twitter')}
          >
            <Twitter size={20} />
          </motion.a>
        )}
        {twitch && (
          <motion.a
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            href={getSocialUrl('twitch', twitch)}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#9146FF' }}
            title={t('profile.visit_twitch', 'Visitar Twitch')}
          >
            <Twitch size={20} />
          </motion.a>
        )}
        {youtube && (
          <motion.a
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            href={getSocialUrl('youtube', youtube)}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#ff0000' }}
            title={t('profile.visit_youtube', 'Visitar YouTube')}
          >
            <Youtube size={20} />
          </motion.a>
        )}
      </div>
    </div>
  );
}

function BioSection({
  profile,
  onCopyDiscord,
}: Readonly<{
  profile: Profile;
  onCopyDiscord: (tag: string) => void;
}>) {
  const { t } = useTranslation();

  return (
    <div className="premium-card">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ flex: 1, minWidth: '300px' }}>
          <h3>
            <User size={18} /> {t('profile.about_me')}
          </h3>
          <div style={{ color: '#aaa', lineHeight: 1.8 }}>
            {profile.bio ? (
              <MarkdownRenderer content={profile.bio} />
            ) : (
              <p style={{ fontStyle: 'italic' }}>{t('profile.no_bio')}</p>
            )}
          </div>
        </div>

        <SocialLinks
          discord={profile.social_discord}
          twitter={profile.social_twitter}
          twitch={profile.social_twitch}
          youtube={profile.social_youtube}
          onCopyDiscord={onCopyDiscord}
        />
      </div>
    </div>
  );
}

function MedalItem({
  medalId,
  definition,
}: Readonly<{
  medalId: string | number;
  definition: MedalDefinition;
}>) {
  const { t, i18n } = useTranslation();
  const Icon = MEDAL_ICONS[definition.icon as keyof typeof MEDAL_ICONS] || Medal;
  const title =
    i18n.language.startsWith('en') && definition.name_en
      ? definition.name_en
      : (t(`account.medals.items.${medalId}.title`, definition.name) as string);

  return (
    <motion.div
      whileHover={{ scale: 1.1, rotate: 5 }}
      style={{
        padding: '0.8rem',
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '12px',
        border: `1px solid ${definition.color}33`,
        display: 'flex',
        alignItems: 'center',
        gap: '0.8rem',
      }}
      title={definition.description}
    >
      {definition.image_url ? (
        <img
          src={definition.image_url}
          alt={definition.name}
          style={{ width: '1.5rem', height: '1.5rem', objectFit: 'contain' }}
        />
      ) : (
        <Icon style={{ color: definition.color, fontSize: '1.2rem' }} />
      )}
      <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{title}</span>
    </motion.div>
  );
}

function MedalsShowcase({
  medals,
  definitions,
}: Readonly<{
  medals: (string | number)[];
  definitions: MedalDefinition[];
}>) {
  const { t } = useTranslation();
  if (medals.length === 0) return null;

  return (
    <div className="premium-card">
      <h3>
        <Medal size={18} /> {t('profile.medals')}
      </h3>
      <div className="medal-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
        {medals.map((medalId) => {
          const def = definitions.find((m) => m.id === medalId);
          if (!def) return null;
          return <MedalItem key={medalId} medalId={medalId} definition={def} />;
        })}
      </div>
    </div>
  );
}

export default function PublicProfile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user: currentUser } = useAuth();

  const isAdmin = checkIsAdmin(currentUser);

  const [overrideProfile, setProfile] = useState<Profile | null>(null);
  const [givingKarma, setGivingKarma] = useState(false);
  const [toast, setToast] = useState<ToastState>({
    visible: false,
    message: '',
    type: CONSTANTS.TOAST_INFO,
  });

  const showToast = useCallback((message: string, type: ToastType = CONSTANTS.TOAST_INFO) => {
    setToast({ visible: true, message, type });
  }, []);

  const {
    data: profileQueryData,
    isLoading: loading,
    error: queryError,
  } = useQuery({
    queryKey: ['publicProfile', username],
    queryFn: () =>
      fetchProfileData(username ?? '', t('profile.not_found', 'Usuario no encontrado')),
    enabled: Boolean(username),
    staleTime: 30_000,
  });

  const profile = profileQueryData?.profile ?? overrideProfile;
  const medalDefinitions = profileQueryData?.medalDefinitions ?? [];
  const error = queryError ? (queryError as Error).message : null;

  const statsIdentifier = getStatsIdentifier(profile, username);

  const { data: playerStats = null, isLoading: statsLoading } = useQuery({
    queryKey: ['publicProfileStats', statsIdentifier, API_URL],
    queryFn: () => (statsIdentifier ? fetchStatsData(statsIdentifier) : Promise.resolve(null)),
    enabled: Boolean(statsIdentifier && profile?.public_stats),
    staleTime: 30_000,
  });

  const handleGiveKarma = async () => {
    if (!currentUser || !profile || currentUser.id === profile.id) return;

    setGivingKarma(true);
    try {
      const newReputation = await postKarmaUpdate(profile.id);
      setProfile((prev) => (prev ? { ...prev, reputation: newReputation } : null));
      showToast(t('profile.karma_success'), CONSTANTS.TOAST_SUCCESS);
    } catch (e) {
      console.error(e);
      const errorMsg = e instanceof Error ? e.message : t('profile.karma_conn_error');
      showToast(errorMsg, CONSTANTS.TOAST_ERROR);
    } finally {
      setGivingKarma(false);
    }
  };

  const handleCopyDiscord = useCallback(
    (discordTag: string) => {
      navigator.clipboard.writeText(discordTag);
      showToast(t('common.copied', 'Copiado al portapapeles'), CONSTANTS.TOAST_SUCCESS);
    },
    [showToast, t],
  );

  if (loading)
    return (
      <div className="layout-center">
        <Loader />
      </div>
    );
  if (error) return <ProfileNotFound onBackHome={() => navigate('/')} />;
  if (!profile) return null;

  return (
    <div className="public-profile-container fade-in">
      <ProfileHeader
        profile={profile}
        currentUser={currentUser}
        onGiveKarma={handleGiveKarma}
        givingKarma={givingKarma}
      />

      <div className="profile-content">
        <div className="profile-sidebar">
          <div className="premium-card">
            <h3>
              <Gamepad2 size={18} /> {t('profile.skin_title')}
            </h3>
            <div className="skin-preview-premium">
              <SkinViewer username={profile.username} height={380} width={280} />
            </div>
          </div>

          <PlayerStatsGrid
            stats={playerStats}
            loading={statsLoading}
            isPublic={Boolean(profile.public_stats)}
            isAdmin={isAdmin}
          />
        </div>

        <div className="profile-main">
          <BioSection profile={profile} onCopyDiscord={handleCopyDiscord} />

          {profile.medals && (
            <MedalsShowcase medals={profile.medals} definitions={medalDefinitions} />
          )}

          <div
            className="premium-card"
            style={{
              padding: 0,
              background: 'transparent',
              border: 'none',
              backdropFilter: 'none',
            }}
          >
            <ProfileWall profileId={profile.id} isAdmin={isAdmin} />
          </div>
        </div>
      </div>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={() => setToast((prev) => ({ ...prev, visible: false }))}
      />
    </div>
  );
}
