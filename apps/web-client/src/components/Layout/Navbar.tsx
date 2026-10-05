import type { User } from '@supabase/supabase-js';
import NotificationCenter from '../../components/UI/NotificationCenter';
import { Link, useNavigate, useLocation } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { isAdmin as checkAdmin } from '../../utils/roleUtils';
import {
  Trophy,
  Edit,
  Shield,
  LogOut,
  Settings,
  Server,
  User as UserIcon,
  Link as LinkIcon,
} from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { m as motion, AnimatePresence } from 'framer-motion';

import { useTranslation } from 'react-i18next';
import '../../styles/layout/navbar.css';

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const closeUserDropdown = () => setDropdownOpen(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setDropdownOpen(false);
      navigate('/');
    }
  };

  const location = useLocation();
  const isAdmin = checkAdmin(user);

  // Hide navbar on policy pages if requested
  if (location.pathname.startsWith('/policies')) return null;

  return (
    <header
      className={`z-100 fixed inset-x-0 top-0 box-border transition-colors duration-500 ${scrolled ? 'py-2' : 'py-4'}`}
    >
      <div
        className={`mx-auto transition-colors duration-500 ${scrolled ? 'max-w-screen-2xl px-4' : 'max-w-screen-2xl px-4 md:px-8'}`}
      >
        <div
          className={`relative flex h-14 items-center justify-between rounded-full border border-white/5 px-4 transition-colors duration-500 md:h-16 md:px-8 ${scrolled ? 'bg-black/60 shadow-2xl backdrop-blur-xl' : 'bg-transparent'}`}
        >
          {/* 1. Logo Section (Left) */}
          <div className="flex shrink-0 items-center">
            <Link
              to="/"
              aria-label="CrystalTides SMP Inicio"
              className="group flex items-center gap-2 md:gap-3"
            >
              <div className="logo-animate-idle relative">
                <motion.img
                  src="/images/ui/logo.webp"
                  alt="CrystalTides Logo"
                  className="relative z-10 size-8 cursor-pointer object-contain md:size-9"
                  whileHover={{ scale: 1.25, rotate: 12 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 12 }}
                />
                {/* Glow */}
                <div className="bg-(--accent)/30 absolute inset-0 z-0 animate-pulse rounded-full blur-xl" />
              </div>
              <span className="relative flex items-center text-sm font-black uppercase tracking-tight sm:text-lg md:text-xl">
                <span className="brand-text-shimmer hidden xl:inline">CrystalTides</span>
                <span className="ml-1.5 hidden text-[8px] text-gray-500 opacity-50 md:text-xs 2xl:inline">
                  SMP
                </span>
              </span>
            </Link>
          </div>

          {/* 2. Navigation (Flexible Center) */}
          <nav className="hidden min-w-0 flex-1 items-center justify-center overflow-hidden px-2 lg:flex">
            <div className="flex items-center gap-0.5 overflow-hidden xl:gap-1.5">
              {[
                {
                  to: '/launcher',
                  label: t('navbar.launcher', 'LAUNCHER'),
                  prefetch: () => import('../../pages/LauncherPage'),
                },
                {
                  to: '/rules',
                  label: t('navbar.rules', 'REGLAS'),
                  prefetch: () => import('../../pages/Rules'),
                },
                {
                  to: '/donors',
                  label: t('navbar.donors', 'DONADORES'),
                  prefetch: () => import('../../pages/Donors'),
                },
                {
                  to: '/news',
                  label: t('navbar.news', 'NOTICIAS'),
                  prefetch: () => import('../../pages/Blog'),
                },
                {
                  to: '/suggestions',
                  label: t('navbar.suggestions', 'SUGERENCIAS'),
                  prefetch: () => import('../../pages/Suggestions'),
                },
                {
                  to: '/forum',
                  label: t('navbar.forum', 'FORO'),
                  prefetch: () => import('../../pages/Forum'),
                },
                {
                  to: '/wiki',
                  label: t('navbar.wiki', 'GUÍA'),
                  prefetch: () => import('../../pages/Wiki'),
                },
                {
                  to: '/support',
                  label: t('navbar.support', 'SOPORTE'),
                  prefetch: () => import('../../pages/Support'),
                },
                {
                  to: '/map',
                  label: t('navbar.map', 'MAPA'),
                  prefetch: () => import('../../pages/Map'),
                },
              ].map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onMouseEnter={link.prefetch}
                  className="whitespace-nowrap px-1 py-2 text-[clamp(9px,0.55vw,11.5px)] font-black uppercase tracking-widest text-gray-400 transition-colors hover:text-white xl:px-2.5"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>

          {/* 3. Right Actions (Right) */}
          <div className="flex shrink-0 items-center gap-2 xl:gap-6">
            {/* Selector de Idioma */}
            <div className="box-border hidden items-center rounded-xl border border-white/5 bg-black/40 p-0.5 shadow-inner sm:flex xl:p-1">
              <button
                type="button"
                onClick={() => changeLanguage('es')}
                aria-label="Cambiar idioma a Español"
                className={`flex items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-black transition-colors xl:gap-2 xl:px-3 ${i18n.resolvedLanguage === 'es' ? 'bg-(--accent) shadow-(--accent)/20 text-black shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
              >
                <img
                  src="/images/flags/es.svg"
                  alt="ES"
                  className="xl:w-4.5 h-2.5 w-4 shrink-0 rounded-[1px] object-cover xl:h-3"
                />
                <span className="hidden min-[1500px]:inline">ES</span>
              </button>
              <div className="mx-0.5 hidden h-3 w-px bg-white/10 xl:mx-1 min-[1500px]:block" />
              <button
                type="button"
                onClick={() => changeLanguage('en')}
                aria-label="Change language to English"
                className={`flex items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-black transition-colors xl:gap-2 xl:px-3 ${i18n.resolvedLanguage === 'en' ? 'bg-(--accent) shadow-(--accent)/20 text-black shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
              >
                <img
                  src="/images/flags/us.svg"
                  alt="EN"
                  className="xl:w-4.5 h-2.5 w-4 shrink-0 rounded-[1px] object-cover xl:h-3"
                />
                <span className="hidden min-[1500px]:inline">EN</span>
              </button>
            </div>

            {/* User Profile / Login */}
            <div className="flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-4">
                  <NotificationCenter />
                  <UserDropdownMenu
                    user={user}
                    isAdmin={isAdmin}
                    dropdownOpen={dropdownOpen}
                    setDropdownOpen={setDropdownOpen}
                    dropdownRef={dropdownRef}
                    closeUserDropdown={closeUserDropdown}
                    handleLogout={handleLogout}
                  />
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-6 py-2.5 text-xs font-black uppercase tracking-widest text-gray-400 transition-colors hover:text-white"
                  >
                    {t('navbar.login')}
                  </Link>
                  <Link
                    to="/register"
                    className="hover:bg-(--accent) rounded-xl bg-white px-6 py-2.5 text-xs font-black uppercase tracking-widest text-black shadow-xl transition-colors hover:scale-105 active:scale-95"
                  >
                    {t('navbar.register')}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

interface UserDropdownMenuProps {
  user: User;
  isAdmin: boolean;
  dropdownOpen: boolean;
  setDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
  closeUserDropdown: () => void;
  handleLogout: () => Promise<void>;
}

function UserDropdownMenu({
  user,
  isAdmin,
  dropdownOpen,
  setDropdownOpen,
  dropdownRef,
  closeUserDropdown,
  handleLogout,
}: Readonly<UserDropdownMenuProps>) {
  const { t } = useTranslation();
  const meta = user.user_metadata || {};
  const mcNick = meta.minecraft_nick || meta.username || 'steve';
  const avatarUrl =
    meta.avatar_preference === 'social' && meta.avatar_url
      ? meta.avatar_url
      : `https://mc-heads.net/avatar/${mcNick}/64`;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        aria-label="Menú de perfil de usuario"
        className="bg-(--accent) shadow-(--accent)/20 group flex cursor-pointer items-center gap-3 rounded-xl px-4 py-2 shadow-lg transition-colors hover:brightness-110 active:scale-95"
        onClick={() => setDropdownOpen((prev) => !prev)}
      >
        <div className="size-6 overflow-hidden rounded-lg border border-black/10">
          <img src={avatarUrl} alt="Avatar" className="size-full object-cover" />
        </div>
        <span className="max-w-30 truncate text-[11px] font-black uppercase tracking-widest text-black">
          {user.user_metadata?.minecraft_nick || user.user_metadata?.username || 'User'}
        </span>
      </button>

      <AnimatePresence>
        {dropdownOpen && (
          <motion.div
            key="user-dropdown-menu"
            className="min-w-65 rounded-4xl z-100 absolute right-0 top-full mt-4 origin-top-right overflow-hidden border border-white/10 bg-[#0a0a0a] p-3 shadow-2xl shadow-black/80 backdrop-blur-2xl"
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
          >
            <div className="mb-2 border-b border-white/5 p-4">
              <p className="mb-1 text-[10px] font-black uppercase leading-none tracking-widest text-gray-500">
                {t('navbar.logged_in_as', 'Conectado como')}
              </p>
              <p className="truncate text-sm font-black text-white">{user.email}</p>
            </div>

            <div className="space-y-1">
              {[
                {
                  to: `/u/${user.user_metadata?.minecraft_nick || user.user_metadata?.username}`,
                  icon: <UserIcon size={18} />,
                  label: t('account.nav.profile', 'Ver Perfil'),
                },
                {
                  to: '/account?tab=overview',
                  icon: <Server size={18} />,
                  label: t('account.nav.overview', 'Resumen de Cuenta'),
                },
                {
                  to: '/account?tab=posts',
                  icon: <Edit size={18} />,
                  label: t('account.nav.posts', 'Mis Publicaciones'),
                },
                {
                  to: '/account?tab=achievements',
                  icon: <Trophy size={18} />,
                  label: t('account.nav.achievements', 'Logros'),
                },
                {
                  to: '/account?tab=connections',
                  icon: <LinkIcon size={18} />,
                  label: t('account.nav.connections', 'Cuentas Vinculadas'),
                },
                {
                  to: '/account?tab=settings',
                  icon: <Settings size={18} />,
                  label: t('account.settings.title', 'Configuración'),
                },
              ].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="group/item flex items-center gap-3 rounded-[1.25rem] px-4 py-3 text-sm font-bold text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
                  onClick={closeUserDropdown}
                >
                  <span className="group-hover/item:text-(--accent) text-gray-600 transition-colors">
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              ))}

              {isAdmin && (
                <>
                  <div className="mx-4 my-2 h-px bg-white/5"></div>
                  <Link
                    to="/admin"
                    className="text-(--accent) hover:bg-(--accent)/10 flex items-center gap-3 rounded-[1.25rem] px-4 py-3 text-sm font-black transition-colors"
                    onClick={closeUserDropdown}
                  >
                    <Shield size={18} /> {t('account.admin_panel', 'Panel de Admin')}
                  </Link>
                </>
              )}

              <div className="mx-4 my-2 h-px bg-white/5"></div>
              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-[1.25rem] px-4 py-3 text-left text-sm font-black text-red-500 transition-colors hover:bg-red-500/10"
                onClick={handleLogout}
              >
                <LogOut size={18} /> {t('account.nav.logout', 'Cerrar Sesión')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
