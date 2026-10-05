import React from 'react';
import type { NewsPost } from '../../mockLauncherState';
import { LAUNCHER_HOME_CONSTANTS, categoryStyle, timeAgo } from '../constants';

export interface NewsSlideProps {
  post: NewsPost;
  onNavigateNews?: () => void;
  controls?: React.ReactNode;
}

export const NewsSlide: React.FC<Readonly<NewsSlideProps>> = ({
  post,
  onNavigateNews,
  controls,
}) => {
  const currentStyle = categoryStyle(post.category);

  return (
    <>
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        {post.imageUrl ? (
          <img
            src={post.imageUrl}
            alt=""
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: 'brightness(0.65)',
              transition:
                'color 0.5s ease, background-color 0.5s ease, border-color 0.5s ease, opacity 0.5s ease',
            }}
            onError={(e) => (e.currentTarget.style.display = 'none')}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              background: currentStyle.thumb,
              opacity: 0.85,
            }}
          />
        )}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, rgba(10, 15, 26, 0.15) 0%, rgba(10, 15, 26, 0.7) 55%, rgba(10, 15, 26, 0.95) 100%)',
          }}
        />
      </div>

      <div
        style={{
          position: 'relative',
          zIndex: 2,
          padding: '20px 24px 18px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          height: '100%',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <span
            style={{
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              padding: '4px 12px',
              borderRadius: 999,
              color: currentStyle.color,
              background: currentStyle.background,
              border: `1px solid ${currentStyle.border}`,
              backdropFilter: 'blur(8px)',
              boxShadow: `0 0 12px ${currentStyle.border}`,
            }}
          >
            {post.category}
          </span>
          <span
            style={{
              fontSize: 11,
              color: LAUNCHER_HOME_CONSTANTS.TEXT_MUTED_60,
              fontWeight: 500,
            }}
          >
            {timeAgo(post.createdAt)}
          </span>
        </div>

        <h3
          style={{
            margin: '0 0 6px 0',
            fontSize: 20,
            fontWeight: 800,
            lineHeight: 1.25,
            color: '#FFFFFF',
            letterSpacing: '-0.01em',
            textShadow: '0 2px 10px rgba(0,0,0,0.5)',
          }}
        >
          {post.title}
        </h3>

        <p
          style={{
            margin: '0 0 14px 0',
            fontSize: 12.5,
            color: 'rgba(255, 255, 255, 0.78)',
            lineHeight: 1.45,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            maxWidth: '92%',
          }}
        >
          {post.content}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            type="button"
            onClick={() => onNavigateNews?.()}
            style={{
              background: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              color: '#FFFFFF',
              fontSize: 11.5,
              fontWeight: 700,
              padding: '7px 16px',
              borderRadius: 10,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              backdropFilter: 'blur(8px)',
              transition:
                'color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease, opacity 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = LAUNCHER_HOME_CONSTANTS.ACCENT_COLOR;
              e.currentTarget.style.color = '#052A26';
              e.currentTarget.style.borderColor = LAUNCHER_HOME_CONSTANTS.ACCENT_COLOR;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
              e.currentTarget.style.color = '#FFFFFF';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
            }}
          >
            <span>Leer noticia completa</span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>

          {controls}
        </div>
      </div>
    </>
  );
};
