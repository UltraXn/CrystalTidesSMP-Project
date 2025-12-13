export default function UsersManager() {
    const mockUsers = [
        { id: 1, name: 'SteveMaster', email: 'steve@mail.com', role: 'Usuario', status: 'Active' },
        { id: 2, name: 'AlexGamer', email: 'alex@mail.com', role: 'VIP', status: 'Active' },
        { id: 3, name: 'TrollFace', email: 'troll@mail.com', role: 'Usuario', status: 'Banned' },
        { id: 4, name: 'AdminDave', email: 'dave@admin.com', role: 'Admin', status: 'Active' },
    ]

    return (
        <div className="admin-card">
            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Usuario</th>
                            <th>Email</th>
                            <th>Rol Web</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mockUsers.map(u => (
                            <tr key={u.id}>
                                <td style={{ fontWeight: '500', color: '#fff' }}>{u.name}</td>
                                <td style={{ color: '#888' }}>{u.email}</td>
                                <td>
                                    <span style={{
                                        padding: '0.2rem 0.5rem',
                                        borderRadius: '4px',
                                        background: u.role === 'Admin' ? 'rgba(109, 165, 192, 0.2)' : 'rgba(255,255,255,0.05)',
                                        color: u.role === 'Admin' ? 'var(--accent)' : '#aaa',
                                        fontSize: '0.8rem',
                                        fontWeight: '500'
                                    }}>
                                        {u.role}
                                    </span>
                                </td>
                                <td>
                                    <span className={`status-chip ${u.status === 'Active' ? 'active' : 'banned'}`}>
                                        {u.status === 'Active' ? 'Activo' : 'Baneado'}
                                    </span>
                                </td>
                                <td>
                                    <button style={{ background: 'transparent', border: '1px solid #444', color: '#ccc', cursor: 'pointer', padding: '0.3rem 0.8rem', borderRadius: '4px', fontSize: '0.8rem', transition: 'all 0.2s' }}>Editar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
