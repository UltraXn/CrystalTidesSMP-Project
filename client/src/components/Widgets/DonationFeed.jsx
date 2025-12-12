import { useEffect, useState } from 'react'
import { supabase } from '../../services/supabaseClient'
import { FaHeart, FaUser } from 'react-icons/fa'
import '@/donation-feed.css'

export default function DonationFeed() {
    const [donations, setDonations] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchDonations()

        // Suscribirse a cambios en tiempo real (NUEVAS donaciones aparecen al instante)
        const subscription = supabase
            .channel('public:donations')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'donations' }, (payload) => {
                setDonations(prev => [payload.new, ...prev])
            })
            .subscribe()

        return () => {
            supabase.removeChannel(subscription)
        }
    }, [])

    const fetchDonations = async () => {
        try {
            const { data, error } = await supabase
                .from('donations')
                .select('*')
                .eq('is_public', true)
                .order('created_at', { ascending: false })
                .limit(20)

            if (error) throw error
            setDonations(data)
        } catch (error) {
            console.error('Error fetching donations:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <div style={{ textAlign: 'center', padding: '2rem' }}>Cargando donaciones...</div>

    const renderDonationCard = (donation, index) => (
        <div className="donation-card" key={`${donation.id || donation.message_id}-${index}`}>
            <div className="donation-header">
                <div className="donation-user">
                    <div className="donation-avatar">
                        <FaUser />
                    </div>
                    <div className="donation-info">
                        <h4>{donation.from_name}</h4>
                        <span className="donation-date">
                            {new Date(donation.created_at).toLocaleDateString()}
                        </span>
                    </div>
                </div>
                <div className="donation-amount-badge">
                    <FaHeart size={12} />
                    {donation.currency} {donation.amount}
                </div>
            </div>
            {donation.message && (
                <div className="donation-message">
                    "{donation.message}"
                </div>
            )}
        </div>
    )

    return (
        <div className="donation-feed">
            {donations.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '2rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
                    <p>Aún no hay donaciones recientes. ¡Sé el primero en apoyar!</p>
                </div>
            ) : (
                <div className="donation-scroll-track">
                    {/* Renderizamos la lista dos veces para el efecto infinito */}
                    {donations.map((d, i) => renderDonationCard(d, `A-${i}`))}
                    {donations.map((d, i) => renderDonationCard(d, `B-${i}`))}
                </div>
            )}
        </div>
    )
}
