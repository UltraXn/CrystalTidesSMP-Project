import { supabase } from "./supabaseClient";

export interface NewsPost {
  id: string;
  title: string;
  content: string;
  category: string;
  imageUrl?: string;
  createdAt: string;
}

interface RawNewsRow {
  id: string;
  title?: string;
  content?: string;
  category?: string;
  image_url?: string;
  created_at?: string;
}

const DUMMY_NEWS: NewsPost[] = [
  {
    id: "1",
    title: "¡Bienvenidos a CrystalTides SMP!",
    content: "El servidor ha abierto sus puertas oficialmente. Únete ahora con tu cliente.",
    category: "Anuncio",
    imageUrl: "/wallpapers/crystaltides_night.png",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "2",
    title: "Mantenimiento y Rendimiento",
    content: "Optimizaciones de red aplicadas en el lobby principal y mundos de juego.",
    category: "Mantenimiento",
    imageUrl: "/wallpapers/crystaltides_day.png",
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: "3",
    title: "Torneo PvP de Gladiadores",
    content: "Prepárate para el torneo de gladiadores este fin de semana. Grandes recompensas.",
    category: "Evento",
    imageUrl: "/wallpapers/crystaltides_night.png",
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: "4",
    title: "Nuevas Mazmorras y Clanes",
    content: "Explora las profundidades abisales con tu clan y obtén botines legendarios.",
    category: "Actualización",
    imageUrl: "/wallpapers/crystaltides_day.png",
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
];

export const fetchNews = async (limit: number = 6): Promise<NewsPost[]> => {
  try {
    const { data, error } = await supabase
      .from("news")
      .select("id, title, content, category, image_url, created_at")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error || !data || data.length === 0) {
      return DUMMY_NEWS.slice(0, limit);
    }

    return (data as RawNewsRow[]).map((row) => ({
      id: row.id,
      title: row.title || "Sin título",
      content: row.content || "",
      category: row.category || "General",
      imageUrl: row.image_url,
      createdAt: row.created_at || new Date().toISOString(),
    }));
  } catch {
    return DUMMY_NEWS.slice(0, limit);
  }
};

export interface LauncherNewsFeedItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  tag: string;
  tagColor: string;
  summary: string;
  imageUrl?: string | null;
  actionUrl: string;
  publishedAt: string;
}

export interface LauncherNewsFeedResponse {
  featured: LauncherNewsFeedItem | null;
  cards: LauncherNewsFeedItem[];
  latestChangelog: {
    version: string;
    buildDate: string;
    bullets: string[];
    actionUrl: string;
  };
  serverStatus: {
    online: boolean;
    motd: string;
    networkRegion: string;
    latencyMs: number;
  };
}

export const fetchLauncherNewsFeed = async (): Promise<LauncherNewsFeedResponse> => {
  try {
    const apiBase = (import.meta as unknown as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL || "https://api.crystaltidessmp.net";
    const res = await fetch(`${apiBase}/api/news/feed`);
    if (res.ok) {
      const data = await res.json();
      return data as LauncherNewsFeedResponse;
    }
  } catch (err) {
    console.warn("Could not fetch remote launcher news feed, falling back to direct Supabase:", err);
  }

  // Fallback to direct supabase
  const news = await fetchNews(6);
  const featured = news[0]
    ? {
        id: news[0].id,
        title: news[0].title,
        slug: news[0].id,
        category: news[0].category,
        tag: news[0].category.toUpperCase(),
        tagColor: "#2DD4BF",
        summary: news[0].content.substring(0, 140) + "...",
        imageUrl: news[0].imageUrl || null,
        actionUrl: `https://crystaltidessmp.net/news/${news[0].id}`,
        publishedAt: news[0].createdAt,
      }
    : null;

  return {
    featured,
    cards: news.map((n: NewsPost) => ({
      id: n.id,
      title: n.title,
      slug: n.id,
      category: n.category,
      tag: n.category.toUpperCase(),
      tagColor: "#2DD4BF",
      summary: n.content.substring(0, 140) + "...",
      imageUrl: n.imageUrl || null,
      actionUrl: `https://crystaltidessmp.net/news/${n.id}`,
      publishedAt: n.createdAt,
    })),
    latestChangelog: {
      version: "0.1.0-alpha",
      buildDate: "2026.8",
      bullets: [
        "Sincronización en la nube de perfiles y shaders",
        "Optimización de memoria JVM y rendimiento",
        "Integración nativa con CrystalCore y chat relay",
      ],
      actionUrl: "https://crystaltidessmp.net/changelog",
    },
    serverStatus: {
      online: true,
      motd: "CrystalTides SMP • Temporada Abisal",
      networkRegion: "US-East",
      latencyMs: 18,
    },
  };
};
