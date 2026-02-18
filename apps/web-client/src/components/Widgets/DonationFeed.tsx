import { useEffect } from 'react'
import { Heart, User } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { motion, useAnimationControls } from 'framer-motion'
import { supabase } from '../../services/supabaseClient'
import { fetchPublicDonations, PublicDonation } from '../../services/apiService'
import '../../donation-feed.css'

interface DonationFeedProps {
    mockDonations?: PublicDonation[];
}

export default function DonationFeed({ mockDonations }: DonationFeedProps = {}) {
    const { t, i18n } = useTranslation()
    const controls = useAnimationControls()

    const queryClient = useQueryClient()
    const { data: fetchedDonations = [], isLoading } = useQuery({
        queryKey: ['public-donations-feed', 'all'],
        queryFn: () => fetchPublicDonations('all'),
        enabled: !mockDonations,
        staleTime: 1000 * 15,
        refetchInterval: 1000 * 60
    })

    const donations = mockDonations || fetchedDonations
    const loading = !mockDonations && isLoading

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

    // Restart animation when donations change
    useEffect(() => {
        if (donations.length > 0) {
            controls.start({
                y: ["0%", "-50%"],
                transition: {
                    duration: Math.max(20, donations.length * 4), // Dynamic speed based on items
                    ease: "linear",
                    repeat: Infinity
                }
            })
        }
    }, [donations.length, controls])

    const renderDonationCard = (donation: PublicDonation, index: string | number) => (
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
                <motion.div 
                    className="donation-scroll-track"
                    animate={controls}
                    whileHover={{ animationPlayState: 'paused' }} // CSS integration
                >
                    {/* Render triple to ensure it covers 400px height even with few donations */}
                    {donations.map((d, i) => renderDonationCard(d, `A-${i}`))}
                    {donations.map((d, i) => renderDonationCard(d, `B-${i}`))}
                    {donations.map((d, i) => renderDonationCard(d, `C-${i}`))}
                </motion.div>
            )}
        </div>
    )
}
