import { useState, useEffect } from 'react'
import { FaTrash, FaSpinner, FaInbox, FaFilter } from 'react-icons/fa'
import { useTranslation } from 'react-i18next'

const API_URL = import.meta.env.VITE_API_URL

interface Suggestion {
    id: number;
    type: string;
    nickname: string;
    message: string;
    created_at: string;
}

export default function SuggestionsManager() {
    const { t } = useTranslation()
    const [suggestions, setSuggestions] = useState<Suggestion[]>([])
    const [loading, setLoading] = useState(true)

    const [filterType, setFilterType] = useState('All')

    const fetchSuggestions = async () => {
        setLoading(true)
        try {
            const res = await fetch(`${API_URL}/suggestions`)
            if(res.ok) {
                const data = await res.json()
                setSuggestions(data)
            }
        } catch(err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchSuggestions()
    }, [])

    const handleDelete = async (id: number) => {
        if(!window.confirm(t('admin.suggestions.delete_confirm'))) return
        try {
            await fetch(`${API_URL}/suggestions/${id}`, { method: 'DELETE' })
            fetchSuggestions()
        } catch(err) { console.error(err) }
    }

    const filteredSuggestions = suggestions.filter(s => 
        filterType === 'All' ? true : s.type.toLowerCase() === filterType.toLowerCase()
    )

    return (
        <div className="admin-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, display:'flex', alignItems:'center', gap:'0.5rem' }}>
                    <FaInbox /> {t('admin.suggestions.title')}
                </h3>
                
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <FaFilter color="#666" />
                    <select 
                        value={filterType} 
                        onChange={e => setFilterType(e.target.value)}
                        className="admin-input" 
                        style={{ width: '150px', marginBottom: 0 }}
                    >
                        <option value="All">Todos</option>
                        <option value="Bug">Bug</option>
                        <option value="Feature">Feature</option>
                        <option value="Mod">Mod</option>
                        <option value="Other">Otro</option>
                    </select>
                </div>
            </div>
            
            {loading ? (
                <div style={{padding:'2rem', textAlign:'center'}}><FaSpinner className="spin" size={24}/> {t('admin.suggestions.loading')}</div>
            ) : (
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th style={{width:'120px'}}>{t('admin.suggestions.table.date')}</th>
                                <th style={{width:'100px'}}>{t('admin.suggestions.table.type')}</th>
                                <th style={{width:'150px'}}>{t('admin.suggestions.table.user')}</th>
                                <th>{t('admin.suggestions.table.message')}</th>
                                <th style={{width:'80px'}}>{t('admin.suggestions.table.action')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSuggestions.map(s => (
                                <tr key={s.id}>
                                    <td style={{fontSize:'0.85rem', color:'#aaa'}}>{new Date(s.created_at).toLocaleDateString()}</td>
                                    <td>
                                        <span style={{
                                            padding: '2px 8px', borderRadius:'4px', fontSize:'0.75rem', fontWeight:'bold',
                                            background: s.type === 'Bug' ? '#ef4444' : s.type === 'Mod' ? '#3b82f6' : '#22c55e',
                                            color: '#000'
                                        }}>
                                            {s.type}
                                        </span>
                                    </td>
                                    <td style={{fontWeight:'bold', color: s.nickname==='Anónimo'?'#666':'#fff'}}>{s.nickname}</td>
                                    <td style={{maxWidth:'300px', whiteSpace:'pre-wrap'}}>{s.message}</td>
                                    <td>
                                        <button onClick={() => handleDelete(s.id)} className="btn-icon delete" title="Eliminar"><FaTrash /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {suggestions.length === 0 && <p style={{textAlign:'center', padding:'2rem', color:'#666'}}>{t('admin.suggestions.empty')}</p>}
                </div>
            )}
        </div>
    )
}
