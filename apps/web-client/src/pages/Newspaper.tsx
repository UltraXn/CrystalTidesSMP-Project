import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Flame, Clock, Calendar, User, ArrowRight, RefreshCw, BookOpen, Newspaper as NewspaperIcon, Swords } from "lucide-react"

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api"

export interface NewspaperEdition {
  id: string
  issue_number: number
  issue_date: string
  headline: string
  front_page_summary: string
  full_markdown: string
  image?: string
  likes_count: number
  created_at: string
}

export interface DailyQuest {
  id: number
  quest_type: "HUNT" | "CRAFT" | "EXPLORE" | "COMMERCE"
  title: string
  description: string
  target: string
  amount: number
  reward_kc: number
}

const DEFAULT_COVERS = [
  "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80"
]

function getCoverImage(edition: NewspaperEdition, idx = 0): string {
  if (edition.image?.startsWith('http')) return edition.image
  return DEFAULT_COVERS[idx % DEFAULT_COVERS.length]
}

function cleanTitle(rawHeadline: string | undefined | null): string {
  if (!rawHeadline) return "Edición Oficial del Servidor"
  return rawHeadline
    .replace(/^#+\s*/, '')
    .replace(/^(?:[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|\s|\d|\.)*/u, '')
    .trim()
}

async function fetchLatestNewspaper(): Promise<NewspaperEdition | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/ai/newspaper/latest`)
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

async function fetchNewspaperArchive(): Promise<NewspaperEdition[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/ai/newspaper/archive?limit=15`)
    if (!res.ok) return []
    const data = await res.json()
    return data.editions || []
  } catch {
    return []
  }
}

async function fetchDailyQuests(): Promise<DailyQuest[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/ai/quests/daily`)
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

/**
 * Renderizador de Markdown Enriquecido estilo Blog con soporte de Imágenes Inline `![alt](url)`
 */
export function RichBlogMarkdownRenderer({ markdown }: { readonly markdown: string }) {
  if (!markdown) return null

  const imageRegex = /!\[(.*?)\]\((.*?)\)/g
  const paragraphs = markdown.split('\n\n').filter(Boolean)

  return (
    <div className="space-y-6 text-gray-200 leading-relaxed text-base sm:text-lg">
      {paragraphs.map((para) => {
        const trimmed = para.trim()
        const elementKey = `para_${trimmed.slice(0, 15)}_${trimmed.length}`

        if (trimmed.startsWith('![')) {
          const match = /^!\[(.*?)\]\((.*?)\)$/.exec(trimmed)
          if (match) {
            return (
              <figure key={elementKey} className="my-6 space-y-2">
                <img
                  src={match[2]}
                  alt={match[1] || 'Imagen del Periódico'}
                  className="w-full rounded-2xl border border-white/10 shadow-2xl object-cover max-h-137.5 hover:scale-[1.01] transition-transform"
                />
                {match[1] && (
                  <figcaption className="text-center text-xs text-gray-400 font-mono italic">
                    📷 {match[1]}
                  </figcaption>
                )}
              </figure>
            )
          }
        }

        if (trimmed.startsWith('# ') || trimmed.startsWith('## ') || trimmed.startsWith('### ')) {
          const cleanHeading = cleanTitle(trimmed)

          if (cleanHeading.toLowerCase().includes('titular sensacionalista') && cleanHeading.length < 35) {
            return null
          }

          return (
            <h3
              key={elementKey}
              className="text-2xl sm:text-3xl font-black text-white pt-8 pb-3 border-b border-white/10 flex items-center gap-3 tracking-tight"
            >
              {cleanHeading}
            </h3>
          )
        }

        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const items = trimmed.split('\n').filter(Boolean)
          return (
            <ul key={elementKey} className="space-y-2 pl-4 border-l-2 border-(--accent)/40 my-4">
              {items.map((it) => {
                const itemText = it.replace(/^[-*]\s*/, '').trim()
                return (
                  <li key={`it_${itemText.slice(0, 15)}`} className="text-gray-300 text-sm sm:text-base">
                    {itemText}
                  </li>
                )
              })}
            </ul>
          )
        }

        const parts: React.ReactNode[] = []
        let lastIdx = 0
        let imgMatch: RegExpExecArray | null

        const localRegex = new RegExp(imageRegex)
        while ((imgMatch = localRegex.exec(trimmed)) !== null) {
          if (imgMatch.index > lastIdx) {
            parts.push(trimmed.substring(lastIdx, imgMatch.index))
          }
          parts.push(
            <img
              key={`img_inline_${imgMatch.index}`}
              src={imgMatch[2]}
              alt={imgMatch[1] || 'Imagen inline'}
              className="w-full rounded-2xl border border-white/10 shadow-xl my-4 object-cover max-h-100"
            />
          )
          lastIdx = imgMatch.index + imgMatch[0].length
        }

        if (lastIdx < trimmed.length) {
          parts.push(trimmed.substring(lastIdx))
        }

        return (
          <p key={elementKey} className="text-gray-300 text-base sm:text-lg leading-relaxed font-normal">
            {parts.length > 0 ? parts : trimmed}
          </p>
        )
      })}
    </div>
  )
}

function DailyQuestsBoard({ quests, isLoading }: { readonly quests?: DailyQuest[]; readonly isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="py-16 text-center text-gray-400 text-sm">
        <RefreshCw className="w-8 h-8 text-(--accent) animate-spin mx-auto mb-4" />
        Cargando misiones del día...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-black text-white uppercase tracking-tight">
          Tablón de Misiones Diarias
        </h2>
        <p className="text-gray-400 text-sm">
          Completa misiones in-game ejecutando <code className="text-(--accent)">/misiones</code> para reclamar KilluCoins (KC).
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {quests?.map((q) => (
          <div key={q.id} className="p-6 rounded-3xl bg-black/40 backdrop-blur-xl border border-white/10 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-(--accent)/10 text-(--accent) text-[10px] font-mono font-bold border border-(--accent)/30 uppercase">
                {q.quest_type}
              </span>
              <span className="text-xs font-mono font-black text-(--accent)">
                +{q.reward_kc} KC
              </span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white mb-1">{q.title}</h3>
              <p className="text-xs text-gray-300 leading-relaxed">{q.description}</p>
            </div>

            <div className="pt-3 border-t border-white/10 text-[10px] text-gray-400 flex items-center justify-between font-mono">
              <span>Objetivo: {q.target} x{q.amount}</span>
              <span className="text-(--accent)">/misiones</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ArticleReader({
  edition,
  hasLiked,
  onLike
}: {
  readonly edition: NewspaperEdition
  readonly hasLiked: boolean
  readonly onLike: (id: string) => void
}) {
  return (
    <article className="space-y-8 bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 sm:p-12 shadow-2xl">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="px-3 py-1 rounded-full bg-(--accent)/10 text-(--accent) text-xs font-mono font-bold border border-(--accent)/30">
            EDICIÓN #{edition.issue_number}
          </span>
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-(--accent)" /> {edition.issue_date}
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight tracking-tight">
          {cleanTitle(edition.headline)}
        </h1>

        <div className="flex items-center justify-between pt-4 border-t border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-(--accent)/20 border border-(--accent)/40 flex items-center justify-center text-white font-bold">
              <User className="w-5 h-5 text-(--accent)" />
            </div>
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider">Prensa Oficial</p>
              <p className="text-[10px] text-gray-400">CrystalTides SMP</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onLike(edition.id)}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold transition-all ${
              hasLiked
                ? "bg-(--accent) text-black shadow-lg shadow-(--accent)/20"
                : "bg-white/10 text-gray-300 hover:bg-white/20"
            }`}
          >
            <Flame className="w-4 h-4" />
            {edition.likes_count + (hasLiked ? 1 : 0)} Likes
          </button>
        </div>
      </div>

      <div className="relative rounded-3xl overflow-hidden aspect-video border border-white/10 shadow-2xl">
        <img
          src={getCoverImage(edition)}
          alt={edition.headline}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent" />
      </div>

      <RichBlogMarkdownRenderer markdown={edition.full_markdown} />
    </article>
  )
}

function HeroArticleCard({
  hero,
  likes,
  onRead,
  onLike
}: {
  readonly hero: NewspaperEdition
  readonly likes: number
  readonly onRead: (art: NewspaperEdition) => void
  readonly onLike: (id: string) => void
}) {
  const headline = cleanTitle(hero.headline)

  return (
    <article className="group space-y-6">
      <div className="relative rounded-3xl overflow-hidden aspect-video border border-white/10 shadow-2xl bg-black/60">
        <img
          src={getCoverImage(hero, 0)}
          alt={headline}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-103"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black via-black/30 to-transparent" />
        <span className="absolute top-6 left-6 px-4 py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-white/10 text-xs font-black text-(--accent) uppercase tracking-widest flex items-center gap-1.5">
          <NewspaperIcon className="w-3.5 h-3.5" /> EDICIÓN DESTACADA #{hero.issue_number}
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-4 text-xs font-mono text-gray-400">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-(--accent)" /> {hero.issue_date}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <User className="w-3.5 h-3.5 text-(--accent)" /> Staff
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white group-hover:text-(--accent) transition-colors leading-tight tracking-tight">
          {headline}
        </h1>

        <p className="text-gray-300 text-base sm:text-lg leading-relaxed font-normal">
          {hero.front_page_summary}
        </p>

        <div className="pt-2 flex items-center gap-4">
          <button
            type="button"
            onClick={() => onRead(hero)}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-(--accent) text-black font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-(--accent)/20 cursor-pointer"
          >
            Leer Artículo Completo <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => onLike(hero.id)}
            className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white/10 text-xs font-bold text-gray-300 hover:bg-white/20 transition-colors cursor-pointer"
          >
            <Flame className="w-4 h-4 text-amber-500" />
            {likes} Likes
          </button>
        </div>
      </div>
    </article>
  )
}

function ArticlesCatalog({
  articles,
  onSelect
}: {
  readonly articles: NewspaperEdition[]
  readonly onSelect: (art: NewspaperEdition) => void
}) {
  if (articles.length === 0) {
    return <p className="text-gray-400 text-sm">No hay ediciones anteriores archivadas.</p>
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {articles.map((art, idx) => (
        <button
          type="button"
          key={art.id}
          onClick={() => onSelect(art)}
          className="group bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden flex flex-col justify-between transition-all duration-300 hover:border-(--accent)/40 hover:-translate-y-1 cursor-pointer shadow-xl text-left"
        >
          <div className="relative aspect-video overflow-hidden bg-black/50">
            <img
              src={getCoverImage(art, idx + 1)}
              alt={art.headline}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
            />
            <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border border-white/10 text-[10px] font-black text-(--accent) uppercase tracking-widest">
              EDICIÓN #{art.issue_number}
            </div>
          </div>

          <div className="p-6 space-y-3 grow flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-gray-400">
                {art.issue_date}
              </span>
              <h4 className="text-base font-bold text-white group-hover:text-(--accent) transition-colors line-clamp-2 leading-snug">
                {cleanTitle(art.headline)}
              </h4>
              <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed">
                {art.front_page_summary}
              </p>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-bold text-(--accent)">
              <span>Leer Noticia</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}

function SidebarQuestsList({ quests, isLoading }: { readonly quests?: DailyQuest[]; readonly isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="p-6 text-center text-xs text-gray-400">
        <RefreshCw className="w-5 h-5 text-(--accent) animate-spin mx-auto mb-2" />
        Cargando misiones...
      </div>
    )
  }

  if (!quests || quests.length === 0) {
    return <p className="text-xs text-gray-400">No hay misiones activas por hoy.</p>
  }

  return (
    <div className="space-y-3">
      {quests.slice(0, 3).map((quest) => (
        <div key={quest.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white">{quest.title}</span>
            <span className="text-(--accent) font-mono font-bold">+{quest.reward_kc} KC</span>
          </div>
          <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">{quest.description}</p>
        </div>
      ))}
    </div>
  )
}

function SidebarWidgets({
  dailyQuests,
  loadingQuests,
  allArticles,
  onSelectArticle
}: {
  readonly dailyQuests?: DailyQuest[]
  readonly loadingQuests: boolean
  readonly allArticles: NewspaperEdition[]
  readonly onSelectArticle: (art: NewspaperEdition) => void
}) {
  return (
    <div className="lg:col-span-4 space-y-8 sticky top-28">
      <div className="p-6 rounded-3xl bg-black/40 border border-white/10 backdrop-blur-xl space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h4 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Swords className="w-4 h-4 text-(--accent)" /> Misiones Diarias
          </h4>
          <span className="text-[10px] font-mono text-(--accent) bg-(--accent)/10 px-2 py-0.5 rounded-full border border-(--accent)/30">
            /misiones
          </span>
        </div>

        <SidebarQuestsList quests={dailyQuests} isLoading={loadingQuests} />
      </div>

      {allArticles.length > 0 && (
        <div className="p-6 rounded-3xl bg-black/40 border border-white/10 backdrop-blur-xl space-y-4 shadow-xl">
          <h4 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-3">
            <BookOpen className="w-4 h-4 text-(--accent)" /> Ediciones Recientes
          </h4>

          <div className="space-y-3">
            {allArticles.slice(0, 4).map((art, idx) => (
              <button
                type="button"
                key={art.id}
                onClick={() => onSelectArticle(art)}
                className="flex items-center gap-3 p-2 rounded-2xl hover:bg-white/5 transition-colors cursor-pointer group w-full text-left"
              >
                <img
                  src={getCoverImage(art, idx + 1)}
                  alt={art.headline}
                  className="w-14 h-14 rounded-xl object-cover shrink-0 border border-white/10"
                />
                <div className="grow min-w-0">
                  <span className="text-[10px] font-mono text-(--accent)">
                    EDICIÓN #{art.issue_number}
                  </span>
                  <h5 className="text-xs font-bold text-white group-hover:text-(--accent) transition-colors line-clamp-1">
                    {cleanTitle(art.headline)}
                  </h5>
                  <span className="text-[10px] text-gray-500">{art.issue_date}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function MainArticlesFeed({
  readingEdition,
  loadingLatest,
  activeHero,
  allArticles,
  hasLiked,
  likes,
  onLike,
  onSelectEdition
}: {
  readonly readingEdition: NewspaperEdition | null
  readonly loadingLatest: boolean
  readonly activeHero: NewspaperEdition | null
  readonly allArticles: NewspaperEdition[]
  readonly hasLiked: boolean
  readonly likes: number
  readonly onLike: (id: string) => void
  readonly onSelectEdition: (art: NewspaperEdition) => void
}) {
  if (readingEdition) {
    return (
      <ArticleReader
        edition={readingEdition}
        hasLiked={hasLiked}
        onLike={onLike}
      />
    )
  }

  return (
    <div className="space-y-12">
      {loadingLatest && (
        <div className="p-16 text-center rounded-3xl bg-black/40 border border-white/10 backdrop-blur-xl">
          <RefreshCw className="w-8 h-8 text-(--accent) animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-sm">Cargando artículo principal...</p>
        </div>
      )}

      {!loadingLatest && activeHero && (
        <HeroArticleCard
          hero={activeHero}
          likes={likes}
          onRead={onSelectEdition}
          onLike={onLike}
        />
      )}

      <div className="space-y-6 pt-6 border-t border-white/10">
        <h3 className="text-2xl font-black text-white tracking-tight uppercase flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-(--accent)" /> Catálogo de Noticias
        </h3>

        <ArticlesCatalog articles={allArticles} onSelect={onSelectEdition} />
      </div>
    </div>
  )
}

export function NewspaperSection() {
  const [activeTab, setActiveTab] = useState<"blog" | "quests">("blog")
  const [readingEdition, setReadingEdition] = useState<NewspaperEdition | null>(null)
  const [likedEditions, setLikedEditions] = useState<Record<string, boolean>>({})

  const { data: latestEdition, isLoading: loadingLatest } = useQuery({
    queryKey: ["latest-newspaper-edition"],
    queryFn: fetchLatestNewspaper
  })

  const { data: archiveEditions } = useQuery({
    queryKey: ["newspaper-archive-list"],
    queryFn: fetchNewspaperArchive
  })

  const { data: dailyQuests, isLoading: loadingQuests } = useQuery({
    queryKey: ["daily-quests-list"],
    queryFn: fetchDailyQuests
  })

  const activeHero = latestEdition ?? archiveEditions?.[0] ?? null
  const allArticles = archiveEditions ? archiveEditions.filter(a => a.id !== activeHero?.id) : []
  
  const targetId = readingEdition?.id ?? activeHero?.id
  const hasLiked = Boolean(targetId && likedEditions[targetId])
  const extraLikes = hasLiked ? 1 : 0
  const likes = activeHero ? activeHero.likes_count + extraLikes : 0

  const handleLike = async (editionId: string) => {
    if (likedEditions[editionId]) return
    setLikedEditions(prev => ({ ...prev, [editionId]: true }))
    try {
      await fetch(`${API_BASE_URL}/ai/newspaper/${editionId}/like`, { method: 'POST' })
    } catch (err) {
      console.warn('Error al enviar like:', err)
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-10">
      {/* Navigation Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => { setActiveTab("blog"); setReadingEdition(null) }}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest transition-all ${
              activeTab === "blog"
                ? "bg-(--accent) text-black shadow-lg shadow-(--accent)/20"
                : "bg-white/5 text-gray-300 hover:bg-white/10"
            }`}
          >
            <NewspaperIcon className="w-4 h-4" /> Noticias & Artículos
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("quests")}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest transition-all ${
              activeTab === "quests"
                ? "bg-(--accent) text-black shadow-lg shadow-(--accent)/20"
                : "bg-white/5 text-gray-300 hover:bg-white/10"
            }`}
          >
            <Swords className="w-4 h-4" /> Misiones del Gremio ({dailyQuests?.length || 0})
          </button>
        </div>

        {readingEdition && (
          <button
            type="button"
            onClick={() => setReadingEdition(null)}
            className="text-xs font-mono text-(--accent) hover:underline flex items-center gap-1"
          >
            ← Volver a Portada
          </button>
        )}
      </div>

      {activeTab === "quests" ? (
        <DailyQuestsBoard quests={dailyQuests} isLoading={loadingQuests} />
      ) : (
        <div className="grid lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-8 space-y-12">
            <MainArticlesFeed
              readingEdition={readingEdition}
              loadingLatest={loadingLatest}
              activeHero={activeHero}
              allArticles={allArticles}
              hasLiked={hasLiked}
              likes={likes}
              onLike={handleLike}
              onSelectEdition={setReadingEdition}
            />
          </div>

          <SidebarWidgets
            dailyQuests={dailyQuests}
            loadingQuests={loadingQuests}
            allArticles={allArticles}
            onSelectArticle={setReadingEdition}
          />
        </div>
      )}
    </div>
  )
}

export default function NewspaperPage() {
  return (
    <div className="min-h-screen bg-[#07090e] text-white pt-24 pb-16">
      <NewspaperSection />
    </div>
  )
}
