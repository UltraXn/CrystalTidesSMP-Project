import { Megaphone } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { NewsItem } from "../../services/newsService"

interface ForumNewsCardProps {
    news: NewsItem | null;
}

export default function ForumNewsCard({ news }: ForumNewsCardProps) {
    const { t, i18n } = useTranslation()

    if (!news) {
        return (
            <div className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-4xl p-8 flex flex-col items-center justify-center text-center gap-6 h-full min-h-[300px]">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-gray-500 mb-2">
                    <Megaphone size={28} aria-hidden="true" />
                </div>
                <p className="text-gray-400 font-black uppercase tracking-[0.2em] text-[10px]">{t('forum_page.loading_news')}</p>
            </div>
        )
    }

    return (
        <Link 
            to={`/forum/thread/news/${news.slug || news.id}`} 
            className="group block h-full relative rounded-4xl overflow-hidden border border-white/5 hover:border-(--accent) transition-all duration-500 shadow-2xl"
        >
            <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110"
                style={{ backgroundImage: `url(${news.image || '/img/placeholder.webp'})` }}
                aria-hidden="true"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black via-black/80 to-transparent opacity-90" aria-hidden="true" />
            
            <div className="relative h-full flex flex-col justify-end p-8 md:p-10">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-amber-500 text-black px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] flex items-center gap-2 shadow-lg shadow-amber-500/20">
                        <Megaphone size={12} aria-hidden="true" /> 
                        {t('forum_page.new_badge')}
                    </div>
                    <span className="text-amber-500 font-black text-[10px] uppercase tracking-widest">{t('forum_page.news_section')}</span>
                </div>
                
                <h3 className="text-2xl md:text-3xl font-black text-white mb-4 leading-tight group-hover:text-(--accent) transition-colors tracking-tight">
                    {i18n.language === 'en' && news.title_en ? news.title_en : news.title}
                </h3>
                
                <p className="text-gray-300 text-sm font-medium line-clamp-2 leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                    {(i18n.language === 'en' && news.content_en ? news.content_en : (news.content || "")).replace(/<[^>]*>?/gm, "")}
                </p>
            </div>
        </Link>
    )
}
