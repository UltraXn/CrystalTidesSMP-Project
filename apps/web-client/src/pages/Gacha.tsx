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
import { GACHA_TIERS, VISUAL_REWARDS, Reward } from './Gacha/gachaConstants';
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
    const { data: historyData, refetch: refetchHistory } = useQuery({
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
    const [killuBalance, setKilluBalance] = useState(0); // Mock balance
    const [unlockedTiers, setUnlockedTiers] = useState<string[]>(['bronze']);
    const [freeRolls, setFreeRolls] = useState<Record<string, boolean>>({});

    const history = historyData?.data || [];
    const isLinked = linkData?.linked || true; // Default to true for demo if not linked

    // Refs for animations
    const containerRef = useRef<HTMLDivElement>(null);
    const reelRefs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];
    const rewardCardRef = useRef<HTMLDivElement>(null);

    // Sync Unlocked Tiers from linkData
    useEffect(() => {
        if (linkData?.unlocked_tiers) {
            setUnlockedTiers(linkData.unlocked_tiers.split(','));
        }
    }, [linkData]);

    const handleGenerateLinkCode = async () => {
        try {
            const data = await linkInitMutation.mutateAsync();
            if (data.success && data.code) {
                setLinkingCode(data.code);
            }
        } catch (e) { console.error(e); }
    };

    const reelItemsSet = useMemo(() => {
        return [0, 1, 2].map(() => {
            const items = [];
            for (let i = 0; i < 60; i++) {
                items.push(selectedTier.rewards[Math.floor(Math.random() * selectedTier.rewards.length)]);
            }
            return items;
        });
    }, [selectedTier]);

    const handleOpen = async () => {
        if (!user || isOpening || !isLinked) return;

        const hasFreeRoll = freeRolls[selectedTier.id];
        if (!hasFreeRoll && killuBalance < selectedTier.cost && selectedTier.id !== 'ultra') {
            setError('Saldo insuficiente.');
            return;
        }

        setIsOpening(true);
        setReward(null);
        setError(null);

        try {
            // Subtle shake on spin btn (UI only)
            gsap.to('.spin-btn', { x: "random(-2, 2)", duration: 0.1, repeat: 5, yoyo: true });

            const data = await rollMutation.mutateAsync();
            
            // Animation logic
            reelItemsSet.forEach((reel, i) => {
                const targetReward = data.success 
                    ? VISUAL_REWARDS.find(r => r.name === data.data.reward_name) || VISUAL_REWARDS[0]
                    : VISUAL_REWARDS[(i + Math.floor(Math.random() * 5)) % VISUAL_REWARDS.length];
                reel[45] = targetReward;
            });

            reelRefs.forEach(ref => gsap.set(ref.current, { y: 0, filter: 'blur(0px)' }));
            const itemHeight = 160;
            const stopIndex = 45; 
            const offset = (stopIndex * itemHeight) - 80;

            const tl = gsap.timeline({
                onComplete: () => {
                    if (data.success) {
                        setReward(data.data);
                        setTimeout(() => {
                            gsap.set(rewardCardRef.current, { display: 'flex' });
                            gsap.fromTo(rewardCardRef.current, 
                                { scale: 0, rotationY: 180, opacity: 0 },
                                { scale: 1, rotationY: 0, opacity: 1, duration: 1, ease: "back.out(1.7)" }
                            );
                        }, 500);
                    } else {
                        setError(data.message || 'No has ganado esta vez');
                        setIsOpening(false);
                    }
                    if (data.success) setIsOpening(false);
                }
            });

            reelRefs.forEach((ref, i) => {
                tl.to(ref.current, {
                    y: -offset,
                    duration: 4 + (i * 1),
                    ease: "power4.inOut",
                    onUpdate: function() {
                        const v = Math.abs(gsap.getProperty(this.targets()[0], "y") as number);
                        gsap.set(this.targets()[0], { filter: `blur(${Math.min(v/100, 4)}px)` });
                    },
                    onComplete: () => gsap.set(ref.current, { filter: 'blur(0px)' })
                }, 0);
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
