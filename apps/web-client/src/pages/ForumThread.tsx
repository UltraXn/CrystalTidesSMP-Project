import { Link } from 'react-router';
import { ArrowLeft, Reply } from 'lucide-react';
import Loader from '../components/UI/Loader';
import { useForumThread } from '../hooks/useForumThread';
import { getCategorySlug } from '../types/forum';
import ForumThreadArticle from '../components/Forum/ForumThreadArticle';
import ForumCommentItem from '../components/Forum/ForumCommentItem';
import ForumReplySection from '../components/Forum/ForumReplySection';
import ForumDeleteConfirmModal from '../components/Forum/ForumDeleteConfirmModal';

export default function ForumThread() {
  const {
    thread,
    comments,
    loading,
    error,
    isTopic,
    user,
    isAdmin,
    isStaff,
    isOwnerOrAdmin,
    isEditingThread,
    editThreadData,
    setEditThreadData,
    startEditThread,
    cancelEditThread,
    handleUpdateThread,
    togglePin,
    toggleLock,
    handleDeleteThread,
    editingPostId,
    setEditingPostId,
    editPostContent,
    setEditPostContent,
    handleUpdatePost,
    handleDeletePost,
    deleteModal,
    closeDeleteModal,
    executeDelete,
    newComment,
    setNewComment,
    pendingImageRepl,
    handleReplImageSelect,
    clearReplImage,
    handlePostComment,
    t,
    language,
  } = useForumThread();

  if (loading) {
    return (
      <div
        style={{
          minHeight: '80vh',
          paddingTop: '100px',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Loader text={t('forum_thread.loading')} />
      </div>
    );
  }

  if (error || !thread) {
    return (
      <div
        style={{
          minHeight: '80vh',
          paddingTop: '100px',
          textAlign: 'center',
          color: '#fff',
        }}
      >
        <h2>{error ?? t('forum_thread.not_found')}</h2>
        <Link to="/forum" className="btn-secondary" style={{ marginTop: '1rem' }}>
          {t('forum_thread.back_forum')}
        </Link>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        paddingTop: '8rem',
        paddingBottom: '4rem',
        background: '#050505',
      }}
    >
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 2rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <Link
            to={isTopic ? `/forum/${getCategorySlug(thread.category_id)}` : '/forum/announcements'}
            style={{
              color: 'var(--muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              textDecoration: 'none',
              marginBottom: '1rem',
            }}
          >
            <ArrowLeft /> {t('forum_thread.back_link')}
          </Link>
        </div>

        <ForumThreadArticle
          thread={thread}
          isTopic={isTopic}
          isEditingThread={isEditingThread}
          editThreadData={editThreadData}
          isOwnerOrAdmin={isOwnerOrAdmin(thread.author_id)}
          isAdmin={isAdmin || isStaff}
          onEditThreadDataChange={setEditThreadData}
          onStartEditThread={startEditThread}
          onCancelEditThread={cancelEditThread}
          onUpdateThread={handleUpdateThread}
          onDeleteThread={handleDeleteThread}
          onTogglePin={togglePin}
          onToggleLock={toggleLock}
          t={t}
          language={language}
        />

        <div
          style={{
            padding: '2rem',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <h3
            style={{
              color: '#fff',
              marginBottom: '2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <Reply /> {t('forum_thread.comments')} ({comments.length})
          </h3>

          <div
            className="comments-list"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
              marginBottom: '3rem',
            }}
          >
            {comments.map((comment) => (
              <ForumCommentItem
                key={comment.id}
                comment={comment}
                isOwnerOrAdmin={isOwnerOrAdmin(comment.user_id)}
                isEditing={editingPostId === comment.id}
                editPostContent={editPostContent}
                onStartEdit={() => {
                  setEditingPostId(comment.id);
                  setEditPostContent(comment.content);
                }}
                onCancelEdit={() => setEditingPostId(null)}
                onSaveEdit={() => handleUpdatePost(comment.id)}
                onDelete={() => handleDeletePost(comment.id)}
                onEditContentChange={setEditPostContent}
                t={t}
              />
            ))}
          </div>

          <ForumReplySection
            user={user}
            threadLocked={thread.locked}
            isAdmin={isAdmin || isStaff}
            newComment={newComment}
            setNewComment={setNewComment}
            pendingImageRepl={pendingImageRepl}
            clearReplImage={clearReplImage}
            handleReplImageSelect={handleReplImageSelect}
            handlePostComment={handlePostComment}
            t={t}
          />
        </div>

        {/* DELETE MODAL */}
        {deleteModal && (
          <ForumDeleteConfirmModal
            deleteModal={deleteModal}
            onClose={closeDeleteModal}
            onConfirm={executeDelete}
          />
        )}
      </div>
    </div>
  );
}
