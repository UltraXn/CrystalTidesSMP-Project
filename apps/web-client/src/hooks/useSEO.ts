import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface SEOProps {
  title: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
}

const TAGS = {
  META: 'meta',
  LINK: 'link',
} as const;

const ATTRS = {
  NAME: 'name',
  PROPERTY: 'property',
  CONTENT: 'content',
  REL: 'rel',
  HREF: 'href',
  HREFLANG: 'hreflang',
} as const;

const SEO_CONSTANTS = {
  DEFAULT_TITLE: 'CrystalTides SMP | Servidor de Minecraft Survival 1.21+',
  DEFAULT_LANG: 'es',
  DEFAULT_URL: 'https://crystaltidessmp.net/',
  CANONICAL: 'canonical',
  ALTERNATE: 'alternate',
  X_DEFAULT: 'x-default',
} as const;

const getOrCreateElement = <T extends HTMLElement>(
  selector: string,
  tagName: string,
  setup: (el: T) => void,
): T => {
  let el = document.querySelector<T>(selector);
  if (!el) {
    el = document.createElement(tagName) as T;
    setup(el);
    document.head.appendChild(el);
  }
  return el;
};

function updateMetaTag(name: string, content?: string): void {
  if (!content) return;
  const meta = getOrCreateElement<HTMLMetaElement>(
    `${TAGS.META}[${ATTRS.NAME}="${name}"]`,
    TAGS.META,
    (el) => el.setAttribute(ATTRS.NAME, name),
  );
  meta.setAttribute(ATTRS.CONTENT, content);
}

function updateOgTag(property: string, content?: string): void {
  if (!content) return;
  const meta = getOrCreateElement<HTMLMetaElement>(
    `${TAGS.META}[${ATTRS.PROPERTY}="${property}"]`,
    TAGS.META,
    (el) => el.setAttribute(ATTRS.PROPERTY, property),
  );
  meta.setAttribute(ATTRS.CONTENT, content);
}

function updateCanonical(canonical?: string): void {
  if (!canonical) return;
  const link = getOrCreateElement<HTMLLinkElement>(
    `${TAGS.LINK}[${ATTRS.REL}="${SEO_CONSTANTS.CANONICAL}"]`,
    TAGS.LINK,
    (el) => el.setAttribute(ATTRS.REL, SEO_CONSTANTS.CANONICAL),
  );
  link.setAttribute(ATTRS.HREF, canonical);
}

function setHreflang(hreflang: string, href: string): void {
  const link = getOrCreateElement<HTMLLinkElement>(
    `${TAGS.LINK}[${ATTRS.REL}="${SEO_CONSTANTS.ALTERNATE}"][${ATTRS.HREFLANG}="${hreflang}"]`,
    TAGS.LINK,
    (el) => {
      el.setAttribute(ATTRS.REL, SEO_CONSTANTS.ALTERNATE);
      el.setAttribute(ATTRS.HREFLANG, hreflang);
    },
  );
  link.setAttribute(ATTRS.HREF, href);
}

function updateHreflangTags(baseUrl: string): void {
  setHreflang('es', `${baseUrl}?lang=es`);
  setHreflang('en', `${baseUrl}?lang=en`);
  setHreflang(SEO_CONSTANTS.X_DEFAULT, baseUrl);
}

function updateOpenGraphTags(title: string, description?: string, ogImage?: string): void {
  updateOgTag('og:title', title);
  updateOgTag('og:description', description);
  if (ogImage) {
    updateOgTag('og:image', ogImage);
  }
}

function updateTwitterTags(title: string, description?: string, ogImage?: string): void {
  updateMetaTag('twitter:title', title);
  updateMetaTag('twitter:description', description);
  if (ogImage) {
    updateMetaTag('twitter:image', ogImage);
  }
}

export function useSEO({
  title,
  description,
  keywords,
  canonical,
  ogImage,
}: Readonly<SEOProps>): void {
  const { i18n } = useTranslation();

  useEffect(() => {
    const lang = i18n.language || SEO_CONSTANTS.DEFAULT_LANG;
    document.documentElement.lang = lang;
    document.title = title || SEO_CONSTANTS.DEFAULT_TITLE;

    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    updateCanonical(canonical);

    const baseUrl = canonical ?? SEO_CONSTANTS.DEFAULT_URL;
    updateHreflangTags(baseUrl);

    // Dynamic Open Graph (Discord, Reddit, WhatsApp, Facebook, LinkedIn)
    updateOpenGraphTags(title, description, ogImage);

    // Dynamic Twitter / X Cards
    updateTwitterTags(title, description, ogImage);
  }, [title, description, keywords, canonical, ogImage, i18n.language]);
}
