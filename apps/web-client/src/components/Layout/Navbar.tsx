
import NotificationCenter from "../../components/UI/NotificationCenter"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { isAdmin as checkAdmin } from "../../utils/roleUtils"
import { Trophy, Edit, Shield, LogOut, Settings, Server, User as UserIcon, Link as LinkIcon } from "lucide-react"
import { useRef, useState, useEffect } from "react"
import { m as motion, AnimatePresence } from "framer-motion"

import { useTranslation } from 'react-i18next'
import "../../styles/layout/navbar.css"

export default function Navbar() {
    const { t, i18n } = useTranslation()
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)

    // Scroll detection
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setScrolled(true)
            } else {
                setScrolled(false)
            }
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const dropdownRef = useRef<HTMLDivElement>(null)

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng)
    }

    const closeUserDropdown = () => setDropdownOpen(false)

    const handleLogout = async () => {
        try {
            await logout()
        } catch (error) {
            console.error("Logout error:", error)
        } finally {
            setDropdownOpen(false)
            navigate('/')
        }
    }

    const location = useLocation()
    const isAdmin = checkAdmin(user)

    // Hide navbar on policy pages if requested
    if (location.pathname.startsWith('/policies')) return null;

    return (
        <header className={`fixed top-0 left-0 right-0 z-100 transition-colors duration-500 box-border ${scrolled ? 'py-2' : 'py-4'}`}>
            <div className={`mx-auto transition-colors duration-500 ${scrolled ? 'px-4 max-w-screen-2xl' : 'px-4 md:px-8 max-w-screen-2xl'}`}>
                <div className={`relative flex items-center justify-between h-14 md:h-16 px-4 md:px-8 rounded-full border border-white/5 transition-colors duration-500 ${scrolled ? 'bg-black/60 backdrop-blur-xl shadow-2xl' : 'bg-transparent'}`}>
                
                    {/* 1. Logo Section (Left) */}
                    <div className="flex items-center shrink-0">
                        <Link 
                            to="/" 
                            aria-label="CrystalTides SMP Inicio"
                            className="flex items-center gap-2 md:gap-3 group"
                        >
                            <div className="relative logo-animate-idle">
                                <motion.img
                                    src="/images/ui/logo.webp"
                                    alt="CrystalTides Logo"
                                    className="w-8 h-8 md:w-9 md:h-9 object-contain relative z-10 cursor-pointer"
                                    whileHover={{ scale: 1.25, rotate: 12 }}
                                    whileTap={{ scale: 0.95 }}
                                    transition={{ type: "spring", stiffness: 350, damping: 12 }}
                                />
                                {/* Glow */}
                                <div className="absolute inset-0 bg-(--accent)/30 blur-xl rounded-full z-0 animate-pulse" />
                            </div>
                            <span className="text-sm sm:text-lg md:text-xl font-black uppercase tracking-tight flex items-center relative">
                                <span className="brand-text-shimmer hidden xl:inline">CrystalTides</span>
                                <span className="text-gray-500 ml-1.5 text-[8px] md:text-xs opacity-50 hidden 2xl:inline">SMP</span>
                            </span>
                        </Link>
                    </div>

                    {/* 2. Navigation (Flexible Center) */}
                    <nav className="hidden lg:flex flex-1 items-center justify-center px-2 overflow-hidden min-w-0">
                        <div className="flex items-center gap-0.5 xl:gap-1.5 overflow-hidden">
                            {[
                                { to: "/rules", label: t('navbar.rules', 'REGLAS') },
                                { to: "/donors", label: t('navbar.donors', 'DONADORES') },
                                { to: "/news", label: t('navbar.news', 'NOTICIAS') },
                                { to: "/suggestions", label: t('navbar.suggestions', 'SUGERENCIAS') },
                                { to: "/forum", label: t('navbar.forum', 'FORO') },
                                { to: "/wiki", label: t('navbar.wiki', 'GUÍA') },
                                { to: "/support", label: t('navbar.support', 'SOPORTE') },
                                { to: "/map", label: t('navbar.map', 'MAPA') }
                            ].map((link) => (
                                <Link 
                                    key={link.to} 
                                    to={link.to} 
                                    className="px-1 xl:px-2.5 py-2 text-[clamp(9px,0.55vw,11.5px)] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-colors whitespace-nowrap"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </nav>

                    {/* 3. Right Actions (Right) */}
                    <div className="flex items-center gap-2 xl:gap-6 shrink-0">
                        {/* Selector de Idioma */}
                        <div className="hidden sm:flex items-center bg-black/40 p-0.5 xl:p-1 rounded-xl border border-white/5 shadow-inner box-border">
                            <button type="button"
                                onClick={() => changeLanguage('es')}
                                aria-label="Cambiar idioma a Español"
                                className={`flex items-center gap-1 xl:gap-2 px-2 xl:px-3 py-1.5 rounded-lg text-[10px] font-black transition-colors ${i18n.resolvedLanguage === 'es' ? 'bg-(--accent) text-black shadow-lg shadow-(--accent)/20' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                <img src="/images/flags/es.svg" alt="ES" className="w-4 xl:w-4.5 h-2.5 xl:h-3 object-cover rounded-[1px] shrink-0" />
                                <span className="hidden min-[1500px]:inline">ES</span>
                            </button>
                            <div className="hidden min-[1500px]:block w-px h-3 bg-white/10 mx-0.5 xl:mx-1" />
                            <button type="button"
                                onClick={() => changeLanguage('en')}
                                aria-label="Change language to English"
                                className={`flex items-center gap-1 xl:gap-2 px-2 xl:px-3 py-1.5 rounded-lg text-[10px] font-black transition-colors ${i18n.resolvedLanguage === 'en' ? 'bg-(--accent) text-black shadow-lg shadow-(--accent)/20' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                <img src="/images/flags/us.svg" alt="EN" className="w-4 xl:w-4.5 h-2.5 xl:h-3 object-cover rounded-[1px] shrink-0" />
                                <span className="hidden min-[1500px]:inline">EN</span>
                            </button>
                        </div>

                        {/* User Profile / Login */}
                        <div className="flex items-center gap-4">
                            {user ? (
                                <div className="flex items-center gap-4">
                                    <NotificationCenter />
                                    <div className="relative" ref={dropdownRef}>
                                        <button type="button"
                                            aria-label="Menú de perfil de usuario"
                                            className="flex items-center gap-3 bg-(--accent) px-4 py-2 rounded-xl cursor-pointer hover:brightness-110 active:scale-95 transition-colors shadow-lg shadow-(--accent)/20 group"
                                            onClick={() => setDropdownOpen(!dropdownOpen)}
                                        >
                                            <div className="w-6 h-6 rounded-lg overflow-hidden border border-black/10">
                                                <img 
                                                    src={(() => {
                                                        const meta = user.user_metadata || {};
                                                        const mcNick = meta.minecraft_nick || meta.username || 'steve';
                                                        return meta.avatar_preference === 'social' && meta.avatar_url 
                                                            ? meta.avatar_url 
                                                            : `https://mc-heads.net/avatar/${mcNick}/64`;
                                                    })()}
                                                    alt="Avatar" 
                                                    className="w-full h-full object-cover" 
                                                />
                                            </div>
                                            <span className="text-[11px] font-black text-black uppercase tracking-widest truncate max-w-30">
                                                {user.user_metadata?.minecraft_nick || user.user_metadata?.username || 'User'}
                                            </span>
                                        </button>

                                        <AnimatePresence>
                                            {dropdownOpen && (
                                                <motion.div
                                                    key="user-dropdown-menu"
                                                    className="absolute top-full right-0 mt-4 min-w-65 bg-[#0a0a0a] border border-white/10 rounded-4xl p-3 shadow-2xl backdrop-blur-2xl z-100 origin-top-right overflow-hidden shadow-black/80"
                                                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                                    transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
                                                >
                                                    <div className="px-4 py-4 mb-2 border-b border-white/5">
                                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none mb-1">{t('navbar.logged_in_as', 'Conectado como')}</p>
                                                        <p className="text-sm font-black text-white truncate">{user.email}</p>
                                                    </div>

                                                    <div className="space-y-1">
                                                        {[
                                                            { to: `/u/${user.user_metadata?.minecraft_nick || user.user_metadata?.username}`, icon: <UserIcon size={18} />, label: t('account.nav.profile', 'Ver Perfil') },
                                                            { to: "/account?tab=overview", icon: <Server size={18} />, label: t('account.nav.overview', 'Resumen de Cuenta') },
                                                            { to: "/account?tab=posts", icon: <Edit size={18} />, label: t('account.nav.posts', 'Mis Publicaciones') },
                                                            { to: "/account?tab=achievements", icon: <Trophy size={18} />, label: t('account.nav.achievements', 'Logros') },
                                                            { to: "/account?tab=connections", icon: <LinkIcon size={18} />, label: t('account.nav.connections', 'Cuentas Vinculadas') },
                                                            { to: "/account?tab=settings", icon: <Settings size={18} />, label: t('account.settings.title', 'Configuración') }
                                                        ].map((item) => (
                                                            <Link 
                                                                key={item.to}
                                                                to={item.to} 
                                                                className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-400 rounded-[1.25rem] hover:bg-white/5 hover:text-white group/item transition-colors" 
                                                                onClick={closeUserDropdown} 
                                                            >
                                                                <span className="text-gray-600 group-hover/item:text-(--accent) transition-colors">{item.icon}</span>
                                                                {item.label}
                                                            </Link>
                                                        ))}

                                                        {isAdmin && (
                                                            <>
                                                                <div className="h-px bg-white/5 my-2 mx-4"></div>
                                                                <Link to="/admin" className="flex items-center gap-3 px-4 py-3 text-sm font-black text-(--accent) rounded-[1.25rem] hover:bg-(--accent)/10 transition-colors" onClick={closeUserDropdown}>
                                                                    <Shield size={18} /> {t('account.admin_panel', 'Panel de Admin')}
                                                                </Link>
                                                            </>
                                                        )}

                                                        <div className="h-px bg-white/5 my-2 mx-4"></div>
                                                        <button type="button" className="w-full flex items-center gap-3 px-4 py-3 text-sm font-black text-red-500 rounded-[1.25rem] hover:bg-red-500/10 transition-colors text-left" onClick={handleLogout}>
                                                            <LogOut size={18} /> {t('account.nav.logout', 'Cerrar Sesión')}
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Link to="/login" className="px-6 py-2.5 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-white transition-colors">{t('navbar.login')}</Link>
                                    <Link to="/register" className="px-6 py-2.5 bg-white text-black text-xs font-black uppercase tracking-widest rounded-xl shadow-xl hover:bg-(--accent) hover:scale-105 active:scale-95 transition-colors">{t('navbar.register')}</Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}