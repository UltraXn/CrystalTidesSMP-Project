import { useState, useEffect, type ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router';
import { isStaff } from '../utils/roleUtils';
import {
  Shield,
  PieChart,
  Users,
  Ticket,
  Lightbulb,
  BarChart3,
  Calendar,
  Newspaper,
  Gamepad2,
  IdCard,
  X,
  Briefcase,
  List,
  Settings,
  ArrowLeft,
  Book,
  CircleDollarSign,
  Gift,
  MapPin,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Loader from '../components/UI/Loader';
import { use2FAStatus } from '../hooks/useAccountData';
import { getAdminToken } from '../services/adminAuth';
import Admin2FAModal from '../components/Admin/Admin2FAModal';
import { useScrollDirection } from '../hooks/useScrollDirection';

import '../styles/admin/admin-layout.css';
import '../styles/admin/admin.css';
import '../styles/admin/admin_kanban.css';
import '../styles/admin/admin_calendar.css';
import '../styles/admin/admin_staff.css';
import '../styles/admin/admin_polls.css';
import '../styles/admin/admin_events.css';
import '../styles/admin/admin_news.css';
import '../styles/admin/admin_gamification.css';
import '../styles/admin/admin_donors.css';
import '../styles/admin/admin_donations.css';
import '../styles/admin/admin_audit.css';

// Sub-componentes del Admin Panel
import DashboardOverview from '../components/Admin/DashboardOverview';
import UsersManager from '../components/Admin/UsersManager';
import TicketsManager from '../components/Admin/TicketsManager';
import AuditLog from '../components/Admin/AuditLog';
import AdminNews from '../components/Admin/AdminNews';
import SuggestionsManager from '../components/Admin/SuggestionsManager';
import PollsManager from '../components/Admin/PollsManager';
import EventsManager from '../components/Admin/EventsManager';
import StaffWorkspace from '../components/Admin/StaffHub/StaffWorkspace';
import SiteConfig from '../components/Admin/SiteConfig';
import DonationsManager from '../components/Admin/DonationsManager';
import GamificationManager from '../components/Admin/GamificationManager';
import StaffCardsManager from '../components/Admin/StaffCardsManager';
import AdminDocs from '../components/Admin/AdminDocs';
import WikiManager from '../components/Admin/WikiManager';
import LocationsManager from '../components/Admin/Config/LocationsManager';
import AdminMobileNavbar from '../components/Admin/AdminMobileNavbar';
import RoadmapAdminManager from '../components/Admin/RoadmapAdminManager';

const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  GACHA: '/gacha',
} as const;

const ADMIN_TABS = {
  OVERVIEW: 'overview',
  SETTINGS: 'settings',
  LOGS: 'logs',
  DOCS: 'docs',
  USERS: 'users',
  DONATIONS: 'donations',
  NEWS: 'news',
  EVENTS: 'events',
  GAMIFICATION: 'gamification',
  ROADMAP: 'roadmap',
  SUGGESTIONS: 'suggestions',
  POLLS: 'polls',
  WIKI: 'wiki',
  LOCATIONS: 'locations',
  STAFF_HUB: 'staff_hub',
  TEAM: 'team',
  TICKETS: 'tickets',
  GACHA_DEV: 'gacha_dev',
} as const;

const ROLES = {
  NEROFERNO: 'neroferno',
  KILLU: 'killu',
  FOUNDER: 'founder',
  ADMIN: 'admin',
  STAFF: 'staff',
  DEVELOPER: 'developer',
  HELPER: 'helper',
  DONOR: 'donor',
  USER: 'user',
} as const;

const CLOSE_SIDEBAR_KEY = 'admin.sidebar.close';
const CLOSE_SIDEBAR_DEFAULT = 'Cerrar menú lateral';

const SUPER_ADMIN_ROLES = ['neroferno', 'killu', 'developer'] as const;
const MOBILE_BREAKPOINT = 1024;

type AdminUser = ReturnType<typeof useAuth>['user'];

interface SidebarItemProps {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: ReactNode;
}

function SidebarItem({ active, onClick, label, icon }: Readonly<SidebarItemProps>) {
  return (
    <button
      aria-label={label}
      aria-current={active ? 'page' : undefined}
      type="button"
      className={`xp-sidebar-btn ${active ? 'active' : ''}`}
      onClick={onClick}
    >
      <span className="icon" aria-hidden="true">
        {icon}
      </span>
      {label}
    </button>
  );
}

interface UserRoleDisplayProps {
  role: string;
}

interface RoleConfig {
  label: string;
  color?: string;
  img: string;
}

function UserRoleDisplay({ role }: Readonly<UserRoleDisplayProps>) {
  const { t } = useTranslation();

  const roles: Record<string, RoleConfig> = {
    neroferno: {
      label: t('account.roles.neroferno'),
      color: '#8b5cf6',
      img: '/ranks/rank-neroferno.png',
    },
    killu: { label: t('account.roles.killu'), color: '#ec4899', img: '/ranks/rank-killu.png' },
    founder: {
      label: t('account.roles.founder'),
      color: '#a855f7',
      img: '/ranks/rank-fundador.png',
    },
    admin: { label: t('account.roles.admin'), color: '#f59e0b', img: '/ranks/admin.png' },
    staff: { label: t('account.roles.staff', 'Staff'), color: '#ffd700', img: '/ranks/staff.png' },
    developer: {
      label: t('account.roles.developer'),
      color: '#0ea5e9',
      img: '/ranks/developer.png',
    },
    helper: { label: t('account.roles.helper'), color: '#3b82f6', img: '/ranks/helper.png' },
    donor: { label: t('account.roles.donor'), color: '#22c55e', img: '/ranks/rank-donador.png' },
    user: { label: t('account.roles.user'), img: '/ranks/user.png' },
  };

  const current = roles[role] ?? roles[ROLES.USER];

  if (current.img) {
    return <img src={current.img} alt={current.label} className="user-role-img" />;
  }

  return (
    <span className="user-role-badge" style={{ color: current.color }}>
      {current.label}
    </span>
  );
}

interface AdminTabContentProps {
  activeTab: string;
  user: AdminUser;
  hasSecureAccess: boolean;
}

type TabRenderer = (user: AdminUser, hasSecureAccess: boolean) => React.ReactNode;

const TAB_COMPONENTS: Record<string, TabRenderer> = {
  [ADMIN_TABS.OVERVIEW]: () => <DashboardOverview />,
  [ADMIN_TABS.TICKETS]: () => <TicketsManager />,
  [ADMIN_TABS.USERS]: () => <UsersManager />,
  [ADMIN_TABS.SUGGESTIONS]: () => <SuggestionsManager />,
  [ADMIN_TABS.POLLS]: () => <PollsManager />,
  [ADMIN_TABS.EVENTS]: () => <EventsManager />,
  [ADMIN_TABS.NEWS]: (user) => <AdminNews user={user} />,
  [ADMIN_TABS.DONATIONS]: () => <DonationsManager />,
  [ADMIN_TABS.GAMIFICATION]: () => <GamificationManager />,
  [ADMIN_TABS.ROADMAP]: () => <RoadmapAdminManager />,
  [ADMIN_TABS.TEAM]: (_u, hasSecureAccess) => (hasSecureAccess ? <StaffCardsManager /> : null),
  [ADMIN_TABS.STAFF_HUB]: () => <StaffWorkspace />,
  [ADMIN_TABS.WIKI]: () => <WikiManager />,
  [ADMIN_TABS.LOCATIONS]: () => <LocationsManager />,
  [ADMIN_TABS.LOGS]: () => <AuditLog />,
  [ADMIN_TABS.SETTINGS]: (_u, hasSecureAccess) => (hasSecureAccess ? <SiteConfig /> : null),
  [ADMIN_TABS.DOCS]: () => <AdminDocs />,
};

function AdminTabContent({ activeTab, user, hasSecureAccess }: Readonly<AdminTabContentProps>) {
  const renderTab = TAB_COMPONENTS[activeTab];
  return renderTab ? <>{renderTab(user, hasSecureAccess)}</> : null;
}

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  isMobile: boolean;
  hasSecureAccess: boolean;
  onNavigateHome: () => void;
  onNavigateGacha: () => void;
}

function AdminSidebar({
  activeTab,
  setActiveTab,
  sidebarOpen,
  setSidebarOpen,
  isMobile,
  hasSecureAccess,
  onNavigateHome,
  onNavigateGacha,
}: Readonly<AdminSidebarProps>) {
  const { t } = useTranslation();

  const handleTabSelect = (tab: string) => {
    setActiveTab(tab);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const handleGachaClick = () => {
    onNavigateGacha();
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <aside className={`admin-layout-sidebar ${isMobile && sidebarOpen ? 'open' : ''}`}>
      <div className="drawer-handle" />
      <div className="admin-sidebar-header">
        <div>
          <h3 className="admin-brand-title">Crystal Panel</h3>
          <div className="admin-version-tag">v2.6.4 Stable</div>
        </div>
        {isMobile && (
          <button
            aria-label={t(CLOSE_SIDEBAR_KEY, CLOSE_SIDEBAR_DEFAULT)}
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="admin-sidebar-close"
          >
            <X size={20} aria-hidden="true" />
          </button>
        )}
      </div>

      <div className="xp-sidebar-nav">
        <button type="button" className="xp-sidebar-btn back-btn" onClick={onNavigateHome}>
          <span className="icon">
            <ArrowLeft size={20} />
          </span>
          {t('admin.back_home', 'Volver al Inicio')}
        </button>

        <div className="xp-sidebar-header">{t('admin.sidebar.general')}</div>
        <SidebarItem
          active={activeTab === ADMIN_TABS.OVERVIEW}
          onClick={() => handleTabSelect(ADMIN_TABS.OVERVIEW)}
          icon={<PieChart size={18} />}
          label={t('admin.tabs.general')}
        />
        {hasSecureAccess && (
          <SidebarItem
            active={activeTab === ADMIN_TABS.SETTINGS}
            onClick={() => handleTabSelect(ADMIN_TABS.SETTINGS)}
            icon={<Settings size={18} />}
            label={t('admin.tabs.settings')}
          />
        )}
        <SidebarItem
          active={activeTab === ADMIN_TABS.LOGS}
          onClick={() => handleTabSelect(ADMIN_TABS.LOGS)}
          icon={<List size={18} />}
          label={t('admin.tabs.logs')}
        />
        <SidebarItem
          active={activeTab === ADMIN_TABS.DOCS}
          onClick={() => handleTabSelect(ADMIN_TABS.DOCS)}
          icon={<Book size={18} />}
          label={t('admin.tabs.docs')}
        />

        <div className="xp-sidebar-header">{t('admin.sidebar.community')}</div>
        <SidebarItem
          active={activeTab === ADMIN_TABS.USERS}
          onClick={() => handleTabSelect(ADMIN_TABS.USERS)}
          icon={<Users size={18} />}
          label={t('admin.tabs.users')}
        />
        <SidebarItem
          active={activeTab === ADMIN_TABS.DONATIONS}
          onClick={() => handleTabSelect(ADMIN_TABS.DONATIONS)}
          icon={<CircleDollarSign size={18} />}
          label={t('admin.tabs.donations')}
        />
        <SidebarItem
          active={activeTab === ADMIN_TABS.NEWS}
          onClick={() => handleTabSelect(ADMIN_TABS.NEWS)}
          icon={<Newspaper size={18} />}
          label={t('admin.tabs.news')}
        />
        <SidebarItem
          active={activeTab === ADMIN_TABS.EVENTS}
          onClick={() => handleTabSelect(ADMIN_TABS.EVENTS)}
          icon={<Calendar size={18} />}
          label={t('admin.tabs.events')}
        />
        <SidebarItem
          active={activeTab === ADMIN_TABS.GAMIFICATION}
          onClick={() => handleTabSelect(ADMIN_TABS.GAMIFICATION)}
          icon={<Gamepad2 size={18} />}
          label={t('admin.tabs.gamification')}
        />
        <SidebarItem
          active={activeTab === ADMIN_TABS.ROADMAP}
          onClick={() => handleTabSelect(ADMIN_TABS.ROADMAP)}
          icon={<Gift size={18} style={{ color: '#2DD4BF' }} />}
          label="Roadmap y Recompensas"
        />
        <SidebarItem
          active={activeTab === ADMIN_TABS.SUGGESTIONS}
          onClick={() => handleTabSelect(ADMIN_TABS.SUGGESTIONS)}
          icon={<Lightbulb size={18} />}
          label={t('admin.tabs.suggestions')}
        />
        <SidebarItem
          active={activeTab === ADMIN_TABS.POLLS}
          onClick={() => handleTabSelect(ADMIN_TABS.POLLS)}
          icon={<BarChart3 size={18} />}
          label={t('admin.tabs.polls')}
        />
        <SidebarItem
          active={activeTab === ADMIN_TABS.WIKI}
          onClick={() => handleTabSelect(ADMIN_TABS.WIKI)}
          icon={<Book size={18} />}
          label={t('admin.tabs.wiki', 'Wiki / Gamepedia')}
        />
        <SidebarItem
          active={activeTab === ADMIN_TABS.LOCATIONS}
          onClick={() => handleTabSelect(ADMIN_TABS.LOCATIONS)}
          icon={<MapPin size={18} />}
          label={t('admin.tabs.locations', 'Lugares y Lore')}
        />
        <SidebarItem
          active={activeTab === ADMIN_TABS.GACHA_DEV}
          onClick={handleGachaClick}
          icon={<Gift size={18} style={{ color: '#ff8000' }} />}
          label="Gacha (Dev/Internal)"
        />

        <div className="xp-sidebar-header">{t('admin.sidebar.staff_management')}</div>
        <SidebarItem
          active={activeTab === ADMIN_TABS.STAFF_HUB}
          onClick={() => handleTabSelect(ADMIN_TABS.STAFF_HUB)}
          icon={<Briefcase size={18} />}
          label={t('admin.tabs.staff_hub')}
        />
        {hasSecureAccess && (
          <SidebarItem
            active={activeTab === ADMIN_TABS.TEAM}
            onClick={() => handleTabSelect(ADMIN_TABS.TEAM)}
            icon={<IdCard size={18} />}
            label={t('admin.tabs.team')}
          />
        )}
        <SidebarItem
          active={activeTab === ADMIN_TABS.TICKETS}
          onClick={() => handleTabSelect(ADMIN_TABS.TICKETS)}
          icon={<Ticket size={18} />}
          label={t('admin.tabs.tickets')}
        />
      </div>
    </aside>
  );
}

interface AdminHeaderProps {
  activeTab: string;
  isMobile: boolean;
  scrollDirection: 'up' | 'down' | null;
  user: AdminUser;
  onOpen2FAModal: () => void;
}

function AdminHeader({
  activeTab,
  isMobile,
  scrollDirection,
  user,
  onOpen2FAModal,
}: Readonly<AdminHeaderProps>) {
  const { t, i18n } = useTranslation();
  const isHidden = isMobile && scrollDirection === 'down';

  const rawUsername = user?.user_metadata?.username;
  const rawFullName = user?.user_metadata?.full_name;
  const username =
    (typeof rawUsername === 'string' ? rawUsername : undefined) ??
    (typeof rawFullName === 'string' ? rawFullName : undefined) ??
    user?.email?.split('@')[0] ??
    'Admin';

  const rawRole = user?.user_metadata?.role;
  const role = typeof rawRole === 'string' ? rawRole : ROLES.USER;

  return (
    <header className={`admin-layout-header ${isHidden ? 'hide' : ''}`}>
      <div className="admin-header-left">
        <h2 className="admin-page-title">
          {t(`admin.headers.${activeTab}`, activeTab.replace('_', ' '))}
        </h2>
      </div>

      <div className="admin-header-right">
        <fieldset
          className="admin-lang-toggle m-0 min-w-0"
          aria-label={t('common.language_selector', 'Seleccionar idioma')}
        >
          <button
            aria-label={t('admin.lang.es', 'Cambiar idioma a español')}
            aria-pressed={i18n.language === 'es'}
            type="button"
            onClick={() => i18n.changeLanguage('es')}
            className={`lang-btn ${i18n.language === 'es' ? 'active' : ''}`}
          >
            ES
          </button>
          <button
            aria-label={t('admin.lang.en', 'Cambiar idioma a inglés')}
            aria-pressed={i18n.language === 'en'}
            type="button"
            onClick={() => i18n.changeLanguage('en')}
            className={`lang-btn ${i18n.language === 'en' ? 'active' : ''}`}
          >
            EN
          </button>
        </fieldset>

        <div className="admin-user-info-box">
          <div className="username-text">
            <div className="username-display">{username}</div>
            <button
              type="button"
              onClick={onOpen2FAModal}
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(255,255,255,0.4)',
                fontSize: '0.7rem',
                cursor: 'pointer',
                padding: 0,
                marginTop: '2px',
              }}
              className="hover:text-white"
            >
              {t('admin.verify_2fa', 'Verificar 2FA')}
            </button>
          </div>
          <UserRoleDisplay role={role} />
        </div>
      </div>
    </header>
  );
}

function AdminLoadingView({ loadingText }: Readonly<{ loadingText: string }>) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#080808',
        color: '#fff',
      }}
    >
      <Loader
        text={loadingText}
        style={{ height: 'auto', minHeight: 'auto', transform: 'scale(1.2)' }}
      />
    </div>
  );
}

function AccessDeniedView({ onNavigateHome }: Readonly<{ onNavigateHome: () => void }>) {
  const { t } = useTranslation();

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0a0a',
        color: '#ef4444',
        flexDirection: 'column',
        gap: '1rem',
        zIndex: 9999,
      }}
    >
      <Shield size={64} />
      <h1 style={{ fontSize: '2rem' }}>{t('admin.access_denied.title')}</h1>
      <p style={{ color: '#aaa' }}>{t('admin.access_denied.msg')}</p>
      <button
        type="button"
        onClick={onNavigateHome}
        className="btn-primary"
        style={{ marginTop: '1rem' }}
      >
        {t('admin.access_denied.back_home')}
      </button>
    </div>
  );
}

export default function AdminPanel() {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>(ADMIN_TABS.OVERVIEW);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < MOBILE_BREAKPOINT);
  const [sidebarOpen, setSidebarOpen] = useState(() => !isMobile);
  const scrollDirection = useScrollDirection();

  // 2FA Logic (TanStack Query)
  const { data: status2FA } = use2FAStatus();
  const [show2FAModal, setShow2FAModal] = useState(false);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Lock body scroll when sidebar is open on mobile
  useEffect(() => {
    document.body.style.overflow = isMobile && sidebarOpen ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobile, sidebarOpen]);

  useEffect(() => {
    if (!loading && user && status2FA?.enabled && !show2FAModal) {
      const adminToken = getAdminToken();
      if (!adminToken) {
        Promise.resolve().then(() => setShow2FAModal(true));
      }
    }
  }, [user, loading, status2FA, show2FAModal]);

  useEffect(() => {
    if (!loading && !user) {
      navigate(ROUTES.LOGIN);
    }
  }, [user, loading, navigate]);

  if (loading) {
    return <AdminLoadingView loadingText={t('admin.loading_panel')} />;
  }

  const isAdmin = isStaff(user);
  if (!isAdmin) {
    return <AccessDeniedView onNavigateHome={() => navigate(ROUTES.HOME)} />;
  }

  const rawAppRole = user?.app_metadata?.role;
  const appRole = typeof rawAppRole === 'string' ? rawAppRole.toLowerCase() : '';
  const hasSecureAccess = SUPER_ADMIN_ROLES.some((role) => appRole.includes(role));

  return (
    <div className="admin-layout-container">
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <button
          type="button"
          className="admin-mobile-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-label={t(CLOSE_SIDEBAR_KEY, CLOSE_SIDEBAR_DEFAULT)}
        />
      )}

      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isMobile={isMobile}
        hasSecureAccess={hasSecureAccess}
        onNavigateHome={() => navigate(ROUTES.HOME)}
        onNavigateGacha={() => navigate(ROUTES.GACHA)}
      />

      <div className="admin-layout-main">
        <AdminHeader
          activeTab={activeTab}
          isMobile={isMobile}
          scrollDirection={scrollDirection}
          user={user}
          onOpen2FAModal={() => setShow2FAModal(true)}
        />

        <main className="admin-layout-content">
          <AdminTabContent activeTab={activeTab} user={user} hasSecureAccess={hasSecureAccess} />
        </main>
      </div>

      {isMobile && (
        <AdminMobileNavbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
      )}

      <Admin2FAModal
        isOpen={show2FAModal}
        onVerified={() => setShow2FAModal(false)}
        onClose={() => navigate(ROUTES.HOME)}
      />
    </div>
  );
}
