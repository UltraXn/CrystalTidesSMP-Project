import { FaArrowUp } from "react-icons/fa"
import { SiKofi } from "react-icons/si"
import { Link } from "react-router-dom"
import { useTranslation } from 'react-i18next'
import { useState, useEffect } from 'react'

export default function Footer() {
    const { t } = useTranslation()
    const [showScrollBtn, setShowScrollBtn] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
             // Show when scrolled > 300px
             setShowScrollBtn(window.scrollY > 300);
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        })
    }

    return (
        <footer className="site-footer">
            <div className="footer-content">
                <div className="footer-section brand-section">
                    <Link to="/" onClick={scrollToTop} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <img src="/images/ui/logo.webp" alt="CrystalTides SMP Logo" className="footer-logo" width="60" height="60" />
                        <h3 style={{ margin: 0, fontSize: '1.5rem' }}>CRYSTALTIDES SMP</h3>
                    </Link>
                    <p className="slogan">{t('footer.slogan')}</p>
                </div>

                <div className="footer-links-container">
                    <div className="footer-section">
                        <h3>{t('footer.server')}</h3>
                        <ul>
                            <li><Link to="/#rules">{t('footer.rules')}</Link></li>
                            <li><Link to="/map">{t('footer.online_map')}</Link></li>
                            <li><Link to="/support">{t('footer.support', 'Soporte')}</Link></li>
                            <li><Link to="/#suggestions">{t('footer.suggestions')}</Link></li>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h3>{t('footer.community')}</h3>
                        <ul>
                            <li><Link to="/#news">{t('footer.news')}</Link></li>
                            <li><Link to="/#contests">{t('footer.events')}</Link></li>
                            <li><Link to="/#stories">{t('footer.stories')}</Link></li>
                            <li><Link to="/forum">{t('footer.forum')}</Link></li>
                            <li><Link to="/#donors" style={{ 
                                color: 'var(--accent)', 
                                fontWeight: 'bold', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '8px' 
                            }}>
                                <SiKofi size="1.2em" />
                                <span>{t('footer.donate')}</span>
                            </Link></li>
                        </ul>
                    </div>
                </div>
            </div>

            <button 
                className={`scroll-top-btn ${showScrollBtn ? 'visible' : ''}`} 
                onClick={scrollToTop} 
                aria-label={t('footer.aria_scroll_top', 'Volver arriba')}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
                <FaArrowUp />
            </button>

            <div className="footer-bottom">
                <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginBottom: '1rem', fontSize: '0.85rem' }}>
                    <Link to="/policies/privacy" style={{ color: 'var(--muted)', textDecoration: 'none' }}>{t('footer.privacy', 'Privacidad')}</Link>
                    <Link to="/policies/tos" style={{ color: 'var(--muted)', textDecoration: 'none' }}>{t('footer.tos', 'Términos')}</Link>
                </div>
                <p>&copy; {new Date().getFullYear()} CrystalTides SMP. {t('footer.rights')}</p>
                <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', opacity: 0.8, color: 'var(--muted)', textAlign: 'center', maxWidth: '100%', padding: '0 1rem' }}>
                    NOT AN OFFICIAL MINECRAFT PRODUCT. NOT APPROVED BY OR ASSOCIATED WITH MOJANG OR MICROSOFT.
                </p>
            </div>
        </footer>
    )
}
