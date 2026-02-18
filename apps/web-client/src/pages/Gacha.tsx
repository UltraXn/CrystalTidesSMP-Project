import { useState, useEffect, useRef, useMemo } from 'react';
import { Star, Coins } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/UI/Loader';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Gacha3DShowcase from '../components/Gacha/Gacha3DShowcase';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchGachaHistory, rollGacha, checkMinecraftLink, initMinecraftLink } from '../services/apiService';
import gsap from 'gsap';

// Decomposed Components
import { GACHA_TIERS, Reward } from './Gacha/gachaConstants';
import GachaTierSelector from './Gacha/GachaTierSelector';
import GachaHistory from './Gacha/GachaHistory';
import GachaRewardCard from './Gacha/GachaRewardCard';
import GachaLinkPanel from './Gacha/GachaLinkPanel';
import GachaSlotMachine from './Gacha/GachaSlotMachine';

import './Gacha/GachaStyles.css';

export default function Gacha() {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const queryClient = useQueryClient();

    // Restricted Access Check
    const allowedRoles = ['admin', 'neroferno', 'killu', 'helper', 'developer'];
    const isAdmin = allowedRoles.includes(user?.user_metadata?.role?.toLowerCase());

    useEffect(() => {
        if (!authLoading && !isAdmin) {
            navigate('/');
        }
    }, [authLoading, isAdmin, navigate]);

    // Data Fetching
    const { data: historyData } = useQuery({
        queryKey: ['gachaHistory', user?.id],
        queryFn: () => fetchGachaHistory(),
        enabled: !!user && isAdmin
    });

    const { data: linkData } = useQuery({
        queryKey: ['minecraftLink', user?.id],
        queryFn: () => checkMinecraftLink(user!.id),
        enabled: !!user && isAdmin
    });

    // Mutations
    const rollMutation = useMutation({
        mutationFn: () => rollGacha(user!.id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gachaHistory'] });
        }
    });

    const linkInitMutation = useMutation({
        mutationFn: () => initMinecraftLink(user!.id)
    });

    // Local UI State
    const [isOpening, setIsOpening] = useState(false);
    const [reward, setReward] = useState<Reward | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [selectedTier, setSelectedTier] = useState(GACHA_TIERS[0]);
    const [linkingCode, setLinkingCode] = useState<string | null>(null);
    const [freeRolls] = useState<Record<string, boolean>>({});

    const [killuBalance, setKilluBalance] = useState(0); // Mock balance

    const history = historyData?.data || [];
    const isLinked = linkData?.linked || true; // Default to true for demo if not linked

    // Derived State
    const unlockedTiers = useMemo(() => {
        return linkData?.unlocked_tiers ? linkData.unlocked_tiers.split(',') : ['bronze'];
    }, [linkData]);

    const reelItemsSet = useMemo(() => {
        return [0, 1, 2].map(() => {
            const items = [];
            for (let i = 0; i < 60; i++) {
                // eslint-disable-next-line
                items.push(selectedTier.rewards[Math.floor(Math.random() * selectedTier.rewards.length)]);
            }
            return items;
        });
    }, [selectedTier]);

    // Refs for animations
    const containerRef = useRef<HTMLDivElement>(null);
    const reelRefs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];
    const rewardCardRef = useRef<HTMLDivElement>(null);

    const handleGenerateLinkCode = async () => {
        try {
            const data = await linkInitMutation.mutateAsync();
            if (data.success && data.code) {
                setLinkingCode(data.code);
            }
        } catch (e) { console.error(e); }
    };

    const handleOpen = async () => {
        if (isOpening || !isLinked) return;
        
        setIsOpening(true);
        setError(null);
        setReward(null);

        try {
            const tl = gsap.timeline();
            const offset = 4000;

            // Start API call
            rollMutation.mutate(undefined, {
                onSuccess: (data) => {
                    if (data.success && data.reward) {
                        setReward(data.reward);
                        setKilluBalance(prev => prev - (selectedTier.cost || 0));
                        
                        setTimeout(() => {
                            if (rewardCardRef.current) {
                                gsap.set(rewardCardRef.current, { display: 'flex', opacity: 0, scale: 0.8 });
                                gsap.to(rewardCardRef.current, { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.7)" });
                            }
                        }, 500);
                    } else {
                        setError(data.message || 'No has ganado esta vez');
                        setIsOpening(false);
                    }
                    if (data.success) setIsOpening(false);
                }
            });

            reelRefs.forEach((ref, i) => {
                const target = ref.current;
                if (target) {
                    tl.to(target, {
                        y: -offset,
                        duration: 4 + (i * 1),
                        ease: "power4.inOut",
                        onUpdate: () => {
                            const v = Math.abs(gsap.getProperty(target, "y") as number);
                            gsap.set(target, { filter: `blur(${Math.min(v/100, 4)}px)` });
                        },
                        onComplete: () => {
                            gsap.set(target, { filter: 'blur(0px)' });
                        }
                    }, 0);
                }
            });

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al tirar');
            setIsOpening(false);
        }
    };

    if (authLoading) return <div className="gacha-page"><Loader /></div>;
    if (!isAdmin) return null;

    return (
        <div className="gacha-page" ref={containerRef}>
            <div className="gacha-background">
                <div className="gradient-sphere sphere-1"></div>
                <div className="gradient-sphere sphere-2"></div>
            </div>

            <div className="gacha-container">
                <header className="gacha-header">
                    <span className="gacha-badge"><Star size={14} /> CRYSTAL SLOT</span>
                    <div className="balance-display" onClick={() => setKilluBalance(prev => prev + 100000)}>
                        <Coins size={18} /> {killuBalance.toLocaleString()} <span>KC</span>
                    </div>
                    <h1>{t('gacha.hero_title')}</h1>
                    <p>{t('gacha.hero_subtitle')}</p>
                </header>

                <main className="gacha-main">
                    {!isLinked ? (
                        <GachaLinkPanel linkingCode={linkingCode} generateLinkCode={handleGenerateLinkCode} />
                    ) : (
                        <>
                            <GachaTierSelector 
                                unlockedTiers={unlockedTiers}
                                selectedTierId={selectedTier.id}
                                onTierSelect={setSelectedTier}
                                isOpening={isOpening}
                                freeRolls={freeRolls}
                            />
                            <div className="gacha-game-layout">
                                <Gacha3DShowcase tierColor={selectedTier.color} />
                                <GachaSlotMachine 
                                    reelItemsSet={reelItemsSet}
                                    reelRefs={reelRefs}
                                    isOpening={isOpening}
                                    cooldown={false} // Manage cooldown via history/mutation if needed
                                    onOpen={handleOpen}
                                />
                            </div>
                        </>
                    )}
                    {error && <div className="gacha-error">{error}</div>}
                </main>

                <GachaRewardCard 
                    reward={reward} 
                    selectedTierId={selectedTier.id} 
                    onClose={() => { setReward(null); setIsOpening(false); }}
                    innerRef={rewardCardRef}
                />

                <GachaHistory 
                    history={history} 
                    isOpen={isHistoryOpen} 
                    onToggle={() => setIsHistoryOpen(!isHistoryOpen)} 
                />
            </div>
        </div>
    );
}
