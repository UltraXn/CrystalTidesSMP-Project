import { Loader2, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Poll, PollOption } from './types';

interface PollWidgetProps {
  poll: Poll | null;
  isLoading: boolean;
  voted: boolean;
  onVote: (optionId: number) => void;
}

export default function PollWidget({ poll, isLoading, voted, onVote }: Readonly<PollWidgetProps>) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-[2.5rem] border border-white/10 bg-white/5 p-12">
        <Loader2 className="animate-spin text-white/20" size={32} />
        <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
          {t('suggestions.loading_poll')}
        </p>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 rounded-[2.5rem] border border-white/10 bg-white/5 p-12 text-center opacity-50">
        <AlertTriangle size={48} className="text-white/10" />
        <p className="max-w-50 text-sm/relaxed font-bold uppercase tracking-widest text-gray-400">
          {t('suggestions.no_active_poll')}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 rounded-[2.5rem] border border-white/10 bg-white/5 p-8 backdrop-blur-xl md:p-10">
      <div>
        <div className="text-(--accent) mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em]">
          <span className="bg-(--accent) size-1.5 animate-pulse rounded-full" />
          {poll.title}
        </div>
        <h4 className="text-2xl/tight font-black uppercase tracking-tight text-white">
          {poll.question}
        </h4>
      </div>

      <div className="flex flex-col gap-4">
        {(poll.options || []).map((option: PollOption) => {
          const widthStyle = voted ? `${option.percent}%` : '0%';
          const optionBtnClass = voted
            ? 'cursor-default'
            : 'cursor-pointer hover:bg-white/10 hover:border-white/20 active:scale-95';
          const labelClass = voted ? 'text-white' : 'text-gray-400 group-hover:text-white';

          return (
            <button
              key={option.id}
              type="button"
              disabled={voted}
              className={`group relative h-14 w-full overflow-hidden rounded-2xl border border-white/5 bg-white/5 text-left transition-colors ${optionBtnClass}`}
              onClick={() => onVote(option.id)}
            >
              <div
                className="bg-linear-to-r absolute inset-y-0 left-0 from-cyan-500/35 via-blue-500/25 to-indigo-500/35 transition-colors duration-1000 ease-out"
                style={{ width: widthStyle }}
              >
                {voted && option.percent > 0 && (
                  <div className="absolute inset-y-0 right-0 w-1 rounded-full bg-cyan-400 shadow-[0_0_12px_#22d3ee]" />
                )}
              </div>

              <div className="pointer-events-none relative z-10 flex h-full items-center justify-between px-6">
                <span
                  className={`text-sm font-black uppercase tracking-widest transition-colors ${labelClass}`}
                >
                  {option.label}
                </span>
                {voted && (
                  <span className="text-(--accent) font-mono font-bold">
                    {poll.totalVotes > 0 ? `${option.percent}%` : '0%'}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-4 border-t border-white/5 pt-6">
        <div className="flex items-center justify-between px-2 text-[10px] font-black uppercase tracking-widest text-gray-500">
          <span>Total: {poll.totalVotes} votos</span>
          <span>Cierra en: {poll.closesIn}</span>
        </div>
        {voted && (
          <p className="animate-bounce text-center text-xs font-black uppercase tracking-widest text-emerald-400">
            {t('suggestions.thanks_vote')}
          </p>
        )}
      </div>
    </div>
  );
}
