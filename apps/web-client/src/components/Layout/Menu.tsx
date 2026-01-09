
import { useState, useRef, useEffect } from 'react'
import { FaBars, FaUserCircle, FaShieldAlt } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'

export default function Menu() {
    const { t, i18n } = useTranslation()
    const { user } = useAuth()
    const [isOpen, setIsOpen] = useState(false)
    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 })
    const buttonRef = useRef<HTMLButtonElement>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const itemsRef = useRef<(HTMLAnchorElement | HTMLDivElement)[]>([])

    // Check if admin (Same logic as Navbar)
    const allowedRoles = ['admin', 'neroferno', 'killu', 'helper', 'developer', 'staff']
    const isAdmin = allowedRoles.includes(user?.user_metadata?.role?.toLowerCase())

    const toggleMenu = () => {
        if (!isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect()
            setMenuPosition({
                top: rect.bottom + 10,
                left: Math.min(rect.left, window.innerWidth - 260) // Prevent going off screen (width ~240px + padding)
            })
        }
        setIsOpen(!isOpen)
    }
    const closeMenu = () => setIsOpen(false)

    useEffect(() => {
        if (isOpen) {
            // OPEN ANIMATION
            if (dropdownRef.current) {
                gsap.killTweensOf(dropdownRef.current);
                gsap.set(dropdownRef.current, { visibility: 'visible', opacity: 1 });

                gsap.fromTo(dropdownRef.current,
                    { scale: 0.9, opacity: 0, y: 10 },
                    {
                        scale: 1,
                        opacity: 1,
                        y: 0,
                        ease: 'elastic.out(1, 0.75)',
                        duration: 0.8
                    }
                );
            }

            if (itemsRef.current.length > 0) {
                gsap.killTweensOf(itemsRef.current);
                gsap.fromTo(itemsRef.current,
                    { x: 20, opacity: 0 },
                    {
                        x: 0,
                        opacity: 1,
                        stagger: 0.05,
                        delay: 0.1,
                        ease: 'power3.out',
                        duration: 0.5
                    }
                );
            }

        } else {
            // CLOSE ANIMATION
            if (dropdownRef.current) {
                gsap.killTweensOf(dropdownRef.current);
                gsap.to(dropdownRef.current, {
                    opacity: 0,
                    y: 10,
                    scale: 0.95,
                    duration: 0.3,
                    ease: 'power2.in',
                    onComplete: () => {
                        if (dropdownRef.current) {
                            gsap.set(dropdownRef.current, { visibility: 'hidden' });
                        }
                    }
                });
            }
        }
    }, [isOpen]);

    // Helper to add refs to array
    const addToRefs = (el: HTMLAnchorElement | HTMLDivElement | null) => {
        if (el && !itemsRef.current.includes(el)) {
            itemsRef.current.push(el);
        }
    };

    return (
        <div className="menu-container">
            <button
                ref={buttonRef}
                className="menu-trigger"
                onClick={toggleMenu}
            >
                <FaBars className="menu-icon" />
                <span className="menu-text">{t('navbar.menu')}</span>
            </button>

            <div
                className="menu-dropdown"
                ref={dropdownRef}
                style={{
                    position: 'fixed',
                    top: `${menuPosition.top}px`,
                    left: `${menuPosition.left}px`,
                    width: 'calc(100vw - 40px)', // Full width minus margins
                    maxWidth: '280px', // But capped at a reasonable size
                    zIndex: 9999,
                    visibility: 'hidden', // Controlled by anime.js
                    opacity: 0,
                    maxHeight: 'calc(100vh - 100px)', // Prevent overflow
                    overflowY: 'auto'
                }}
            >
                {/* Clear refs via callback logic optimization if needed, but for now standard ref handling */}
                
                <Link to="/#rules" className="menu-item" onClick={closeMenu} ref={addToRefs}>{t('navbar.rules')}</Link>
                <Link to="/#donors" className="menu-item" style={{ color: 'var(--accent)', fontWeight: 'bold' }} onClick={closeMenu} ref={addToRefs}>{t('navbar.donors')}</Link>
                <div className="dropdown-divider"></div>
                <Link to="/#contests" className="menu-item" onClick={closeMenu} ref={addToRefs}>{t('navbar.contests')}</Link>
                <Link to="/#news" className="menu-item" onClick={closeMenu} ref={addToRefs}>{t('navbar.news')}</Link>
                <Link to="/#stories" className="menu-item" onClick={closeMenu} ref={addToRefs}>{t('navbar.stories')}</Link>
                <div className="dropdown-divider"></div>
                <Link to="/#suggestions" className="menu-item" onClick={closeMenu} ref={addToRefs}>{t('navbar.suggestions')}</Link>
                <Link to="/forum" className="menu-item" onClick={closeMenu} ref={addToRefs}>{t('navbar.forum')}</Link>
                <Link to="/wiki" className="menu-item" onClick={closeMenu} ref={addToRefs}>{t('navbar.wiki', 'Guía')}</Link>
                <Link to="/support" className="menu-item" onClick={closeMenu} ref={addToRefs}>{t('navbar.support', 'Soporte')}</Link>
                <Link to="/map" className="menu-item" onClick={closeMenu} ref={addToRefs}>{t('footer.online_map')}</Link>

                <div className="dropdown-divider"></div>
                
                {/* Mobile Auth & Lang - Visible inside menu for cleaner header */}
                <div className="menu-section-mobile" ref={addToRefs}>
                    <div className="mobile-lang-selector" style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', margin: '0.5rem 0' }}>
                         <button onClick={() => i18n.changeLanguage('es')} className={`lang-btn-mobile ${i18n.resolvedLanguage === 'es' ? 'active' : ''}`} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: i18n.resolvedLanguage === 'es' ? 1 : 0.5 }}>
                            <img src="/images/flags/es.svg" alt="ES" width="24" height="18" />
                         </button>
                         <button onClick={() => i18n.changeLanguage('en')} className={`lang-btn-mobile ${i18n.resolvedLanguage === 'en' ? 'active' : ''}`} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: i18n.resolvedLanguage === 'en' ? 1 : 0.5 }}>
                            <img src="/images/flags/us.svg" alt="EN" width="24" height="18" />
                         </button>
                    </div>

                    {!user ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <Link to="/login" className="menu-btn" onClick={closeMenu} style={{ textAlign: 'center', padding: '0.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', textDecoration: 'none', color: '#fff' }}>
                                {t('navbar.login')}
                            </Link>
                            <Link to="/register" className="menu-btn primary" onClick={closeMenu} style={{ textAlign: 'center', padding: '0.5rem', background: 'var(--accent)', borderRadius: '4px', textDecoration: 'none', color: '#000', fontWeight: 'bold' }}>
                                {t('navbar.register')}
                            </Link>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {isAdmin && (
                                <Link to="/admin" className="menu-item" onClick={closeMenu} style={{ color: '#ff6b6b', fontWeight: 'bold' }}>
                                     <FaShieldAlt style={{ marginRight: '8px' }}/> {t('account.admin_panel')}
                                </Link>
                            )}
                            <Link to="/account" className="menu-item" onClick={closeMenu}>
                                 <FaUserCircle style={{ marginRight: '8px' }}/> {(() => {
                                    const meta = user.user_metadata || {};
                                    const identities = user.identities || [];
                                    
                                    // 1. Web Nick (Full Name > Display Name > Username)
                                    if (meta.full_name) return meta.full_name;
                                    if (meta.display_name) return meta.display_name;
                                    if (meta.username) return meta.username;
                                    
                                    // 2. Discord
                                    const discord = identities.find((id) => id.provider === 'discord');
                                    if (discord?.identity_data) {
                                        const data = discord.identity_data as { 
                                            full_name?: string; 
                                            custom_claims?: { global_name?: string };
                                            name?: string;
                                            user_name?: string;
                                        };
                                        return data.full_name || 
                                               data.custom_claims?.global_name || 
                                               data.name || 
                                               data.user_name;
                                    }

                                    // 3. Twitch
                                    const twitch = identities.find((id) => id.provider === 'twitch');
                                    if (twitch?.identity_data) {
                                        const data = twitch.identity_data as {
                                            display_name?: string;
                                            full_name?: string;
                                            name?: string;
                                        };
                                        return data.display_name || 
                                               data.full_name || 
                                               data.name;
                                    }

                                    // 4. Minecraft
                                    if (meta.minecraft_nick) return meta.minecraft_nick;

                                    return user.email?.split('@')[0] || 'Mi Cuenta';
                                })()}
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
