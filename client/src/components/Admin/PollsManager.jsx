import { useState, useEffect } from 'react'
import { FaPoll, FaPlus, FaTimes, FaCheck, FaCheckCircle, FaSpinner, FaStopCircle, FaTrash } from 'react-icons/fa'
import { useTranslation } from 'react-i18next'

const API_URL = import.meta.env.VITE_API_URL

export default function PollsManager() {
    const { t } = useTranslation()
    const [activePoll, setActivePoll] = useState(null)
    const [loading, setLoading] = useState(true)

    // Form
    const [title, setTitle] = useState('')
    const [question, setQuestion] = useState('')
    const [options, setOptions] = useState(['', ''])
    const [creating, setCreating] = useState(false)
    const [daysDuration, setDaysDuration] = useState(7)

    // Fetch Active
    const fetchActive = async () => {
        setLoading(true)
        try {
            const res = await fetch(`${API_URL}/polls/active`)
            if(res.ok) {
                const data = await res.json()
                setActivePoll(data) // returns null if no active poll
            }
        } catch(err) { console.error(err) }
        finally { setLoading(false) }
    }

    useEffect(() => { fetchActive() }, [])

    const [buttonSuccess, setButtonSuccess] = useState(false)

    // Create Handler
    const handleCreate = async (e) => {
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
                // alert("Encuesta lanzada!") // Removing alert to use button feedback
                setButtonSuccess(true)
                setTimeout(() => setButtonSuccess(false), 3000)
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
        } catch(err) { console.error(err) }
    }

    const updateOption = (idx, val) => {
        const newOpts = [...options]
        newOpts[idx] = val
        setOptions(newOpts)
    }

    const removeOption = (idx) => {
        const newOpts = options.filter((_, i) => i !== idx)
        setOptions(newOpts)
    }

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
            
            {/* COLUMN 1: ACTIVE POLL */}
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
                            
                            <h4 style={{marginBottom:'0.5rem', color:'var(--accent)'}}>{activePoll.title}</h4>
                            <p style={{marginBottom:'1.5rem', fontSize:'1.1rem'}}>{activePoll.question}</p>

                            <div style={{display:'flex', flexDirection:'column', gap:'0.5rem', marginBottom:'1.5rem'}}>
                                {activePoll.options.map(opt => (
                                    <div key={opt.id} style={{background:'rgba(255,255,255,0.05)', padding:'0.5rem', borderRadius:'4px', display:'flex', justifyContent:'space-between'}}>
                                        <span>{opt.label}</span>
                                        <span style={{fontWeight:'bold'}}>{opt.percent}% ({opt.votes} {t('admin.polls.votes')})</span>
                                    </div>
                                ))}
                                <div style={{marginTop:'0.5rem', textAlign:'right', color:'#888', fontSize:'0.9rem'}}>
                                    {t('admin.polls.total_votes', {count: activePoll.totalVotes})}
                                </div>
                            </div>

                            <button onClick={handleClose} className="btn-secondary" style={{width:'100%', borderColor:'#ef4444', color:'#ef4444'}}>
                                <FaStopCircle /> {t('admin.polls.close_btn')}
                            </button>
                        </div>
                    ) : (
                        <div style={{textAlign:'center', padding:'3rem', color:'#666', border:'1px dashed #444', borderRadius:'8px'}}>
                            <FaPoll size={32} style={{marginBottom:'1rem'}}/>
                            <p>{t('admin.polls.no_active')}</p>
                        </div>
                    )
                )}
            </div>

            {/* COLUMN 2: CREATE NEW */}
            <div className="admin-card">
                <h3 style={{ marginBottom: '1.5rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
                    <FaCheckCircle /> {t('admin.polls.create_title')}
                </h3>

                <form onSubmit={handleCreate}>
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
                                        <button type="button" onClick={() => removeOption(idx)} className="btn-icon delete" style={{height:'42px', width:'42px'}}>
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
                        <input className="admin-input" type="number" min="1" max="30" value={daysDuration} onChange={e => setDaysDuration(e.target.value)} />
                    </div>

                    <div style={{marginTop:'2rem', paddingTop:'1rem', borderTop:'1px solid #333'}}>
                        {activePoll && <p style={{color:'#facc15', fontSize:'0.9rem', marginBottom:'1rem'}}>{t('admin.polls.form.warning_active')}</p>}
                        
                        <button type="submit" className="btn-primary" style={{width:'100%', background: buttonSuccess ? '#22c55e' : '', borderColor: buttonSuccess ? '#22c55e' : ''}} disabled={creating || buttonSuccess}>
                            {creating ? <FaSpinner className="spin" /> : buttonSuccess ? (
                                <><FaCheck /> {t('admin.polls.form.success')}</>
                            ) : t('admin.polls.form.submit')}
                        </button>
                    </div>
                </form>
            </div>

        </div>
    )
}
