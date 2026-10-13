import { Link, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Home, Store, Menu, Gamepad2, X, Shield, MessageSquare } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSidebar } from '../../hooks/useSidebar';
import { gsap } from 'gsap';
import { isAdmin } from '../../utils/roleUtils';

// We will render the existing Menu component (which is the overlay)
// but we need to trigger it.
// However, Menu.tsx currently has the trigger button built-in.
// Strategy: We will render Menu.tsx but hide its default trigger button with CSS or modify it.
// Better Strategy: Modify Menu.tsx to expose `toggleMenu` or accept `isOpen` prop.
// BUT, since I cannot easily change the props of Menu without breaking usage in Navbar (if kept),
// I will assume for now I will modify Navbar to remove Menu, and here I will implement the BottomNav
// and I will import Menu here?
// Actually, why not put the BottomNav logic INSIDE Menu.tsx?
// The user said "remove hamburger menu".
// So, I will REPLACE the contents of Menu.tsx with the BottomNav + Overlay logic.
// This way, wherever Menu is used (Navbar), it now renders the BottomNav (which handles its own visibility on mobile).
// WAIT. Navbar is at the top. BottomNav should be at the bottom.
// If I render BottomNav inside Navbar, it will be at the top of the DOM but fixed to bottom via CSS. This works.
// So: I will rewrite Menu.tsx to be the MobileBottomNav component + The Overlay.
// This is the cleanest path.

function getUserAvatarUrl(user: unknown): string | undefined {
  if (!user || typeof user !== 'object') return undefined;
  const meta = (user as { user_metadata?: Record<string, string> }).user_metadata;
  if (meta?.avatar_preference === 'social' && meta?.avatar_url) {
    return meta.avatar_url;
  }
  const nick = meta?.minecraft_nick ?? meta?.username ?? 'Steve';
  return `https://mc-heads.net/avatar/${nick}/128`;
}

export default function MobileBottomNav() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Check for admin role
  const userIsAdmin = isAdmin(user);

  const avatarUrl = getUserAvatarUrl(user);

  const profileLink = user ? '/account' : '/login';

  const { toggleSidebar } = useSidebar();
  const isAccountPage = location.pathname.startsWith('/account');

  return (
    <>
      {/* Bottom Navigation Bar */}
      <div className="pb-safe z-150 animate-slide-up fixed bottom-0 left-0 w-full border-t border-white/5 bg-[#0a0a0a]/90 backdrop-blur-2xl lg:hidden">
        <div className="flex h-20 items-center justify-around px-2 pb-2">
          <NavLink
            to="/"
            icon={<Home size={20} />}
            label={t('common.home', 'Inicio')}
            active={location.pathname === '/'}
          />
          <NavLink
            to="/donors"
            icon={<Store size={20} />}
            label={t('navbar.donors', 'Tienda')}
            active={location.pathname === '/donors'}
          />

          {/* Center Action Button (PFP or Status) */}
          <div className="relative -top-6 flex flex-col items-center justify-center">
            {user ? (
              <Link
                to={profileLink}
                aria-label="Ir al perfil de usuario"
                className="group flex size-16 items-center justify-center overflow-hidden rounded-full border-4 border-[#0a0a0a] bg-[#0a0a0a] shadow-xl transition-colors active:scale-95"
              >
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="size-full object-cover transition-colors group-hover:brightness-110"
                />
              </Link>
            ) : (
              <Link
                to="/status"
                aria-label="Ver estado del servidor"
                className="bg-(--accent) animate-pulse-slow flex size-14 items-center justify-center rounded-full border-4 border-[#0a0a0a] text-black shadow-[0_0_20px_var(--accent-color)]"
              >
                <Gamepad2 size={24} />
              </Link>
            )}

            {isAccountPage && user && (
              <button
                type="button"
                onClick={toggleSidebar}
                className="top-18 text-(--accent) absolute rounded-full border border-white/10 bg-black/50 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest backdrop-blur-md"
              >
                {t('navbar.account_menu', 'Cuenta')}
              </button>
            )}
          </div>

          {userIsAdmin ? (
            <NavLink
              to="/admin"
              icon={<Shield size={20} />}
              label="Admin"
              active={location.pathname === '/admin'}
            />
          ) : (
            <NavLink
              to="/forum"
              icon={<MessageSquare size={20} />}
              label={t('footer.forum', 'Foro')}
              active={location.pathname === '/forum'}
            />
          )}

          <button
            type="button"
            onClick={() => setIsMenuOpen(true)}
            aria-label="Abrir menú de navegación"
            className={`flex w-16 flex-col items-center justify-center gap-1 rounded-xl py-2 transition-colors ${isMenuOpen ? 'text-(--accent)' : 'text-gray-500'}`}
          >
            <Menu size={20} />
            <span className="mt-1.5 text-[9px] font-black uppercase tracking-widest">Menú</span>
          </button>
        </div>
      </div>

      {/* Reusing the Menu Overlay Logic (Inline for now to ensure it works perfect) */}
      <MenuOverlay isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
}

function NavLink({
  to,
  icon,
  label,
  active,
}: Readonly<{ to: string; icon: React.ReactNode; label: string; active: boolean }>) {
  return (
    <Link
      to={to}
      aria-label={label}
      className={`flex w-16 flex-col items-center justify-center gap-1 rounded-xl py-2 transition-colors ${active ? 'text-(--accent)' : 'text-gray-500 active:scale-95'}`}
    >
      {icon}
      <span className="mt-1.5 text-[9px] font-black uppercase tracking-widest">{label}</span>
    </Link>
  );
}

// ... Copying the overlay component logic from previous Menu.tsx view ...

function MenuOverlay({ isOpen, onClose }: Readonly<{ isOpen: boolean; onClose: () => void }>) {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const overlayRef = useRef<HTMLDivElement>(null);
  const sidePanelRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLAnchorElement | HTMLDivElement)[]>([]);

  useEffect(() => {
    if (!isOpen) {
      /* nosonar */
      document.body.style.overflow = '';
      gsap.to(sidePanelRef.current, { x: '100%', duration: 0.4, ease: 'power4.in' });
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.4,
        display: 'none',
        delay: 0.2,
      });
      return;
    }

    document.body.style.overflow = 'hidden';
    gsap.to(overlayRef.current, { opacity: 1, duration: 0.4, display: 'block' });
    gsap.fromTo(
      sidePanelRef.current,
      { x: '100%' },
      { x: '0%', duration: 0.6, ease: 'power4.out' },
    );

    if (itemsRef.current.length > 0) {
      gsap.fromTo(
        itemsRef.current,
        { x: 50, opacity: 0 },
        { x: 0, opacity: 1, stagger: 0.05, duration: 0.5, delay: 0.2, ease: 'power3.out' },
      );
    }
  }, [isOpen]);

  const addToRefs = (el: HTMLAnchorElement | HTMLDivElement | null) => {
    if (el && !itemsRef.current.includes(el)) {
      itemsRef.current.push(el);
    }
  };

  return (
    <div
      ref={overlayRef}
      className="bg-[#060606]/98 z-200 fixed inset-0 hidden overflow-hidden opacity-0 backdrop-blur-2xl"
    >
      <div ref={sidePanelRef} className="flex size-full flex-col">
        {/* Header inside menu */}
        <div className="flex h-20 items-center justify-between border-b border-white/5 px-8">
          <div className="flex items-center gap-3">
            <img src="/images/ui/logo.webp" alt="Logo" className="size-8 object-contain" />
            <span className="text-xl font-black uppercase tracking-tighter text-white">
              Crystal<span className="text-(--accent)">Tides</span>
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar menú"
            className="flex size-11 items-center justify-center rounded-xl border border-white/5 bg-white/5 text-white shadow-lg transition-colors hover:bg-white/10 active:scale-90"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex h-[calc(100vh-80px)] flex-col overflow-y-auto px-8 py-10">
          {/* Navigation Links */}
          <nav className="mb-12 flex flex-col gap-2">
            {[
              { to: '/rules', label: t('navbar.rules') },
              { to: '/donors', label: t('navbar.donors'), highlight: true },
              { to: '/news', label: t('navbar.news') },
              { to: '/suggestions', label: t('navbar.suggestions') },
              { to: '/forum', label: t('navbar.forum') },
              { to: '/wiki', label: t('navbar.wiki', 'Guía') },
              { to: '/support', label: t('navbar.support', 'Soporte') },
              { to: '/map', label: t('navbar.map') },
            ].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`group flex items-center justify-between rounded-3xl px-6 py-5 transition-colors ${link.highlight ? 'bg-(--accent) shadow-(--accent)/20 text-black shadow-2xl' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                onClick={onClose}
                ref={addToRefs}
              >
                <span
                  className={`text-2xl font-black uppercase tracking-widest ${link.highlight ? 'text-black' : 'text-white/80 group-hover:text-white'}`}
                >
                  {link.label}
                </span>
                <div
                  className={`h-px w-8 origin-right transition-colors duration-500 group-hover:scale-x-150 ${link.highlight ? 'bg-black' : 'group-hover:bg-(--accent) bg-white/20'}`}
                />
              </Link>
            ))}
          </nav>

          {/* Bottom Section */}
          <div className="mt-auto space-y-8" ref={addToRefs}>
            <div className="flex items-center gap-4 rounded-2xl border border-white/5 bg-white/5 p-2">
              <button
                aria-label={t('common.change_language_es', 'Cambiar idioma a Español')}
                type="button"
                onClick={() => i18n.changeLanguage('es')}
                className={`flex flex-1 items-center justify-center gap-3 rounded-xl py-4 text-xs font-black tracking-widest transition-colors ${i18n.resolvedLanguage === 'es' ? 'bg-white text-black shadow-xl ring-4 ring-white/10' : 'text-gray-500 hover:text-white'}`}
              >
                <img src="/images/flags/es.svg" alt="ES" className="h-auto w-5 rounded-sm" />
                <span>ESPAÑOL</span>
              </button>
              <button
                aria-label={t('common.change_language_en', 'Switch language to English')}
                type="button"
                onClick={() => i18n.changeLanguage('en')}
                className={`flex flex-1 items-center justify-center gap-3 rounded-xl py-4 text-xs font-black tracking-widest transition-colors ${i18n.resolvedLanguage === 'en' ? 'bg-white text-black shadow-xl ring-4 ring-white/10' : 'text-gray-500 hover:text-white'}`}
              >
                <img src="/images/flags/us.svg" alt="EN" className="h-auto w-5 rounded-sm" />
                <span>ENGLISH</span>
              </button>
            </div>

            {/* We don't show login/register buttons if we are logged in, handled by logic above */}
            {!user && (
              <div className="grid grid-cols-2 gap-4">
                <Link
                  to="/login"
                  className="rounded-2xl border border-white/10 bg-white/5 py-5 text-center text-xs font-black uppercase tracking-widest text-white transition-colors active:scale-95"
                  onClick={onClose}
                >
                  {t('navbar.login')}
                </Link>
                <Link
                  to="/register"
                  className="rounded-2xl bg-white py-5 text-center text-xs font-black uppercase tracking-widest text-black shadow-[0_10px_30px_rgba(255,255,255,0.1)] transition-colors active:scale-95"
                  onClick={onClose}
                >
                  {t('navbar.register')}
                </Link>
              </div>
            )}

            <div className="pb-10 pt-8 text-center">
              <p className="text-[10px] font-black uppercase italic tracking-[0.3em] text-gray-400">
                CRYSTALTIDES SMP — EXPLORE THE ABYSS
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
