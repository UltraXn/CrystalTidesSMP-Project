import { useEffect } from 'react'
import { Heart, User } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../services/supabaseClient'
import { fetchPublicDonations, PublicDonation } from '../../services/apiService'
import '../../donation-feed.css'

interface Donation extends PublicDonation {}

interface DonationFeedProps {
    mockDonations?: Donation[];
}

export default function DonationFeed({ mockDonations }: DonationFeedProps = {}) {
    const { t, i18n } = useTranslation()

    const queryClient = useQueryClient()
    const { data: fetchedDonations = [], isLoading } = useQuery({
        queryKey: ['public-donations-feed', 'all'],
        queryFn: () => fetchPublicDonations('all'),
        enabled: !mockDonations,
        staleTime: 1000 * 15,
        refetchInterval: 1000 * 60 // Increased interval as we have real-time now
    })

    // Real-time updates
    useEffect(() => {
        if (mockDonations) return

        const channel = supabase
            .channel('public_donations_realtime')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'donations',
                filter: 'is_public=eq.true'
            }, () => {
                queryClient.invalidateQueries({ queryKey: ['public-donations-feed', 'all'] })
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [mockDonations, queryClient])

    const donations = mockDonations || fetchedDonations
    const loading = !mockDonations && isLoading

    const renderDonationCard = (donation: Donation, index: string | number) => (
        <div className="donation-card" key={`${donation.id || donation.message_id}-${index}`}>
            <div className="donation-header">
                <div className="donation-user">
                    <div className="donation-avatar">
                        <User size={16} />
                    </div>
                    <div className="donation-info">
                        <h4>{donation.from_name}</h4>
                        <span className="donation-date">
                            {new Date(donation.created_at).toLocaleDateString()}
                        </span>
                    </div>
                </div>
                <div className="donation-amount-badge">
                    <Heart size={12} />
                    {donation.currency} {donation.amount}
                </div>
            </div>
            {donation.message && (
                <div className="donation-message">
                    "{i18n.language === 'en' && donation.message_en ? donation.message_en : donation.message}"
                </div>
            )}
        </div>
    )

    return (
        <div className="donation-feed">
            {loading ? (
                <div style={{
                    textAlign: 'center',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--muted)'
                }}>
                    {t('donors.loading_donations')}
                </div>
            ) : donations.length === 0 ? (
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
    )
}
