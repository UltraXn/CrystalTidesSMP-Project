import { useState, useEffect, useCallback } from "react"
import { FaSearch, FaSpinner, FaDonate, FaBoxOpen, FaUser, FaClock, FaEdit, FaTrash, FaPlus, FaSave, FaExclamationTriangle } from "react-icons/fa"

const API_URL = import.meta.env.VITE_API_URL as string

interface Donation {
    id?: number;
    amount: string | number;
    currency: string;
    from_name: string;
    message: string;
    is_public: boolean;
    email?: string;
    created_at?: string;
}

export default function DonationsManager() {
    // const { t } = useTranslation() 
    const [donations, setDonations] = useState<Donation[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    
    // CRUD State
    const [showModal, setShowModal] = useState(false)
    const [currentDonation, setCurrentDonation] = useState<Donation | null>(null)
    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const fetchDonations = useCallback(async () => {
        setLoading(true)
        try {
            const res = await fetch(`${API_URL}/donations?page=${page}&limit=20&search=${search}`)
            if(res.ok) {
                const data = await res.json()
                setDonations(data.data || [])
                setTotalPages(data.totalPages || 1)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }, [page, search])

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchDonations()
        }, 500)
        return () => clearTimeout(timer)
    }, [fetchDonations])

    // Handlers
    const handleNew = () => {
        setCurrentDonation({ 
            amount: '', 
            currency: 'USD', 
            from_name: '', 
            message: '', 
            is_public: true,
            email: ''
        })
        setShowModal(true)
    }

    const handleEdit = (donation: Donation) => {
        setCurrentDonation({ ...donation })
        setShowModal(true)
    }

    const handleDelete = (id: number) => {
        setDeleteConfirm(id)
    }

    const executeDelete = async () => {
        if (!deleteConfirm) return
        try {
            const res = await fetch(`${API_URL}/donations/${deleteConfirm}`, { method: 'DELETE' })
            if (res.ok) {
                setDonations(donations.filter(d => d.id !== deleteConfirm))
                setDeleteConfirm(null)
            } else {
                alert('Error al eliminar')
            }
        } catch (error) {
            console.error(error)
        }
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        if (!currentDonation) return;

        const method = currentDonation.id ? 'PUT' : 'POST'
        const url = currentDonation.id 
            ? `${API_URL}/donations/${currentDonation.id}` 
            : `${API_URL}/donations`

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(currentDonation)
            })

            if (res.ok) {
                setShowModal(false)
                fetchDonations()
            } else {
                alert('Error al guardar')
            }
        } catch (error) {
            console.error(error)
            alert('Error de conexión')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="admin-card" style={{ height: 'calc(100vh - 180px)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                    <FaDonate color="var(--accent)" /> Gestión de Donaciones
                </h3>
                
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                        <input 
                            type="text" 
                            placeholder="Buscar por usuario..." 
                            className="admin-input" 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ paddingLeft: '2.5rem', width: '250px', marginBottom: 0 }}
                        />
                        <FaSearch style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                    </div>
                    <button className="btn-primary" onClick={handleNew} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FaPlus size={12} /> Nueva Donación
                    </button>
                </div>
            </div>

            {loading && donations.length === 0 ? (
                <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <FaSpinner className="spin" size={30} />
                </div>
            ) : (
                <>
                    <div className="admin-table-container" style={{ flex: 1, overflowY: 'auto' }}>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Usuario</th>
                                    <th>Mensaje</th>
                                    <th>Monto</th>
                                    <th>Fecha</th>
                                    <th>Visibilidad</th>
                                    <th style={{ textAlign: 'right' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {donations.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                                            No hay donaciones registradas.
                                        </td>
                                    </tr>
                                ) : (
                                    donations.map(donation => (
                                        <tr key={donation.id}>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#333', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                        <FaUser size={12} color="#aaa" />
                                                    </div>
                                                    <span style={{ fontWeight: 'bold', color: '#fff' }}>{donation.from_name || 'Anónimo'}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ccc', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    <FaBoxOpen size={12} /> {donation.message || 'Sin mensaje'}
                                                </div>
                                            </td>
                                            <td>
                                                <span style={{ color: '#4ade80', fontWeight: 'bold', fontSize: '1rem' }}>
                                                    {donation.currency} {parseFloat(donation.amount.toString()).toFixed(2)}
                                                </span>
                                            </td>
                                            <td style={{ color: '#888', fontSize: '0.9rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <FaClock size={12} /> {donation.created_at ? new Date(donation.created_at).toLocaleString() : '-'}
                                                </div>
                                            </td>
                                            <td>
                                                <span className="audit-badge" style={{ 
                                                    background: donation.is_public ? '#4ade80' : '#64748b',
                                                    color: '#000' 
                                                }}>
                                                    {donation.is_public ? 'Público' : 'Privado'}
                                                </span>
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                <button
                                                    onClick={() => handleEdit(donation)}
                                                    className="btn-icon"
                                                    title="Editar"
                                                    style={{ color: 'var(--accent)', marginRight: '0.5rem' }}
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    onClick={() => donation.id && handleDelete(donation.id)}
                                                    className="btn-icon"
                                                    title="Eliminar"
                                                    style={{ color: '#ef4444' }}
                                                >
                                                    <FaTrash />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                         <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem', padding: '1rem 0' }}>
                            <button 
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="admin-tab-btn"
                            >
                                &lt;
                            </button>
                            <span style={{ display: 'flex', alignItems: 'center', color: '#888' }}>
                                Pág. {page} de {totalPages}
                            </span>
                            <button 
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="admin-tab-btn"
                            >
                                &gt;
                            </button>
                         </div>
                    )}
                </>
            )}

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="modal-overlay" style={{ backdropFilter: 'blur(5px)', zIndex: 1000 }}>
                    <div className="admin-card modal-content" style={{ width: '500px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #333', paddingBottom: '1rem' }}>
                            <h3 style={{ margin: 0 }}>{currentDonation?.id ? "Editar Donación" : "Nueva Donación"}</h3>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: '1.2rem' }}>&times;</button>
                        </div>

                        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div className="form-group">
                                <label className="form-label">Nombre del Donante</label>
                                <input 
                                    className="form-input" 
                                    value={currentDonation?.from_name || ''} 
                                    onChange={e => setCurrentDonation(prev => prev ? {...prev, from_name: e.target.value} : null)}
                                    placeholder="Ej: John Doe"
                                />
                            </div>

                             <div className="form-group">
                                <label className="form-label">Email (Privado)</label>
                                <input 
                                    className="form-input" 
                                    value={currentDonation?.email || ''} 
                                    onChange={e => setCurrentDonation(prev => prev ? {...prev, email: e.target.value}: null)}
                                    placeholder="email@example.com"
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label className="form-label">Monto</label>
                                    <input 
                                        type="number" 
                                        step="0.01"
                                        className="form-input" 
                                        value={currentDonation?.amount || ''} 
                                        onChange={e => setCurrentDonation(prev => prev ? {...prev, amount: e.target.value}: null)}
                                        required
                                    />
                                </div>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label className="form-label">Moneda</label>
                                    <select 
                                        className="form-input" 
                                        value={currentDonation?.currency || 'USD'} 
                                        onChange={e => setCurrentDonation(prev => prev ? {...prev, currency: e.target.value}: null)}
                                    >
                                        <option value="USD">USD</option>
                                        <option value="EUR">EUR</option>
                                        <option value="MXN">MXN</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Mensaje</label>
                                <textarea 
                                    className="form-textarea" 
                                    rows={3}
                                    value={currentDonation?.message || ''} 
                                    onChange={e => setCurrentDonation(prev => prev ? {...prev, message: e.target.value}: null)}
                                />
                            </div>

                            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <input 
                                    type="checkbox" 
                                    id="isPublic"
                                    checked={currentDonation?.is_public || false}
                                    onChange={e => setCurrentDonation(prev => prev ? {...prev, is_public: e.target.checked} : null)}
                                    style={{ width: 'auto' }}
                                />
                                <label htmlFor="isPublic" style={{ cursor: 'pointer', userSelect: 'none' }}>Hacer pública la donación</label>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button>
                                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                                    {isSubmitting ? <FaSpinner className="spin" /> : <><FaSave /> Guardar</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div style={{
                    position: 'fixed',
                    top: 0, 
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    background: 'rgba(0, 0, 0, 0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10001,
                    backdropFilter: 'blur(5px)'
                }} onClick={() => setDeleteConfirm(null)}>
                    <div style={{
                        background: '#1e1e24',
                        padding: '2rem',
                        borderRadius: '12px',
                        border: '1px solid #ef4444',
                        maxWidth: '400px',
                        width: '90%',
                        textAlign: 'center',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{ 
                            width: '60px', 
                            height: '60px', 
                            borderRadius: '50%', 
                            background: 'rgba(239, 68, 68, 0.1)', 
                            color: '#ef4444',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1.5rem',
                            fontSize: '2rem'
                        }}>
                            <FaExclamationTriangle />
                        </div>
                        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.4rem' }}>Confirmar Eliminación</h3>
                        <p style={{ color: '#aaa', marginBottom: '2rem' }}>
                            ¿Estás seguro de que quieres eliminar esta donación? Esta acción no se puede deshacer.
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button 
                                className="btn-secondary" 
                                onClick={() => setDeleteConfirm(null)}
                                style={{ flex: 1 }}
                            >
                                Cancelar
                            </button>
                            <button 
                                className="btn-primary" 
                                onClick={executeDelete}
                                style={{ 
                                    flex: 1, 
                                    background: '#ef4444', 
                                    borderColor: '#ef4444', 
                                    color: '#fff' 
                                }}
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
