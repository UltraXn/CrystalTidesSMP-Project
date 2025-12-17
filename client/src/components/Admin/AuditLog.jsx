import { useState, useEffect, useCallback } from "react"
import { FaGlobe, FaGamepad, FaSpinner, FaUser, FaServer } from "react-icons/fa"

const API_URL = import.meta.env.VITE_API_URL

export default function AuditLog() {
    const [logs, setLogs] = useState([])
    const [loading, setLoading] = useState(true)
    const [filterSource, setFilterSource] = useState('all') // 'all', 'web', 'game'
    const [page, setPage] = useState(1)
    const [limit] = useState(50) // Increased limit to enable scrolling
    const [totalPages, setTotalPages] = useState(1)

    const [search, setSearch] = useState('')
    const [searchTerm, setSearchTerm] = useState('')

    // Debounce search
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            setSearchTerm(search)
            setPage(1)
        }, 500)
        return () => clearTimeout(delayDebounceFn)
    }, [search])

    const fetchLogs = useCallback(async () => {
        setLoading(true)
        try {
            let fetchedLogs = [];
            let total = 0;

            if (filterSource === 'all') {
                // Fetch both in parallel
                const [resWeb, resGame] = await Promise.all([
                    fetch(`${API_URL}/logs?limit=${limit}&page=${page}&source=web&search=${searchTerm}`),
                    fetch(`${API_URL}/logs/commands?limit=${limit}&page=${page}&search=${searchTerm}`)
                ]);

                const dataWeb = resWeb.ok ? await resWeb.json() : { logs: [], total: 0 };
                const dataGame = resGame.ok ? await resGame.json() : { data: [], total: 0 };

                // Normalize Game Logs
                const gameLogs = (dataGame.data || []).map((log, index) => ({
                    id: `cp-${index}-${Date.now()}`,
                    created_at: log.time * 1000, 
                    username: log.user,
                    action: 'COMMAND',
                    details: log.message,
                    source: 'game'
                }));

                // Normalize Web Logs (ensure source is set)
                const webLogs = (dataWeb.logs || []).map(l => ({ ...l, source: 'web' }));

                // Merge and Sort by Date DESC
                fetchedLogs = [...webLogs, ...gameLogs].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                
                // Pagination Strategy: approximate by taking the larger total
                // (Since we are fetching page 1 of both, we show the top N recent combined)
                total = Math.max(dataWeb.total || 0, dataGame.total || 0); 

            } else if (filterSource === 'game') {
                const res = await fetch(`${API_URL}/logs/commands?limit=${limit}&page=${page}&search=${searchTerm}`);
                if (!res.ok) throw new Error("Error fetching game logs");
                const data = await res.json();
                
                fetchedLogs = (data.data || []).map((log, index) => ({
                    id: `cp-${index}-${Date.now()}`,
                    created_at: log.time * 1000, 
                    username: log.user,
                    action: 'COMMAND',
                    details: log.message,
                    source: 'game'
                }));
                total = data.total || 0;

            } else {
                // Web only
                const res = await fetch(`${API_URL}/logs?limit=${limit}&page=${page}&source=${filterSource}&search=${searchTerm}`);
                if (!res.ok) throw new Error("Error fetching web logs");
                const data = await res.json();
                fetchedLogs = (data.logs || []).map(l => ({ ...l, source: 'web' }));
                total = data.total || 0;
            }

            setLogs(fetchedLogs);
            setTotalPages(Math.ceil(total / limit));

        } catch (err) {
            console.error("Failed to load logs", err)
            setLogs([])
        } finally {
            setLoading(false)
        }
    }, [filterSource, page, limit, searchTerm])

    useEffect(() => {
        fetchLogs()
    }, [fetchLogs])

    // Reset to page 1 when filter changes
    useEffect(() => {
        setPage(1)
    }, [filterSource])

    // Helper for smart pagination
    const getPageNumbers = () => {
        const pages = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (page <= 4) {
                // Beginning
                for (let i = 1; i <= 5; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            } else if (page >= totalPages - 3) {
                // End
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
            } else {
                // Middle
                pages.push(1);
                pages.push('...');
                for (let i = page - 1; i <= page + 1; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            }
        }
        return pages;
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            
            {/* TABLE CONTAINER (FLEX GROW TO FILL) */}
            <div className="admin-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0', overflow: 'hidden', border: 'none', height: 'calc(100vh - 200px)' }}>
                {loading ? (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#666' }}>
                        <FaSpinner className="spin" size={32} style={{ marginBottom: '1rem' }} /> 
                        <span>Cargando registros...</span>
                    </div>
                ) : logs.length === 0 ? (
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#666' }}>
                        <p>No hay registros encontrados.</p>
                    </div>
                ) : (
                    <>
                        <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
                            <table className="admin-table" style={{ borderCollapse: 'collapse', width: '100%' }}>
                                <thead style={{ position: 'sticky', top: 0, background: '#111', zIndex: 10, borderBottom: '1px solid #333' }}>
                                    <tr>
                                        <th style={{width: '160px', padding: '1rem', color: '#888', fontSize:'0.85rem', fontWeight:'600', letterSpacing:'0.5px'}}>FECHA</th>
                                        <th style={{width: '160px', padding: '1rem', color: '#888', fontSize:'0.85rem', fontWeight:'600', letterSpacing:'0.5px'}}>USUARIO / STAFF</th>
                                        <th style={{width: '180px', padding: '1rem', color: '#888', fontSize:'0.85rem', fontWeight:'600', letterSpacing:'0.5px'}}>ACCIÓN</th>
                                        <th style={{padding: '1rem', color: '#888', fontSize:'0.85rem', fontWeight:'600', letterSpacing:'0.5px'}}>DETALLES</th>
                                        
                                        {/* MERGED HEADER: FUENTE LABEL + FILTERS */}
                                        <th style={{width: 'auto', padding: '0.8rem 1rem', textAlign:'right'}}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '1rem' }}>
                                                {/* Search Box */}
                                                <input 
                                                    type="text" 
                                                    placeholder="Buscar usuario, comando..." 
                                                    value={search}
                                                    onChange={(e) => setSearch(e.target.value)}
                                                    className="admin-input"
                                                    style={{ 
                                                        padding: '0.3rem 0.8rem', 
                                                        fontSize: '0.8rem', 
                                                        width: '200px',
                                                        borderRadius: '20px',
                                                        border: '1px solid #444',
                                                        background: '#222'
                                                    }}
                                                />

                                                <span style={{ color: '#888', fontSize:'0.85rem', fontWeight:'600', letterSpacing:'0.5px' }}>FUENTE</span>
                                                
                                                <div style={{ display: 'flex', gap: '0.25rem' }}>
                                                    <button 
                                                         onClick={() => setFilterSource('all')}
                                                         className={`admin-tab-btn ${filterSource === 'all' ? 'active' : ''}`} 
                                                         style={{
                                                             fontSize: '0.75rem', 
                                                             padding: '0.3rem 0.8rem', 
                                                             borderRadius: '20px',
                                                             border: filterSource === 'all' ? 'none' : '1px solid #444',
                                                             background: filterSource === 'all' ? 'var(--accent)' : '#222',
                                                             color: filterSource === 'all' ? '#000' : '#ccc',
                                                             cursor: 'pointer'
                                                         }}
                                                    >
                                                        Todos
                                                    </button>
                                                    <button 
                                                         onClick={() => setFilterSource('web')}
                                                         className={`admin-tab-btn ${filterSource === 'web' ? 'active' : ''}`} 
                                                         style={{
                                                             fontSize: '0.75rem', 
                                                             padding: '0.3rem 0.8rem', 
                                                             borderRadius: '20px',
                                                             display:'flex', alignItems:'center', gap:'4px',
                                                             border: filterSource === 'web' ? 'none' : '1px solid #444',
                                                             background: filterSource === 'web' ? '#3b82f6' : '#222',
                                                             color: filterSource === 'web' ? '#fff' : '#ccc',
                                                             cursor: 'pointer'
                                                         }}
                                                    >
                                                        {filterSource === 'web' && <FaGlobe />} Web
                                                    </button>
                                                    <button 
                                                         onClick={() => setFilterSource('game')}
                                                         className={`admin-tab-btn ${filterSource === 'game' ? 'active' : ''}`} 
                                                         style={{
                                                             fontSize: '0.75rem', 
                                                             padding: '0.3rem 0.8rem', 
                                                             borderRadius: '20px',
                                                             display:'flex', alignItems:'center', gap:'4px',
                                                             border: filterSource === 'game' ? 'none' : '1px solid #444',
                                                             background: filterSource === 'game' ? '#22c55e' : '#222',
                                                             color: filterSource === 'game' ? '#000' : '#ccc',
                                                             cursor: 'pointer'
                                                         }}
                                                    >
                                                        {filterSource === 'game' && <FaGamepad />} Juego
                                                    </button>
                                                </div>
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.map((log, index) => (
                                        <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: index % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                                            <td style={{ color: '#888', fontSize: '0.85rem', padding: '0.8rem 1rem' }}>
                                                {new Date(log.created_at).toLocaleString()}
                                            </td>
                                            <td style={{ padding: '0.8rem 1rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <FaUser size={10} color="#666" />
                                                    <span style={{color: log.username === 'Staff' ? 'var(--accent)' : '#ccc', fontWeight: log.username === 'Staff' ? 'bold' : 'normal'}}>
                                                        {log.username || 'System'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '0.8rem 1rem' }}>
                                                <span className="audit-badge" style={{
                                                    background: getActionColor(log.action),
                                                    padding: '2px 8px',
                                                    borderRadius: '4px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 'bold',
                                                    color: '#000',
                                                    display: 'inline-block',
                                                    minWidth: '80px',
                                                    textAlign: 'center'
                                                }}>
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td style={{ color: '#bbb', fontSize: '0.9rem', padding: '0.8rem 1rem' }}>
                                                {log.details}
                                            </td>
                                            <td style={{ textAlign: 'center', padding: '0.8rem 1rem' }}>
                                                {log.source === 'web' ? <FaGlobe color="#3b82f6" title="Web Panel" /> : <FaGamepad color="#22c55e" title="Minecraft Server" />}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* PAGINATION FOOTER */}
                        <div style={{ 
                            padding: '0.8rem 1rem', 
                            background: '#1a1a1a', 
                            borderTop: '1px solid #333',
                            display: 'flex',
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            flexShrink: 0
                        }}>
                             <span style={{ fontSize: '0.9rem', color: '#888' }}>
                                Página <strong style={{color:'#fff'}}>{page}</strong> de <strong style={{color:'#fff'}}>{totalPages}</strong>
                            </span>

                             {totalPages >= 1 && (
                                <div style={{ display: 'flex', gap: '5px' }}>
                                    <button 
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        style={{ 
                                            padding: '0.4rem 0.8rem', 
                                            cursor: 'pointer', 
                                            background: '#333', 
                                            border:'1px solid #444', 
                                            borderRadius:'20px', 
                                            color:'#fff', 
                                            opacity: page===1 ? 0.5:1,
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        &lt;
                                    </button>
                                    
                                    {getPageNumbers().map((p, idx) => (
                                        typeof p === 'number' ? (
                                            <button
                                                key={idx}
                                                onClick={() => setPage(p)}
                                                style={{
                                                    background: page === p ? 'var(--accent)' : '#333',
                                                    color: page === p ? '#000' : '#eee',
                                                    border: page === p ? 'none' : '1px solid #444',
                                                    minWidth: '32px',
                                                    height: '32px',
                                                    borderRadius: '50%',
                                                    cursor: 'pointer',
                                                    fontWeight: 'bold',
                                                    fontSize: '0.9rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                            >
                                                {p}
                                            </button>
                                        ) : (
                                            <span key={idx} style={{ color: '#888', lineHeight: '32px', padding: '0 5px' }}>...</span>
                                        )
                                    ))}

                                    <button 
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                        style={{ 
                                            padding: '0.4rem 0.8rem', 
                                            cursor: 'pointer', 
                                            background: '#333', 
                                            border:'1px solid #444', 
                                            borderRadius:'20px', 
                                            color:'#fff', 
                                            opacity: page===totalPages?0.5:1,
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        &gt;
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

function getActionColor(action) {
    if (!action) return '#ccc';
    if (action.includes('BAN')) return '#ef4444'; // Red
    if (action.includes('DELETE')) return '#f87171'; // Light Red
    if (action.includes('CREATE')) return '#4ade80'; // Green
    if (action.includes('UPDATE')) return '#facc15'; // Yellow
    if (action.includes('RESOLVE')) return '#60a5fa'; // Blue
    if (action === 'COMMAND') return '#d946ef'; // Magenta for game commands
    return '#ccc'; // Gray
}
