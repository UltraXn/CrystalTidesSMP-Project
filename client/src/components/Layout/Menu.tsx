
import { useState, useRef, useEffect } from 'react'
import { FaBars, FaUserCircle, FaShieldAlt } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import anime from 'animejs'
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
    const allowedRoles = ['admin', 'neroferno', 'killu', 'helper', 'owner', 'founder']
    const isAdmin = allowedRoles.includes(user?.user_metadata?.role)

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
            anime.remove(dropdownRef.current);
            anime.remove(itemsRef.current);

            anime.set(dropdownRef.current, { visibility: 'visible', opacity: 1 });

            anime({
                targets: dropdownRef.current,
                scale: [0.9, 1],
                opacity: [0, 1],
                translateY: [10, 0],
                easing: 'spring(1, 80, 10, 0)',
                duration: 600
            });

            anime({
                targets: itemsRef.current,
                translateX: [20, 0],
                opacity: [0, 1],
                delay: anime.stagger(100, { start: 100 }),
                easing: 'easeOutExpo'
            });

        } else {
            // CLOSE ANIMATION only if we have rendered at least once (ref exists)
            if (dropdownRef.current) {
                anime.remove(dropdownRef.current);
                anime.remove(itemsRef.current);

                anime({
                    targets: dropdownRef.current,
                    opacity: 0,
                    translateY: 10,
                    duration: 200,
                    easing: 'easeInQuad',
                    complete: () => {
                        if (!isOpen && dropdownRef.current) { // check isOpen again to prevent race condition
                            anime.set(dropdownRef.current, { visibility: 'hidden' });
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
                    width: '240px',
                    zIndex: 9999,
                    visibility: 'hidden', // Controlled by anime.js
                    opacity: 0
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
                <Link to="/map" className="menu-item" onClick={closeMenu} ref={addToRefs}>{t('footer.online_map')}</Link>

                <div className="dropdown-divider"></div>
                
                {/* Mobile Auth & Lang - Visible inside menu for cleaner header */}
                <div className="menu-section-mobile" ref={addToRefs}>
                    <div className="mobile-lang-selector" style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
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
                            <Link to="/account" className="menu-item" onClick={closeMenu} style={{ color: 'var(--accent)' }}>
                                 <FaUserCircle style={{ marginRight: '8px' }}/> {user.user_metadata?.username || 'Mi Cuenta'}
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
