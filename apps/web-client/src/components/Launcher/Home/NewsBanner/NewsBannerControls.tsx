import React from 'react';
import type { NewsPost } from '../../mockLauncherState';
import { LAUNCHER_HOME_CONSTANTS } from '../constants';

export interface NewsBannerControlsProps {
  news: NewsPost[];
  activeIndex: number;
  onSelectIndex: (index: number) => void;
  onPrev: () => void;
  onNext: () => void;
}

export const NewsBannerControls: React.FC<Readonly<NewsBannerControlsProps>> = ({
  news,
  activeIndex,
  onSelectIndex,
  onPrev,
  onNext,
}) => {
  if (news.length <= 1) return null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ display: 'flex', gap: 6 }}>
        <button
          aria-label="Noticia anterior"
          type="button"
          onClick={onPrev}
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            background: 'rgba(0, 0, 0, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#FFF',
            fontSize: 10,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(6px)',
            transition: 'color 0.2s, background-color 0.2s, border-color 0.2s, opacity 0.2s',
          }}
        >
          <span aria-hidden="true">◀</span>
        </button>
        <button
          aria-label="Noticia siguiente"
          type="button"
          onClick={onNext}
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            background: 'rgba(0, 0, 0, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#FFF',
            fontSize: 10,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(6px)',
            transition: 'color 0.2s, background-color 0.2s, border-color 0.2s, opacity 0.2s',
          }}
        >
          <span aria-hidden="true">▶</span>
        </button>
      </div>

      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        {news.map((post, idx) => (
          <button
            aria-label={`Ir a noticia ${idx + 1}: ${post.title}`}
            aria-pressed={activeIndex === idx}
            type="button"
            key={post.id}
            onClick={() => onSelectIndex(idx)}
            style={{
              width: activeIndex === idx ? 18 : 7,
              height: 7,
              borderRadius: 999,
              background:
                activeIndex === idx
                  ? LAUNCHER_HOME_CONSTANTS.ACCENT_COLOR
                  : 'rgba(255, 255, 255, 0.3)',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              transition:
                'color 0.3s ease, background-color 0.3s ease, border-color 0.3s ease, opacity 0.3s ease',
            }}
          />
        ))}
      </div>
    </div>
  );
};
