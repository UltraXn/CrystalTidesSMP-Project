import { useState, useEffect, useCallback } from 'react'
import { FaPoll, FaPlus, FaHistory } from 'react-icons/fa'
import { useTranslation } from 'react-i18next'
import Loader from "../UI/Loader"
import { supabase } from "../../services/supabaseClient"
import { getAuthHeaders } from "../../services/adminAuth"
import { Poll } from './Polls/types'
import PollActiveCard from './Polls/PollActiveCard'
import PollHistoryTable from './Polls/PollHistoryTable'
import PollFormModal from './Polls/PollFormModal'
import PollDeleteModal from './Polls/PollDeleteModal'

const API_URL = import.meta.env.VITE_API_URL || '/api'

interface PollsManagerProps {
    mockActivePoll?: Poll | null;
    mockHistoryPolls?: Poll[];
}

export default function PollsManager({ mockActivePoll, mockHistoryPolls }: PollsManagerProps = {}) {
    const { t } = useTranslation()
    const [activePoll, setActivePoll] = useState<Poll | null>(mockActivePoll !== undefined ? mockActivePoll : null)
    const [loading, setLoading] = useState(mockActivePoll === undefined) // Only load if no mock provided
    const [tab, setTab] = useState('active') // 'active', 'history'

    // History State
    const [historyPolls, setHistoryPolls] = useState<Poll[]>(mockHistoryPolls || [])
    const [historyLoading, setHistoryLoading] = useState(false)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    // Form State
    const [creating, setCreating] = useState(false)
    const [buttonSuccess, setButtonSuccess] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [editingPoll, setEditingPoll] = useState<Poll | null>(null)
    
    // Translation State
    const [translating, setTranslating] = useState<string | null>(null)
    const [translatedValues, setTranslatedValues] = useState<{ title?: string, question?: string, option?: {idx: number, val: string} }>({})

    // Delete State
    const [showDeleteModal, setShowDeleteModal] = useState<number | null>(null)

    // Fetch Active
    const fetchActive = useCallback(async () => {
        if (mockActivePoll !== undefined) return;
        setLoading(true)
        try {
            const res = await fetch(`${API_URL}/polls/active`)
            if(res.ok) {
                const data = await res.json()
                setActivePoll(data.success ? data.data : data) 
            }
        } catch(err) { console.error(err) }
        finally { setLoading(false) }
    }, [mockActivePoll])

    // Fetch History
    const fetchHistory = useCallback(async () => {
        if (mockHistoryPolls) return;
        setHistoryLoading(true)
        try {
            const res = await fetch(`${API_URL}/polls?page=${page}&limit=10`)
            if(res.ok) {
                const data = await res.json()
                const payload = data.success ? data.data : data
                setHistoryPolls(Array.isArray(payload.data) ? payload.data : [])
                setTotalPages(payload.totalPages || 1)
            }
        } catch (err) { console.error(err) }
        finally { setHistoryLoading(false) }
    }, [page, mockHistoryPolls])

    useEffect(() => { 
        if(tab === 'active') fetchActive()
        if(tab === 'history') fetchHistory()
    }, [tab, page, fetchActive, fetchHistory])


    // Handlers
    const handleEdit = (poll: Poll) => {
        setEditingPoll(poll);
        setShowModal(true);
    }

    const onCreateOpen = () => {
        setEditingPoll(null);
        setShowModal(true);
    }

    const handleFormSubmit = async (e: React.FormEvent, data: any) => {
        setCreating(true)
        try {
            const validOptions = data.options.filter((o: any) => o.label.trim() !== '')
            if (validOptions.length < 2) {
                alert(t('admin.polls.form.error_options'))
                setCreating(false)
                return
            }

            const closesAt = new Date(Date.now() + data.daysDuration * 24 * 60 * 60 * 1000).toISOString()
            const payloadOptions = validOptions.map((o: any) => ({
                label: o.label,
                label_en: o.labelEn
            }))

            const endpoint = editingPoll ? `${API_URL}/polls/update/${editingPoll.id}` : `${API_URL}/polls/create`
            const method = editingPoll ? 'PUT' : 'POST'

            const { data: { session } } = await supabase.auth.getSession()
            
            if (!session) {
                alert("No active session. Please log in again.");
                setCreating(false);
                return;
            }

            const res = await fetch(endpoint, {
                method: method,
                headers: { 
                    'Content-Type': 'application/json',
                    ...getAuthHeaders(session.access_token)
                },
                body: JSON.stringify({ 
                    title: data.title, 
                    title_en: data.titleEn, 
                    question: data.question, 
                    question_en: data.questionEn,
                    options: payloadOptions,
                    closes_at: closesAt
                })
            })
            
            if(res.ok) {
                fetchActive()
                if (tab === 'history') fetchHistory()
                setButtonSuccess(true)
                setTimeout(() => {
                    setButtonSuccess(false)
                    setShowModal(false)
                    setEditingPoll(null)
                }, 1500)
            } else {
                alert(t('admin.polls.form.error_create'))
            }
        } catch(err) { console.error(err) }
        finally { setCreating(false) }
    }

    const handleClosePoll = async (id: number) => {
        if(!window.confirm(t('admin.polls.confirm_close'))) return
        
        try {
            const { data: { session } } = await supabase.auth.getSession()
            await fetch(`${API_URL}/polls/close/${id}`, { 
                method: 'POST',
                headers: getAuthHeaders(session?.access_token || null)
            })
            fetchActive()
            if(tab === 'history') fetchHistory()
        } catch(err) { console.error(err) }
    }

    const handleDelete = async (id: number) => {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) return;

            const res = await fetch(`${API_URL}/polls/${id}`, { 
                method: 'DELETE',
                headers: getAuthHeaders(session.access_token)
            })
            
            if (res.ok) {
                if (activePoll?.id === id) setActivePoll(null)
                fetchHistory()
                setShowDeleteModal(null)
            } else if (res.status === 404) {
                 alert("Error: Delete endpoint not found.")
            } else {
                alert("Error al eliminar encuesta")
            }
        } catch(err) { console.error(err) }
    }
    
    // Translation
    const handleTranslate = async (text: string, targetField: string, index?: number) => {
        if (!text) return
        
        const fieldKey = targetField === 'options' ? `option-${index}` : targetField;
        setTranslating(fieldKey)

        try {
            const { data: { session } } = await supabase.auth.getSession()
            const res = await fetch(`${API_URL}/translation`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    ...getAuthHeaders(session?.access_token || null)
                },
                body: JSON.stringify({ text: text, targetLang: 'en' })
            })
            
            if (res.ok) {
                const data = await res.json()
                const translated = data.translatedText || ''
                
                if (targetField === 'title') setTranslatedValues(prev => ({ ...prev, title: translated }))
                else if (targetField === 'question') setTranslatedValues(prev => ({ ...prev, question: translated }))
                else if (targetField === 'options' && index !== undefined) {
                    setTranslatedValues(prev => ({ ...prev, option: {idx: index, val: translated} }))
                }
            }
        } catch (error) {
            console.error(error)
        } finally {
            setTranslating(null)
        }
    }

    return (
        <div className="poll-manager-container">
            
            {/* HEADER */}
            <div className="poll-header">
                <div className="poll-tabs-wrapper">
                    <button 
                        onClick={() => setTab('active')}
                        className={`poll-tab-btn ${tab === 'active' ? 'active' : ''}`}
                    >
                        <FaPoll /> {t('admin.polls.tabs.active')}
                    </button>
                    <button 
                        onClick={() => setTab('history')}
                        className={`poll-tab-btn ${tab === 'history' ? 'active' : ''}`}
                    >
                        <FaHistory /> {t('admin.polls.tabs.history')}
                    </button>
                </div>

                <button 
                    onClick={onCreateOpen} 
                    className="btn-primary poll-new-btn" 
                >
                    <FaPlus /> {t('admin.polls.new_btn')}
                </button>
            </div>

            {/* CONTENT */}
            {tab === 'active' ? (
                loading ? (
                    <div style={{ padding: '6rem', display: 'flex', justifyContent: 'center' }}>
                        <Loader style={{ height: 'auto', minHeight: '100px' }} />
                    </div>
                ) : (
                    <PollActiveCard 
                        poll={activePoll} 
                        onEdit={handleEdit} 
                        onDelete={(id) => setShowDeleteModal(id)}
                        onClose={handleClosePoll}
                        onCreate={onCreateOpen}
                    />
                )
            ) : (
                <PollHistoryTable 
                    polls={historyPolls}
                    loading={historyLoading}
                    page={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                    onDelete={(id) => setShowDeleteModal(id)}
                    onClose={handleClosePoll}
                />
            )}

            {/* MODALS */}
            {showModal && (
                <PollFormModal 
                    onClose={() => { setShowModal(false); setEditingPoll(null); }}
                    onSubmit={handleFormSubmit}
                    poll={editingPoll}
                    creating={creating}
                    buttonSuccess={buttonSuccess}
                    hasActivePoll={!!activePoll}
                    onTranslate={handleTranslate}
                    translatingField={translating}
                    translatedValues={translatedValues}
                />
            )}

            {showDeleteModal && (
                <PollDeleteModal 
                    onConfirm={() => handleDelete(showDeleteModal)}
                    onCancel={() => setShowDeleteModal(null)}
                />
            )}
        </div>
    )
}
