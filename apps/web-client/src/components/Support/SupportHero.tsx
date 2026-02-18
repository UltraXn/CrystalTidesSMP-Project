import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

interface SupportHeroProps {
    isLoggedIn: boolean;
    onOpenCreateModal: () => void;
}

export default function SupportHero({ isLoggedIn, onOpenCreateModal }: SupportHeroProps) {
    const { t } = useTranslation()
    const navigate = useNavigate()

    return (
        <section className="hero-mini" style={{ 
            padding: '10rem 0 6rem', 
            background: 'radial-gradient(circle at center, rgba(12, 112, 117, 0.1) 0%, rgba(2, 1, 3, 0) 70%)',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
            <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <motion.h1 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="gradient-text" 
                    style={{ fontSize: 'clamp(2.5rem, 8vw, 4.5rem)', marginBottom: '1.5rem', fontWeight: 900, letterSpacing: '-2px' }}
                >
                    {t('support.title')}
                </motion.h1>
                <motion.p 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    style={{ color: 'var(--muted)', fontSize: '1.2rem', maxWidth: '650px', margin: '0 0 3rem', lineHeight: 1.6 }}
                >
                    {t('support.subtitle')}
                </motion.p>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap', width: '100%' }}
                >
                    <button 
                        className="nav-btn" 
                        onClick={() => isLoggedIn ? onOpenCreateModal() : navigate('/login')}
                        style={{ 
                            padding: '1rem 2.5rem', 
                            fontSize: '1.1rem', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.8rem', 
                            borderRadius: '12px',
                            textTransform: 'uppercase',
                            fontWeight: 'bold',
                            color: '#fff',
                            background: 'rgba(137, 217, 209, 0.2)',
                            border: '1px solid var(--accent)'
                         }}
                    >
                        <Plus size={18} style={{ color: 'var(--accent)' }} /> {t('support.create_ticket')}
                    </button>
                    <a 
                        href="https://discord.com/invite/TDmwYNnvyT" 
                        target="_blank" 
                        rel="noreferrer" 
                        className="nav-btn"
                        style={{ 
                            padding: '1rem 2.5rem', 
                            fontSize: '1.1rem', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.8rem', 
                            background: 'rgba(88, 101, 242, 0.2)',
                            border: '1px solid rgba(88, 101, 242, 0.5)', 
                            color: '#fff',
                            borderRadius: '12px',
                            textTransform: 'uppercase',
                            fontWeight: 'bold'
                        }}
                    >
                        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 640 512" height="20" width="20" xmlns="http://www.w3.org/2000/svg" style={{ color: '#5865F2' }}><path d="M524.531,69.836a1.5,1.5,0,0,0-.764-.7A485.065,485.065,0,0,0,404.081,32.03a1.816,1.816,0,0,0-1.923.91,337.461,337.461,0,0,0-14.9,30.6,447.848,447.848,0,0,0-134.426,0,309.541,309.541,0,0,0-15.135-30.6,1.89,1.89,0,0,0-1.924-.91A483.689,483.689,0,0,0,116.085,69.137a1.712,1.712,0,0,0-.788.676C39.068,183.651,18.186,294.69,28.43,404.354a2.016,2.016,0,0,0,.765,1.375A487.666,487.666,0,0,0,176.02,479.918a1.9,1.9,0,0,0,2.063-.676A348.2,348.2,0,0,0,208.12,430.4a1.86,1.86,0,0,0-1.019-2.588,321.173,321.173,0,0,1-45.868-21.853,1.885,1.885,0,0,1-.185-3.126c3.082-2.309,6.166-4.711,9.109-7.137a1.819,1.819,0,0,1,1.9-.256c96.229,43.917,200.41,43.917,295.5,0a1.812,1.812,0,0,1,1.924.233c2.944,2.426,6.027,4.851,9.132,7.16a1.884,1.884,0,0,1-.162,3.126,301.407,301.407,0,0,1-45.89,21.83,1.875,1.875,0,0,0-1,2.611,391.055,391.055,0,0,0,30.014,48.815,1.864,1.864,0,0,0,2.063.7A486.048,486.048,0,0,0,610.7,405.729a1.882,1.882,0,0,0,.765-1.352C623.729,277.594,590.8,167.234,524.531,69.836ZM222.491,337.58c-28.972,0-52.844-26.587-52.844-59.239S193.056,219.1,222.491,219.1c29.665,0,53.306,26.82,52.843,59.239C275.334,310.993,251.924,337.58,222.491,337.58Zm195.38,0c-28.971,0-52.843-26.587-52.843-59.239S388.437,219.1,417.871,219.1c29.667,0,53.307,26.82,52.844,59.239C470.715,310.993,447.538,337.58,417.871,337.58Z"></path></svg> {t('support.discord_btn')}
                    </a>
                </motion.div>
            </div>
        </section>
    )
}
