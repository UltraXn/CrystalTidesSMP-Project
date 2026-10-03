import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabaseClient';
import { uploadImage } from '../services/uploadService';
import { parseThreadDetail } from '@crystaltides/shared';
import {
  type Thread,
  type Comment,
  type ForumAuthorData,
  type PendingImageRepl,
  checkIsAdmin,
  compressImage,
} from '../types/forum';

export async function fetchThreadDetail(type: string, id: string | undefined, apiUrl: string) {
  if (!id) return null;
  const isTopic = type === 'topic';
  const threadPromise = isTopic
    ? fetch(`${apiUrl}/forum/thread/${id}`)
    : fetch(`${apiUrl}/news/${id}`);

  const threadRes = await threadPromise;
  if (!threadRes.ok) throw new Error('Not Found');
  const threadData = await threadRes.json();

  const parsedThread = parseThreadDetail(threadData, isTopic ? 'topic' : 'news') as Thread;

  const commentsPromise = isTopic
    ? fetch(`${apiUrl}/forum/thread/${id}/posts`)
    : fetch(`${apiUrl}/news/${id}/comments`);

  const commentsRes = await commentsPromise;
  const commentsData = commentsRes.ok ? await commentsRes.json() : [];

  const parsedComments: Comment[] = Array.isArray(commentsData)
    ? commentsData.map(
        (c: {
          id: string | number;
          author_name?: string;
          user_name?: string;
          author_id?: string;
          user_id?: string;
          author_avatar?: string;
          user_avatar?: string;
          author_role?: string;
          user_role?: string;
          content: string;
          created_at: string;
          author_data_fresh?: unknown;
        }) => ({
          id: c.id,
          user: (isTopic ? c.author_name : c.user_name) || 'Anónimo',
          user_id: c.author_id || c.user_id || null,
          avatar: (isTopic ? c.author_avatar : c.user_avatar) || null,
          role: (isTopic ? c.author_role : c.user_role) || 'user',
          content: c.content,
          date:
            new Date(c.created_at).toLocaleDateString() +
            ' ' +
            new Date(c.created_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
          author_data_fresh: c.author_data_fresh as ForumAuthorData,
        }),
      )
    : [];

  return { thread: parsedThread, comments: parsedComments };
}

export function useForumThread() {
  const params = useParams<{ type?: string; id?: string }>();
  const type = params.id ? params.type || 'topic' : 'topic';
  const id = params.id || params.type;
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [overrideThread, setOverrideThread] = useState<Thread | null>(null);
  const [overrideComments, setOverrideComments] = useState<Comment[]>([]);
  const [isEditingThread, setIsEditingThread] = useState(false);
  const [editThreadData, setEditThreadData] = useState({
    title: '',
    content: '',
  });

  const isSubmittingRef = useRef(false);
  const [newComment, setNewComment] = useState('');
  const [editingPostId, setEditingPostId] = useState<string | number | null>(null);
  const [editPostContent, setEditPostContent] = useState('');
  const [deleteModal, setDeleteModal] = useState<{
    type: 'thread' | 'post';
    id: string | number;
  } | null>(null);

  const [pendingImageRepl, setPendingImageRepl] = useState<PendingImageRepl | null>(null);
  const deletingRef = useRef(false);

  const API_URL = import.meta.env.VITE_API_URL;
  const isTopic = type === 'topic';

  const {
    data: threadQueryData,
    isLoading: loading,
    error: threadError,
  } = useQuery({
    queryKey: ['forumThreadDetail', type, id],
    queryFn: () => fetchThreadDetail(type, id, API_URL),
    enabled: Boolean(id),
    staleTime: 30_000,
  });

  const thread = threadQueryData?.thread ?? overrideThread;
  const comments =
    overrideComments.length > 0 ? overrideComments : (threadQueryData?.comments ?? []);
  const error = threadError ? (threadError as Error).message : null;

  const isAdmin = checkIsAdmin(user?.user_metadata);
  const isOwnerOrAdmin = (targetUserId: string | null) => isAdmin || user?.id === targetUserId;

  useEffect(() => {
    return () => {
      if (pendingImageRepl?.preview) {
        URL.revokeObjectURL(pendingImageRepl.preview);
      }
    };
  }, [pendingImageRepl?.preview]);

  const startEditThread = () => {
    if (!thread) return;
    setIsEditingThread(true);
    setEditThreadData({ title: thread.title, content: thread.content });
  };

  const cancelEditThread = () => {
    setIsEditingThread(false);
  };

  const handleUpdateThread = async () => {
    if (isSubmittingRef.current || !editThreadData.title.trim() || !editThreadData.content.trim())
      return;
    isSubmittingRef.current = true;
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch(`${API_URL}/forum/thread/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editThreadData),
      });

      if (res.ok) {
        setOverrideThread((prev) =>
          prev
            ? {
                ...prev,
                title: editThreadData.title,
                content: editThreadData.content,
              }
            : null,
        );
        setIsEditingThread(false);
      } else {
        alert('Error al actualizar');
      }
    } catch (e: unknown) {
      console.error(e);
    } finally {
      isSubmittingRef.current = false;
    }
  };

  const togglePin = async () => {
    if (isSubmittingRef.current || !thread) return;
    isSubmittingRef.current = true;
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      const newValue = !thread.pinned;
      const res = await fetch(`${API_URL}/forum/thread/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ pinned: newValue }),
      });
      if (res.ok) setOverrideThread({ ...thread, pinned: newValue });
    } catch (e: unknown) {
      console.error(e);
    } finally {
      isSubmittingRef.current = false;
    }
  };

  const toggleLock = async () => {
    if (isSubmittingRef.current || !thread) return;
    isSubmittingRef.current = true;
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      const newValue = !thread.locked;
      const res = await fetch(`${API_URL}/forum/thread/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ locked: newValue }),
      });
      if (res.ok) setOverrideThread({ ...thread, locked: newValue });
    } catch (e: unknown) {
      console.error(e);
    } finally {
      isSubmittingRef.current = false;
    }
  };

  const handleDeleteThread = () => {
    if (thread?.id) setDeleteModal({ type: 'thread', id: thread.id });
  };

  const handleDeletePost = (postId: string | number) => {
    setDeleteModal({ type: 'post', id: postId });
  };

  const closeDeleteModal = () => {
    setDeleteModal(null);
  };

  const executeDelete = async () => {
    if (!deleteModal || deletingRef.current) return;
    deletingRef.current = true;

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;
      const authHeaders = { Authorization: `Bearer ${token}` };

      if (deleteModal.type === 'thread') {
        const res = await fetch(`${API_URL}/forum/thread/${deleteModal.id}`, {
          method: 'DELETE',
          headers: authHeaders,
        });
        if (res.ok) {
          navigate('/forum');
        } else {
          alert('Error al eliminar el tema');
        }
      } else if (deleteModal.type === 'post') {
        const url = isTopic
          ? `${API_URL}/forum/posts/${deleteModal.id}`
          : `${API_URL}/news/comments/${deleteModal.id}`;
        const res = await fetch(url, {
          method: 'DELETE',
          headers: authHeaders,
        });
        if (res.ok) {
          setOverrideComments(comments.filter((c) => c.id !== deleteModal.id));
        } else {
          alert('Error al eliminar el comentario');
        }
      }
    } catch (e: unknown) {
      console.error(e);
      alert('Error de conexión');
    } finally {
      deletingRef.current = false;
      setDeleteModal(null);
    }
  };

  const handleUpdatePost = async (postId: string | number) => {
    if (!editPostContent.trim()) return;
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      const url = isTopic
        ? `${API_URL}/forum/posts/${postId}`
        : `${API_URL}/news/comments/${postId}`;

      const res = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: editPostContent }),
      });
      if (res.ok) {
        setOverrideComments(
          comments.map((c) => (c.id === postId ? { ...c, content: editPostContent } : c)),
        );
        setEditingPostId(null);
      }
    } catch (e: unknown) {
      console.error(e);
    }
  };

  const handleReplImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) return alert('Imagen muy pesada (Max 20MB)');

    try {
      const blob = await compressImage(file);
      if (pendingImageRepl?.preview) URL.revokeObjectURL(pendingImageRepl.preview);
      setPendingImageRepl({
        blob,
        preview: URL.createObjectURL(blob),
      });
      e.target.value = '';
    } catch (e) {
      console.error(e);
      alert('Error al procesar imagen');
    }
  };

  const clearReplImage = () => {
    if (pendingImageRepl?.preview) URL.revokeObjectURL(pendingImageRepl.preview);
    setPendingImageRepl(null);
  };

  const handlePostComment = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const currentUser = user;
    if (isSubmittingRef.current || !currentUser || (!newComment.trim() && !pendingImageRepl))
      return;
    isSubmittingRef.current = true;

    let finalContent = newComment;

    try {
      if (pendingImageRepl) {
        const publicUrl = await uploadImage(pendingImageRepl.blob, 'forum-uploads');
        finalContent += `\n\n![Imagen](${publicUrl})`;
      }

      const currentRole = currentUser?.user_metadata?.role || 'user';
      const username =
        currentUser?.user_metadata?.username || currentUser?.email?.split('@')[0] || 'Usuario';

      const body = isTopic
        ? {
            content: finalContent,
            user_data: {
              id: currentUser.id,
              name: username,
              avatar: currentUser?.user_metadata?.avatar_url,
              role: currentRole,
            },
          }
        : {
            user_name: username,
            user_avatar: currentUser?.user_metadata?.avatar_url,
            content: finalContent,
            user_role: currentRole,
          };

      const url = isTopic
        ? `${API_URL}/forum/thread/${id}/posts`
        : `${API_URL}/news/${id}/comments`;

      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const savedComment = await res.json();
        const newC: Comment = {
          id: savedComment.id,
          user: isTopic ? savedComment.author_name : savedComment.user_name,
          user_id: currentUser.id,
          avatar: isTopic ? savedComment.author_avatar : savedComment.user_avatar,
          role: isTopic ? savedComment.author_role : savedComment.user_role,
          date: t('forum_thread.just_now'),
          content: savedComment.content,
        };
        setOverrideComments([...comments, newC]);
        setNewComment('');
        clearReplImage();
      }
    } catch (err: unknown) {
      console.error('Error posting comment:', err);
      alert(t('forum_thread.comment_error'));
    } finally {
      isSubmittingRef.current = false;
    }
  };

  return {
    thread,
    comments,
    loading,
    error,
    isTopic,
    user,
    isAdmin,
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
    language: i18n.language,
  };
}
