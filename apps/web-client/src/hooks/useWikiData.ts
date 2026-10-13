import { useState, useEffect, useMemo } from 'react';
import { getWikiArticles, getWikiArticle, WikiArticle } from '../services/wikiService';
import { FALLBACK_ARTICLES } from '../data/fallbackArticles';

export const cleanArticleTitle = (title: string): string =>
  title.replace(/^[•#\d\s.-]+/, '').trim();

export function mergeArticleList(
  remoteArticles: WikiArticle[],
  fallbackArticles: WikiArticle[],
): WikiArticle[] {
  const cleanedData = remoteArticles.map((remote) => ({
    ...remote,
    title: cleanArticleTitle(remote.title),
  }));

  const merged: WikiArticle[] = fallbackArticles.map((f) => ({
    ...f,
    title: cleanArticleTitle(f.title),
  }));

  for (const remote of cleanedData) {
    const matchIndex = merged.findIndex(
      (m) =>
        m.slug === remote.slug ||
        m.title.toLowerCase().trim() === remote.title.toLowerCase().trim() ||
        (m.slug.includes('wither') && remote.slug.includes('wither')),
    );

    if (matchIndex !== -1) {
      merged[matchIndex] = {
        ...merged[matchIndex],
        ...remote,
        model_3d_url: remote.model_3d_url ?? merged[matchIndex].model_3d_url,
        model_3d_url_phase_2:
          remote.model_3d_url_phase_2 ?? merged[matchIndex].model_3d_url_phase_2,
        texture_url: remote.texture_url ?? merged[matchIndex].texture_url,
        boss_phases: remote.boss_phases || merged[matchIndex].boss_phases,
        boss_phase_1_attacks:
          remote.boss_phase_1_attacks || merged[matchIndex].boss_phase_1_attacks,
        boss_phase_2_attacks:
          remote.boss_phase_2_attacks || merged[matchIndex].boss_phase_2_attacks,
      };
    } else {
      merged.push(remote);
    }
  }

  return merged;
}

export function mergeArticleDetail(
  remote: WikiArticle | null,
  localMatch?: WikiArticle,
): WikiArticle | null {
  if (!remote && !localMatch) return null;
  if (!remote) return localMatch ?? null;

  return {
    ...localMatch,
    ...remote,
    model_3d_url: remote.model_3d_url ?? localMatch?.model_3d_url,
    model_3d_url_phase_2: remote.model_3d_url_phase_2 ?? localMatch?.model_3d_url_phase_2,
    texture_url: remote.texture_url ?? localMatch?.texture_url,
    boss_phases: remote.boss_phases || localMatch?.boss_phases,
    boss_phase_1_attacks: remote.boss_phase_1_attacks || localMatch?.boss_phase_1_attacks,
    boss_phase_2_attacks: remote.boss_phase_2_attacks || localMatch?.boss_phase_2_attacks,
  } as WikiArticle;
}

export function useWikiData(slug?: string) {
  const [articles, setArticles] = useState<WikiArticle[]>([]);
  const [currentArticle, setCurrentArticle] = useState<WikiArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [articleLoading, setArticleLoading] = useState(false);
  const [portalSearch, setPortalSearch] = useState('');

  // Fetch full article catalog
  useEffect(() => {
    let ignore = false;
    const fetchArticles = async () => {
      try {
        const data = await getWikiArticles();
        if (!ignore) {
          if (data && data.length > 0) {
            setArticles(mergeArticleList(data, FALLBACK_ARTICLES));
          } else {
            setArticles(FALLBACK_ARTICLES);
          }
        }
      } catch {
        if (!ignore) {
          setArticles(FALLBACK_ARTICLES);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchArticles();
    return () => {
      ignore = true;
    };
  }, []);

  // Fetch specific article detail when slug changes
  useEffect(() => {
    let ignore = false;
    const fetchDetail = async () => {
      if (!slug) {
        if (!ignore) setCurrentArticle(null);
        return;
      }

      setArticleLoading(true);
      const localMatch = FALLBACK_ARTICLES.find(
        (a) => a.slug === slug || a.slug === slug.replaceAll('_', '-'),
      );

      try {
        const data = await getWikiArticle(slug);
        if (!ignore) {
          setCurrentArticle(mergeArticleDetail(data, localMatch));
        }
      } catch {
        if (!ignore) {
          setCurrentArticle(localMatch || null);
        }
      } finally {
        setArticleLoading(false);
      }
    };

    fetchDetail();
    return () => {
      ignore = true;
    };
  }, [slug]);

  // Sequential navigation (Prev/Next)
  const { prevArticle, nextArticle } = useMemo(() => {
    if (!slug || articles.length === 0) {
      return { prevArticle: null, nextArticle: null };
    }

    const currentIndex = articles.findIndex(
      (a) => a.slug === slug || a.slug === slug.replaceAll('_', '-'),
    );

    if (currentIndex === -1) {
      return { prevArticle: null, nextArticle: null };
    }

    const prev = currentIndex > 0 ? articles[currentIndex - 1] : articles[articles.length - 1];
    const next = currentIndex < articles.length - 1 ? articles[currentIndex + 1] : articles[0];

    return { prevArticle: prev, nextArticle: next };
  }, [articles, slug]);

  // Filter articles for portal view
  const portalArticles = useMemo(() => {
    if (!portalSearch.trim()) return articles;
    const q = portalSearch.toLowerCase();
    return articles.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        (a.boss_mod_name ?? '').toLowerCase().includes(q) ||
        (a.content ?? '').toLowerCase().includes(q),
    );
  }, [articles, portalSearch]);

  // Category counts
  const categoryCounts = useMemo(() => {
    return {
      bosses: articles.filter((a) => a.category === 'bosses').length,
      hostiles: articles.filter((a) => a.category === 'mobs_hostiles').length,
      critters: articles.filter((a) => a.category === 'mobs_pacificos').length,
      guides: articles.filter((a) => a.category === 'guias_generales' || a.category === 'comandos')
        .length,
    };
  }, [articles]);

  const isMobArticle = useMemo(() => {
    if (!currentArticle) return false;
    return (
      Boolean(currentArticle.model_3d_url) ||
      currentArticle.category === 'bosses' ||
      currentArticle.category === 'mobs_hostiles' ||
      currentArticle.category === 'mobs_pacificos'
    );
  }, [currentArticle]);

  return {
    articles,
    currentArticle,
    loading,
    articleLoading,
    portalSearch,
    setPortalSearch,
    portalArticles,
    prevArticle,
    nextArticle,
    categoryCounts,
    isMobArticle,
  };
}
