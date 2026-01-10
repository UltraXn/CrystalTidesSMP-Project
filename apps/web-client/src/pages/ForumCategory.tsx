import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { User, MessageSquare, Clock, Pen, Pin, ArrowLeft } from "lucide-react"
import Loader from "../components/UI/Loader"
import { useTranslation } from 'react-i18next'
import Section from "../components/Layout/Section"

interface ThreadSummary {
    id: string | number;
    title: string;
    author: string;
    replies: number;
    views: number;
    lastActivity: string;
    pinned: boolean;
    tag: string | null;
    slug?: string;
}

interface NewsResponse {
    id: string | number;
    title: string;
    replies?: number;
    views?: number;
    created_at: string;
    category: string | null;
    status: string;
    slug?: string;
}

interface ThreadResponse {
    id: string | number;
    title: string;
    author_name?: string;
    reply_count?: number;
    views?: number;
    created_at: string;
    pinned?: boolean;
    slug?: string;
}

const categorySlugs = {
    "announcements": 1,
    "general": 2,
    "support": 3,
    "off-topic": 4
}

const categoryTranslationKeys: Record<string, string> = {
    "announcements": "announcements",
    "1": "announcements",
    "news": "announcements",
    "general": "general",
    "2": "general",
    "support": "support",
    "3": "support",
    "off-topic": "offtopic",
    "4": "offtopic"
}

export default function ForumCategory() {
    const { id: slug } = useParams<{ id: string }>()
    const { t } = useTranslation()
    const [threads, setThreads] = useState<ThreadSummary[]>([])
    const [loading, setLoading] = useState(true)

    // Fallback if slug not found - try to map slug to ID, or use it as ID if it is one
    const categoryId = slug ? (categorySlugs[slug as keyof typeof categorySlugs] || slug) : null;
    const translationKey = slug ? categoryTranslationKeys[slug] : null;
    const categoryTitle = translationKey ? t(`forum_page.categories.${translationKey}.title`) : t('forum_page.categories.general.title')
    const API_URL = import.meta.env.VITE_API_URL

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            if (!categoryId) {
                setLoading(false)
                return
            }

            if (String(categoryId) === "1") {
                try {
                    // Fetch real news for "Anuncios"
                    const res = await fetch(`${API_URL}/news`)
                    const data = await res.json()
                    const mappedNews: ThreadSummary[] = Array.isArray(data) ? (data as NewsResponse[]).filter(n => n.status === 'Published').map(n => ({
                        id: n.id,
                        title: n.title,
                        author: "Staff",
                        replies: n.replies || 0,
                        views: n.views || 0,
                        lastActivity: new Date(n.created_at).toLocaleDateString(),
                        pinned: true,
                        tag: n.category,
                        slug: n.slug
                    })) : []
                    setThreads(mappedNews)
                } catch (err) {
                    console.error("Error loading forum news:", err)
                } finally {
                    setLoading(false)
                }
            } else {
                try {
                    // Fetch real user threads
                    const res = await fetch(`${API_URL}/forum/category/${categoryId}`)
                    const data = await res.json()
                    const mappedThreads: ThreadSummary[] = Array.isArray(data) ? (data as ThreadResponse[]).map(t => ({
                        id: t.id,
                        title: t.title,
                        author: t.author_name || "Anónimo",
                        replies: t.reply_count || 0,
                        views: t.views || 0,
                        lastActivity: new Date(t.created_at).toLocaleDateString(),
                        pinned: t.pinned || false,
                        tag: null,
                        slug: t.slug
                    })) : []
                    setThreads(mappedThreads)
                } catch (err) {
                    console.error(err)
                } finally {
                    setLoading(false)
                }
            }
        }

        fetchData()
    }, [categoryId, slug, API_URL])

    return (
        <div className="pt-24 min-h-screen">
            <Section title={categoryTitle}>
                <div className="max-w-4xl mx-auto">
                    {/* Header Controls */}
                    <div className="flex justify-between items-center mb-8 bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/5">
                        <Link 
                            to="/forum" 
                            className="flex items-center gap-2 text-gray-400 hover:text-(--accent) transition-colors text-sm font-bold uppercase tracking-widest"
                        >
                            <ArrowLeft /> {t('forum_category.back_link')}
                        </Link>

                        {String(categoryId) !== "1" && (
                            <Link 
                                to="/forum/create" 
                                className="flex items-center gap-2 px-6 py-3 bg-(--accent) text-black rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-lg shadow-(--accent)/20"
                            >
                                <Pen /> {t('forum_category.new_thread')}
                            </Link>
                        )}
                    </div>

                    {/* Content */}
                    {loading ? (
                        <div className="py-20 flex flex-col items-center justify-center gap-4">
                            <div className="w-12 h-12 border-4 border-white/10 border-t-(--accent) rounded-full animate-spin"></div>
                            <Loader text={t('forum_category.loading')} />
                        </div>
                    ) : threads.length === 0 ? (
                        <div className="py-20 flex flex-col items-center justify-center gap-6 bg-white/2 border border-dashed border-white/10 rounded-3xl">
                            <MessageSquare className="text-6xl text-white/10" />
                            <div className="text-center">
                                <p className="text-gray-400 font-medium mb-4">{t('forum_category.no_threads')}</p>
                                {String(categoryId) !== '1' && (
                                    <Link 
                                        to="/forum/create" 
                                        className="text-(--accent) font-bold hover:underline"
                                    >
                                        {t('forum_category.be_first')}
                                    </Link>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {threads.map(thread => (
                                <Link 
                                    to={String(categoryId) === "1" ? `/forum/thread/news/${thread.slug || thread.id}` : `/forum/thread/${thread.slug || thread.id}`} 
                                    key={thread.id} 
                                    className="group block"
                                >
                                    <div className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6 flex items-center gap-6 transition-all duration-300 hover:bg-white/5 hover:border-(--accent)/30 hover:-translate-y-1 hover:shadow-xl hover:shadow-(--accent)/5">
                                        
                                        {/* Icon */}
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl shrink-0 ${thread.pinned ? 'bg-(--accent)/10 text-(--accent)' : 'bg-white/5 text-gray-500 group-hover:bg-white/10 group-hover:text-gray-300'}`}>
                                            {thread.pinned ? <Pin className="rotate-45" /> : <MessageSquare />}
                                        </div>

                                        {/* Info */}
                                        <div className="grow min-w-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                {thread.tag && (
                                                    <span className="bg-(--accent) text-black px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest shrink-0">
                                                        {thread.tag}
                                                    </span>
                                                )}
                                                <h3 className="text-lg font-bold text-white group-hover:text-(--accent) transition-colors truncate">
                                                    {thread.title}
                                                </h3>
                                            </div>
                                            
                                            <div className="flex items-center gap-6 text-xs font-bold text-gray-500 uppercase tracking-widest">
                                                <span className="flex items-center gap-2">
                                                    <User className="text-(--accent)/50" /> {thread.author}
                                                </span>
                                                <span className="flex items-center gap-2">
                                                    <Clock className="text-(--accent)/50" /> {thread.lastActivity}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Stats */}
                                        <div className="gap-8 text-center shrink-0 border-l border-white/5 pl-8 hidden sm:flex">
                                            <div className="flex flex-col">
                                                <span className="text-xl font-black text-white group-hover:text-(--accent) transition-colors">{thread.replies}</span>
                                                <span className="text-[10px] text-gray-500 uppercase tracking-widest">{t('forum_category.replies')}</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-xl font-black text-white group-hover:text-(--accent) transition-colors">{thread.views}</span>
                                                <span className="text-[10px] text-gray-500 uppercase tracking-widest">{t('forum_category.views')}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </Section>
        </div>
    )
}
