import { Request, Response } from 'express';
import supabase from '../services/supabaseService.js';

interface NewsItem {
  id: number;
  created_at: string;
}

interface WikiArticleItem {
  slug?: string;
  updated_at?: string;
  created_at: string;
}

interface ForumThreadItem {
  slug?: string;
  created_at: string;
}

const buildStaticPagesXml = (baseUrl: string, now: string): string => {
  const staticPages = [
    { url: `${baseUrl}/`, priority: '1.0', changefreq: 'daily' },
    { url: `${baseUrl}/rules`, priority: '0.8', changefreq: 'monthly' },
    { url: `${baseUrl}/donors`, priority: '0.8', changefreq: 'weekly' },
    { url: `${baseUrl}/wiki`, priority: '0.9', changefreq: 'daily' },
    { url: `${baseUrl}/forum`, priority: '0.9', changefreq: 'daily' },
    { url: `${baseUrl}/contests`, priority: '0.7', changefreq: 'weekly' },
    { url: `${baseUrl}/news`, priority: '0.8', changefreq: 'daily' },
  ];

  let xml = '';
  for (const page of staticPages) {
    xml += `  <url>\n`;
    xml += `    <loc>${page.url}</loc>\n`;
    xml += `    <lastmod>${now}</lastmod>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += `  </url>\n`;
  }
  return xml;
};

const buildNewsXml = (newsItems: NewsItem[] | null, baseUrl: string): string => {
  if (!newsItems) return '';
  let xml = '';
  for (const item of newsItems) {
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/news#article-${item.id}</loc>\n`;
    xml += `    <lastmod>${new Date(item.created_at).toISOString()}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.7</priority>\n`;
    xml += `  </url>\n`;
  }
  return xml;
};

const buildWikiXml = (wikiArticles: WikiArticleItem[] | null, baseUrl: string): string => {
  if (!wikiArticles) return '';
  let xml = '';
  for (const article of wikiArticles) {
    if (!article.slug) continue;
    const lastmod = new Date(article.updated_at || article.created_at).toISOString();
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/wiki?article=${encodeURIComponent(article.slug)}</loc>\n`;
    xml += `    <lastmod>${lastmod}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.8</priority>\n`;
    xml += `  </url>\n`;
  }
  return xml;
};

const buildForumXml = (forumThreads: ForumThreadItem[] | null, baseUrl: string): string => {
  if (!forumThreads) return '';
  let xml = '';
  for (const thread of forumThreads) {
    if (!thread.slug) continue;
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/forum/thread/${encodeURIComponent(thread.slug)}</loc>\n`;
    xml += `    <lastmod>${new Date(thread.created_at).toISOString()}</lastmod>\n`;
    xml += `    <changefreq>daily</changefreq>\n`;
    xml += `    <priority>0.6</priority>\n`;
    xml += `  </url>\n`;
  }
  return xml;
};

function formatErrorMessage(err: unknown): string {
  if (err instanceof Error) {
    return err.message;
  }
  if (typeof err === 'string') {
    return err;
  }
  try {
    return JSON.stringify(err);
  } catch {
    return 'Unknown error object';
  }
}

export const getSitemapXml = async (_req: Request, res: Response): Promise<void> => {
  try {
    const baseUrl = 'https://crystaltidessmp.net';
    const now = new Date().toISOString();

    const { data: newsItems } = await supabase
      .from('news')
      .select('id, created_at')
      .eq('status', 'Published')
      .order('created_at', { ascending: false });

    const { data: wikiArticles } = await supabase
      .from('wiki_articles')
      .select('slug, updated_at, created_at')
      .order('updated_at', { ascending: false });

    const { data: forumThreads } = await supabase
      .from('forum_threads')
      .select('slug, created_at')
      .order('created_at', { ascending: false })
      .limit(100);

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    xml += buildStaticPagesXml(baseUrl, now);
    xml += buildNewsXml(newsItems, baseUrl);
    xml += buildWikiXml(wikiArticles, baseUrl);
    xml += buildForumXml(forumThreads, baseUrl);

    xml += `</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.header('Cache-Control', 'public, max-age=3600');
    res.status(200).send(xml);
  } catch (err: unknown) {
    const errorMsg = formatErrorMessage(err);
    console.error('[getSitemapXml] Failed to generate sitemap:', errorMsg);
    res.status(500).send('Error generating sitemap');
  }
};
