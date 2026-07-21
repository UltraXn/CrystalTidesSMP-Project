import { supabase } from "./supabaseClient";

export interface NewsPost {
  id: string;
  title: string;
  content: string;
  category: string;
  imageUrl?: string;
  createdAt: string;
}

const DUMMY_NEWS: NewsPost[] = [
  {
    id: "1",
    title: "¡Bienvenidos a CrystalTides!",
    content: "El servidor ha abierto sus puertas oficialmente. Únete ahora.",
    category: "Anuncio",
    imageUrl: "https://images.unsplash.com/photo-1599508704512-2f19efd1e35f?q=80&w=1000",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "2",
    title: "Mantenimiento Programado",
    content: "Realizaremos mejoras en el lobby principal este fin de semana.",
    category: "Mantenimiento",
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: "3",
    title: "Nuevo Evento PvP",
    content: "Prepárate para el torneo de gladiadores.",
    category: "Evento",
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
];

export const fetchNews = async (limit = 20): Promise<NewsPost[]> => {
  try {
    const { data, error } = await supabase
      .from("news")
      .select("id, title, content, category, image_url, created_at")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error || !data || data.length === 0) {
      console.warn("News fetch error or empty, using dummy data:", error);
      return DUMMY_NEWS;
    }

    return data.map((row: any) => ({
      id: row.id,
      title: row.title || "Sin título",
      content: row.content || "",
      category: row.category || "General",
      imageUrl: row.image_url,
      createdAt: row.created_at,
    }));
  } catch (err) {
    console.warn("News service error, using dummy data:", err);
    return DUMMY_NEWS;
  }
};
