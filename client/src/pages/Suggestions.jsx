import { useState } from "react"
import { FaPaperPlane, FaPoll, FaCheckCircle } from "react-icons/fa"
import Section from "@/components/Layout/Section"
import { useTranslation } from 'react-i18next'

import { activePoll } from "@/data/pollData"

export default function Suggestions() {
    const { t } = useTranslation()
    const [formStatus, setFormStatus] = useState('idle') // idle, sending, success

    const handleVote = (optionId) => {
        // En un futuro: enviar voto a API
        alert(`¡Votaste por la opción ${optionId}!`)
    }

    const handleFormSubmit = (e) => {
        e.preventDefault()
        setFormStatus('sending')
        // Simular envío a backend
        setTimeout(() => setFormStatus('success'), 1500)
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
                                    <input type="text" className="form-input" placeholder={t('suggestions.form.nick_placeholder')} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">{t('suggestions.form.type')}</label>
                                    <select className="form-input" style={{ background: 'rgba(0,0,0,0.5)' }}>
                                        <option>{t('suggestions.form.options.general')}</option>
                                        <option>{t('suggestions.form.options.bug')}</option>
                                        <option>{t('suggestions.form.options.mod')}</option>
                                        <option>{t('suggestions.form.options.complaint')}</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">{t('suggestions.form.msg')}</label>
                                    <textarea className="form-textarea" placeholder={t('suggestions.form.msg_placeholder')} required></textarea>
                                </div>
                                <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={formStatus === 'sending'}>
                                    {formStatus === 'sending' ? t('suggestions.form.sending') : t('suggestions.form.submit')}
                                </button>
                            </form>
                        )}
                    </div>

                    {/* DERECHA: VOTACIONES */}
                    <div className="polls-column">
                        <h3 className="section-subtitle" style={{ color: '#fff', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FaPoll color="var(--accent)" /> {t('suggestions.poll_title')}
                        </h3>

                        <div className="poll-card">
                            <div style={{ marginBottom: '1rem', color: 'var(--accent)', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
                                {activePoll.title}
                            </div>
                            <h4 className="poll-question">
                                {activePoll.question}
                            </h4>

                            <div className="poll-options">
                                {activePoll.options.map((option) => (
                                    <div key={option.id} className="poll-option" onClick={() => handleVote(option.id)}>
                                        <div className="poll-bar-track">
                                            <div className="poll-bar-fill" style={{ width: `${option.percent}%` }}></div>
                                            <span className="poll-label">{option.label}</span>
                                            <span className="poll-percent">{option.percent}%</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div style={{ marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--muted)', textAlign: 'center' }}>
                                {t('suggestions.total_votes')}: {activePoll.totalVotes} • {t('suggestions.closes_in')} {activePoll.closesIn}
                            </div>
                        </div>

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
