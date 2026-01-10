import { useState, useRef, useEffect } from 'react'
import { UserCircle2, Shield, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import { isAdmin as checkAdmin } from '../../utils/roleUtils'

export default function Menu() {
    const { t, i18n } = useTranslation()
    const { user } = useAuth()
    const [isOpen, setIsOpen] = useState(false)
    const buttonRef = useRef<HTMLButtonElement>(null)
    const overlayRef = useRef<HTMLDivElement>(null)
    const sidePanelRef = useRef<HTMLDivElement>(null)
    const itemsRef = useRef<(HTMLAnchorElement | HTMLDivElement)[]>([])

    const isAdmin = checkAdmin(user)

    const toggleMenu = () => setIsOpen(!isOpen)
    const closeMenu = () => setIsOpen(false)

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
        <>
            <button
                ref={buttonRef}
                className="flex items-center justify-center w-11 h-11 bg-white/5 border border-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-all text-white group active:scale-95"
                onClick={toggleMenu}
                aria-label="Open Menu"
            >
                <div className="flex flex-col gap-1.5 items-end">
                    <span className="w-6 h-0.5 bg-white rounded-full transition-all group-hover:w-8" />
                    <span className="w-8 h-0.5 bg-(--accent) rounded-full shadow-[0_0_10px_var(--accent-color)]" />
                    <span className="w-5 h-0.5 bg-white rounded-full transition-all group-hover:w-8" />
                </div>
            </button>

            {/* Full Screen Menu */}
            <div 
                ref={overlayRef}
                className="fixed inset-0 bg-[#060606]/98 backdrop-blur-2xl z-200 hidden opacity-0 overflow-hidden"
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
                        onClick={closeMenu}
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
                                onClick={closeMenu} 
                                ref={addToRefs}
                            >
                                <span className={`text-2xl font-black uppercase tracking-widest ${link.highlight ? 'text-black' : 'text-white/80 group-hover:text-white'}`}>
                                    {link.label}
                                </span>
                                <div className={`w-8 h-px transition-all duration-500 origin-right group-hover:scale-x-150 ${link.highlight ? 'bg-black' : 'bg-white/20 group-hover:bg-(--accent)'}`} />
                            </Link>
                        ))}
                    </nav>

                    {/* Bottom Section: Language & User */}
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

                        {!user ? (
                            <div className="grid grid-cols-2 gap-4">
                                <Link to="/login" className="py-5 text-center text-xs font-black uppercase tracking-widest text-white bg-white/5 border border-white/10 rounded-2xl active:scale-95 transition-all" onClick={closeMenu}>
                                    {t('navbar.login')}
                                </Link>
                                <Link to="/register" className="py-5 text-center text-xs font-black uppercase tracking-widest text-black bg-white rounded-2xl active:scale-95 transition-all shadow-[0_10px_30px_rgba(255,255,255,0.1)]" onClick={closeMenu}>
                                    {t('navbar.register')}
                                </Link>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                <Link to="/account" className="flex items-center justify-between w-full p-4 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 transition-all group" onClick={closeMenu}>
                                     <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-(--accent) rounded-xl flex items-center justify-center text-black">
                                            <UserCircle2 size={24} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none mb-1">Tu Cuenta</span>
                                            <span className="text-sm font-black text-white">{user.user_metadata?.minecraft_nick || user.email}</span>
                                        </div>
                                     </div>
                                     <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-gray-400 group-hover:text-(--accent) group-hover:border-(--accent)/50 transition-all">
                                        →
                                     </div>
                                </Link>
                                {isAdmin && (
                                    <Link to="/admin" className="flex items-center justify-center gap-3 w-full py-5 text-center text-xs font-black uppercase tracking-widest text-black bg-(--accent) rounded-2xl hover:scale-105 transition-all shadow-xl shadow-(--accent)/20" onClick={closeMenu}>
                                         <Shield size={18} /> {t('account.admin_panel')}
                                    </Link>
                                )}
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
        </>
    )
}
