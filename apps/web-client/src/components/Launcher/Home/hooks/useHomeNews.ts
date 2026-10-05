import { useState, useEffect, useCallback } from 'react';
import { fetchNews, type NewsPost } from '../../mockLauncherState';

export const useHomeNews = (limit: number = 5) => {
  const [news, setNews] = useState<NewsPost[]>([]);
  const [activeNewsIndex, setActiveNewsIndex] = useState(0);
  const [isHoveringCarousel, setIsHoveringCarousel] = useState(false);

  useEffect(() => {
    let ignore = false;
    fetchNews(limit).then((data) => {
      if (!ignore) setNews(data);
    });
    return () => {
      ignore = true;
    };
  }, [limit]);

  useEffect(() => {
    if (news.length <= 1 || isHoveringCarousel) return;
    const interval = setInterval(() => {
      setActiveNewsIndex((prev) => (prev + 1) % news.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [news.length, isHoveringCarousel]);

  const handlePrevNews = useCallback(() => {
    setActiveNewsIndex((prev) => (prev - 1 + news.length) % news.length);
  }, [news.length]);

  const handleNextNews = useCallback(() => {
    setActiveNewsIndex((prev) => (prev + 1) % news.length);
  }, [news.length]);

  return {
    news,
    activeNewsIndex,
    setActiveNewsIndex,
    setIsHoveringCarousel,
    handlePrevNews,
    handleNextNews,
  };
};
