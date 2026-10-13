import { Link } from 'react-router';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { WikiArticle } from '../../services/wikiService';

interface WikiArticleToolbarProps {
  currentArticle: WikiArticle | null;
  prevArticle: WikiArticle | null;
  nextArticle: WikiArticle | null;
}

export default function WikiArticleToolbar({
  currentArticle,
  prevArticle,
  nextArticle,
}: Readonly<WikiArticleToolbarProps>) {
  return (
    <div className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-neutral-800 bg-neutral-900 p-3.5 shadow-md sm:flex-row sm:items-center">
      <div className="flex items-center gap-2 text-xs text-neutral-400">
        <Link to="/wiki" className="font-medium transition-colors hover:text-white">
          Wiki
        </Link>
        <ChevronRight size={12} />
        <span className="font-medium capitalize text-neutral-300">
          {currentArticle?.category?.replaceAll('_', ' ') ?? 'General'}
        </span>
        <ChevronRight size={12} />
        <span className="max-w-65 truncate font-bold text-white">{currentArticle?.title}</span>
      </div>

      {/* Previous & Next Article Switchers */}
      <div className="flex items-center gap-2 self-end text-xs font-semibold sm:self-auto">
        {prevArticle && (
          <Link
            to={`/wiki/${prevArticle.slug}`}
            className="flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-1.5 text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-white"
            title={prevArticle.title}
          >
            <ChevronLeft size={13} />
            <span className="max-w-32.5 truncate">{prevArticle.title.split('(')[0].trim()}</span>
          </Link>
        )}
        {nextArticle && (
          <Link
            to={`/wiki/${nextArticle.slug}`}
            className="flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-1.5 text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-white"
            title={nextArticle.title}
          >
            <span className="max-w-32.5 truncate">{nextArticle.title.split('(')[0].trim()}</span>
            <ChevronRight size={13} />
          </Link>
        )}
      </div>
    </div>
  );
}
