import React from 'react';
import { Medal, Lock, Share2 } from 'lucide-react';

export interface AchievementCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    unlocked: boolean;
    criteria?: string;
    onShare?: () => void;
    color?: string;
}

const AchievementCard = ({ title, description, icon, unlocked, criteria, onShare, color = '#4CAF50' }: AchievementCardProps) => (
    <div 
        className={`group relative flex flex-col items-center text-center p-8 rounded-4xl transition-all duration-500 overflow-hidden ${unlocked ? 'bg-white/5 border border-white/5 hover:bg-white/10 hover:-translate-y-1' : 'bg-transparent border border-dashed border-white/10 opacity-60'}`}
        style={{ '--accent-color': color } as React.CSSProperties}
    >
        {/* Background Glow */}
        {unlocked && (
            <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none"
                style={{ background: `radial-gradient(circle at center, ${color} 0%, transparent 70%)` }}
            />
        )}

        {/* Status Badges */}
        <div className="absolute top-6 right-6 flex flex-col gap-2">
            {unlocked ? (
                <>
                    <div 
                        className="w-9 h-9 flex items-center justify-center bg-white/5 rounded-full"
                        style={{ color }}
                    >
                        <Medal size={14} className="drop-shadow-[0_0_8px_currentColor]" />
                    </div>
                    {onShare && (
                        <button 
                            onClick={(e) => { e.stopPropagation(); onShare(); }}
                            className="w-9 h-9 flex items-center justify-center bg-white/5 border border-white/10 rounded-full text-white transition-all hover:bg-(--accent-color) hover:text-black hover:scale-110 active:scale-90"
                            title="Compartir Logro"
                        >
                            <Share2 size={12} />
                        </button>
                    )}
                </>
            ) : (
                <div className="w-9 h-9 flex items-center justify-center bg-white/2 rounded-full text-gray-700">
                    <Lock size={12} />
                </div>
            )}
        </div>
        
        {/* Icon Container */}
        <div className={`relative w-20 h-20 flex items-center justify-center rounded-3xl mb-6 transition-all duration-500 ${unlocked ? 'bg-white/5 border border-white/10 shadow-2xl group-hover:scale-110' : 'bg-white/2 border border-white/5 grayscale opacity-30 shadow-none'}`}>
             <div className="text-4xl">
                {icon}
             </div>
             {unlocked && (
                <div 
                    className="absolute inset-0 rounded-3xl opacity-20 blur-xl pointer-events-none"
                    style={{ backgroundColor: color }}
                />
             )}
        </div>
        
        {/* Text Content */}
        <div className="space-y-3">
            <h3 className={`text-lg font-black uppercase tracking-tighter transition-colors ${unlocked ? 'text-white' : 'text-gray-600'}`}>
                {title}
            </h3>
            <p className={`text-xs font-medium leading-relaxed max-w-[180px] mx-auto transition-colors ${unlocked ? 'text-gray-400' : 'text-gray-700'}`}>
                {description}
            </p>
            
            {!unlocked && criteria && (
                <div className="mt-4 inline-block px-3 py-1 bg-black/40 rounded-lg border border-white/5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-700 italic">
                        🔒 {criteria}
                    </p>
                </div>
            )}
        </div>

        {/* Progress Line (Decorative) */}
        {unlocked && (
            <div 
                className="absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full transition-all duration-700 ease-out"
                style={{ backgroundColor: color }}
            />
        )}
    </div>
)

export default AchievementCard;
