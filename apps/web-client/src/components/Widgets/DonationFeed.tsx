import { useEffect, useRef } from 'react'
import { Heart, User } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { gsap } from 'gsap'
import { supabase } from '../../services/supabaseClient'
import { fetchPublicDonations, PublicDonation } from '../../services/apiService'
import '../../donation-feed.css'

interface DonationFeedProps {
    mockDonations?: PublicDonation[];
}

export default function DonationFeed({ mockDonations }: DonationFeedProps = {}) {
    const { t, i18n } = useTranslation()

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

    const trackRef = useRef<HTMLDivElement>(null)
    const animRef = useRef<gsap.core.Tween | null>(null)

    // Constant Carousel Animation (GSAP)
    useEffect(() => {
        if (donations.length > 0 && trackRef.current) {
            // Kill previous animation to avoid overlaps
            if (animRef.current) animRef.current.kill()

            animRef.current = gsap.to(trackRef.current, {
                y: "-33.333%",
                duration: Math.max(20, donations.length * 4), 
                ease: "none",
                repeat: -1,
                paused: false
            })
        }
        return () => {
            if (animRef.current) animRef.current.kill()
        }
    }, [donations.length])

    const getDonationTier = (amount: number | string) => {
        const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
        if (numAmount >= 50) return 'legendary'
        if (numAmount >= 10) return 'epic'
        return 'standard'
    }

    const renderDonationCard = (donation: PublicDonation, index: string | number) => {
        const tier = getDonationTier(donation.amount)
        
        return (
            <div 
                className={`donation-card donation-card-${tier}`} 
                key={`${donation.id || donation.message_id}-${index}`}
            >
                <div className="donation-header">
                    <div className="donation-user">
                        <div className="donation-avatar">
                            {donation.from_avatar ? (
                                <img src={donation.from_avatar} alt={donation.from_name} />
                            ) : (
                                <User size={20} className="text-white/40" />
                            )}
                        </div>
                        <div className="donation-info">
                            <h4>{donation.from_name}</h4>
                            <span className="donation-date">
                                {new Date(donation.created_at).toLocaleDateString(i18n.language, {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                })}
                            </span>
                        </div>
                    </div>
                    <div className="donation-amount-badge">
                        <Heart size={14} className={tier === 'legendary' ? 'text-amber-400' : tier === 'epic' ? 'text-purple-400' : 'text-accent'} />
                        <span>{donation.currency} {donation.amount}</span>
                    </div>
                </div>
                {donation.message && (
                    <div className="donation-message">
                        "{i18n.language === 'en' && donation.message_en ? donation.message_en : donation.message}"
                    </div>
                )}
            </div>
        )
    }

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
                <div 
                    className="donation-scroll-container"
                    onMouseEnter={() => animRef.current?.pause()}
                    onMouseLeave={() => animRef.current?.play()}
                    style={{ height: '100%', overflow: 'hidden' }}
                >
                    <div 
                        ref={trackRef}
                        className="donation-scroll-track"
                    >
                        {/* Render triple for seamless vertical loop */}
                        {donations.map((d, i) => renderDonationCard(d, `A-${i}`))}
                        {donations.map((d, i) => renderDonationCard(d, `B-${i}`))}
                        {donations.map((d, i) => renderDonationCard(d, `C-${i}`))}
                    </div>
                </div>
            )}
        </div>
    )
}
