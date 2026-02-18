import { AlertCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

export default function SupportLoginPrompt() {
    const { t } = useTranslation()

    return (
        <div className="login-prompt" style={{
            background: 'rgba(231, 76, 60, 0.1)',
            border: '1px solid rgba(231, 76, 60, 0.2)',
            padding: '1.5rem',
            borderRadius: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '2rem'
        }}>
            <AlertCircle style={{ color: '#e74c3c' }} size={24} />
            <div>
                <h4 style={{ margin: 0 }}>{t('support.login_required')}</h4>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--muted)' }}>{t('support.login_hint')}</p>
            </div>
            <Link to="/login" className="nav-btn primary" style={{ marginLeft: 'auto' }}>{t('login.submit')}</Link>
        </div>
    )
}
