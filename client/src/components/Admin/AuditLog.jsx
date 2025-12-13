export default function AuditLog() {
    const logs = [
        { id: 1, action: 'Banned User', details: 'Banned user TrollFace for spamming', admin: 'AdminDave', time: '12 Oct 2023, 14:30' },
        { id: 2, action: 'Updated Settings', details: 'Changed site maintenance mode to OFF', admin: 'SuperAdmin', time: '12 Oct 2023, 10:15' },
        { id: 3, action: 'Resolved Ticket', details: 'Closed ticket #T-1021', admin: 'ModSarah', time: '11 Oct 2023, 18:45' },
    ]

    return (
        <div className="admin-card">
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Actividad Reciente del Staff</h3>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                {logs.map(log => (
                    <div key={log.id} className="log-item">
                        <div className="log-time">{log.time}</div>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                                <span style={{ color: '#fff', fontWeight: '500' }}>{log.action}</span>
                                <span style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.1)', padding: '0.1rem 0.4rem', borderRadius: '4px', color: '#aaa' }}>{log.admin}</span>
                            </div>
                            <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.9rem' }}>{log.details}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
