import { useState, useEffect, useCallback, useMemo } from "react"
import { FaSearch, FaDollarSign, FaChartBar, FaFilter, FaPlus, FaDonate } from "react-icons/fa"
import { useTranslation } from "react-i18next"
import { supabase } from "../../services/supabaseClient"
import { getAuthHeaders } from "../../services/adminAuth"
import { Donation } from "./Donations/types"
import DonationsTable from "./Donations/DonationsTable"
import DonationFormModal from "./Donations/DonationFormModal"
import DonationDeleteModal from "./Donations/DonationDeleteModal"

const API_URL = import.meta.env.VITE_API_URL || '/api'

interface DonationsManagerProps {
    mockDonations?: Donation[];
}

export default function DonationsManager({ mockDonations }: DonationsManagerProps = {}) {
    const { t } = useTranslation() 
    const [donations, setDonations] = useState<Donation[]>(mockDonations || [])
    const [loading, setLoading] = useState(!mockDonations)
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    
    // CRUD State
    const [showModal, setShowModal] = useState(false)
    const [currentDonation, setCurrentDonation] = useState<Donation | null>(null)
    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
    const [, setAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

    const fetchDonations = useCallback(async () => {
        if (mockDonations) return;
        setLoading(true)
        try {
            const { data: { session } } = await supabase.auth.getSession()
            const res = await fetch(`${API_URL}/donations?page=${page}&limit=20&search=${search}`, {
                headers: getAuthHeaders(session?.access_token || null)
            })
            if(res.ok) {
                const rawData = await res.json()
                const payload = rawData.success ? rawData.data : rawData
                setDonations(payload.data || [])
                setTotalPages(payload.totalPages || 1)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }, [page, search, mockDonations])

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchDonations()
        }, 500)
        return () => clearTimeout(timer)
    }, [fetchDonations])

    // Real-time subscription
    useEffect(() => {
        const channel = supabase
            .channel('public:donations')
            .on(
                'postgres_changes',
                { event: '*', table: 'donations', schema: 'public' },
                () => {
                    fetchDonations()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [fetchDonations])

    // Stats calculation
    const stats = useMemo(() => {
        if (!donations.length) return { total: 0, count: 0, avg: 0 };
        const total = donations.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
        return {
            total: total.toFixed(2),
            count: donations.length,
            avg: (total / donations.length).toFixed(2)
        };
    }, [donations]);

    const handleNew = () => {
        setCurrentDonation(null) // Null indicates new
        setShowModal(true)
    }

    const handleEdit = (donation: Donation) => {
        setCurrentDonation({ ...donation })
        setShowModal(true)
    }

    const handleDelete = async () => {
        if (!deleteConfirm) return
        try {
            const { data: { session } } = await supabase.auth.getSession()
            const res = await fetch(`${API_URL}/donations/${deleteConfirm}`, { 
                method: 'DELETE',
                headers: getAuthHeaders(session?.access_token || null)
            })
            if (res.ok) {
                setDonations(donations.filter(d => d.id !== deleteConfirm))
                setDeleteConfirm(null)
                setAlert({ message: t('admin.donations.success_delete', 'Donación eliminada'), type: 'success' })
            } else {
                setAlert({ message: t('admin.donations.error_delete'), type: 'error' })
            }
        } catch (error) {
            console.error(error)
            setAlert({ message: t('admin.donations.error_conn'), type: 'error' })
        }
    }

    const handleSave = async (donationData: Donation) => {
        const method = donationData.id ? 'PUT' : 'POST'
        const url = donationData.id 
            ? `${API_URL}/donations/${donationData.id}` 
            : `${API_URL}/donations`

        try {
            const { data: { session } } = await supabase.auth.getSession()
            const res = await fetch(url, {
                method,
                headers: { 
                    'Content-Type': 'application/json',
                    ...getAuthHeaders(session?.access_token || null)
                },
                body: JSON.stringify(donationData)
            })

            if (res.ok) {
                fetchDonations()
                setAlert({ message: t('admin.donations.success_save', 'Cambios guardados correctamente'), type: 'success' })
            } else {
                setAlert({ message: t('admin.donations.error_save'), type: 'error' })
                throw new Error("Failed to save")
            }
        } catch (error) {
            console.error(error)
            setAlert({ message: t('admin.donations.error_conn'), type: 'error' })
            throw error; 
        }
    }

    return (
        <div className="donations-manager-container">
            {/* Header / Actions Bar */}
            <div className="donations-header" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                     <div style={{ padding: '12px', background: 'rgba(var(--accent-rgb), 0.1)', borderRadius: '16px', color: 'var(--accent)', fontSize: '1.2rem', display: 'flex', flexShrink: 0 }}>
                        <FaDonate />
                    </div>
                    <div style={{ flex: '1', minWidth: '0' }}>
                        <p className="donations-subtitle" style={{ margin: 0, fontSize: 'clamp(0.7rem, 2vw, 0.8rem)', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.6 }}>
                            {t('admin.donations.title')}
                        </p>
                        <span style={{ color: '#fff', fontWeight: 800, fontSize: 'clamp(0.95rem, 3vw, 1.1rem)', wordBreak: 'break-word' }}>
                            {t('admin.donations.manager_desc')}
                        </span>
                    </div>
                </div>
                
                <div className="donations-actions" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', width: '100%' }}>
                    <div className="poll-search-wrapper" style={{ flex: '1 1 100%', minWidth: '200px', maxWidth: '100%' }}>
                        <FaSearch className="search-icon" />
                        <input 
                            type="text" 
                            placeholder={t('admin.donations.search_ph')}
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            className="poll-search-input"
                        />
                    </div>
                    <button className="btn-primary poll-new-btn" onClick={handleNew} style={{ flex: '1 1 auto', minWidth: '160px', height: '52px', padding: '0 2rem', borderRadius: '18px', boxShadow: '0 10px 20px rgba(var(--accent-rgb), 0.2)' }}>
                        <FaPlus /> {t('admin.donations.new_btn')}
                    </button>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="donations-stats-grid">
                <div className="donation-stat-card">
                    <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                        <FaDollarSign />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">${stats.total}</span>
                        <span className="stat-label">{t('admin.donations.stats.total')}</span>
                    </div>
                </div>
                <div className="donation-stat-card">
                    <div className="stat-icon-wrapper" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                        <FaChartBar />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{stats.count}</span>
                        <span className="stat-label">{t('admin.donations.stats.count')}</span>
                    </div>
                </div>
                <div className="donation-stat-card">
                    <div className="stat-icon-wrapper" style={{ background: 'rgba(250, 204, 21, 0.1)', color: '#facc15' }}>
                        <FaFilter />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">${stats.avg}</span>
                        <span className="stat-label">{t('admin.donations.stats.avg')}</span>
                    </div>
                </div>
            </div>

            {/* Table Area */}
            <DonationsTable 
                donations={donations}
                loading={loading}
                onEdit={handleEdit}
                onDelete={setDeleteConfirm}
                page={page}
                totalPages={totalPages}
                setPage={setPage}
            />

            {/* Modals */}
            <DonationFormModal 
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSave={handleSave}
                initialData={currentDonation}
            />

            <DonationDeleteModal 
                isOpen={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                onConfirm={handleDelete}
            />
        </div>
    )
}
