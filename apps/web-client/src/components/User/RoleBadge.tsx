interface RoleBadgeProps {
    role?: string;
    username?: string;
}

export default function RoleBadge({ role, username }: RoleBadgeProps) {
    if (!role && !username) return null

    const r = role ? role.toLowerCase() : ""
    const u = username ? username.toLowerCase() : ""

    // Ranks Específicos de Owner (Killu / Neroferno)
    if (u.includes('killu') || u.includes('ultraxn') || u.includes('neroferno')) {
        if (u.includes('killu')) {
             return <img src="/ranks/rank-killu.png" alt="KILLU" style={{ verticalAlign: 'middle' }} />
        }
        if (u.includes('ultraxn') || u.includes('neroferno')) {
            return <img src="/ranks/rank-neroferno.png" alt="NEROFERNO" style={{ verticalAlign: 'middle' }} />
        }
        // Fallback para otros Owners
        return <span style={{ background: '#FFD700', color: '#000', padding: '2px 6px', fontWeight: 'bold', borderRadius: '4px', fontSize: '0.7rem' }}>OWNER</span>
    }

    // Ranks con Imágenes (Admin / Helper / Donador / User)
    if (r === 'staff') {
        return <img src="/ranks/staff.png" alt="STAFF" style={{ verticalAlign: 'middle' }} />
    }
    if (r === 'admin') {
        return <img src="/ranks/admin.png" alt="ADMIN" style={{ verticalAlign: 'middle' }} />
    }
    if (r === 'helper') {
        return <img src="/ranks/helper.png" alt="HELPER" style={{ verticalAlign: 'middle' }} />
    }
    if (r === 'donador') {
        return <img src="/ranks/donador.png" alt="DONADOR" style={{ verticalAlign: 'middle' }} />
    }
    if (r === 'developer') {
        return <img src="/ranks/developer.png" alt="DEVELOPER" style={{ verticalAlign: 'middle' }} />
    }

    // Default User
    return <img src="/ranks/user.png" alt="USUARIO" style={{ verticalAlign: 'middle' }} />
}
