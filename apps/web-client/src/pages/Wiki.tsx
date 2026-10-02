import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { m as motion, AnimatePresence } from 'framer-motion';
import Loader from '../components/UI/Loader';
import { useSEO } from '../hooks/useSEO';
import { useWikiData } from '../hooks/useWikiData';
import WikiTreeSidebar from '../components/Wiki/WikiTreeSidebar';
import WikiPortalView from '../components/Wiki/WikiPortalView';
import WikiArticleToolbar from '../components/Wiki/WikiArticleToolbar';
import WikiArticleDetail from '../components/Wiki/WikiArticleDetail';
import '../styles/pages/wiki.css';

export default function Wiki() {
  const { slug } = useParams();
  const { t } = useTranslation();

  useSEO({
    title: slug
      ? `Wiki - ${slug.replaceAll('-', ' ').toUpperCase()}`
      : 'Guía de Juego, Bestiario y Comandos (Wiki)',
    description:
      'Manual completo del jugador para CrystalTides SMP 1.21+. Tutoriales, Bestiario con Tarjetas 3D Interactivas, protecciones y economía.',
    keywords:
      'wiki minecraft, bestiario minecraft, comandos smp, guia minecraft, protecciones minecraft, economia minecraft',
    canonical: `https://crystaltidessmp.net/wiki${slug ? `/${slug}` : ''}`,
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

  return (
    <div className="wiki-container max-w-437.5 mx-auto flex min-h-screen flex-col items-start gap-8 px-4 pb-20 pt-24 md:px-8 lg:flex-row">
      {/* 1. Iconic Left Navigation Tree Sidebar (Always Available) */}
      <WikiTreeSidebar articles={articles} />

      {/* 2. Main Wiki Content Area (Full Width Space) */}
      <div className="w-full min-w-0 flex-1 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center rounded-3xl border border-neutral-800 bg-neutral-900/80 py-32 shadow-xl">
            <Loader text={t('wiki.loading_catalog', 'Abriendo los tomos de la Wiki...')} />
          </div>
        ) : !slug ? (
          <WikiPortalView
            portalArticles={portalArticles}
            portalSearch={portalSearch}
            onSearchChange={setPortalSearch}
            categoryCounts={categoryCounts}
          />
        ) : (
          <div className="space-y-6">
            <WikiArticleToolbar
              currentArticle={currentArticle}
              prevArticle={prevArticle}
              nextArticle={nextArticle}
            />

            <AnimatePresence mode="wait">
              {articleLoading ? (
                <div className="flex items-center justify-center rounded-3xl border border-neutral-800 bg-neutral-900/80 py-32 shadow-xl">
                  <Loader
                    text={t('wiki.loading_article', 'Abriendo artículo e invocando modelo...')}
                  />
                </div>
              ) : currentArticle ? (
                <motion.div
                  key={currentArticle.slug}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <WikiArticleDetail article={currentArticle} isMobArticle={isMobArticle} />
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
