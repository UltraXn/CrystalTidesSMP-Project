import React, { useState, useEffect } from 'react';
import { m as motion } from 'framer-motion';
import { Flame, ShieldAlert, Timer, Sparkles, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BountyData {
  id: string;
  bossId: string;
  bossName: string;
  location: string;
  multiplier: string;
  rewardKc: number;
  remainingSeconds: number;
  isExpired: boolean;
}

export const FlashBountyBanner: React.FC = () => {
  const [bounty, setBounty] = useState<BountyData | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    // Fetch active Flash Bounty from Backend API
    fetch('/api/bounties/active')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.bounty && !data.bounty.isExpired) {
          setBounty(data.bounty);
          setTimeLeft(data.bounty.remainingSeconds);
        }
      })
      .catch(() => {
        // Fallback demo bounty if API unreachable
        setBounty({
          id: 'bounty-ignis-001',
          bossId: 'ignis',
          bossName: 'Ignis (Jefe Imperial del Fuego)',
          location: 'Altar Imperial del Nether',
          multiplier: '2.5x KC',
          rewardKc: 5000,
          remainingSeconds: 2700,
          isExpired: false
        });
        setTimeLeft(2700);
      });
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  if (!bounty || timeLeft <= 0) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl bg-linear-to-r from-red-950/80 via-amber-950/70 to-slate-950/90 border border-amber-500/40 p-4 shadow-[0_0_30px_rgba(245,158,11,0.25)] backdrop-blur-md my-6"
    >
      {/* Background Animated Pulse Glow */}
      <div className="absolute -left-10 -top-10 w-40 h-40 bg-amber-500/20 rounded-full blur-3xl animate-pulse pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left Side: Title & Info */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/20 rounded-xl border border-amber-500/50 text-amber-400 animate-bounce">
            <Flame className="w-6 h-6" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-slate-950 uppercase tracking-wide flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Flash Bounty Activa
              </span>
              <span className="text-xs text-amber-300/80 font-mono flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" /> {bounty.location}
              </span>
            </div>

            <h3 className="text-lg md:text-xl font-bold text-white mt-1">
              {bounty.bossName}
            </h3>
          </div>
        </div>

        {/* Center: Multiplier & KC Reward */}
        <div className="flex items-center gap-4 bg-slate-900/80 px-4 py-2 rounded-xl border border-white/10">
          <div className="text-center">
            <span className="block text-[10px] text-slate-400 uppercase tracking-widest font-bold">Multiplicador</span>
            <span className="text-xl font-black text-amber-400">{bounty.multiplier}</span>
          </div>

          <div className="h-8 w-px bg-white/10" />

          <div className="text-center">
            <span className="block text-[10px] text-slate-400 uppercase tracking-widest font-bold">Recompensa Base</span>
            <span className="text-xl font-black text-emerald-400">+{bounty.rewardKc} KC</span>
          </div>
        </div>

        {/* Right Side: Countdown Timer & CTA */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-950/80 rounded-xl border border-amber-500/30 text-amber-400 font-mono font-bold text-lg">
            <Timer className="w-5 h-5 text-amber-400 animate-spin-slow" />
            <span>{formattedTime}</span>
          </div>

          <Link
            to="/wiki/ignis"
            className="flex items-center gap-1 px-4 py-2.5 rounded-xl bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold transition-all shadow-lg hover:shadow-amber-500/30 text-sm"
          >
            Ir a Cazar <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default FlashBountyBanner;
