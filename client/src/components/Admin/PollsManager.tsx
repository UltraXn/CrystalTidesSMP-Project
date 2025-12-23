import { useState, useEffect, useCallback } from 'react'
import { FaPoll, FaPlus, FaTimes, FaCheck, FaCheckCircle, FaSpinner, FaStopCircle, FaHistory } from 'react-icons/fa'
import { useTranslation } from 'react-i18next'

const API_URL = import.meta.env.VITE_API_URL

interface PollOption {
    id?: number;
    label: string;
    votes?: number;
    percent?: number;
}

interface Poll {
    id: number;
    title: string;
    question: string;
    options: PollOption[];
    closesIn?: string;
    totalVotes?: number;
    created_at?: string;
    is_active?: boolean;
    closes_at?: string;
}

export default function PollsManager() {
    const { t } = useTranslation()
    const [activePoll, setActivePoll] = useState<Poll | null>(null)
    const [loading, setLoading] = useState(true)
    const [tab, setTab] = useState('active') // 'active', 'history'

    // History State
    const [historyPolls, setHistoryPolls] = useState<Poll[]>([])
    const [historyLoading, setHistoryLoading] = useState(false)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    // Form
    const [title, setTitle] = useState('')
    const [question, setQuestion] = useState('')
    const [options, setOptions] = useState(['', ''])
    const [creating, setCreating] = useState(false)
    const [daysDuration, setDaysDuration] = useState(7)
    const [buttonSuccess, setButtonSuccess] = useState(false)
    const [showModal, setShowModal] = useState(false)

    // Fetch Active
    const fetchActive = useCallback(async () => {
        setLoading(true)
        try {
            const res = await fetch(`${API_URL}/polls/active`)
            if(res.ok) {
                const data = await res.json()
                setActivePoll(data) // returns null if no active poll
            }
        } catch(err) { console.error(err) }
        finally { setLoading(false) }
    }, [])

    // Fetch History
    const fetchHistory = useCallback(async () => {
        setHistoryLoading(true)
        try {
            const res = await fetch(`${API_URL}/polls?page=${page}&limit=10`)
            if(res.ok) {
                const data = await res.json()
                setHistoryPolls(data.data || [])
                setTotalPages(data.totalPages || 1)
            }
        } catch (err) { console.error(err) }
        finally { setHistoryLoading(false) }
    }, [page])

    useEffect(() => { 
        if(tab === 'active') fetchActive()
        if(tab === 'history') fetchHistory()
    }, [tab, page, fetchActive, fetchHistory])

    // Create Handler
    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        setCreating(true)
        try {
            const validOptions = options.filter(o => o.trim() !== '')
            if (validOptions.length < 2) {
                alert(t('admin.polls.form.error_options'))
                setCreating(false)
                return
            }

            const closesAt = new Date(Date.now() + daysDuration * 24 * 60 * 60 * 1000).toISOString()

            const res = await fetch(`${API_URL}/polls/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    title, 
                    question, 
                    options: validOptions,
                    closes_at: closesAt
                })
            })
            
            if(res.ok) {
                setTitle('')
                setQuestion('')
                setOptions(['', ''])
                fetchActive()
                setButtonSuccess(true)
                setTimeout(() => {
                    setButtonSuccess(false)
                    setShowModal(false)
                }, 1500)
            } else {
                alert(t('admin.polls.form.error_create'))
            }
        } catch(err) { console.error(err) }
        finally { setCreating(false) }
    }

    // Close Handler
    const handleClose = async () => {
        if(!activePoll) return;
        if(!window.confirm(t('admin.polls.confirm_close'))) return
        
        try {
            await fetch(`${API_URL}/polls/close/${activePoll.id}`, { method: 'POST' })
            fetchActive()
            if(tab === 'history') fetchHistory()
        } catch(err) { console.error(err) }
    }

    const updateOption = (idx: number, val: string) => {
        const newOpts = [...options]
        newOpts[idx] = val
        setOptions(newOpts)
    }

    const removeOption = (idx: number) => {
        const newOpts = options.filter((_, i) => i !== idx)
        setOptions(newOpts)
    }

    return (
        <div style={{ position: 'relative' }}>
            
            {/* HEADER */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button 
                        onClick={() => setTab('active')}
                        className={`admin-tab-btn ${tab === 'active' ? 'active' : ''}`}
                    >
                        <FaPoll /> Activa
                    </button>
                    <button 
                        onClick={() => setTab('history')}
                        className={`admin-tab-btn ${tab === 'history' ? 'active' : ''}`}
                    >
                        <FaHistory /> Historial
                    </button>
                </div>

                <button 
                    onClick={() => setShowModal(true)} 
                    className="btn-primary" 
                    style={{ fontSize: '0.9rem', padding: '0.6rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <FaPlus /> NUEVA ENCUESTA
                </button>
            </div>

            {/* CONTENT */}
            {tab === 'active' ? (
                <div className="admin-card">
                     <h3 style={{ marginBottom: '1.5rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
                        <FaPoll /> {t('admin.polls.active_title')}
                    </h3>

                    {loading ? <div style={{textAlign:'center'}}><FaSpinner className="spin" /></div> : (
                        activePoll ? (
                            <div>
                                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'1rem' }}>
                                    <span className="badge" style={{background:'#22c55e', color:'#000'}}>{t('admin.polls.status_active')}</span>
                                    <span style={{fontSize:'0.8rem', color:'#aaa'}}>{t('admin.polls.ends_in')} {activePoll.closesIn}</span>
                                </div>
                                
                                <h4 style={{marginBottom:'0.5rem', color:'var(--accent)', fontSize: '1.5rem'}}>{activePoll.title}</h4>
                                <p style={{marginBottom:'2rem', fontSize:'1.2rem', color: '#ddd'}}>{activePoll.question}</p>

                                <div style={{display:'flex', flexDirection:'column', gap:'0.8rem', marginBottom:'2rem'}}>
                                    {activePoll.options.map(opt => (
                                        <div key={opt.id} style={{
                                            background:'rgba(255,255,255,0.03)', 
                                            padding:'1rem', 
                                            borderRadius:'4px', 
                                            display:'flex', 
                                            justifyContent:'space-between',
                                            border: '1px solid rgba(255,255,255,0.1)'
                                        }}>
                                            <span style={{ fontSize: '1.1rem' }}>{opt.label}</span>
                                            <span style={{fontWeight:'bold', color: 'var(--accent)'}}>{opt.percent}% ({opt.votes} {t('admin.polls.votes')})</span>
                                        </div>
                                    ))}
                                    <div style={{marginTop:'0.5rem', textAlign:'right', color:'#888', fontSize:'0.9rem'}}>
                                        {t('admin.polls.total_votes', {count: activePoll.totalVotes})}
                                    </div>
                                </div>

                                <button onClick={handleClose} className="btn-secondary" style={{borderColor:'#ef4444', color:'#ef4444', padding: '0.8rem 2rem'}}>
                                    <FaStopCircle /> {t('admin.polls.close_btn')}
                                </button>
                            </div>
                        ) : (
                            <div style={{textAlign:'center', padding:'5rem 2rem', color:'#666', border:'2px dashed #333', borderRadius:'8px'}}>
                                <FaPoll size={48} style={{marginBottom:'1rem', opacity: 0.5}}/>
                                <p style={{ fontSize: '1.2rem' }}>{t('admin.polls.no_active')}</p>
                                <button onClick={() => setShowModal(true)} className="btn-primary" style={{ marginTop: '1rem' }}>
                                    Crear una encuesta ahora
                                </button>
                            </div>
                        )
                    )}
                </div>
            ) : (
                <div className="admin-card">
                    <h3 style={{ marginBottom: '1.5rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
                        <FaHistory /> Historial de Encuestas
                    </h3>
                    
                    {historyLoading ? (
                        <div style={{textAlign:'center', padding:'3rem'}}><FaSpinner className="spin" size={24}/></div>
                    ) : (
                        <div className="admin-table-container">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Título</th>
                                        <th>Fecha</th>
                                        <th>Votos</th>
                                        <th>Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {historyPolls.map(poll => (
                                        <tr key={poll.id}>
                                            <td style={{fontWeight: '500'}}>{poll.title}</td>
                                            <td style={{color:'#888'}}>{poll.created_at ? new Date(poll.created_at).toLocaleDateString() : '-'}</td>
                                            <td>{poll.totalVotes}</td>
                                            <td>
                                                <span className={`status-chip ${poll.is_active ? 'active' : 'inactive'}`} style={{
                                                    background: poll.is_active ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                                                    color: poll.is_active ? '#22c55e' : '#aaa',
                                                    padding: '2px 8px', borderRadius:'4px', fontSize:'0.75rem', fontWeight:'bold'
                                                }}>
                                                    {poll.is_active ? 'ACTIVA' : 'CERRADA'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {historyPolls.length === 0 && (
                                        <tr><td colSpan={4} style={{textAlign:'center', padding:'2rem'}}>No hay historial</td></tr>
                                    )}
                                </tbody>
                            </table>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem', padding: '1rem 0' }}>
                                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="admin-tab-btn">&lt;</button>
                                    <span style={{ display: 'flex', alignItems: 'center', color: '#888' }}>Pág. {page} de {totalPages}</span>
                                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="admin-tab-btn">&gt;</button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* MODAL: CREATE NEW */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="admin-card modal-content" style={{ maxWidth: '600px', width: '90%' }}>
                        <div style={{ paddingBottom: '1rem', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <FaCheckCircle /> {t('admin.polls.create_title')}
                            </h3>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: '1.2rem' }}>
                                <FaTimes />
                            </button>
                        </div>
                        
                        <div style={{ overflowY: 'auto', maxHeight: '70vh' }}>
                            <form onSubmit={(e) => { handleCreate(e); }}>
                                <div className="form-group">
                                    <label className="admin-label">{t('admin.polls.form.title')}</label>
                                    <input className="admin-input" value={title} onChange={e => setTitle(e.target.value)} placeholder={t('admin.polls.form.title_ph')} required />
                                </div>
                                
                                <div className="form-group">
                                    <label className="admin-label">{t('admin.polls.form.question')}</label>
                                    <textarea className="admin-input" value={question} onChange={e => setQuestion(e.target.value)} placeholder={t('admin.polls.form.question_ph')} required rows={3} style={{resize:'vertical'}}></textarea>
                                </div>

                                <div className="form-group">
                                    <label className="admin-label">{t('admin.polls.form.options')}</label>
                                    <div style={{display:'flex', flexDirection:'column', gap:'0.5rem'}}>
                                        {options.map((opt, idx) => (
                                            <div key={idx} style={{display:'flex', gap:'0.5rem'}}>
                                                <input 
                                                    className="admin-input" 
                                                    value={opt} 
                                                    onChange={e => updateOption(idx, e.target.value)} 
                                                    placeholder={`${t('admin.polls.form.option_ph')}${idx + 1}`}
                                                    required
                                                />
                                                {options.length > 2 && (
                                                    <button type="button" onClick={() => removeOption(idx)} className="btn-icon delete" style={{height:'42px', width:'42px', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                                                        <FaTimes />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <button type="button" onClick={() => setOptions([...options, ''])} className="btn-secondary" style={{marginTop:'0.5rem', width:'100%'}}>
                                        <FaPlus /> {t('admin.polls.form.add_option')}
                                    </button>
                                </div>

                                <div className="form-group">
                                    <label className="admin-label">{t('admin.polls.form.duration')}</label>
                                    <input className="admin-input" type="number" min="1" max="30" value={daysDuration} onChange={e => setDaysDuration(parseInt(e.target.value))} />
                                </div>

                                <div style={{marginTop:'2rem', paddingTop:'1rem', borderTop:'1px solid #333'}}>
                                    {activePoll && <p style={{color:'#facc15', fontSize:'0.9rem', marginBottom:'1rem'}}>{t('admin.polls.form.warning_active')}</p>}
                                    
                                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                        <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                                            Cancelar
                                        </button>
                                        <button type="submit" className="btn-primary" style={{ background: buttonSuccess ? '#22c55e' : '', borderColor: buttonSuccess ? '#22c55e' : ''}} disabled={creating || buttonSuccess}>
                                            {creating ? <FaSpinner className="spin" /> : buttonSuccess ? (
                                                <><FaCheck /> {t('admin.polls.form.success')}</>
                                            ) : t('admin.polls.form.submit')}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
