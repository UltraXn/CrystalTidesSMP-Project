import type { useTranslation } from 'react-i18next';
import { Calendar, Eye } from 'lucide-react';
import MarkdownRenderer from '../UI/MarkdownRenderer';
import PollDisplay from './PollDisplay';
import ForumAuthorHeader from './ForumAuthorHeader';
import ForumThreadActionButtons from './ForumThreadActionButtons';
import type { Thread } from '../../types/forum';

interface ForumThreadArticleProps {
  readonly thread: Thread;
  readonly isTopic: boolean;
  readonly isEditingThread: boolean;
  readonly editThreadData: { title: string; content: string };
  readonly isOwnerOrAdmin: boolean;
  readonly isAdmin: boolean;
  readonly onEditThreadDataChange: React.Dispatch<
    React.SetStateAction<{ title: string; content: string }>
  >;
  readonly onStartEditThread: () => void;
  readonly onCancelEditThread: () => void;
  readonly onUpdateThread: () => void;
  readonly onDeleteThread: () => void;
  readonly onTogglePin: () => void;
  readonly onToggleLock: () => void;
  readonly t: ReturnType<typeof useTranslation>['t'];
  readonly language: string;
}

export default function ForumThreadArticle({
  thread,
  isTopic,
  isEditingThread,
  editThreadData,
  isOwnerOrAdmin,
  isAdmin,
  onEditThreadDataChange,
  onStartEditThread,
  onCancelEditThread,
  onUpdateThread,
  onDeleteThread,
  onTogglePin,
  onToggleLock,
  t,
  language,
}: Readonly<ForumThreadArticleProps>) {
  return (
    <article
      style={{
        background: 'rgba(30, 30, 40, 0.6)',
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.05)',
        marginBottom: '3rem',
      }}
    >
      {thread.image && (
        <div
          style={{
            width: '100%',
            height: '300px',
            overflow: 'hidden',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <img
            src={thread.image}
            alt={thread.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      )}

      <div style={{ padding: '3rem' }}>
        <div
          style={{
            marginBottom: '2rem',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            paddingBottom: '1.5rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1rem',
              alignItems: 'center',
              marginBottom: '1rem',
            }}
          >
            {thread.tag && (
              <span
                style={{
                  background: 'var(--accent)',
                  color: '#000',
                  padding: '0.3rem 0.8rem',
                  borderRadius: '4px',
                  fontSize: '0.8rem',
                  fontWeight: 'bold',
                }}
              >
                {thread.tag}
              </span>
            )}
            <span
              style={{
                color: 'var(--muted)',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <Calendar /> {thread.longDate}
            </span>
            <span
              style={{
                color: 'var(--muted)',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <Eye /> {thread.views} {t('forum_thread.views')}
            </span>
          </div>

          {/* Thread Title Area - Edit or View */}
          {isEditingThread ? (
            <div style={{ marginBottom: '1.5rem' }}>
              <input
                aria-label={t('forum_thread.edit_title', 'Editar título del tema')}
                className="form-input"
                style={{
                  width: '100%',
                  fontSize: '1.5rem',
                  marginBottom: '1rem',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid #444',
                  color: '#fff',
                }}
                value={editThreadData.title}
                onChange={(e) =>
                  onEditThreadDataChange((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
              />
            </div>
          ) : (
            <h1 style={{ fontSize: '2.5rem', color: '#fff', lineHeight: 1.2 }}>
              {language === 'en' && thread?.title_en ? thread.title_en : thread.title}
            </h1>
          )}

          <div className="mb-6 mt-8 flex items-center justify-between border-b border-white/5 pb-6">
            <ForumAuthorHeader thread={thread} />
            <ForumThreadActionButtons
              isTopic={isTopic}
              isOwnerOrAdmin={isOwnerOrAdmin}
              isEditingThread={isEditingThread}
              isAdmin={isAdmin}
              pinned={thread.pinned}
              locked={thread.locked}
              onTogglePin={onTogglePin}
              onToggleLock={onToggleLock}
              onStartEditThread={onStartEditThread}
              onDeleteThread={onDeleteThread}
              onUpdateThread={onUpdateThread}
              onCancelEditThread={onCancelEditThread}
            />
          </div>
        </div>

        {/* Thread Content Area - Edit or View */}
        {isEditingThread ? (
          <textarea
            aria-label={t('forum_thread.edit_content', 'Editar contenido del tema')}
            className="form-textarea"
            value={editThreadData.content}
            onChange={(e) =>
              onEditThreadDataChange((prev) => ({
                ...prev,
                content: e.target.value,
              }))
            }
            rows={10}
            style={{
              width: '100%',
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid #444',
              color: '#e0e0e0',
              fontSize: '1.1rem',
              padding: '1rem',
            }}
          />
        ) : (
          <div
            className="thread-content"
            style={{
              color: '#e0e0e0',
              fontSize: '1.1rem',
              lineHeight: 1.8,
              whiteSpace: 'pre-wrap',
            }}
          >
            <MarkdownRenderer
              content={language === 'en' && thread?.content_en ? thread.content_en : thread.content}
            />
          </div>
        )}

        {/* Poll Component */}
        {!isEditingThread && thread.poll && (
          <PollDisplay
            poll={thread.poll}
            refreshPoll={() => {
              window.location.reload();
            }}
          />
        )}
      </div>
    </article>
  );
}
