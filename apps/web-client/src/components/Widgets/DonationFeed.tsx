import { useEffect, useState } from 'react'
import { supabase } from '../../services/supabaseClient'
import { Heart, User } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Skeleton } from 'boneyard-js/react'
import '../../styles/widgets/donation-feed.css'

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
        let ignore = false;

        async function fetchDonations() {
            try {
                const { data, error } = await supabase
                    .from('donations')
                    .select('*')
                    .eq('is_public', true)
                    .order('created_at', { ascending: false })
                    .limit(20);

                if (error) throw error;
                if (!ignore) setDonations(data || []);
            } catch (error) {
                console.error('Error fetching donations:', error);
            } finally {
                if (!ignore) setLoading(false);
            }
        }

        fetchDonations();

        // Suscribirse a cambios en tiempo real
        const subscription = supabase
            .channel('public:donations')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'donations' }, (payload: { new: Donation }) => {
                if (ignore) return;
                const donation = payload.new;
                const id = donation.id || donation.message_id || `new-${Date.now()}`;
                
                // Marcar como "nueva" temporalmente para la animación
                setNewDonationIds(prev => new Set(prev).add(id));
                
                setDonations(prev => [donation, ...prev.slice(0, 19)]);

                // Quitar el estado "nuevo" después de que pase la animación (600ms en CSS, damos un margen)
                setTimeout(() => {
                    if (ignore) return;
                    setNewDonationIds(prev => {
                        const next = new Set(prev);
                        next.delete(id);
                        return next;
                    });
                }, 3000);
            })
            .subscribe()

        return () => {
            ignore = true;
            supabase.removeChannel(subscription);
        }
    }, [mockDonations])


    const renderDonationCard = (donation: Donation, keyPrefix: string) => {
        const baseId = donation.id || donation.message_id || `card-${donation.from_name}-${donation.created_at}`;
        const id = `${keyPrefix}-${baseId}`;
        const isNew = newDonationIds.has(baseId);
        const amount = Number(donation.amount);
        const isPremium = amount >= 20; // Brillo dorado para donaciones >= 20

        return (
            <div 
                className={`donation-card ${isNew ? 'new-donation' : ''} ${isPremium ? 'premium-glow' : ''}`} 
                key={id}
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

    const DonationFeedSkeleton = (
        <div className="donation-feed">
            <div className="donation-scroll-track animate-pulse">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div className="donation-card bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-3 min-h-22.5" key={`skel-${i}`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-white/10" />
                                <div className="flex flex-col gap-2">
                                    <div className="w-24 h-4 rounded bg-white/10" />
                                    <div className="w-16 h-3 rounded bg-white/5" />
                                </div>
                            </div>
                            <div className="w-16 h-6 rounded-full bg-white/10" />
                        </div>
                        <div className="w-3/4 h-3 rounded bg-white/5" />
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <Skeleton
            name="donation-feed"
            loading={loading}
            fallback={DonationFeedSkeleton}
            animate="shimmer"
            color="#1a1a2e"
            darkColor="#0f0f1a"
        >
            <div className="donation-feed">
                {donations.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '2rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
                        <p>{t('donors.no_donations')}</p>
                    </div>
                ) : (
                    <div className="donation-scroll-track">
                        {donations.map((d, i) => renderDonationCard(d, `A-${i}`))}
                        {donations.map((d, i) => renderDonationCard(d, `B-${i}`))}
                    </div>
                )}
            </div>
        </Skeleton>
    )
}
