import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Home, Store, Menu, Gamepad2, X, Shield, MessageSquare } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useSidebar } from "../../context/SidebarContext";
import { gsap } from "gsap";
import { isAdmin } from "../../utils/roleUtils";


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

export default function MobileBottomNav() {
    const { t } = useTranslation()
    const { user } = useAuth()
    const location = useLocation()
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    
    // Check for admin role
    const userIsAdmin = isAdmin(user);

    // We can reuse the Overlay logic from the old Menu.tsx or duplicate it here.
    // For simplicity and speed, I will create a new separate Overlay component or just inline it?
    // I will write this file as 'MobileBottomNav.tsx' to avoid confusion, and then update App.tsx to use it.
    
    const avatarUrl = user ? (
        (user.user_metadata?.avatar_preference === 'social' && user.user_metadata?.avatar_url) 
            ? user.user_metadata.avatar_url 
            : `https://mc-heads.net/avatar/${user.user_metadata?.minecraft_nick || user.user_metadata?.username || 'Steve'}/128`
    ) : null;

    const profileLink = user ? '/account' : '/login';

    const { toggleSidebar } = useSidebar();
    const isAccountPage = location.pathname.startsWith('/account');

    return (
        <>
            {/* Bottom Navigation Bar */}
            <div className="fixed bottom-0 left-0 w-full bg-[#0a0a0a]/90 backdrop-blur-2xl border-t border-white/5 pb-safe z-150 lg:hidden animate-slide-up">
                <div className="flex items-center justify-around h-20 px-2 pb-2">
                    <NavLink to="/" icon={<Home size={20} />} label={t('common.home', 'Inicio')} active={location.pathname === '/'} />
                    <NavLink to="/#donors" icon={<Store size={20} />} label={t('navbar.donors', 'Tienda')} active={location.hash === '#donors'} />
                    
                    {/* Center Action Button (PFP or Status) */}
                    <div className="relative -top-6 flex flex-col items-center justify-center">
                        {user ? (
                            <Link to={profileLink} className="flex items-center justify-center w-16 h-16 rounded-full border-4 border-[#0a0a0a] bg-[#0a0a0a] shadow-xl overflow-hidden group transition-all active:scale-95">
                                 <img 
                                    src={avatarUrl} 
                                    alt="Profile" 
                                    className="w-full h-full object-cover group-hover:brightness-110 transition-all"
                                />
                            </Link>
                        ) : (
                            <Link to="/status" className="flex items-center justify-center w-14 h-14 bg-(--accent) rounded-full shadow-[0_0_20px_var(--accent-color)] text-black animate-pulse-slow border-4 border-[#0a0a0a]">
                                <Gamepad2 size={24} />
                            </Link>
                        )}
                        
                        {isAccountPage && user && (
                            <button 
                                onClick={toggleSidebar}
                                className="absolute top-18 text-[9px] font-black uppercase tracking-widest text-(--accent) bg-black/50 px-2 py-0.5 rounded-full backdrop-blur-md border border-white/10"
                            >
                                {t('navbar.account_menu', 'Cuenta')}
                            </button>
                        )}
                    </div>

                    {userIsAdmin ? (
                         <NavLink to="/admin" icon={<Shield size={20} />} label="Admin" active={location.pathname === '/admin'} />
                    ) : (
                         <NavLink to="/forum" icon={<MessageSquare size={20} />} label={t('footer.forum', 'Foro')} active={location.pathname === '/forum'} />
                    )}

                    <button 
                        onClick={() => setIsMenuOpen(true)}
                        className={`flex flex-col items-center justify-center gap-1 w-16 py-2 rounded-xl transition-all ${isMenuOpen ? 'text-(--accent)' : 'text-gray-500'}`}
                    >
                        <Menu size={20} />
                        <span className="text-[9px] font-black uppercase tracking-widest mt-1.5">Menú</span>
                    </button>
                </div>
            </div>

            {/* Reusing the Menu Overlay Logic (Inline for now to ensure it works perfect) */}
            <MenuOverlay isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
        </>
    )
}

function NavLink({ to, icon, label, active }: { to: string, icon: React.ReactNode, label: string, active: boolean }) {
    return (
        <Link 
            to={to} 
            className={`flex flex-col items-center justify-center gap-1 w-16 py-2 rounded-xl transition-all ${active ? 'text-(--accent)' : 'text-gray-500 active:scale-95'}`}
        >
            {icon}
            <span className="text-[9px] font-black uppercase tracking-widest mt-1.5">{label}</span>
        </Link>
    )
}

// ... Copying the overlay component logic from previous Menu.tsx view ...

function MenuOverlay({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const { t, i18n } = useTranslation()
    const { user } = useAuth()
    const overlayRef = useRef<HTMLDivElement>(null)
    const sidePanelRef = useRef<HTMLDivElement>(null)
    const itemsRef = useRef<(HTMLAnchorElement | HTMLDivElement)[]>([])

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
            gsap.to(overlayRef.current, { opacity: 1, duration: 0.4, display: 'block' })
            gsap.fromTo(sidePanelRef.current, 
                { x: '100%' }, 
                { x: '0%', duration: 0.6, ease: 'power4.out' }
            )
            
            if (itemsRef.current.length > 0) {
                gsap.fromTo(itemsRef.current, 
                    { x: 50, opacity: 0 }, 
                    { x: 0, opacity: 1, stagger: 0.05, duration: 0.5, delay: 0.2, ease: 'power3.out' }
                )
            }
        } else {
            document.body.style.overflow = ''
            gsap.to(sidePanelRef.current, { x: '100%', duration: 0.4, ease: 'power4.in' })
            gsap.to(overlayRef.current, { 
                opacity: 0, 
                duration: 0.4, 
                display: 'none',
                delay: 0.2
            })
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
            className="fixed inset-0 bg-[#060606]/98 backdrop-blur-2xl z-200 hidden opacity-0 overflow-hidden"
        >
             <div 
                ref={sidePanelRef}
                className="w-full h-full flex flex-col"
            >
                {/* Header inside menu */}
                <div className="h-20 px-8 flex items-center justify-between border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <img src="/images/ui/logo.webp" alt="Logo" className="w-8 h-8 object-contain" />
                        <span className="text-xl font-black uppercase tracking-tighter text-white">
                            Crystal<span className="text-(--accent)">Tides</span>
                        </span>
                    </div>
                    <button 
                        onClick={onClose}
                        className="w-11 h-11 flex items-center justify-center bg-white/5 border border-white/5 rounded-xl text-white hover:bg-white/10 active:scale-90 transition-all shadow-lg"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="flex flex-col h-[calc(100vh-80px)] overflow-y-auto px-8 py-10">
                    {/* Navigation Links */}
                    <nav className="flex flex-col gap-2 mb-12">
                        {[
                            { to: "/#rules", label: t('navbar.rules') },
                            { to: "/#donors", label: t('navbar.donors'), highlight: true },
                            { to: "/#news", label: t('navbar.news') },
                            { to: "/#suggestions", label: t('navbar.suggestions') },
                            { to: "/forum", label: t('navbar.forum') },
                            { to: "/wiki", label: t('navbar.wiki', 'Guía') },
                            { to: "/support", label: t('navbar.support', 'Soporte') },
                            { to: "/map", label: t('footer.online_map') }
                        ].map((link, idx) => (
                            <Link 
                                key={idx}
                                to={link.to} 
                                className={`flex items-center justify-between px-6 py-5 rounded-3xl transition-all group ${link.highlight ? 'bg-(--accent) text-black shadow-2xl shadow-(--accent)/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`} 
                                onClick={onClose} 
                                ref={addToRefs}
                            >
                                <span className={`text-2xl font-black uppercase tracking-widest ${link.highlight ? 'text-black' : 'text-white/80 group-hover:text-white'}`}>
                                    {link.label}
                                </span>
                                <div className={`w-8 h-px transition-all duration-500 origin-right group-hover:scale-x-150 ${link.highlight ? 'bg-black' : 'bg-white/20 group-hover:bg-(--accent)'}`} />
                            </Link>
                        ))}
                    </nav>

                    {/* Bottom Section */}
                    <div className="mt-auto space-y-8" ref={addToRefs}>
                        <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/5">
                            <button 
                                onClick={() => i18n.changeLanguage('es')} 
                                className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-xl text-xs font-black tracking-widest transition-all ${i18n.resolvedLanguage === 'es' ? 'bg-white text-black shadow-xl ring-4 ring-white/10' : 'text-gray-500 hover:text-white'}`}
                            >
                                <img src="/images/flags/es.svg" alt="ES" className="w-5 h-auto rounded-sm" />
                                ESPAÑOL
                            </button>
                            <button 
                                onClick={() => i18n.changeLanguage('en')} 
                                className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-xl text-xs font-black tracking-widest transition-all ${i18n.resolvedLanguage === 'en' ? 'bg-white text-black shadow-xl ring-4 ring-white/10' : 'text-gray-500 hover:text-white'}`}
                            >
                                <img src="/images/flags/us.svg" alt="EN" className="w-5 h-auto rounded-sm" />
                                ENGLISH
                            </button>
                        </div>
                         
                        {/* We don't show login/register buttons if we are logged in, handled by logic above */}
                        {!user && (
                             <div className="grid grid-cols-2 gap-4">
                                <Link to="/login" className="py-5 text-center text-xs font-black uppercase tracking-widest text-white bg-white/5 border border-white/10 rounded-2xl active:scale-95 transition-all" onClick={onClose}>
                                    {t('navbar.login')}
                                </Link>
                                <Link to="/register" className="py-5 text-center text-xs font-black uppercase tracking-widest text-black bg-white rounded-2xl active:scale-95 transition-all shadow-[0_10px_30px_rgba(255,255,255,0.1)]" onClick={onClose}>
                                    {t('navbar.register')}
                                </Link>
                            </div>
                        )}
                        
                        <div className="pt-8 text-center pb-10">
                            <p className="text-[10px] font-black text-gray-700 uppercase tracking-[0.3em] italic">
                                CRYSTALTIDES SMP — EXPLORE THE ABYSS
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
