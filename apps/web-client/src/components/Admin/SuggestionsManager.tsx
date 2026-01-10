import { useState } from 'react'
import Loader from "../UI/Loader"

import { 
    useAdminSuggestions, 
    useUpdateSuggestionStatus, 
    useDeleteSuggestion 
} from "../../hooks/useAdminData"

import { Suggestion } from './Suggestions/types';
import SuggestionCard from './Suggestions/SuggestionCard';
import SuggestionDeleteModal from './Suggestions/SuggestionDeleteModal';
import SuggestionsFilters from './Suggestions/SuggestionsFilters';

export default function SuggestionsManager() {
    const { data: suggestionsData, isLoading: loading } = useAdminSuggestions();
    const updateStatusMutation = useUpdateSuggestionStatus();
    const deleteMutation = useDeleteSuggestion();

    const [expandedCard, setExpandedCard] = useState<number | null>(null)
    const [filterType, setFilterType] = useState('All')
    const [filterStatus, setFilterStatus] = useState('All')
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [selectedId, setSelectedId] = useState<number | null>(null)

    const suggestions = suggestionsData || [];

    const handleDelete = (id: number) => {
        setSelectedId(id)
        setShowDeleteModal(true)
    }

    const confirmDelete = async () => {
        if (selectedId === null) return
        deleteMutation.mutate(selectedId, {
            onSuccess: () => {
                setShowDeleteModal(false)
                setSelectedId(null)
            }
        });
    }

    const handleUpdateStatus = async (id: number, status: string) => {
        updateStatusMutation.mutate({ id, status });
    }

    const filteredSuggestions = suggestions.filter((s: Suggestion) => {
        const typeMatch = filterType === 'All' ? true : s.type.toLowerCase() === filterType.toLowerCase();
        const statusMatch = filterStatus === 'All' ? true : s.status?.toLowerCase() === filterStatus.toLowerCase();
        return typeMatch && statusMatch;
    })

    return (
        <div className="admin-container suggestions-wrapper" style={{ maxWidth: '1600px', margin: '0 auto' }}>
            
            <SuggestionsFilters 
                filterType={filterType}
                setFilterType={setFilterType}
                filterStatus={filterStatus}
                setFilterStatus={setFilterStatus}
            />
            
            <div style={{ flex: 1 }}>
                {loading ? (
                    <div style={{ padding: '5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                        <Loader text="" style={{ height: 'auto', minHeight: '100px' }} />
                    </div>
                ) : (
                <>
                    {filteredSuggestions.length > 0 ? (
                        <div style={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            gap: '12px'
                        }}>
                            {filteredSuggestions.map((s: Suggestion) => (
                                <SuggestionCard 
                                    key={s.id}
                                    suggestion={s}
                                    isExpanded={expandedCard === s.id}
                                    onToggleExpand={() => setExpandedCard(expandedCard === s.id ? null : s.id)}
                                    onUpdateStatus={handleUpdateStatus}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    ) : (
                        <div style={{ 
                            background: 'rgba(255,255,255,0.02)', borderRadius: '16px', padding: '4rem', 
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            border: '2px dashed rgba(255,255,255,0.05)'
                        }}>
                            <h3 style={{ margin: 0, color: '#888' }}>No hay sugerencias</h3>
                            <p style={{ color: '#555', fontSize: '0.9rem' }}>No hay sugerencias que coincidan con los filtros actuales.</p>
                        </div>
                    )}
                </>
            )}

            <style>{`
                .suggestions-wrapper {
                    display: flex;
                    gap: 2rem;
                    align-items: flex-start;
                }
                @media (max-width: 900px) {
                    .suggestions-wrapper {
                        flex-direction: column;
                        gap: 1rem;
                    }
                }
            `}</style>
            
            <SuggestionDeleteModal 
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
            />
            </div>
        </div>
    )
}
