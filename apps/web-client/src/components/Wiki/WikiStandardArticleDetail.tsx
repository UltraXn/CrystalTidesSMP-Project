import { Tag, Clock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { formatDate } from '../../utils/date';
import type { WikiArticle } from '../../services/wikiService';

interface WikiStandardArticleDetailProps {
  article: WikiArticle;
}

export function WikiStandardArticleDetail({ article }: Readonly<WikiStandardArticleDetailProps>) {
  return (
    <div className="space-y-6 rounded-2xl border border-neutral-800 bg-neutral-900 p-8 shadow-xl md:p-10">
      <header className="space-y-3 border-b border-neutral-800 pb-5">
        <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-400">
          <span className="flex items-center gap-1.5 rounded-sm border border-neutral-700 bg-neutral-800 px-2.5 py-0.5 font-bold capitalize text-neutral-200">
            <Tag size={11} />
            {article.category.replaceAll('_', ' ')}
          </span>
          <span className="ml-auto flex items-center gap-1 text-[11px] text-neutral-500">
            <Clock size={11} /> {article.updated_at ? formatDate(article.updated_at) : 'Oficial'}
          </span>
        </div>

        <h1 className="text-2xl/tight font-black tracking-tight text-white sm:text-4xl">
          {article.title}
        </h1>
      </header>

      <div className="article-content prose prose-invert max-w-none text-sm/relaxed text-neutral-300 sm:text-base">
        <ReactMarkdown>{article.content}</ReactMarkdown>
      </div>
    </div>
  );
}
