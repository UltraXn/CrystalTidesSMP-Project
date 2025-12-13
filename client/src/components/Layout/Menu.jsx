
import { useState, useRef, useEffect } from 'react'
import { FaBars } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import anime from 'animejs'
import { useTranslation } from 'react-i18next'

export default function Menu() {
    const { t } = useTranslation()
    const [isOpen, setIsOpen] = useState(false)
    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 })
    const buttonRef = useRef(null)
    const dropdownRef = useRef(null)
    const itemsRef = useRef([])

    const toggleMenu = () => {
        if (!isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect()
            setMenuPosition({
                top: rect.bottom,
                left: rect.left
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
    const addToRefs = (el) => {
        if (el && !itemsRef.current.includes(el)) {
            itemsRef.current.push(el);
        }
    };

    // Clear refs on render to avoid duplicates re-render issue
    itemsRef.current = [];

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
                <div ref={addToRefs}></div>

                <Link to="/#rules" className="menu-item" onClick={closeMenu} ref={addToRefs}>{t('navbar.rules')}</Link>
                <Link to="/#donors" className="menu-item" style={{ color: 'var(--accent)', fontWeight: 'bold' }} onClick={closeMenu} ref={addToRefs}>{t('navbar.donors')} 💎</Link>
                <Link to="/#contests" className="menu-item" onClick={closeMenu} ref={addToRefs}>{t('navbar.contests')}</Link>
                <Link to="/#news" className="menu-item" onClick={closeMenu} ref={addToRefs}>{t('navbar.news')}</Link>
                <Link to="/#stories" className="menu-item" onClick={closeMenu} ref={addToRefs}>{t('navbar.stories')}</Link>
                <Link to="/#suggestions" className="menu-item" onClick={closeMenu} ref={addToRefs}>{t('navbar.suggestions')}</Link>
                <Link to="/forum" className="menu-item" onClick={closeMenu} ref={addToRefs}>{t('navbar.forum')} 💬</Link>
                <Link to="/map" className="menu-item" onClick={closeMenu} ref={addToRefs}>{t('footer.online_map')} 🗺️</Link>
            </div>
        </div>
    )
}
