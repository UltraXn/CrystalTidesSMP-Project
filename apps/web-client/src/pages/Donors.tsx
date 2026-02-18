import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import Section from "../components/Layout/Section"
import EmblaCarousel from "../components/UI/EmblaCarousel"
import { KoFiButton } from "../components/Widgets/KoFi"
import DonationFeed from "../components/Widgets/DonationFeed"
import { fetchSettings } from '../services/apiService'

const OPTIONS = { loop: true }

const RANK_IMAGES: Record<string, string> = {
    'donador': '/ranks/rank-donador.png',
    'fundador': '/ranks/rank-fundador.png',
    'killu': '/ranks/rank-killu.png',
    'neroferno': '/ranks/rank-neroferno.png',
    'developer': '/ranks/developer.png',
    'admin': '/ranks/admin.png',
    'mod': '/ranks/moderator.png',
    'helper': '/ranks/helper.png',
    'staff': '/ranks/staff.png'
}

interface DonorProfile {
    name: string;
    rank: React.ReactNode;
    image: string;
    description: string;
}

export default function Donors() {
    const { t, i18n } = useTranslation()

    // 1. Fetch Settings
    const { data: settingsData } = useQuery({
        queryKey: ['settings'],
        queryFn: fetchSettings,
        staleTime: 1000 * 60 * 5,
    });

    const HARDCODED_DONORS: DonorProfile[] = useMemo(() => [
        {
            name: "Killu Bysmali",
            rank: <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', alignItems: 'center' }}>
                    <img src="/ranks/rank-killu.png" alt={t('donors.ranks.killu')} title={t('donors.ranks.killu')} />
                  </div>,
            image: "/skins/killu.png?v=fixed",
            description: t('donors.profiles.killu')
        },
        {
            name: "Neroferno Ultranix",
            rank: <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', alignItems: 'center' }}>
                    <img src="/ranks/rank-neroferno.png" alt={t('donors.ranks.neroferno')} title={t('donors.ranks.neroferno')} />
                  </div>,
            image: "https://minotar.net/skin/344af588-8a7e-4053-9f03-92d68d96b86c",
            description: t('donors.profiles.neroferno')
        },
        {
            name: "Lawchihuahua",
            rank: <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', alignItems: 'center' }}>
                    <img src="/ranks/rank-fundador.png" alt={t('donors.ranks.fundador')} title={t('donors.ranks.fundador')} />
                  </div>,
            image: "/skins/law.png",
            description: t('donors.profiles.law')
        },
        {
            name: "pixiesixer",
            rank: <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', alignItems: 'center' }}>
                    <img src="/ranks/rank-fundador.png" alt={t('donors.ranks.fundador')} title={t('donors.ranks.fundador')} />
                  </div>,
            image: "https://minotar.net/skin/b47ee72ad3474abe9a081ab32f47153a",
            description: t('donors.profiles.pixie')
        },
        {
            name: "Zeta",
            rank: <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', alignItems: 'center' }}>
                    <img src="/ranks/rank-fundador.png" alt={t('donors.ranks.fundador')} title={t('donors.ranks.fundador')} />
                  </div>,
            image: "/skins/zeta.png",
            description: t('donors.profiles.zeta')
        },
        {
            name: "SendPles",
            rank: <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', alignItems: 'center' }}>
                    <img src="/ranks/rank-fundador.png" alt={t('donors.ranks.fundador')} title={t('donors.ranks.fundador')} />
                  </div>,
            image: "https://minotar.net/skin/5bec40ab-e459-474b-b96c-21ee1eae7d29",
            description: t('donors.profiles.sendples')
        },
        {
            name: "ZenXeone",
            rank: <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', alignItems: 'center' }}>
                    <img src="/ranks/rank-donador.png" alt={t('donors.ranks.donador')} title={t('donors.ranks.donador')} />
                  </div>,
            image: "https://minotar.net/skin/eacfb70c-c83a-4e0b-8465-ee4b0b86e041",
            description: t('donors.profiles.zen')
        },
        {
            name: "Churly",
            rank: (
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', alignItems: 'center' }}>
                    <img src="/ranks/rank-donador.png" alt={t('donors.ranks.donador')} title={t('donors.ranks.donador')} />
                    <img src="/ranks/developer.png" alt={t('donors.ranks.developer')} title={t('donors.ranks.developer')} />
                </div>
            ),
            image: "/skins/churly.png",
            description: t('donors.profiles.churly')
        },
        {
            name: "Nana Fubuki",
            rank: <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', alignItems: 'center' }}>
                    <img src="/ranks/rank-donador.png" alt={t('donors.ranks.donador')} title={t('donors.ranks.donador')} />
                  </div>,
            image: "/skins/nana-fubuki.png",
            description: t('donors.profiles.nana')
        }
    ], [t]);

    const hardcodedDescs = useMemo(() => {
        return HARDCODED_DONORS.reduce((acc, curr) => {
            acc[curr.name.toLowerCase()] = curr.description
            return acc
        }, {} as Record<string, string>)
    }, [HARDCODED_DONORS])

    const finalDonors = useMemo(() => {
        if (!settingsData?.donors_list) return HARDCODED_DONORS;

        interface DonorData {
            name: string;
            skinUrl?: string;
            description?: string;
            description_en?: string;
            ranks?: string[];
        }

        try {
            const parsed = typeof settingsData.donors_list === 'string' 
                ? JSON.parse(settingsData.donors_list) 
                : settingsData.donors_list;

            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed.map((d: DonorData) => ({
                    name: d.name,
                    image: d.skinUrl || `https://mc-heads.net/avatar/${d.name}/128`,
                    description: hardcodedDescs[d.name.toLowerCase()] || 
                                ((i18n.language === 'en' && d.description_en) ? d.description_en : d.description) || "",
                    rank: (
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', alignItems: 'center' }}>
                            {(d.ranks || []).map((r: string) => (
                                RANK_IMAGES[r] ? <img key={r} src={RANK_IMAGES[r]} alt={t(`donors.ranks.${r}`)} title={t(`donors.ranks.${r}`)} /> : null
                            ))}
                        </div>
                    )
                }));
            }
        } catch (e) {
            console.error("Error parsing dynamic donors", e);
        }
        return HARDCODED_DONORS;
    }, [settingsData, HARDCODED_DONORS, hardcodedDescs, i18n.language, t]);

    return (
        <div className="pt-24 min-h-screen">
            <Section title={
                <div className="flex items-center justify-center gap-3">
                    <img src="/skins/kiru.png" alt="icon" className="h-[1.5em] w-auto animate-pulse" /> 
                    <span className="uppercase tracking-widest">{t('donors.title')}</span>
                </div>
            }>
                {/* Intro */}
                <div className="max-w-3xl mx-auto mb-16 text-center">
                    <p className="text-gray-400 text-lg leading-relaxed">{t('donors.intro')}</p>
                </div>

                {/* Latest Donations */}
                <div className="mb-24">
                    <div className="flex items-center justify-center gap-4 mb-8">
                        <div className="h-px w-16 bg-linear-to-r from-transparent to-(--accent)"></div>
                        <h3 className="text-2xl font-black uppercase tracking-widest text-white">{t('donors.latest_title')}</h3>
                        <div className="h-px w-16 bg-linear-to-l from-transparent to-(--accent) text-(--accent)"></div>
                    </div>
                    <DonationFeed />
                </div>

                {/* Carousel Section */}
                <div className="relative">
                    <div className="mb-12 flex justify-center w-full">
                        <div className="transform transition-transform hover:scale-105 active:scale-95">
                            <KoFiButton text={t('hero.kofi_text')} />
                        </div>
                    </div>
                    <div className="w-full max-w-[1400px] mx-auto">
                        <EmblaCarousel slides={finalDonors} options={OPTIONS} />
                    </div>
                </div>
            </Section>
        </div>
    )
}
