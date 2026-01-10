import { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { createTicketSchema, CreateTicketFormValues } from '../../schemas/ticket'

interface TicketFormProps {
    onClose: () => void;
    onSubmit: (data: CreateTicketFormValues) => Promise<void>;
}

export default function TicketForm({ onClose, onSubmit }: TicketFormProps) {
    const { t } = useTranslation()
    const [generalError, setGeneralError] = useState('')

    const { 
        register, 
        handleSubmit, 
        formState: { errors, isSubmitting } 
    } = useForm<CreateTicketFormValues>({
        resolver: zodResolver(createTicketSchema),
        defaultValues: {
            category: 'general',
            priority: 'medium',
            title: '',
            description: ''
        }
    })

    const handleFormSubmit = async (data: CreateTicketFormValues) => {
        setGeneralError('')
        try {
            await onSubmit(data)
        } catch (error) {
            console.error('Error submitting ticket:', error)
            setGeneralError(t('support.error_create', 'Error creating ticket'))
        }
    }

    return (
        <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="modal-content"
            style={{
                background: '#0B0C10', padding: '2.5rem', borderRadius: '2rem',
                width: '100%', maxWidth: '600px', border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}
            onClick={e => e.stopPropagation()}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ width: '3rem', height: '3rem', background: 'var(--accent-soft)', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Plus style={{ color: 'var(--accent)' }} />
                </div>
                <h2 style={{ margin: 0, fontSize: '1.8rem' }}>{t('support.new_ticket_title')}</h2>
            </div>

            {generalError && (
                <div style={{ color: '#ff6b6b', background: 'rgba(255, 107, 107, 0.1)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.9rem', border: '1px solid rgba(255, 107, 107, 0.2)' }}>
                    {generalError}
                </div>
            )}

            <form onSubmit={handleSubmit(handleFormSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--muted)' }}>{t('support.category', 'Category')}</label>
                        <select 
                            {...register('category')}
                            style={{
                                width: '100%', padding: '1rem', borderRadius: '1rem', 
                                background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', 
                                color: 'white', outline: 'none', colorScheme: 'dark'
                            }}
                        >
                            <option value="general">{t('support.categories.general', 'General')}</option>
                            <option value="bug">{t('support.categories.bug', 'Bug Report')}</option>
                            <option value="report">{t('support.categories.player', 'Player Report')}</option>
                            <option value="billing">{t('support.categories.billing', 'Billing')}</option>
                            <option value="other">{t('support.categories.other', 'Other')}</option>
                        </select>
                        {errors.category && <span style={{color: '#ff6b6b', fontSize: '0.8rem'}}>{errors.category.message}</span>}
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--muted)' }}>{t('support.priority', 'Priority')}</label>
                        <select 
                            {...register('priority')}
                            style={{
                                width: '100%', padding: '1rem', borderRadius: '1rem', 
                                background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', 
                                color: 'white', outline: 'none', colorScheme: 'dark'
                            }}
                        >
                            <option value="low">{t('support.priorities.low', 'Low')}</option>
                            <option value="medium">{t('support.priorities.medium', 'Medium')}</option>
                            <option value="high">{t('support.priorities.high', 'High')}</option>
                        </select>
                        {errors.priority && <span style={{color: '#ff6b6b', fontSize: '0.8rem'}}>{errors.priority.message}</span>}
                    </div>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--muted)' }}>{t('support.subject')}</label>
                    <input 
                        type="text" 
                        placeholder={t('support.subject_placeholder')}
                        {...register('title')} 
                        style={{
                            width: '100%', padding: '1rem', borderRadius: '1rem', 
                            background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', 
                            color: 'white', outline: 'none'
                        }}
                    />
                    {errors.title && <span style={{color: '#ff6b6b', fontSize: '0.8rem'}}>{errors.title.message}</span>}
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--muted)' }}>{t('support.message')}</label>
                    <textarea 
                        rows={5}
                        placeholder={t('support.message_placeholder')}
                        {...register('description')}
                        style={{
                            width: '100%', padding: '1rem', borderRadius: '1rem', 
                            background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', 
                            color: 'white', outline: 'none', resize: 'none'
                        }}
                    ></textarea>
                    {errors.description && <span style={{color: '#ff6b6b', fontSize: '0.8rem'}}>{errors.description.message}</span>}
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <button type="button" onClick={onClose} className="nav-btn" disabled={isSubmitting} style={{ flex: 1, padding: '1rem', background: 'rgba(255,255,255,0.05)' }}>
                        {t('common.cancel', 'Cancel')}
                    </button>
                    <button type="submit" className="nav-btn primary" disabled={isSubmitting} style={{ flex: 1, padding: '1rem', boxShadow: 'none' }}>
                        {isSubmitting ? t('common.loading', 'Loading...') : t('common.submit', 'Submit')}
                    </button>
                </div>
            </form>
        </motion.div>
    )
}
