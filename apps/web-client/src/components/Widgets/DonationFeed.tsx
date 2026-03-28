import { useEffect, useState } from 'react'
import { supabase } from '../../services/supabaseClient'
import { Heart, User } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import '../../donation-feed.css'

interface Donation {
    id?: string;
    message_id?: string;
    from_name: string;
    created_at: string;
    currency: string;
    amount: string | number;
    message?: string;
    message_en?: string;
    is_public: boolean;
}

interface DonationFeedProps {
    mockDonations?: Donation[];
}

export default function DonationFeed({ mockDonations }: DonationFeedProps = {}) {
    const [donations, setDonations] = useState<Donation[]>(mockDonations || [])
    const [loading, setLoading] = useState(!mockDonations)
    const [newDonationIds, setNewDonationIds] = useState<Set<string>>(new Set())
    const { t, i18n } = useTranslation()

    useEffect(() => {
        if (mockDonations) return;
        fetchDonations()

        // Suscribirse a cambios en tiempo real
        const subscription = supabase
            .channel('public:donations')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'donations' }, (payload: { new: Donation }) => {
                const donation = payload.new;
                const id = donation.id || donation.message_id || `new-${Date.now()}`;
                
                // Marcar como "nueva" temporalmente para la animación
                setNewDonationIds(prev => new Set(prev).add(id));
                
                setDonations(prev => [donation, ...prev]);

                // Quitar el estado "nuevo" después de que pase la animación (600ms en CSS, damos un margen)
                setTimeout(() => {
                    setNewDonationIds(prev => {
                        const next = new Set(prev);
                        next.delete(id);
                        return next;
                    });
                }, 5000);
            })
            .subscribe()

        return () => {
            supabase.removeChannel(subscription)
        }
    }, [mockDonations])

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

    if (loading) return (
        <div style={{ 
            textAlign: 'center', 
            height: '400px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'var(--muted)'
        }}>
            {t('donors.loading_donations')}
        </div>
    )

    const renderDonationCard = (donation: Donation, index: string | number) => {
        const id = donation.id || donation.message_id || `card-${index}`;
        const isNew = newDonationIds.has(id);
        const amount = Number(donation.amount);
        const isPremium = amount >= 20; // Brillo dorado para donaciones >= 20

        return (
            <div 
                className={`donation-card ${isNew ? 'new-donation' : ''} ${isPremium ? 'premium-glow' : ''}`} 
                key={`${id}-${index}`}
            >
                <div className="donation-header">
                    <div className="donation-user">
                        <div className="donation-avatar">
                            <User size={20} />
                        </div>
                        <div className="donation-info">
                            <h4>{donation.from_name}</h4>
                            <span className="donation-date">
                                {new Date(donation.created_at).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                    <div className="donation-amount-badge">
                        <Heart size={14} fill="currentColor" />
                        {donation.currency} {amount.toFixed(2)}
                    </div>
                </div>
                {donation.message && (
                    <div className="donation-message">
                        "{i18n.language === 'en' && donation.message_en ? donation.message_en : donation.message}"
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="donation-feed">
            {donations.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '2rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
                    <p>{t('donors.no_donations')}</p>
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
