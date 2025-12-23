import { useState } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { FaCoins, FaBoxOpen, FaStar, FaGem, FaGift } from 'react-icons/fa';
// @ts-ignore
import confetti from 'canvas-confetti';
import { IconType } from 'react-icons';

interface Reward {
    id: string;
    name: string;
    rarity: string;
    color: string;
    icon: IconType;
}

// Mock Rewards for now
const REWARDS = [
    { id: 'common_xp', name: '100 XP', rarity: 'common', color: '#b0c3d9', icon: FaStar },
    { id: 'rare_coin', name: '50 KilluCoins', rarity: 'rare', color: '#0070dd', icon: FaCoins },
    { id: 'epic_medal', name: 'Medalla Beta Tester', rarity: 'epic', color: '#a335ee', icon: FaGem },
    { id: 'legendary_vip', name: 'VIP 3 Días', rarity: 'legendary', color: '#ff8000', icon: FaGift },
];

export default function Gacha() {

    const [balance, setBalance] = useState(1000); // Mock balance
    const [isOpening, setIsOpening] = useState(false);
    const [reward, setReward] = useState<Reward | null>(null);

    const handleOpen = () => {
        if (balance < 100 || isOpening) return;

        setBalance(prev => prev - 100);
        setIsOpening(true);
        setReward(null);

        // Simulate network delay / animation time
        setTimeout(() => {
            const randomReward = REWARDS[Math.floor(Math.random() * REWARDS.length)];
            setReward(randomReward);
            setIsOpening(false);
            
            // Trigger Confetti
            if (randomReward.rarity === 'legendary' || randomReward.rarity === 'epic') {
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: [randomReward.color, '#ffffff']
                });
            } else {
                confetti({
                    particleCount: 50,
                    spread: 50,
                    origin: { y: 0.6 }
                });
            }

        }, 3000);
    };

    return (
        <div className="gacha-container fade-in">
            <style>{`
                .gacha-container {
                    padding-top: 6rem;
                    min-height: 100vh;
                    background: radial-gradient(circle at center, #1a1a2e 0%, #000000 100%);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    color: white;
                    overflow: hidden;
                }
                .crate-area {
                    position: relative;
                    width: 300px;
                    height: 300px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 3rem 0;
                    perspective: 1000px;
                }
                .crate {
                    font-size: 10rem;
                    color: var(--accent);
                    filter: drop-shadow(0 0 20px rgba(51, 193, 255, 0.4));
                    cursor: pointer;
                    transition: transform 0.2s;
                }
                .crate:hover {
                    transform: scale(1.05);
                }
                .action-btn {
                    background: linear-gradient(45deg, #FFD700, #FFA500);
                    border: none;
                    padding: 1rem 3rem;
                    font-size: 1.5rem;
                    font-weight: bold;
                    color: #000;
                    border-radius: 50px;
                    cursor: pointer;
                    box-shadow: 0 5px 20px rgba(255, 215, 0, 0.4);
                    transition: transform 0.2s, box-shadow 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }
                .action-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                    filter: grayscale(1);
                }
                .action-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 30px rgba(255, 215, 0, 0.6);
                }
                .reward-card {
                    background: rgba(255,255,255,0.1);
                    backdrop-filter: blur(10px);
                    padding: 2rem;
                    border-radius: 20px;
                    text-align: center;
                    border: 2px solid;
                    min-width: 300px;
                }
                .rarity-common { border-color: #b0c3d9; box-shadow: 0 0 20px rgba(176, 195, 217, 0.3); }
                .rarity-rare { border-color: #0070dd; box-shadow: 0 0 20px rgba(0, 112, 221, 0.4); }
                .rarity-epic { border-color: #a335ee; box-shadow: 0 0 30px rgba(163, 53, 238, 0.5); }
                .rarity-legendary { border-color: #ff8000; box-shadow: 0 0 40px rgba(255, 128, 0, 0.6); }
                
                .glow-bg {
                    position: absolute;
                    width: 600px;
                    height: 600px;
                    background: radial-gradient(circle, var(--accent) 0%, transparent 60%);
                    opacity: 0.1;
                    z-index: 0;
                    animation: pulse 4s infinite alternate;
                }
                @keyframes pulse { from { opacity: 0.05; transform: scale(0.8); } to { opacity: 0.2; transform: scale(1.1); } }
            `}</style>
            
            <div className="glow-bg" />

            {/* Header */}
            <div style={{ zIndex: 1, textAlign: 'center' }}>
                <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>KilluCoin Gacha</h1>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,0,0,0.5)', padding: '0.5rem 1.5rem', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.2)' }}>
                    <FaCoins style={{ color: '#FFD700' }} />
                    <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{balance.toLocaleString()} KC</span>
                </div>
            </div>

            {/* Main Area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 1, width: '100%' }}>
                
                <AnimatePresence mode="wait">
                    {reward ? (
                        <Motion.div 
                            key="reward"
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                            className={`reward-card rarity-${reward.rarity}`}
                        >
                            <div style={{ fontSize: '4rem', color: reward.color, marginBottom: '1rem' }}>
                                <reward.icon />
                            </div>
                            <h2 style={{ color: reward.color, textTransform: 'uppercase', marginBottom: '0.5rem' }}>{reward.rarity}</h2>
                            <h3 style={{ fontSize: '2rem' }}>{reward.name}</h3>
                            <button 
                                className="btn-secondary" 
                                style={{ marginTop: '2rem', width: '100%' }}
                                onClick={() => setReward(null)}
                            >
                                Abrir otra
                            </button>
                        </Motion.div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <Motion.div 
                                className="crate-area"
                                animate={isOpening ? { 
                                    scale: [1, 1.1, 0.9, 1.1, 1],
                                    rotate: [0, -5, 5, -5, 0],
                                    filter: ['brightness(1)', 'brightness(2)', 'brightness(1)']
                                } : { y: [0, -20, 0] }}
                                transition={isOpening ? { duration: 0.5, repeat: 5 } : { duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <FaBoxOpen className="crate" />
                            </Motion.div>
                            
                            {!isOpening && (
                                <button className="action-btn" onClick={handleOpen} disabled={balance < 100}>
                                    <FaBoxOpen /> Abrir Caja (100 KC)
                                </button>
                            )}
                            
                             {isOpening && (
                                <h2 style={{ marginTop: '2rem', animation: 'blink 1s infinite' }}>Abriendo...</h2>
                            )}
                        </div>
                    )}
                </AnimatePresence>

            </div>
        </div>
    )
}
