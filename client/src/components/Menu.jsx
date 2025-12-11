import { useState, useRef, useEffect } from 'react'
import { FaBars } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import anime from 'animejs/lib/anime.es.js'

export default function Menu() {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef(null)
    const itemsRef = useRef([])

    const toggleMenu = () => setIsOpen(!isOpen)
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
                className="menu-trigger"
                onClick={toggleMenu}
            >
                <FaBars className="menu-icon" />
                <span className="menu-text">MENU</span>
            </button>

            <div
                className="menu-dropdown"
                ref={dropdownRef}
            >
                <Link to="/account" className="menu-item" onClick={closeMenu} ref={addToRefs}>Cuenta</Link>

                <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '0.5rem 0' }} ref={addToRefs}></div>

                <Link to="/#rules" className="menu-item" onClick={closeMenu} ref={addToRefs}>Reglas</Link>
                <Link to="/#donors" className="menu-item" onClick={closeMenu} ref={addToRefs}>Donadores</Link>

                <div
                    style={{ padding: '0.5rem 1rem 0.2rem', fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '0.5rem' }}
                    ref={addToRefs}
                >
                    Sobre el Servidor
                </div>
                <Link to="/#news" className="menu-item" onClick={closeMenu} ref={addToRefs}>Noticias</Link>
                <Link to="/#contests" className="menu-item" onClick={closeMenu} ref={addToRefs}>Eventos</Link>
                <Link to="/#stories" className="menu-item" onClick={closeMenu} ref={addToRefs}>Historias</Link>
            </div>
        </div>
    )
}
