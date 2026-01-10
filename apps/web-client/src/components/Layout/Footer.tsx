import { ArrowUp } from "lucide-react"
import { Link } from "react-router-dom"
import { useTranslation } from 'react-i18next'
import { useState, useEffect } from 'react'

export default function Footer() {
    const { t } = useTranslation()
    const [showScrollBtn, setShowScrollBtn] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
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
        <footer className="w-full bg-[#050505] border-t border-white/5 pt-32 pb-16 relative overflow-hidden">
            <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 mb-24 relative z-10">
                <div className="flex flex-col gap-8 items-start text-left">
                    <Link to="/" onClick={scrollToTop} className="flex items-center gap-5 group no-underline">
                        <img 
                            src="/images/ui/logo.webp" 
                            alt="Logo" 
                            className="w-16 h-16 object-contain transition-all group-hover:scale-110 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] animate-jump" 
                        />
                        <h3 className="text-3xl font-black uppercase tracking-tighter text-white">
                            Crystal<span className="text-(--accent)">Tides</span> SMP
                        </h3>
                    </Link>
                    <p className="text-gray-400 max-w-md leading-relaxed text-lg font-medium">
                        {t('footer.slogan')}
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-16 text-left">
                    <div className="flex flex-col gap-8">
                        <h4 className="text-white text-xs font-black uppercase tracking-[0.3em] opacity-30">{t('footer.server')}</h4>
                        <ul className="flex flex-col gap-5 list-none">
                            <li><Link to="/#rules" className="text-gray-400 hover:text-white hover:translate-x-1 inline-block transition-all">{t('footer.rules')}</Link></li>
                            <li><Link to="/map" className="text-gray-400 hover:text-white hover:translate-x-1 inline-block transition-all">{t('footer.online_map')}</Link></li>
                            <li><Link to="/support" className="text-gray-400 hover:text-white hover:translate-x-1 inline-block transition-all">{t('footer.support', 'Soporte')}</Link></li>
                            <li><Link to="/#suggestions" className="text-gray-400 hover:text-white hover:translate-x-1 inline-block transition-all">{t('footer.suggestions')}</Link></li>
                        </ul>
                    </div>

                    <div className="flex flex-col gap-8">
                        <h4 className="text-white text-xs font-black uppercase tracking-[0.3em] opacity-30">{t('footer.community')}</h4>
                        <ul className="flex flex-col gap-5 list-none">
                            <li><Link to="/#news" className="text-gray-400 hover:text-white hover:translate-x-1 inline-block transition-all">{t('footer.news')}</Link></li>
                            <li><Link to="/#contests" className="text-gray-400 hover:text-white hover:translate-x-1 inline-block transition-all">{t('footer.events')}</Link></li>
                            <li><Link to="/#stories" className="text-gray-400 hover:text-white hover:translate-x-1 inline-block transition-all">{t('footer.stories')}</Link></li>
                            <li><Link to="/forum" className="text-gray-400 hover:text-white hover:translate-x-1 inline-block transition-all">{t('footer.forum')}</Link></li>
                            <li>
                                <Link to="/#donors" className="flex items-center justify-start gap-3 font-black text-(--accent) hover:scale-105 transition-all group/kofi">
                                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" role="img" viewBox="0 0 24 24" height="20" width="20" xmlns="http://www.w3.org/2000/svg" className="group-hover/kofi:rotate-12 transition-transform"><path d="M23.881 8.948c-.773-4.085-4.859-4.593-4.859-4.593H.723c-.604 0-.679.798-.679.798s-.082 7.324-.022 11.822c.164 2.424 2.586 2.672 2.586 2.672s8.267-.023 11.966-.049c2.438-.426 2.683-2.566 2.658-3.734 4.352.24 7.422-2.831 6.649-6.916zm-11.062 3.511c-1.47 2.453-3.954 3.8-6.535 3.702-2.947-.112-4.9-2.277-5.568-3.692-.14-.298.118-.635.421-.555h.002C1.986 12.158 5.7 12.96 6.307 9.074c.063-.404.653-.357.575.056-.47 2.492-2.716 3.029-2.716 3.029s3.076.657 5.09-1.996c.211-.277.653-.162.686.196.069.754.269 1.761 1.096 2.479.294.254.673-.021.503-.353-.453-.889-.607-1.874-.46-2.505.064-.268.487-.245.485.064-.002 1.488.796 2.217.796 2.217.204.184.456-.03.353-.263-.807-1.832-1.285-4.226.79-5.185.341-.157.533.329.215.539-1.636 1.082-.953 2.916-.807 3.336.14.404.686.327.697-.101.031-1.282.915-1.956.915-1.956.12-.093.267.042.19.168-.692 1.139-.77 2.55-.306 3.659.138.33.565.313.626-.062zM16.2 13.812c.504 0 .87-.803 1.127-1.579.296-.895.044-1.714-.627-1.714-.67 0-1.24.819-1.536 1.714-.296.895.044 1.579.518 1.579.172 0 .341-.027.518-.027zm6.756-1.581c-.538 3.513-3.619 3.238-3.619 3.238-1.551.139-1.652-2.316-1.652-2.576 0-1.873.968-4.244 1.905-5.281 1.156-.164.846-1.076.846-1.076s4.045.242 2.52 5.695z"></path></svg>
                                    <span className="uppercase tracking-widest text-sm">{t('footer.donate')}</span>
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <button 
                className={`fixed bottom-8 right-8 w-14 h-14 bg-white text-black rounded-2xl shadow-2xl hidden lg:flex items-center justify-center text-xl cursor-pointer hover:scale-110 hover:-translate-y-2 active:scale-95 transition-all z-40 ${showScrollBtn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}  
                onClick={scrollToTop} 
                aria-label={t('footer.aria_scroll_top', 'Volver arriba')}
            >
                <ArrowUp />
            </button>

            <div className="max-w-[1400px] mx-auto px-6 pt-16 border-t border-white/5 flex flex-col items-center gap-8">
                <div className="flex gap-8 justify-center text-[10px] font-black uppercase tracking-[0.2em]">
                    <Link to="/policies/privacy" className="text-gray-500 hover:text-white transition-colors">{t('footer.privacy', 'Privacidad')}</Link>
                    <Link to="/policies/tos" className="text-gray-500 hover:text-white transition-colors">{t('footer.tos', 'Términos')}</Link>
                </div>
                <div className="text-center">
                    <p className="text-gray-600 text-[11px] font-bold uppercase tracking-widest mb-3">&copy; {new Date().getFullYear()} CrystalTides SMP. {t('footer.rights')}</p>
                    <p className="text-[9px] uppercase tracking-[0.2em] text-gray-700 max-w-3xl mx-auto leading-loose font-black">
                        NOT AN OFFICIAL MINECRAFT PRODUCT. NOT APPROVED BY OR ASSOCIATED WITH MOJANG OR MICROSOFT.
                    </p>
                </div>
            </div>

            {/* Background Decorations */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-(--accent)/5 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-sky-500/5 rounded-full blur-[100px] pointer-events-none"></div>
        </footer>
    )
}
