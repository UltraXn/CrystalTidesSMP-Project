import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { FaUser, FaCalendarAlt, FaArrowLeft, FaEye, FaReply, FaPaperPlane, FaEdit, FaTrash, FaCheck, FaTimes, FaImage, FaThumbtack, FaLock, FaUnlock } from "react-icons/fa"
import Loader from "../components/UI/Loader"
import { useAuth } from "../context/AuthContext"
import RoleBadge from "../components/User/RoleBadge"
import PollDisplay from "../components/Forum/PollDisplay"
import { useTranslation } from "react-i18next"
import { supabase } from '../services/supabaseClient'
import MarkdownRenderer from "../components/UI/MarkdownRenderer"

interface Thread {
    id: string | number;
    title: string;
    content: string;
    author: string;
    author_id: string;
    author_avatar: string | null;
    author_role: string;
    date: string;
    longDate: string;
    image: string | null;
    tag: string;
    category_id: number;
    views: number;
    poll: Poll | null;
    pinned: boolean;
    locked: boolean;
    title_en?: string;
    content_en?: string;
}

interface Comment {
    id: string | number;
    user: string;
    user_id: string | null;
    avatar: string | null;
    role: string;
    date: string;
    content: string;
}

interface PendingImageRepl {
    blob: Blob;
    preview: string;
}

// Simple helper to compress images (reused)
const compressImage = async (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        const img = new Image()
        img.src = URL.createObjectURL(file)
        img.onload = () => {
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            const MAX_SIZE = 1920
            let width = img.width
            let height = img.height
            if (width > height) {
                if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; }
            } else {
                if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; }
            }
            canvas.width = width
            canvas.height = height
            if (ctx) {
                ctx.drawImage(img, 0, 0, width, height)
            }
            canvas.toBlob((blob) => {
                if (blob) resolve(blob); else reject(new Error("Compression failed"))
            }, 'image/webp', 0.8)
        }
        img.onerror = (err) => reject(err)
    })
}

const categoryNames: Record<number, string> = {
    1: "Anuncios",
    2: "Discusión General",
    3: "Soporte",
    4: "Off-Topic"
}

interface PollOption {
    id: string;
    label: string;
    percent: number;
    votes: number;
}

interface Poll {
    id: string;
    discord_link?: string;
    question: string;
    options: PollOption[];
    totalVotes: number;
    closesIn: string;
}

// MarkdownRenderer is now imported from shared components

export default function ForumThread() {
    const { type, id } = useParams<{ type: 'news' | 'topic', id: string }>()
    const { user } = useAuth()
    const navigate = useNavigate()
    const [thread, setThread] = useState<Thread | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Editing State
    const [isEditingThread, setIsEditingThread] = useState(false)
    const [editThreadData, setEditThreadData] = useState({ title: "", content: "" })

    // Estado para comentarios
    const [comments, setComments] = useState<Comment[]>([])
    const [newComment, setNewComment] = useState("")
    const [editingPostId, setEditingPostId] = useState<string | number | null>(null)
    const [editPostContent, setEditPostContent] = useState("")

    const API_URL = import.meta.env.VITE_API_URL
    const isTopic = type === 'topic'
    const { t, i18n } = useTranslation()

    const [deleteModal, setDeleteModal] = useState<{ type: 'thread' | 'post', id: string | number } | null>(null)

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true)
            try {
                // Fetch Thread
                const threadPromise = isTopic 
                    ? fetch(`${API_URL}/forum/thread/${id}`)
                    : fetch(`${API_URL}/news/${id}`)

                const threadRes = await threadPromise
                if (!threadRes.ok) throw new Error("Not Found")
                const threadData = await threadRes.json()

                setThread({
                    id: threadData.id,
                    title: threadData.title,
                    content: threadData.content,
                    title_en: threadData.title_en,
                    content_en: threadData.content_en,
                    author: isTopic ? (threadData.author_name || "Anónimo") : "CrystalTidesSMP",
                    author_id: isTopic ? threadData.user_id : threadData.author_id, // Important for ownership check
                    author_avatar: isTopic ? threadData.author_avatar : "/images/ui/logo.webp", // Add avatar
                    author_role: isTopic ? threadData.author_role : "staff",
                    date: new Date(threadData.created_at).toLocaleDateString(),
                    longDate: new Date(threadData.created_at).toLocaleDateString() + " " + new Date(threadData.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    image: isTopic ? null : threadData.image,
                    tag: isTopic ? (categoryNames[threadData.category_id] || "General") : threadData.category,
                    category_id: threadData.category_id,
                    views: threadData.views || 0,
                    poll: threadData.poll || null,
                    pinned: threadData.pinned || false,
                    locked: threadData.locked || false
                })

                setEditThreadData({ title: threadData.title, content: threadData.content })

                // Fetch Comments
                const commentsPromise = isTopic
                     ? fetch(`${API_URL}/forum/thread/${id}/posts`)
                     : fetch(`${API_URL}/news/${id}/comments`)
                
                const commentsRes = await commentsPromise
                const commentsData = await commentsRes.json()
                
                if (Array.isArray(commentsData)) {
                    setComments(commentsData.map((c: { 
                        id: string | number, 
                        author_name?: string, 
                        user_name?: string, 
                        user_id?: string, 
                        author_avatar?: string, 
                        user_avatar?: string, 
                        author_role?: string, 
                        user_role?: string, 
                        created_at: string, 
                        content: string 
                    }) => ({
                        id: c.id,
                        user: (isTopic ? c.author_name : c.user_name) || "Anónimo",
                        user_id: c.user_id || null, // Include for both types
                        avatar: (isTopic ? c.author_avatar : c.user_avatar) || null,
                        role: (isTopic ? c.author_role : c.user_role) || "user",
                        date: new Date(c.created_at).toLocaleDateString() + " " + new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        content: c.content
                    })))
                } else {
                    setComments([])
                }

                setLoading(false)

            } catch (err: unknown) {
                console.error(err)
                setError(t('forum_thread.thread_error'))
                setLoading(false)
            }
        }

        fetchAllData()
    }, [id, type, isTopic, API_URL, t])

    const isOwnerOrAdmin = (targetUserId: string | null) => {
        if (!user) return false;
        const isAdmin = ['admin','neroferno', 'killu', 'helper'].includes(user.user_metadata?.role);
        return isAdmin || (user.id === targetUserId);
    }

    const isAdmin = () => {
        if (!user) return false;
        return ['admin', 'neroferno', 'killu', 'helper'].includes(user.user_metadata?.role);
    }

    const handleUpdateThread = async () => {
        if (!editThreadData.title.trim() || !editThreadData.content.trim()) return;
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            
            const res = await fetch(`${API_URL}/forum/thread/${id}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(editThreadData)
            });
            if (res.ok) {
                setThread(prev => prev ? { ...prev, title: editThreadData.title, content: editThreadData.content } : null);
                setIsEditingThread(false);
            } else {
                alert("Error al actualizar");
            }
        } catch (e: unknown) { console.error(e); }
    }

    const togglePin = async () => {
        if (!thread) return;
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            const newValue = !thread.pinned;
            const res = await fetch(`${API_URL}/forum/thread/${id}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ pinned: newValue })
            });
            if (res.ok) setThread({ ...thread, pinned: newValue });
        } catch (e: unknown) { console.error(e); }
    }

    const toggleLock = async () => {
        if (!thread) return;
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            const newValue = !thread.locked;
            const res = await fetch(`${API_URL}/forum/thread/${id}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ locked: newValue })
            });
            if (res.ok) setThread({ ...thread, locked: newValue });
        } catch (e: unknown) { console.error(e); }
    }

    const handleDeleteThread = () => {
        if (id) setDeleteModal({ type: 'thread', id: id });
    }

    const handleUpdatePost = async (postId: string | number) => {
         if (!editPostContent.trim()) return;
         try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            const url = isTopic ? `${API_URL}/forum/posts/${postId}` : `${API_URL}/news/comments/${postId}`;

            const res = await fetch(url, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ content: editPostContent })
            });
            if (res.ok) {
                setComments(comments.map(c => c.id === postId ? { ...c, content: editPostContent } : c));
                setEditingPostId(null);
            }
         } catch (e: unknown) { console.error(e); }
    }

    const handleDeletePost = (postId: string | number) => {
        setDeleteModal({ type: 'post', id: postId });
    }

    const executeDelete = async () => {
        if (!deleteModal) return;
        
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            const authHeaders = { 'Authorization': `Bearer ${token}` };

            if (deleteModal.type === 'thread') {
                const res = await fetch(`${API_URL}/forum/thread/${deleteModal.id}`, { 
                    method: 'DELETE',
                    headers: authHeaders 
                });
                if (res.ok) {
                    navigate('/forum');
                } else {
                    alert("Error al eliminar el tema");
                }
            } else if (deleteModal.type === 'post') {
                const url = isTopic ? `${API_URL}/forum/posts/${deleteModal.id}` : `${API_URL}/news/comments/${deleteModal.id}`;
                const res = await fetch(url, { 
                    method: 'DELETE',
                    headers: authHeaders 
                });
                if (res.ok) {
                    setComments(comments.filter(c => c.id !== deleteModal.id));
                } else {
                    alert("Error al eliminar el comentario");
                }
            }
        } catch (e: unknown) { 
            console.error(e); 
            alert("Error de conexión");
        } finally {
            setDeleteModal(null);
        }
    }


    // Reply Image State
    const [pendingImageRepl, setPendingImageRepl] = useState<PendingImageRepl | null>(null)

    const handleReplImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        if (file.size > 20 * 1024 * 1024) return alert("Imagen muy pesada (Max 20MB)")

        try {
            const blob = await compressImage(file)
            setPendingImageRepl({
                blob,
                preview: URL.createObjectURL(blob)
            })
            e.target.value = ''
        } catch (e) { console.error(e); alert("Error al procesar imagen"); }
    }

    const clearReplImage = () => {
        if(pendingImageRepl?.preview) URL.revokeObjectURL(pendingImageRepl.preview)
        setPendingImageRepl(null)
    }

    const handlePostComment = async (e: React.FormEvent) => {
        e.preventDefault()
        const currentUser = user;
        if (!currentUser || (!newComment.trim() && !pendingImageRepl)) return

        let finalContent = newComment

        try {
             // 1. Upload Image (Deferred)
             if (pendingImageRepl) {
                const fileName = `repl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.webp`
                const { error } = await supabase.storage.from('forum-uploads').upload(fileName, pendingImageRepl.blob, { contentType: 'image/webp' })
                if (error) throw error
                const { data: { publicUrl } } = supabase.storage.from('forum-uploads').getPublicUrl(fileName)
                
                finalContent += `\n\n![Imagen](${publicUrl})`
             }

            const currentRole = currentUser?.user_metadata?.role || 'user'
            const username = currentUser?.user_metadata?.username || currentUser?.email?.split('@')[0] || "Usuario"
            
            // Payload logic
            const body = isTopic ? {
                 content: finalContent,
                 user_data: { 
                     id: currentUser.id, 
                     name: username, 
                     avatar: currentUser?.user_metadata?.avatar_url, 
                     role: currentRole 
                 }
            } : ({
                 user_name: username,
                 user_avatar: currentUser?.user_metadata?.avatar_url,
                 content: finalContent,
                 user_role: currentRole
            })
            
            const url = isTopic ? `${API_URL}/forum/thread/${id}/posts` : `${API_URL}/news/${id}/comments`

            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            const res = await fetch(url, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body)
            })

            if (res.ok) {
                const savedComment = await res.json()
                // Normalize response to add locally
                const newC: Comment = {
                    id: savedComment.id,
                    user: isTopic ? savedComment.author_name : savedComment.user_name,
                    user_id: currentUser.id,
                    avatar: isTopic ? savedComment.author_avatar : savedComment.user_avatar,
                    role: isTopic ? savedComment.author_role : savedComment.user_role,
                    date: t('forum_thread.just_now'),
                    content: savedComment.content
                }
                setComments([...comments, newC])
                setNewComment("")
            clearReplImage()
            }
        } catch (error: unknown) {
            console.error("Error posting comment:", error)
            alert(t('forum_thread.comment_error'))
        }
    }

    if (loading) return (
        <div style={{ minHeight: '80vh', paddingTop: '100px', display: 'flex', justifyContent: 'center' }}>
            <Loader text={t('forum_thread.loading')} />
        </div>
    )

    if (error || !thread) return (
        <div style={{ minHeight: '80vh', paddingTop: '100px', textAlign: 'center', color: '#fff' }}>
            <h2>{error || t('forum_thread.not_found')}</h2>
            <Link to="/forum" className="btn-secondary" style={{ marginTop: '1rem' }}>{t('forum_thread.back_forum')}</Link>
        </div>
    )

    return (
        <div className="" style={{ minHeight: '100vh', paddingTop: '8rem', paddingBottom: '4rem', background: '#050505' }}>
            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 2rem' }}>
                <div style={{ marginBottom: '2rem' }}>
                    <Link to={isTopic ? `/forum/${thread.category_id === 1 ? 'announcements' : thread.category_id === 2 ? 'general' : thread.category_id === 3 ? 'support' : 'off-topic'}` : '/forum/announcements'} style={{ color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', marginBottom: '1rem' }}>
                        <FaArrowLeft /> {t('forum_thread.back_link')}
                    </Link>
                </div>

                <article style={{ background: 'rgba(30, 30, 40, 0.6)', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '3rem' }}>
                    {thread.image && (
                        <div style={{ width: '100%', height: '300px', overflow: 'hidden', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            <img src={thread.image} alt={thread.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                    )}

                    <div style={{ padding: '3rem' }}>
                        <div style={{ marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                                {thread.tag && (
                                    <span style={{ background: 'var(--accent)', color: '#000', padding: '0.3rem 0.8rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                        {thread.tag}
                                    </span>
                                )}
                                <span style={{ color: 'var(--muted)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <FaCalendarAlt /> {thread.longDate}
                                </span>
                                <span style={{ color: 'var(--muted)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <FaEye /> {thread.views} {t('forum_thread.views')}
                                </span>
                            </div>

                            {/* Thread Title Area - Edit or View */}
                            {isEditingThread ? (
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <input 
                                        className="form-input" 
                                        style={{ width: '100%', fontSize: '1.5rem', marginBottom: '1rem', background: 'rgba(0,0,0,0.3)', border: '1px solid #444', color: '#fff' }}
                                        value={editThreadData.title}
                                        onChange={e => setEditThreadData({...editThreadData, title: e.target.value})}
                                    />
                                </div>
                            ) : (
                                    <h1 style={{ fontSize: '2.5rem', color: '#fff', lineHeight: 1.2 }}>
                                        {(i18n.language === 'en' && thread?.title_en) ? thread.title_en : thread.title}
                                    </h1>
                            )}

                            <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                    <div style={{ width: '40px', height: '40px', background: '#333', borderRadius: '50%', overflow:'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {thread.author_avatar ? <img src={thread.author_avatar} alt="author" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <FaUser color="#ccc" />}
                                    </div>
                                    <div>
                                        <Link to={`/u/${thread.author}`} style={{ color: '#fff', fontWeight: 'bold', textDecoration: 'none' }} className="username-link">
                                            {thread.author}
                                        </Link>
                                        <div style={{ color: 'var(--muted)', fontSize: '0.8rem' }}><RoleBadge role={thread.author_role} username={thread.author} /></div>
                                    </div>
                                </div>

                                 {/* Owner/Admin Actions for Thread */}
                                {isTopic && isOwnerOrAdmin(thread.author_id) && !isEditingThread && (
                                    <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                                        {/* Mod Tools - Only for Staff */}
                                        {isAdmin() && (
                                            <>
                                                <button onClick={togglePin} className="btn-icon" title={thread.pinned ? "Desfijar" : "Fijar"} style={{ background: 'transparent', border: 'none', color: thread.pinned ? 'var(--accent)' : '#888', cursor: 'pointer' }}>
                                                    <FaThumbtack size={16} style={{ transform: thread.pinned ? 'rotate(0deg)' : 'rotate(45deg)', transition: 'all 0.3s' }} />
                                                </button>
                                                <button onClick={toggleLock} className="btn-icon" title={thread.locked ? "Desbloquear" : "Bloquear"} style={{ background: 'transparent', border: 'none', color: thread.locked ? '#ef4444' : '#888', cursor: 'pointer' }}>
                                                    {thread.locked ? <FaLock size={16} /> : <FaUnlock size={16} />}
                                                </button>
                                            </>
                                        )}
                                        
                                        <button onClick={() => setIsEditingThread(true)} className="btn-icon" title="Editar" style={{ background: 'transparent', border: 'none', color: 'var(--accent)', cursor: 'pointer', marginLeft: '0.5rem' }}>
                                            <FaEdit size={18} />
                                        </button>
                                        <button onClick={handleDeleteThread} className="btn-icon" title="Eliminar" style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                                            <FaTrash size={18} />
                                        </button>
                                    </div>
                                )}
                                {isEditingThread && (
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <button onClick={handleUpdateThread} className="btn-primary" style={{ padding: '0.5rem 1rem', display: 'flex', gap: '0.5rem' }}>
                                            <FaCheck /> Guardar
                                        </button>
                                        <button onClick={() => setIsEditingThread(false)} className="btn-secondary" style={{ padding: '0.5rem 1rem', display: 'flex', gap: '0.5rem' }}>
                                            <FaTimes /> Cancelar
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Thread Content Area - Edit or View */}
                        {isEditingThread ? (
                            <textarea 
                                className="form-textarea"
                                value={editThreadData.content} 
                                onChange={e => setEditThreadData({...editThreadData, content: e.target.value})}
                                rows={10}
                                style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid #444', color: '#e0e0e0', fontSize: '1.1rem', padding: '1rem' }}
                            />
                        ) : (
                            <div className="thread-content" style={{ color: '#e0e0e0', fontSize: '1.1rem', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                                <MarkdownRenderer content={(i18n.language === 'en' && thread?.content_en) ? thread.content_en : thread.content} />
                            </div>
                        )}
                        
                        {/* POLL RENDER */}
                        {!isEditingThread && thread.poll && (
                            <PollDisplay poll={thread.poll} refreshPoll={() => {
                                // Reload thread to update votes
                                window.location.reload() // MVP solution or refetch? Refetch safer but laziness.
                                // Refetch logic duplicate? 
                                // Simple:
                            }} />
                        )}

                    </div>
                </article>

                <div style={{ padding: '2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <h3 style={{ color: '#fff', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FaReply /> {t('forum_thread.comments')} ({comments.length})
                    </h3>

                    <div className="comments-list" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '3rem' }}>
                        {comments.map(comment => (
                            <div key={comment.id} style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#333', overflow: 'hidden', flexShrink: 0 }}>
                                    {comment.avatar ? <img src={comment.avatar} alt="user" style={{width:'100%',height:'100%',objectFit:'cover'}}/> : <FaUser color="#888" style={{padding:'8px'}}/>}
                                </div>
                                <div style={{ flexGrow: 1 }}>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                                            <Link to={`/u/${comment.user}`} style={{ color: 'var(--accent)', fontWeight: 'bold', textDecoration: 'none' }} className="username-link">
                                                {comment.user}
                                            </Link>
                                            <RoleBadge role={comment.role} username={comment.user} />
                                            <span style={{ color: 'var(--muted)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>• {comment.date}</span>
                                        </div>
                                        {/* Actions for Comment */}
                                        {isOwnerOrAdmin(comment.user_id) && editingPostId !== comment.id && (
                                            <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
                                                <button onClick={() => { setEditingPostId(comment.id); setEditPostContent(comment.content); }} style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', fontSize: '0.8rem' }}>Editar</button>
                                                <button onClick={() => handleDeletePost(comment.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem' }}>Eliminar</button>
                                            </div>
                                        )}
                                    </div>

                                    {editingPostId === comment.id ? (
                                        <div style={{ marginTop: '0.5rem' }}>
                                            <textarea 
                                                value={editPostContent}
                                                onChange={e => setEditPostContent(e.target.value)}
                                                style={{ width: '100%', background: '#222', border: '1px solid #444', color: '#fff', padding: '0.5rem', borderRadius: '4px' }}
                                                rows={3}
                                            />
                                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                                <button onClick={() => handleUpdatePost(comment.id)} className="btn-primary" style={{ fontSize: '0.8rem', padding: '0.3rem 0.8rem' }}>Guardar</button>
                                                <button onClick={() => setEditingPostId(null)} className="btn-secondary" style={{ fontSize: '0.8rem', padding: '0.3rem 0.8rem' }}>Cancelar</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{ color: '#ccc', lineHeight: '1.5', margin: 0 }}>
                                            <MarkdownRenderer content={comment.content} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {user ? (
                        thread.locked && !isAdmin() ? (
                            <div style={{ textAlign: 'center', padding: '2rem', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                                <FaLock size={30} style={{ color: '#ef4444', marginBottom: '1rem' }} />
                                <h4 style={{ color: '#fff', margin: '0 0 0.5rem 0' }}>Tema Cerrado</h4>
                                <p style={{ color: '#888', margin: 0 }}>Este tema ha sido bloqueado por un moderador y no admite más respuestas.</p>
                            </div>
                        ) : (
                            <form onSubmit={handlePostComment} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#333', overflow: 'hidden', flexShrink: 0 }}>
                                     {user.user_metadata?.avatar_url ? <img src={user.user_metadata.avatar_url} style={{width:'100%',height:'100%',objectFit:'cover'}} alt="user"/> : <FaUser color="#888" style={{padding:'8px'}}/>}
                                </div>
                                <div style={{ flexGrow: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', overflow: 'hidden', transition: 'border-color 0.2s' }}
                                     onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'}
                                     onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                                >
                                    <textarea 
                                        className="form-textarea" 
                                        placeholder={t('forum_thread.write_reply')} 
                                        rows={3} 
                                        value={newComment} 
                                        onChange={(e) => setNewComment(e.target.value)} 
                                        style={{ 
                                            width: '100%', 
                                            background: 'transparent', 
                                            border: 'none', 
                                            padding: '1rem', 
                                            color: '#fff', 
                                            resize: 'vertical', 
                                            minHeight: '80px',
                                            outline: 'none'
                                        }}
                                    ></textarea>
                                    
                                    {/* Image Preview Area - Integrated */}
                                    {pendingImageRepl && (
                                        <div style={{ padding: '0 1rem 1rem 1rem' }}>
                                            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '1rem', border: '1px solid var(--accent)', padding: '0.5rem' }}>
                                                <img src={pendingImageRepl.preview} style={{ height: '50px', borderRadius: '4px', objectFit: 'cover' }} alt="preview" />
                                                <div style={{ fontSize: '0.8rem', color: '#ccc' }}>
                                                    <div style={{ fontWeight: 'bold', color: '#fff' }}>Imagen lista</div>
                                                </div>
                                                <button type="button" onClick={clearReplImage} style={{background:'transparent', border:'none', color:'#ef4444', cursor:'pointer', padding: '0 0.5rem', fontSize:'1.1rem'}}><FaTimes /></button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Toolbar */}
                                    <div style={{ 
                                        display: 'flex', 
                                        justifyContent: 'space-between', 
                                        alignItems: 'center', 
                                        padding: '0.5rem 1rem', 
                                        background: 'rgba(255,255,255,0.02)', 
                                        borderTop: '1px solid rgba(255,255,255,0.05)' 
                                    }}>
                                        <label title="Adjuntar imagen" style={{ 
                                            cursor: 'pointer', 
                                            color: pendingImageRepl ? 'var(--accent)' : '#aaa', 
                                            fontSize: '1.2rem', 
                                            padding: '0.5rem', 
                                            borderRadius: '50%', 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => {e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'}}
                                        onMouseLeave={(e) => {e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = pendingImageRepl ? 'var(--accent)' : '#aaa'}}
                                        >
                                            <FaImage />
                                            <input type="file" accept="image/*" onChange={handleReplImageSelect} style={{ display: 'none' }} />
                                        </label>

                                        <button type="submit" disabled={(!newComment.trim() && !pendingImageRepl)} style={{
                                            background: (!newComment.trim() && !pendingImageRepl) ? '#444' : 'var(--accent)',
                                            color: (!newComment.trim() && !pendingImageRepl) ? '#888' : '#000',
                                            border: 'none',
                                            padding: '0.4rem 1.2rem',
                                            borderRadius: '4px',
                                            fontWeight: 'bold',
                                            fontSize: '0.9rem',
                                            cursor: (!newComment.trim() && !pendingImageRepl) ? 'not-allowed' : 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            transition: 'transform 0.1s'
                                        }}>
                                            <FaPaperPlane size={12} /> {t('forum_thread.publish')}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        )
                    ) : (
                        <div style={{ textAlign: 'center', padding: '2rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                            <p style={{ color: 'var(--muted)', marginBottom: '1rem' }}>{t('forum_thread.login_to_reply')}</p>
                            <Link to="/login" className="btn-secondary">{t('forum_thread.login')}</Link>
                        </div>
                    )}
                </div>

                {/* DELETE MODAL */}
                {deleteModal && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        background: 'rgba(0, 0, 0, 0.7)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 10000,
                        backdropFilter: 'blur(5px)'
                    }} onClick={() => setDeleteModal(null)}>
                        <div style={{
                            background: '#1e1e24',
                            padding: '2rem',
                            borderRadius: '12px',
                            border: '1px solid #ef4444',
                            maxWidth: '400px',
                            width: '90%',
                            textAlign: 'center',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
                        }} onClick={e => e.stopPropagation()}>
                            <div style={{ 
                                width: '60px', 
                                height: '60px', 
                                borderRadius: '50%', 
                                background: 'rgba(239, 68, 68, 0.1)', 
                                color: '#ef4444',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 1.5rem',
                                fontSize: '2rem'
                            }}>
                                <FaTrash />
                            </div>
                            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.4rem', color: '#fff' }}>¿Estás seguro?</h3>
                            <p style={{ color: '#aaa', marginBottom: '2rem', lineHeight: '1.5' }}>
                                {deleteModal.type === 'thread' 
                                    ? "Esta acción eliminará el post y todos sus comentarios permanentemente."
                                    : "Esta acción eliminará el comentario permanentemente."}
                            </p>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                                <button 
                                    className="btn-secondary" 
                                    onClick={() => setDeleteModal(null)}
                                    style={{ flex: 1 }}
                                >
                                    Cancelar
                                </button>
                                <button 
                                    className="btn-primary" 
                                    onClick={executeDelete}
                                    style={{ 
                                        flex: 1, 
                                        background: '#ef4444', 
                                        borderColor: '#ef4444', 
                                        color: '#fff' 
                                    }}
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
