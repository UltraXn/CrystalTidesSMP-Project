import { useTranslation } from 'react-i18next';

export function UserRoleBadge({ role }: { role: string }) {
    const { t } = useTranslation()
    
    interface RoleInfo { label: string; img?: string; color?: string; icon?: React.ReactNode; }
    
    const roles: Record<string, RoleInfo> = {
        neroferno: { label: t('account.roles.neroferno'), img: '/ranks/rank-neroferno.png' },
        killu: { label: t('account.roles.killu'), img: '/ranks/rank-killu.png' },
        founder: { label: t('account.roles.founder'), img: '/ranks/rank-fundador.png' },
        admin: { label: t('account.roles.admin'), img: '/ranks/admin.png' },
        staff: { label: t('account.roles.staff', 'Staff'), img: '/ranks/staff.png' },
        helper: { label: t('account.roles.helper'), img: '/ranks/helper.png' },
        donor: { label: t('account.roles.donor'), img: '/ranks/rank-donador.png' },
        user: { label: t('account.roles.user'), img: '/ranks/user.png' },
        developer: { label: t('account.roles.developer'), img: '/ranks/developer.png' }
    }
    const current = roles[role] || roles.user

    if(current.img) {
        return <img src={current.img} alt={role} title={current.label} style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }} />
    }

    return (
        <span style={{
            background: current.color || '#333',
            color: '#fff',
            padding: '4px 10px',
            borderRadius: '6px',
            fontSize: '0.7rem',
            fontWeight: '800',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}>
            {current.icon} {current.label}
        </span>
    )
}
