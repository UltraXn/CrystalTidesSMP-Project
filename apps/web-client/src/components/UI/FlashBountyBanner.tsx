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
    const controller = new AbortController();

    // Fetch active Flash Bounty from Backend API
    fetch('/api/bounties/active', { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data.success && data.bounty && !data.bounty.isExpired) {
          setBounty(data.bounty);
          setTimeLeft(data.bounty.remainingSeconds);
        }
      })
      .catch((err) => {
        if (err?.name === 'AbortError') return;
        // Fallback demo bounty if API unreachable
        setBounty({
          id: 'bounty-ignis-001',
          bossId: 'ignis',
          bossName: 'Ignis (Jefe Imperial del Fuego)',
          location: 'Altar Imperial del Nether',
          multiplier: '2.5x KC',
          rewardKc: 5000,
          remainingSeconds: 2700,
          isExpired: false,
        });
        setTimeLeft(2700);
      });

    return () => controller.abort();
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
      className="bg-linear-to-r relative my-6 overflow-hidden rounded-2xl border border-amber-500/40 from-red-950/80 via-amber-950/70 to-slate-950/90 p-4 shadow-[0_0_30px_rgba(245,158,11,0.25)] backdrop-blur-md"
    >
      {/* Background Animated Pulse Glow */}
      <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 animate-pulse rounded-full bg-amber-500/20 blur-3xl" />

      <div className="relative z-10 flex flex-col items-center justify-between gap-4 md:flex-row">
        {/* Left Side: Title & Info */}
        <div className="flex items-center gap-3">
          <div className="animate-bounce rounded-xl border border-amber-500/50 bg-amber-500/20 p-3 text-amber-400">
            <Flame className="h-6 w-6" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-slate-950">
                <Sparkles className="h-3 w-3" /> Flash Bounty Activa
              </span>
              <span className="flex items-center gap-1 font-mono text-xs text-amber-300/80">
                <ShieldAlert className="h-3.5 w-3.5" /> {bounty.location}
              </span>
            </div>

            <h3 className="mt-1 text-lg font-bold text-white md:text-xl">{bounty.bossName}</h3>
          </div>
        </div>

        {/* Center: Multiplier & KC Reward */}
        <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-slate-900/80 px-4 py-2">
          <div className="text-center">
            <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Multiplicador
            </span>
            <span className="text-xl font-black text-amber-400">{bounty.multiplier}</span>
          </div>

          <div className="h-8 w-px bg-white/10" />

          <div className="text-center">
            <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Recompensa Base
            </span>
            <span className="text-xl font-black text-emerald-400">+{bounty.rewardKc} KC</span>
          </div>
        </div>

        {/* Right Side: Countdown Timer & CTA */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-slate-950/80 px-3 py-2 font-mono text-lg font-bold text-amber-400">
            <Timer className="animate-spin-slow h-5 w-5 text-amber-400" />
            <span>{formattedTime}</span>
          </div>

          <Link
            to="/wiki/ignis"
            className="bg-linear-to-r flex items-center gap-1 rounded-xl from-amber-500 to-amber-600 px-4 py-2.5 text-sm font-bold text-slate-950 shadow-lg transition-all hover:from-amber-400 hover:to-amber-500 hover:shadow-amber-500/30"
          >
            Ir a Cazar <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default FlashBountyBanner;
