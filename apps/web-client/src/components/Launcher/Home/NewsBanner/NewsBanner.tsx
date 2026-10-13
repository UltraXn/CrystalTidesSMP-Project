import React from 'react';
import type { NewsPost } from '../../mockLauncherState';
import { LAUNCHER_HOME_CONSTANTS } from '../constants';
import { NewsSlide } from './NewsSlide';
import { NewsBannerControls } from './NewsBannerControls';

export interface NewsBannerProps {
  news: NewsPost[];
  activeIndex: number;
  onSelectIndex: (index: number) => void;
  onPrev: () => void;
  onNext: () => void;
  onNavigateNews?: () => void;
  onHoverChange: (hover: boolean) => void;
}

export const NewsBanner: React.FC<Readonly<NewsBannerProps>> = ({
  news,
  activeIndex,
  onSelectIndex,
  onPrev,
  onNext,
  onNavigateNews,
  onHoverChange,
}) => {
  const currentPost = news[activeIndex] || news[0];

  return (
    <div
      className="reveal-up"
      style={{
        flex: 2.15,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        animationDelay: '0.06s',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: 12,
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
          }}
        >
          Novedades
        </h2>
        <button
          type="button"
          onClick={() => onNavigateNews?.()}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            fontSize: 11.5,
            fontWeight: 600,
            color: LAUNCHER_HOME_CONSTANTS.ACCENT_COLOR,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            opacity: 0.85,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '0.85';
          }}
          onFocus={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
          onBlur={(e) => {
            e.currentTarget.style.opacity = '0.85';
          }}
        >
          Ver todo
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>

      <section
        aria-roledescription="carousel"
        aria-label="Novedades del Launcher"
        className="hero-news-carousel"
        onMouseEnter={() => onHoverChange(true)}
        onMouseLeave={() => onHoverChange(false)}
        onFocus={() => onHoverChange(true)}
        onBlur={() => onHoverChange(false)}
        style={{
          flex: 1,
          position: 'relative',
          borderRadius: 20,
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          background: 'rgba(10, 15, 26, 0.6)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.4)',
          minHeight: 0,
        }}
      >
        {!currentPost ? (
          <div
            style={{
              padding: 20,
              color: 'rgba(255,255,255,0.5)',
              textAlign: 'center',
              margin: 'auto',
            }}
          >
            No hay novedades disponibles por ahora.
          </div>
        ) : (
          <NewsSlide
            post={currentPost}
            onNavigateNews={onNavigateNews}
            controls={
              <NewsBannerControls
                news={news}
                activeIndex={activeIndex}
                onSelectIndex={onSelectIndex}
                onPrev={onPrev}
                onNext={onNext}
              />
            }
          />
        )}
      </section>
    </div>
  );
};
