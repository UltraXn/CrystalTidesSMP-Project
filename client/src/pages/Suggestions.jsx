import { useState, useEffect } from "react"
import { FaPaperPlane, FaPoll, FaCheckCircle, FaExclamationTriangle, FaSpinner } from "react-icons/fa"
import Section from "@/components/Layout/Section"
import { useTranslation } from 'react-i18next'

const API_URL = import.meta.env.VITE_API_URL

export default function Suggestions() {
    const { t } = useTranslation()
    const [formStatus, setFormStatus] = useState('idle') // idle, sending, success, error
    const [formData, setFormData] = useState({ nickname: '', type: 'General', message: '' })
    
    // Poll State
    const [poll, setPoll] = useState(null)
    const [loadingPoll, setLoadingPoll] = useState(true)
    const [voted, setVoted] = useState(false)

    // Fetch Poll
    useEffect(() => {
        const fetchPoll = async () => {
            try {
                const res = await fetch(`${API_URL}/polls/active`)
                if (res.ok) {
                    const data = await res.json()
                    // Si data es null (200 OK but null body handled in controller), setPoll(null)
                    if(data) setPoll(data)
                }
            } catch (error) {
                console.error("Error fetching poll", error)
            } finally {
                setLoadingPoll(false)
            }
        }
        fetchPoll()
    }, [])

    const handleVote = async (optionId) => {
        if(voted) return
        
        try {
            const res = await fetch(`${API_URL}/polls/vote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pollId: poll.id, optionId })
            })
            
            if (res.ok) {
                setVoted(true)
                // Refetch updated stats
                const refresh = await fetch(`${API_URL}/polls/active`)
                const data = await refresh.json()
                setPoll(data)
            }
        } catch(err) {
            console.error(err)
        }
    }

    const handleFormSubmit = async (e) => {
        e.preventDefault()
        setFormStatus('sending')
        
        try {
            const res = await fetch(`${API_URL}/suggestions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
            
            if(res.ok) {
                setFormStatus('success')
                setFormData(prev => ({ ...prev, message: '' }))
            } else {
                setFormStatus('error')
                setTimeout(() => setFormStatus('idle'), 3000)
            }
        } catch {
             setFormStatus('error')
             setTimeout(() => setFormStatus('idle'), 3000)
        }
    }
    
    return (
        <Section title={t('suggestions.title')}>
            <Section>
                <div className="suggestions-layout">

                    {/* IZQUIERDA: FORMULARIO */}
                    <div className="suggestion-column">
                        <h3 className="section-subtitle" style={{ color: '#fff', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FaPaperPlane color="var(--accent)" /> {t('suggestions.form_title')}
                        </h3>

                        {formStatus === 'success' ? (
                            <div style={{ padding: '3rem', textAlign: 'center', background: 'rgba(74, 222, 128, 0.1)', borderRadius: '12px', border: '1px solid #4ade80' }}>
                                <FaCheckCircle size={50} color="#4ade80" style={{ marginBottom: '1rem' }} />
                                <h4 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{t('suggestions.form.received')}</h4>
                                <p style={{ color: '#ccc' }}>{t('suggestions.form.success_msg')}</p>
                                <button onClick={() => setFormStatus('idle')} className="btn-secondary" style={{ marginTop: '1.5rem' }}>{t('suggestions.form.send_another')}</button>
                            </div>
                        ) : (
                            <form className="suggestion-form" onSubmit={handleFormSubmit}>
                                <div className="form-group">
                                    <label className="form-label">{t('suggestions.form.nick')}</label>
                                    <input 
                                        type="text" 
                                        className="form-input" 
                                        placeholder={t('suggestions.form.nick_placeholder')} 
                                        value={formData.nickname}
                                        onChange={e => setFormData({...formData, nickname: e.target.value})}
                                        required 
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">{t('suggestions.form.type')}</label>
                                    <select 
                                        className="form-input" 
                                        style={{ background: 'rgba(0,0,0,0.5)' }}
                                        value={formData.type}
                                        onChange={e => setFormData({...formData, type: e.target.value})}
                                    >
                                        <option>{t('suggestions.form.options.general')}</option>
                                        <option>{t('suggestions.form.options.bug')}</option>
                                        <option>{t('suggestions.form.options.mod')}</option>
                                        <option>{t('suggestions.form.options.complaint')}</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">{t('suggestions.form.msg')}</label>
                                    <textarea 
                                        className="form-textarea" 
                                        placeholder={t('suggestions.form.msg_placeholder')} 
                                        value={formData.message}
                                        onChange={e => setFormData({...formData, message: e.target.value})}
                                        required
                                    ></textarea>
                                </div>
                                <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={formStatus === 'sending'}>
                                    {formStatus === 'sending' ? (
                                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                            <FaSpinner className="spin" /> {t('suggestions.form.sending')}
                                        </span>
                                    ) : t('suggestions.form.submit')}
                                </button>
                                {formStatus === 'error' && <p style={{color: '#ef4444', textAlign: 'center', marginTop: '1rem'}}>Error enviando sugerencia.</p>}
                            </form>
                        )}
                    </div>

                    {/* DERECHA: VOTACIONES */}
                    <div className="polls-column">
                        <h3 className="section-subtitle" style={{ color: '#fff', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FaPoll color="var(--accent)" /> {t('suggestions.poll_title')}
                        </h3>

                        {loadingPoll ? (
                            <div className="poll-card" style={{ textAlign: 'center', padding: '3rem' }}>
                                <FaSpinner className="spin" size={24} style={{ marginBottom: '1rem' }} />
                                <p>Cargando encuesta...</p>
                            </div>
                        ) : !poll ? (
                            <div className="poll-card" style={{ textAlign: 'center', padding: '3rem', opacity: 0.7 }}>
                                <FaExclamationTriangle size={32} style={{ marginBottom: '1rem' }} />
                                <p>{t('suggestions.no_active_poll')}</p>
                            </div>
                        ) : (
                            <div className="poll-card">
                                <div style={{ marginBottom: '1rem', color: 'var(--accent)', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
                                    {poll.title}
                                </div>
                                <h4 className="poll-question">
                                    {poll.question}
                                </h4>

                                <div className="poll-options">
                                    {poll.options.map((option) => (
                                        <div 
                                            key={option.id} 
                                            className={`poll-option ${voted ? 'voted' : ''}`} 
                                            onClick={() => handleVote(option.id)}
                                            style={{ cursor: voted ? 'default' : 'pointer' }}
                                        >
                                            <div className="poll-bar-track">
                                                <div className="poll-bar-fill" style={{ width: `${option.percent}%`, background: voted ? '#aaa' : 'var(--accent)' }}></div>
                                                <span className="poll-label">{option.label}</span>
                                                <span className="poll-percent">{poll.totalVotes > 0 ? `${option.percent}%` : '0%'}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div style={{ marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--muted)', textAlign: 'center' }}>
                                    {t('suggestions.total_votes')}: {poll.totalVotes} • {poll.closesIn}
                                </div>
                                {voted && <p style={{textAlign:'center', marginTop:'1rem', color:'#4ade80', fontSize:'0.9rem'}}>¡Gracias por tu voto!</p>}
                            </div>
                        )}

                        <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', textAlign: 'center' }}>
                            <p style={{ marginBottom: '1rem', color: '#ccc' }}>{t('suggestions.other_idea')}</p>
                            <button className="btn-primary" style={{ fontSize: '0.9rem', width: '100%' }}>{t('suggestions.suggest_poll')}</button>
                        </div>
                    </div>

                </div>
            </Section>
        </Section>
    )
}
