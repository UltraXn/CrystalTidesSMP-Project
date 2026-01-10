import { useState } from 'react'
import { BarChart3, Plus, History } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import Loader from "../UI/Loader"

import { 
    useAdminActivePoll, 
    useAdminPolls, 
    useCreatePoll, 
    useUpdatePoll, 
    useClosePoll, 
    useDeletePoll,
    useTranslateText
} from "../../hooks/useAdminData"

import { Poll } from './Polls/types'
import PollActiveCard from './Polls/PollActiveCard'
import PollHistoryTable from './Polls/PollHistoryTable'
import PollFormModal from './Polls/PollFormModal'
import PollDeleteModal from './Polls/PollDeleteModal'

interface PollsManagerProps {
    mockActivePoll?: Poll | null;
    mockHistoryPolls?: Poll[];
}

export default function PollsManager({ mockActivePoll, mockHistoryPolls }: PollsManagerProps = {}) {
    const { t } = useTranslation()
    const [tab, setTab] = useState<'active' | 'history'>('active')
    const [page, setPage] = useState(1)

    // TanStack Query Hooks
    const { data: fetchActiveData, isLoading: loadingPoll } = useAdminActivePoll();
    const { data: historyData, isLoading: historyLoading } = useAdminPolls(page);
    
    const createMutation = useCreatePoll();
    const updateMutation = useUpdatePoll();
    const closeMutation = useClosePoll();
    const deleteMutation = useDeletePoll();
    const translateMutation = useTranslateText();

    // UI Flow States
    const [showModal, setShowModal] = useState(false)
    const [editingPoll, setEditingPoll] = useState<Poll | null>(null)
    const [showDeleteModal, setShowDeleteModal] = useState<number | null>(null)
    const [buttonSuccess, setButtonSuccess] = useState(false)
    const [translatingField, setTranslatingField] = useState<string | null>(null)
    const [translatedValues, setTranslatedValues] = useState<{ title?: string, question?: string, option?: {idx: number, val: string} }>({})

    const activePoll = mockActivePoll !== undefined ? mockActivePoll : (fetchActiveData || null);
    const historyPolls = mockHistoryPolls || historyData?.data || [];
    const totalPages = historyData?.totalPages || 1;

    // Handlers
    const handleEdit = (poll: Poll) => {
        setEditingPoll(poll);
        setShowModal(true);
    }

    const onCreateOpen = () => {
        setEditingPoll(null);
        setShowModal(true);
    }

    interface PollFormData {
        title: string;
        titleEn: string;
        question: string;
        questionEn: string;
        options: { label: string; labelEn?: string }[];
        daysDuration: number;
    }

    const handleFormSubmit = async (_e: React.FormEvent, data: PollFormData) => {
        const validOptions = data.options.filter((o: { label: string }) => o.label.trim() !== '')
        if (validOptions.length < 2) {
            alert(t('admin.polls.form.error_options'))
            return
        }

        const closesAt = new Date(Date.now() + data.daysDuration * 24 * 60 * 60 * 1000).toISOString()
        const payloadOptions = validOptions.map((o: { label: string; labelEn?: string }) => ({
            label: o.label,
            label_en: o.labelEn
        }))

        const payload = { 
            title: data.title, 
            title_en: data.titleEn, 
            question: data.question, 
            question_en: data.questionEn,
            options: payloadOptions,
            closes_at: closesAt
        }

        const mutationOptions = {
            onSuccess: () => {
                setButtonSuccess(true)
                setTimeout(() => {
                    setButtonSuccess(false)
                    setShowModal(false)
                    setEditingPoll(null)
                }, 1500)
            },
            onError: () => {
                alert(t('admin.polls.form.error_create'))
            }
        };

        if (editingPoll) {
            updateMutation.mutate({ id: editingPoll.id, payload }, mutationOptions);
        } else {
            createMutation.mutate(payload, mutationOptions);
        }
    }

    const handleClosePoll = (id: number) => {
        if(!window.confirm(t('admin.polls.confirm_close'))) return
        closeMutation.mutate(id);
    }

    const handleDelete = (id: number) => {
        deleteMutation.mutate(id, {
            onSuccess: () => setShowDeleteModal(null)
        });
    }
    
    // Translation
    const handleTranslate = async (text: string, targetField: string, index?: number) => {
        if (!text) return
        const fieldKey = targetField === 'options' ? `option-${index}` : targetField;
        setTranslatingField(fieldKey)

        translateMutation.mutate({ text }, {
            onSuccess: (translated) => {
                if (targetField === 'title') setTranslatedValues(prev => ({ ...prev, title: translated }))
                else if (targetField === 'question') setTranslatedValues(prev => ({ ...prev, question: translated }))
                else if (targetField === 'options' && index !== undefined) {
                    setTranslatedValues(prev => ({ ...prev, option: {idx: index, val: translated} }))
                }
            },
            onSettled: () => setTranslatingField(null)
        });
    }

    return (
        <div className="poll-manager-container">
            <div className="poll-header">
                <div className="poll-tabs-wrapper">
                    <button 
                        onClick={() => setTab('active')}
                        className={`poll-tab-btn ${tab === 'active' ? 'active' : ''}`}
                    >
                        <BarChart3 size={18} /> {t('admin.polls.tabs.active')}
                    </button>
                    <button 
                        onClick={() => setTab('history')}
                        className={`poll-tab-btn ${tab === 'history' ? 'active' : ''}`}
                    >
                        <History size={18} /> {t('admin.polls.tabs.history')}
                    </button>
                </div>

                <button onClick={onCreateOpen} className="btn-primary poll-new-btn">
                    <Plus size={16} /> {t('admin.polls.new_btn')}
                </button>
            </div>

            {tab === 'active' ? (
                loadingPoll ? (
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

            {showModal && (
                <PollFormModal 
                    onClose={() => { setShowModal(false); setEditingPoll(null); }}
                    onSubmit={handleFormSubmit}
                    poll={editingPoll}
                    creating={createMutation.isPending || updateMutation.isPending}
                    buttonSuccess={buttonSuccess}
                    hasActivePoll={!!activePoll}
                    onTranslate={handleTranslate}
                    translatingField={translatingField}
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
