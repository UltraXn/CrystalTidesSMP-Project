import { useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { m as motion, AnimatePresence } from 'framer-motion';
import Loader from '../components/UI/Loader';
import { useSEO } from '../hooks/useSEO';
import { useWikiData } from '../hooks/useWikiData';
import WikiTreeSidebar from '../components/Wiki/WikiTreeSidebar';
import WikiPortalView from '../components/Wiki/WikiPortalView';
import WikiArticleToolbar from '../components/Wiki/WikiArticleToolbar';
import WikiArticleDetail from '../components/Wiki/WikiArticleDetail';
import type { WikiArticle } from '../services/wikiService';
import '../styles/pages/wiki.css';

function renderArticleContent(
  articleLoading: boolean,
  currentArticle: WikiArticle | null,
  isMobArticle: boolean,
  t: TFunction,
) {
  if (articleLoading) {
    return (
      <div className="flex items-center justify-center rounded-3xl border border-neutral-800 bg-neutral-900/80 py-32 shadow-xl">
        <Loader text={t('wiki.loading_article', 'Abriendo artículo e invocando modelo...')} />
      </div>
    );
  }

  if (currentArticle) {
    return (
      <div className="space-y-6">
        <WikiArticleDetail article={currentArticle} isMobArticle={isMobArticle} />
      </div>
    );
  }

  return null;
}

function renderWikiMainView(
  loading: boolean,
  slug: string | undefined,
  portalView: React.ReactNode,
  articleView: React.ReactNode,
  t: TFunction,
) {
  if (loading) {
    return (
      <motion.div
        key="wiki-loading"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex items-center justify-center rounded-3xl border border-neutral-800 bg-neutral-900/80 py-32 shadow-xl"
      >
        <Loader text={t('wiki.loading_catalog', 'Abriendo los tomos de la Wiki...')} />
      </motion.div>
    );
  }

  if (!slug) {
    return (
      <motion.div
        key="wiki-portal"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
      >
        {portalView}
      </motion.div>
    );
  }

  return articleView;
}

export default function Wiki() {
  const { slug } = useParams();
  const { t } = useTranslation();

  const canonicalUrl = slug
    ? `https://crystaltidessmp.net/wiki/${slug}`
    : 'https://crystaltidessmp.net/wiki';

  useSEO({
    title: slug
      ? `Wiki - ${slug.replaceAll('-', ' ').toUpperCase()}`
      : 'Guía de Juego, Bestiario y Comandos (Wiki)',
    description:
      'Manual completo del jugador para CrystalTides SMP 1.21+. Tutoriales, Bestiario con Tarjetas 3D Interactivas, protecciones y economía.',
    keywords:
      'wiki minecraft, bestiario minecraft, comandos smp, guia minecraft, protecciones minecraft, economia minecraft',
    canonical: canonicalUrl,
  });

  const {
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
  } = useWikiData(slug);

  const portalContent = (
    <WikiPortalView
      portalArticles={portalArticles}
      portalSearch={portalSearch}
      onSearchChange={setPortalSearch}
      categoryCounts={categoryCounts}
    />
  );

  const articleContent = (
    <motion.div
      key={currentArticle?.slug ?? 'wiki-article'}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      <WikiArticleToolbar
        currentArticle={currentArticle}
        prevArticle={prevArticle}
        nextArticle={nextArticle}
      />
      {renderArticleContent(articleLoading, currentArticle, isMobArticle, t)}
    </motion.div>
  );

  return (
    <div className="wiki-container max-w-437.5 mx-auto flex min-h-screen flex-col items-start gap-8 px-4 pb-20 pt-24 md:px-8 lg:flex-row">
      {/* 1. Iconic Left Navigation Tree Sidebar (Always Available) */}
      <WikiTreeSidebar articles={articles} />

      {/* 2. Main Wiki Content Area (Full Width Space) */}
      <div className="w-full min-w-0 flex-1 space-y-6">
        <AnimatePresence mode="wait">
          {renderWikiMainView(loading, slug, portalContent, articleContent, t)}
        </AnimatePresence>
      </div>
    </div>
  );
}
