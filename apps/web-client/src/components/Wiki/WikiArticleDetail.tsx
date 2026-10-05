import type { WikiArticle } from '../../services/wikiService';
import { WikiMobArticleDetail } from './WikiMobArticleDetail';
import { WikiStandardArticleDetail } from './WikiStandardArticleDetail';

interface WikiArticleDetailProps {
  article: WikiArticle;
  isMobArticle: boolean;
}

export default function WikiArticleDetail({
  article,
  isMobArticle,
}: Readonly<WikiArticleDetailProps>) {
  if (isMobArticle) {
    return <WikiMobArticleDetail article={article} />;
  }

  return <WikiStandardArticleDetail article={article} />;
}
