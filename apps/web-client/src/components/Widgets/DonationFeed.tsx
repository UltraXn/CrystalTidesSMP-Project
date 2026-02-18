import { useMemo } from 'react'
import { Heart, User } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { fetchPublicDonations, PublicDonation } from '../../services/apiService'
import '../../donation-feed.css'

interface Donation extends PublicDonation {}

interface DonationFeedProps {
    mockDonations?: Donation[];
}

export default function DonationFeed({ mockDonations }: DonationFeedProps = {}) {
    const { t, i18n } = useTranslation()

    const { data: fetchedDonations = [], isLoading } = useQuery({
        queryKey: ['public-donations-feed', 20],
        queryFn: () => fetchPublicDonations(20),
        enabled: !mockDonations,
        staleTime: 1000 * 15,
        refetchInterval: 1000 * 30
    })

    const donations = useMemo(() => mockDonations || fetchedDonations, [mockDonations, fetchedDonations])
    const loading = !mockDonations && isLoading

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
    )
}
