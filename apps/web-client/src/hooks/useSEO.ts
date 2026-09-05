import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface SEOProps {
    title: string;
    description?: string;
    keywords?: string;
    canonical?: string;
    ogImage?: string;
}

const getOrCreateElement = <T extends HTMLElement>(
    selector: string,
    tagName: string,
    setup: (el: T) => void
): T => {
    let el = document.querySelector<T>(selector);
    if (!el) {
        el = document.createElement(tagName) as T;
        setup(el);
        document.head.appendChild(el);
    }
    return el;
};

function updateMetaTag(name: string, content?: string) {
    if (!content) return;
    const meta = getOrCreateElement<HTMLMetaElement>(
        `meta[name="${name}"]`,
        'meta',
        (el) => el.setAttribute('name', name)
    );
    meta.setAttribute('content', content);
}

function updateOgTag(property: string, content?: string) {
    if (!content) return;
    const meta = getOrCreateElement<HTMLMetaElement>(
        `meta[property="${property}"]`,
        'meta',
        (el) => el.setAttribute('property', property)
    );
    meta.setAttribute('content', content);
}

function updateCanonical(canonical?: string) {
    if (!canonical) return;
    const link = getOrCreateElement<HTMLLinkElement>(
        'link[rel="canonical"]',
        'link',
        (el) => el.setAttribute('rel', 'canonical')
    );
    link.setAttribute('href', canonical);
}

function setHreflang(hreflang: string, href: string) {
    const link = getOrCreateElement<HTMLLinkElement>(
        `link[rel="alternate"][hreflang="${hreflang}"]`,
        'link',
        (el) => {
            el.setAttribute('rel', 'alternate');
            el.setAttribute('hreflang', hreflang);
        }
    );
    link.setAttribute('href', href);
}

export function useSEO({ title, description, keywords, canonical, ogImage }: Readonly<SEOProps>) {
    const { i18n } = useTranslation();

    useEffect(() => {
        const lang = i18n.language || 'es';
        document.documentElement.lang = lang;
        document.title = title || 'CrystalTides SMP | Servidor de Minecraft Survival 1.21+';

        updateMetaTag('description', description);
        updateMetaTag('keywords', keywords);
        updateCanonical(canonical);

        const baseUrl = canonical || 'https://crystaltidessmp.net/';
        setHreflang('es', `${baseUrl}?lang=es`);
        setHreflang('en', `${baseUrl}?lang=en`);
        setHreflang('x-default', baseUrl);

        // Dynamic Open Graph (Discord, Reddit, WhatsApp, Facebook, LinkedIn)
        updateOgTag('og:title', title);
        updateOgTag('og:description', description);
        if (ogImage) updateOgTag('og:image', ogImage);

        // Dynamic Twitter / X Cards
        updateMetaTag('twitter:title', title);
        updateMetaTag('twitter:description', description);
        if (ogImage) updateMetaTag('twitter:image', ogImage);
    }, [title, description, keywords, canonical, ogImage, i18n.language]);
}
