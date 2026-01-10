
import NotificationCenter from "../../components/UI/NotificationCenter"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { isAdmin as checkAdmin } from "../../utils/roleUtils"
import { Trophy, Edit, Shield, LogOut, Settings, Server, Link as LinkIcon } from "lucide-react"
import { useRef, useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

import { useTranslation } from 'react-i18next'

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
        <header className={`fixed top-0 left-0 w-full z-100 transition-all duration-500 ${scrolled ? 'bg-black/90 backdrop-blur-xl border-b border-white/5 shadow-2xl py-2' : 'bg-transparent py-4'}`}>
            <div className="w-full px-8 h-16 flex items-center relative">
                
                {/* 1. Logo Section (Left) */}
                <div className="flex items-center">
                    <Link 
                        to="/" 
                        className="flex items-center gap-3 group"
                    >
                        <motion.img
                            src="/images/ui/logo.webp"
                            alt="CrystalTides Logo"
                            className="w-9 h-9 object-contain"
                            whileHover={{ y: -5 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        />
                        <span className="text-xl font-black uppercase tracking-tighter text-white group-hover:text-(--accent) transition-colors hidden 2xl:flex items-center">
                            <span>Crystal</span>
                            <span className="text-(--accent)">Tides</span> 
                            <span className="text-gray-500 ml-2">SMP</span>
                        </span>
                    </Link>
                </div>

                {/* 2. Desktop Navigation (Centered Absolutely) */}
                <nav className="hidden xl:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
                    {[
                        { to: "/#rules", label: t('navbar.rules') },
                        { to: "/#donors", label: t('navbar.donors') },
                        { to: "/#news", label: t('navbar.news') },
                        { to: "/#suggestions", label: t('navbar.suggestions') },
                        { to: "/forum", label: t('navbar.forum') },
                        { to: "/wiki", label: t('navbar.wiki', 'Guía') },
                        { to: "/support", label: t('navbar.support', 'Soporte') },
                        { to: "/map", label: t('footer.online_map') }
                    ].map((link) => (
                        <Link 
                            key={link.to} 
                            to={link.to} 
                            className="px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-white transition-all whitespace-nowrap"
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                {/* 3. Right Actions (Right) */}
                <div className="ml-auto flex items-center gap-6">
                    {/* Selector de Idioma */}
                    <div className="hidden lg:flex items-center bg-black/40 p-1 rounded-xl border border-white/5 shadow-inner box-border">
                        <button
                            onClick={() => changeLanguage('es')}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${i18n.resolvedLanguage === 'es' ? 'bg-(--accent) text-black shadow-lg shadow-(--accent)/20' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            <img src="/images/flags/es.svg" alt="ES" className="w-4 h-[10px] object-cover rounded-[1px] shrink-0" />
                            ES
                        </button>
                        <div className="w-px h-3 bg-white/10 mx-1" />
                        <button
                            onClick={() => changeLanguage('en')}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${i18n.resolvedLanguage === 'en' ? 'bg-(--accent) text-black shadow-lg shadow-(--accent)/20' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            <img src="/images/flags/us.svg" alt="EN" className="w-4 h-[10px] object-cover rounded-[1px] shrink-0" />
                            EN
                        </button>
                    </div>

                    {/* User Profile / Login */}
                    <div className="flex items-center gap-4">
                        {user ? (
                            <div className="flex items-center gap-4">
                                <NotificationCenter />
                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        className="flex items-center gap-3 bg-(--accent) px-4 py-2 rounded-xl cursor-pointer hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-(--accent)/20 group"
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
                                        <span className="text-[11px] font-black text-black uppercase tracking-widest truncate max-w-[120px]">
                                            {user.user_metadata?.minecraft_nick || user.user_metadata?.username || 'User'}
                                        </span>
                                    </button>

                                    {/* Dropdown Menu */}
                                    <AnimatePresence>
                                        {dropdownOpen && (
                                            <motion.div
                                                className="absolute top-full right-0 mt-4 min-w-[260px] bg-[#0a0a0a] border border-white/10 rounded-4xl p-3 shadow-2xl backdrop-blur-2xl z-100 origin-top-right overflow-hidden shadow-black/80"
                                                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                                transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
                                            >
                                                <div className="px-4 py-4 mb-2 border-b border-white/5">
                                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none mb-1">Conectado como</p>
                                                    <p className="text-sm font-black text-white truncate">{user.email}</p>
                                                </div>

                                                <div className="space-y-1">
                                                    {[
                                                        { to: "/account?tab=overview", icon: <Server size={18} />, label: t('account.nav.overview') },
                                                        { to: "/account?tab=posts", icon: <Edit size={18} />, label: t('account.nav.posts') },
                                                        { to: "/account?tab=achievements", icon: <Trophy size={18} />, label: t('navbar.achievements') },
                                                        { to: "/account?tab=connections", icon: <LinkIcon size={18} />, label: t('account.nav.connections') },
                                                        { to: "/account?tab=settings", icon: <Settings size={18} />, label: t('account.settings.title') }
                                                    ].map((item, idx) => (
                                                        <Link 
                                                            key={idx}
                                                            to={item.to} 
                                                            className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-400 rounded-[1.25rem] hover:bg-white/5 hover:text-white group/item transition-all" 
                                                            onClick={closeUserDropdown} 
                                                        >
                                                            <span className="text-gray-600 group-hover/item:text-(--accent) transition-colors">{item.icon}</span>
                                                            {item.label}
                                                        </Link>
                                                    ))}

                                                    {isAdmin && (
                                                        <>
                                                            <div className="h-px bg-white/5 my-2 mx-4"></div>
                                                            <Link to="/admin" className="flex items-center gap-3 px-4 py-3 text-sm font-black text-(--accent) rounded-[1.25rem] hover:bg-(--accent)/10 transition-all" onClick={closeUserDropdown}>
                                                                <Shield size={18} /> {t('account.admin_panel')}
                                                            </Link>
                                                        </>
                                                    )}

                                                    <div className="h-px bg-white/5 my-2 mx-4"></div>
                                                    <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-black text-red-500 rounded-[1.25rem] hover:bg-red-500/10 transition-all text-left" onClick={handleLogout}>
                                                        <LogOut size={18} /> {t('account.nav.logout')}
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
                                <Link to="/register" className="px-6 py-2.5 bg-white text-black text-xs font-black uppercase tracking-widest rounded-xl shadow-xl hover:bg-(--accent) hover:scale-105 active:scale-95 transition-all">{t('navbar.register')}</Link>
                            </div>
                        )}
                        

                    </div>
                </div>
            </div>
        </header>
    )
}