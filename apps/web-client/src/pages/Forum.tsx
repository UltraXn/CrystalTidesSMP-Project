import { MessageSquare, Megaphone, Wrench, Coffee } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import Section from "../components/Layout/Section"
import { useQuery } from "@tanstack/react-query"
import { fetchActivePoll } from "../services/pollService"
import { getForumStats } from "../services/forumService"
import { getLatestNews } from "../services/newsService"
import ForumPollCard from "../components/Forum/ForumPollCard"
import ForumNewsCard from "../components/Forum/ForumNewsCard"
import ForumCategoryCard from "../components/Forum/ForumCategoryCard"

const initialCategoriesData = [
    { id: 1, slug: "announcements", translationKey: "announcements", icon: <Megaphone /> },
    { id: 2, slug: "general", translationKey: "general", icon: <MessageSquare /> },
    { id: 3, slug: "support", translationKey: "support", icon: <Wrench /> },
    { id: 4, slug: "off-topic", translationKey: "off-topic", translationKey_deprecated: "offtopic", icon: <Coffee /> }
]

export default function Forum() {
    const { t } = useTranslation()

    // 1. Fetch Active Poll
    const { data: activePoll } = useQuery({
        queryKey: ['activePoll'],
        queryFn: fetchActivePoll,
        staleTime: 60000,
    })

    // 2. Fetch Forum Stats
    const { data: stats } = useQuery({
        queryKey: ['forumStats'],
        queryFn: getForumStats,
        staleTime: 30000,
    })

    // 3. Fetch Latest News
    const { data: news } = useQuery({
        queryKey: ['latestNews'],
        queryFn: getLatestNews,
        select: (data) => {
            const published = Array.isArray(data) ? data.filter(n => n.status === 'Published') : []
            return published.length > 0 ? published[0] : null
        },
        staleTime: 60000,
    })

    const categories = initialCategoriesData.map(cat => {
        const stat = stats?.find(s => s.id === cat.id)
        return {
            ...cat,
            translationKey: cat.translationKey === "off-topic" ? "offtopic" : cat.translationKey,
            topics: stat?.topics || 0,
            posts: stat?.posts || 0,
            lastPost: stat?.lastPost || { user: "-", date: "-" }
        }
    })

    return (
        <div className="pt-32 pb-20 min-h-screen">
            <Section title={t('forum_page.title')}>
                {/* Intro */}
                <div className="max-w-3xl mx-auto mb-20 text-center">
                    <p className="text-gray-400 text-lg md:text-xl font-medium leading-relaxed opacity-80 decoration-(--accent)/20 underline-offset-8">
                        {t('forum_page.subtitle')}
                    </p>
                </div>

                {/* Featured Section: Poll & News */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20 max-w-6xl mx-auto">
                    <ForumPollCard poll={activePoll || null} />
                    <ForumNewsCard news={news || null} />
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                    {categories.map((cat) => (
                        <ForumCategoryCard key={cat.id} category={cat} />
                    ))}
                </div>
            </Section>
        </div>
    )
}
