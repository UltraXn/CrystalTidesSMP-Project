import { useState, useMemo } from "react"
import { Search, DollarSign, BarChart3, Filter, Plus, HandCoins } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Donation } from "./Donations/types"
import DonationsTable from "./Donations/DonationsTable"
import DonationFormModal from "./Donations/DonationFormModal"
import DonationDeleteModal from "./Donations/DonationDeleteModal"
import { 
    useAdminDonations, 
    useCreateDonation, 
    useUpdateDonation, 
    useDeleteDonation 
} from "../../hooks/useAdminData"

interface DonationsManagerProps {
    mockDonations?: Donation[];
}

export default function DonationsManager({ mockDonations }: DonationsManagerProps = {}) {
    const { t } = useTranslation() 
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(1)
    
    // CRUD State
    const [showModal, setShowModal] = useState(false)
    const [currentDonation, setCurrentDonation] = useState<Donation | null>(null)
    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)

    // TanStack Query Hooks
    const { data: donationsData, isLoading: loading } = useAdminDonations(page, 20, search);
    const createMutation = useCreateDonation();
    const updateMutation = useUpdateDonation();
    const deleteMutation = useDeleteDonation();

    const donations = useMemo(() => mockDonations || donationsData?.data || [], [mockDonations, donationsData?.data]);
    const totalPages = donationsData?.totalPages || 1;

    // Stats calculation
    const stats = useMemo(() => {
        if (!donations.length) return { total: "0.00", count: 0, avg: "0.00" };
        const total = donations.reduce((acc: number, curr: Donation) => acc + (Number(curr.amount) || 0), 0);
        return {
            total: total.toFixed(2),
            count: donations.length,
            avg: (total / donations.length).toFixed(2)
        };
    }, [donations]);

    const handleNew = () => {
        setCurrentDonation(null) 
        setShowModal(true)
    }

    const handleEdit = (donation: Donation) => {
        setCurrentDonation({ ...donation })
        setShowModal(true)
    }

    const handleDelete = async () => {
        if (!deleteConfirm) return
        deleteMutation.mutate(deleteConfirm, {
            onSuccess: () => setDeleteConfirm(null)
        });
    }

    const handleSave = async (donationData: Donation) => {
        if (donationData.id) {
            updateMutation.mutate({ id: donationData.id, payload: donationData }, {
                onSuccess: () => setShowModal(false)
            });
        } else {
            createMutation.mutate(donationData, {
                onSuccess: () => setShowModal(false)
            });
        }
    }

    return (
        <div className="donations-manager-container">
            <div className="donations-header" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                     <div style={{ padding: '12px', background: 'rgba(var(--accent-rgb), 0.1)', borderRadius: '16px', color: 'var(--accent)', fontSize: '1.2rem', display: 'flex', flexShrink: 0 }}>
                        <HandCoins />
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
                        <Search className="search-icon" />
                        <input 
                            type="text" 
                            placeholder={t('admin.donations.search_ph')}
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            className="poll-search-input"
                        />
                    </div>
                    <button className="btn-primary poll-new-btn" onClick={handleNew} style={{ flex: '1 1 auto', minWidth: '160px', height: '52px', padding: '0 2rem', borderRadius: '18px', boxShadow: '0 10px 20px rgba(var(--accent-rgb), 0.2)' }}>
                        <Plus /> {t('admin.donations.new_btn')}
                    </button>
                </div>
            </div>

            <div className="donations-stats-grid">
                <div className="donation-stat-card">
                    <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                        <DollarSign />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">${stats.total}</span>
                        <span className="stat-label">{t('admin.donations.stats.total')}</span>
                    </div>
                </div>
                <div className="donation-stat-card">
                    <div className="stat-icon-wrapper" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                        <BarChart3 />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{stats.count}</span>
                        <span className="stat-label">{t('admin.donations.stats.count')}</span>
                    </div>
                </div>
                <div className="donation-stat-card">
                    <div className="stat-icon-wrapper" style={{ background: 'rgba(250, 204, 21, 0.1)', color: '#facc15' }}>
                        <Filter />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">${stats.avg}</span>
                        <span className="stat-label">{t('admin.donations.stats.avg')}</span>
                    </div>
                </div>
            </div>

            <DonationsTable 
                donations={donations}
                loading={loading}
                onEdit={handleEdit}
                onDelete={setDeleteConfirm}
                page={page}
                totalPages={totalPages}
                setPage={setPage}
            />

            <DonationFormModal 
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSave={handleSave}
                initialData={currentDonation}
                saving={createMutation.isPending || updateMutation.isPending}
            />

            <DonationDeleteModal 
                isOpen={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                onConfirm={handleDelete}
                deleting={deleteMutation.isPending}
            />
        </div>
    )
}
