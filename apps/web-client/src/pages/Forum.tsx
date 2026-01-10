import React, { useState, useEffect } from "react"
import { MessageSquare, Megaphone, Wrench, Coffee, User, Clock, Flame, BarChart3 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Section from "../components/Layout/Section"

interface Poll {
    question: string;
    question_en?: string;
    options: PollOption[];
}

interface PollOption {
    id: string | number;
    label: string;
    label_en?: string;
    percent: number;
}

interface Category {
    id: number;
    slug: string;
    translationKey: string;
    icon: React.ReactElement;
    topics: number;
    posts: number;
    lastPost: { user: string; date: string };
}

interface NewsItem {
    id: string | number;
    title: string;
    title_en?: string;
    image: string;
    content: string;
    content_en?: string;
    status: string;
    slug?: string;
}

interface CategoryStat {
    id: number;
    topics: number;
    posts: number;
    lastPost: { user: string; date: string };
}

const initialCategories: Category[] = [
    {
        id: 1,
        slug: "announcements",
        translationKey: "announcements",
        icon: <Megaphone />,
        topics: 0,
        posts: 0,
        lastPost: { user: "Staff", date: "-" }
    },
    {
        id: 2,
        slug: "general",
        translationKey: "general",
        icon: <MessageSquare />,
        topics: 0,
        posts: 0,
        lastPost: { user: "-", date: "-" }
    },
    {
        id: 3,
        slug: "support",
        translationKey: "support",
        icon: <Wrench />,
        topics: 0,
        posts: 0,
        lastPost: { user: "-", date: "-" }
    },
    {
        id: 4,
        slug: "off-topic",
        translationKey: "offtopic",
        icon: <Coffee />,
        topics: 0,
        posts: 0,
        lastPost: { user: "-", date: "-" }
    }
]

export default function Forum() {
    const { t, i18n } = useTranslation()
    const [categories, setCategories] = useState<Category[]>(initialCategories)
    const [activePoll, setActivePoll] = useState<Poll | null>(null)
    const API_URL = import.meta.env.VITE_API_URL

    const [latestNews, setLatestNews] = useState<NewsItem | null>(null)

    useEffect(() => {
        if (!API_URL) return

        // 1. Fetch Real Active Poll
        fetch(`${API_URL}/polls/active`)
            .then(res => res.json())
            .then(resData => {
                const poll = resData.success ? resData.data : resData
                if (poll && !poll.message && poll.options && poll.options.length > 0) { 
                    setActivePoll(poll)
                }
            })
            .catch(err => console.error("Error loading poll:", err))

        // 2. Fetch Forum Stats
        fetch(`${API_URL}/forum/stats`)
            .then(res => res.json())
            .then((data: CategoryStat[]) => {
                if (Array.isArray(data)) {
                    setCategories(prev => prev.map(cat => {
                        const stat = data.find(s => s.id === cat.id)
                        if (stat) {
                            return {
                                ...cat,
                                topics: stat.topics,
                                posts: stat.posts,
                                lastPost: stat.lastPost
                            }
                        }
                        return cat
                    }))
                }
            })
            .catch(err => console.error("Error loading forum stats:", err))

        // 3. Fetch Latest News (For the new banner)
        fetch(`${API_URL}/news`)
            .then(res => res.json())
            .then((data: NewsItem[]) => {
                const published = Array.isArray(data) ? data.filter(n => n.status === 'Published') : []
                if (published.length > 0) {
                     setLatestNews(published[0]) // Get the most recent one
                }
            })
            .catch(err => console.error("Error loading news:", err))

    }, [API_URL])

    return (
        <div className="pt-24 min-h-screen">
            <Section title={t('forum_page.title')}>
                {/* Intro */}
                <div className="max-w-3xl mx-auto mb-16 text-center">
                    <p className="text-gray-400 text-lg leading-relaxed">{t('forum_page.subtitle')}</p>
                </div>

                {/* Featured Section: Poll & News */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16 max-w-6xl mx-auto">
                    
                    {/* Poll Card */}
                    <div className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8 flex flex-col h-full hover:border-(--accent)/30 transition-colors">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2 text-white font-black uppercase tracking-widest text-sm">
                                <BarChart3 className="text-(--accent) text-lg" />
                                <span>{t('forum_page.official_poll_section')}</span>
                            </div>
                            {activePoll && (
                                <div className="flex items-center gap-2 text-red-500 font-bold uppercase text-xs animate-pulse">
                                    <Flame /> {t('forum_page.hot')}
                                </div>
                            )}
                        </div>

                        {activePoll ? (
                            <div className="flex flex-col flex-1">
                                <h3 className="text-xl md:text-2xl font-bold text-white mb-6 leading-tight">
                                    {i18n.language === 'en' && activePoll.question_en ? activePoll.question_en : activePoll.question}
                                </h3>
                                <div className="space-y-4 flex-1">
                                    {(activePoll.options || []).slice(0, 3).map((opt: PollOption) => (
                                        <div key={opt.id} className="relative group">
                                            <div className="h-12 bg-white/5 rounded-xl overflow-hidden relative">
                                                <div 
                                                    className="absolute inset-y-0 left-0 bg-(--accent) opacity-20 transition-all duration-1000 ease-out group-hover:opacity-30" 
                                                    style={{ width: `${opt.percent}%` }}
                                                />
                                                <div className="absolute inset-0 flex items-center justify-between px-6">
                                                    <span className="text-white font-bold text-sm z-10">
                                                        {i18n.language === 'en' && opt.label_en ? opt.label_en : opt.label}
                                                    </span>
                                                    <span className="text-(--accent) font-black text-sm z-10">{opt.percent}%</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 py-8 opacity-50">
                                <BarChart3 className="text-4xl text-gray-500" />
                                <p className="text-gray-400 font-medium uppercase tracking-widest text-sm">{t('forum_page.no_active_poll')}</p>
                            </div>
                        )}
                    </div>

                    {/* News Card */}
                    <div className="h-full">
                        {latestNews ? (
                             <Link to={`/forum/thread/news/${latestNews.slug || latestNews.id}`} className="group block h-full relative rounded-3xl overflow-hidden border border-white/5 hover:border-(--accent) transition-colors">
                                <div 
                                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                    style={{ backgroundImage: `url(${latestNews.image || '/img/placeholder.webp'})` }}
                                />
                                <div className="absolute inset-0 bg-linear-to-t from-black via-black/80 to-transparent" />
                                
                                <div className="relative h-full flex flex-col justify-end p-8">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="bg-amber-500 text-black px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                           <Megaphone /> {t('forum_page.new_badge')}
                                        </div>
                                        <span className="text-amber-500 font-bold text-xs uppercase tracking-wider">{t('forum_page.news_section')}</span>
                                    </div>
                                    <h3 className="text-2xl font-black text-white mb-2 leading-tight group-hover:text-(--accent) transition-colors">
                                        {i18n.language === 'en' && latestNews.title_en ? latestNews.title_en : latestNews.title}
                                    </h3>
                                    <p className="text-gray-300 text-sm line-clamp-2">
                                        {(i18n.language === 'en' && latestNews.content_en ? latestNews.content_en : (latestNews.content || "")).replace(/<[^>]*>?/gm, "")}
                                    </p>
                                </div>
                            </Link>
                        ) : (
                             <div className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8 flex flex-col items-center justify-center text-center gap-4 h-full">
                                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-gray-500 mb-2">
                                    <Megaphone className="text-2xl" />
                                </div>
                                <p className="text-gray-400 font-medium uppercase tracking-widest text-sm">{t('forum_page.loading_news')}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
                    {categories.map((cat) => (
                        <Link 
                            to={`/forum/${cat.slug}`} 
                            key={cat.id} 
                            className="bg-white/5 backdrop-blur-md border border-white/5 rounded-2xl p-6 flex flex-col sm:flex-row items-center sm:items-stretch gap-6 transition-all duration-300 hover:bg-white/10 hover:border-(--accent)/40 hover:-translate-y-1 hover:shadow-xl hover:shadow-(--accent)/5 group"
                        >
                            {/* Icon Box */}
                            <div className="w-16 h-16 sm:w-20 sm:h-auto bg-black/40 rounded-xl flex items-center justify-center text-3xl text-gray-400 group-hover:text-(--accent) group-hover:bg-(--accent)/10 transition-all shrink-0">
                                {cat.icon}
                            </div>

                            <div className="flex-1 text-center sm:text-left min-w-0">
                                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-(--accent) transition-colors uppercase tracking-tight">
                                    {t(`forum_page.categories.${cat.translationKey}.title`)}
                                </h3>
                                <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                                    {t(`forum_page.categories.${cat.translationKey}.desc`)}
                                </p>

                                <div className="flex items-center justify-center sm:justify-start gap-6 border-t border-white/5 pt-4">
                                    <div className="flex flex-col">
                                        <span className="text-lg font-black text-white">{cat.topics}</span>
                                        <span className="text-[10px] text-gray-500 uppercase tracking-widest">{t('forum_page.stats.topics')}</span>
                                    </div>
                                    <div className="w-px h-8 bg-white/10"></div>
                                    <div className="flex flex-col">
                                        <span className="text-lg font-black text-white">{cat.posts}</span>
                                        <span className="text-[10px] text-gray-500 uppercase tracking-widest">{t('forum_page.stats.posts')}</span>
                                    </div>
                                </div>
                            </div>

                             {/* Last Post (Desktop styles can be enhanced, simplified here for mobile compat) */}
                             <div className="hidden xl:flex flex-col justify-center items-end text-right min-w-[120px] text-xs text-gray-500 border-l border-white/5 pl-6 ml-2">
                                <div className="flex items-center gap-2 mb-1 text-gray-300">
                                    <User className="text-(--accent)/50 text-[10px]" /> {cat.lastPost.user}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="text-(--accent)/50 text-[10px]" /> {cat.lastPost.date}
                                </div>
                             </div>
                        </Link>
                    ))}
                </div>
            </Section>
        </div>
    )
}
