import { User, Clock } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import React from "react"

interface Category {
    id: number;
    slug: string;
    translationKey: string;
    icon: React.ReactElement;
    topics: number;
    posts: number;
    lastPost: { user: string; date: string };
}

interface ForumCategoryCardProps {
    category: Category;
}

export default function ForumCategoryCard({ category }: ForumCategoryCardProps) {
    const { t } = useTranslation()

    return (
        <Link 
            to={`/forum/${category.slug}`} 
            className="bg-white/2 backdrop-blur-md border border-white/5 rounded-3xl p-6 md:p-8 flex flex-col sm:flex-row items-center sm:items-stretch gap-8 transition-all duration-500 hover:bg-white/5 hover:border-(--accent)/40 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-(--accent)/5 group"
        >
            {/* Icon Box */}
            <div className="w-16 h-16 sm:w-24 sm:h-auto bg-black/40 rounded-2xl flex items-center justify-center text-4xl text-gray-500 group-hover:text-(--accent) group-hover:bg-(--accent)/10 group-hover:scale-105 transition-all duration-500 shrink-0 border border-white/5 group-hover:border-(--accent)/20 shadow-inner">
                {React.cloneElement(category.icon as React.ReactElement<any>, { size: 32, strokeWidth: 2.5 })}
            </div>

            <div className="flex-1 text-center sm:text-left min-w-0 flex flex-col justify-center">
                <h3 className="text-xl font-black text-white mb-2 group-hover:text-(--accent) transition-colors uppercase tracking-tight">
                    {t(`forum_page.categories.${category.translationKey}.title`)}
                </h3>
                <p className="text-sm text-gray-400 font-medium mb-6 line-clamp-2 leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                    {t(`forum_page.categories.${category.translationKey}.desc`)}
                </p>

                <div className="flex items-center justify-center sm:justify-start gap-8 border-t border-white/5 pt-6">
                    <div className="flex flex-col gap-1">
                        <span className="text-xl font-black text-white leading-none">{category.topics}</span>
                        <span className="text-[9px] text-gray-500 font-black uppercase tracking-[0.2em]">{t('forum_page.stats.topics')}</span>
                    </div>
                    <div className="w-px h-8 bg-white/10" aria-hidden="true" />
                    <div className="flex flex-col gap-1">
                        <span className="text-xl font-black text-white leading-none">{category.posts}</span>
                        <span className="text-[9px] text-gray-500 font-black uppercase tracking-[0.2em]">{t('forum_page.stats.posts')}</span>
                    </div>
                </div>
            </div>

             {/* Last Post */}
             <div className="hidden xl:flex flex-col justify-center items-end text-right min-w-[160px] text-[10px] font-bold text-gray-500 border-l border-white/5 pl-8 ml-2">
                <div className="flex items-center gap-2 mb-2 text-gray-300 uppercase tracking-wider group-hover:text-white transition-colors">
                    <User size={12} className="text-(--accent)/40" aria-hidden="true" /> 
                    <span className="truncate max-w-[120px]">{category.lastPost.user}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500 uppercase tracking-widest">
                    <Clock size={12} className="text-(--accent)/40" aria-hidden="true" /> 
                    <span>{category.lastPost.date}</span>
                </div>
             </div>
        </Link>
    )
}
