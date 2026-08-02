import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface SEOProps {
    title: string;
    description?: string;
    keywords?: string;
    canonical?: string;
    ogImage?: string;
}

export function useSEO({ title, description, keywords, canonical, ogImage }: SEOProps) {
    const { i18n } = useTranslation();

    useEffect(() => {
        const lang = i18n.language || 'es';
        document.documentElement.lang = lang;

        // Title
        document.title = title || 'CrystalTides SMP | Best English Minecraft Survival moded Server 1.21.1';

        // Meta Description
        if (description) {
            let metaDesc = document.querySelector('meta[name="description"]');
            if (!metaDesc) {
                metaDesc = document.createElement('meta');
                metaDesc.setAttribute('name', 'description');
                document.head.appendChild(metaDesc);
            }
            metaDesc.setAttribute('content', description);
        }

        // Meta Keywords
        if (keywords) {
            let metaKw = document.querySelector('meta[name="keywords"]');
            if (!metaKw) {
                metaKw = document.createElement('meta');
                metaKw.setAttribute('name', 'keywords');
                document.head.appendChild(metaKw);
            }
            metaKw.setAttribute('content', keywords);
        }

        // Canonical URL
        if (canonical) {
            let linkCanonical = document.querySelector('link[rel="canonical"]');
            if (!linkCanonical) {
                linkCanonical = document.createElement('link');
                linkCanonical.setAttribute('rel', 'canonical');
                document.head.appendChild(linkCanonical);
            }
            linkCanonical.setAttribute('href', canonical);
        }

        // Hreflang Tags for Search Engines (Dual English/Spanish Indexing)
        const setHreflang = (hreflang: string, href: string) => {
            let link = document.querySelector(`link[rel="alternate"][hreflang="${hreflang}"]`);
            if (!link) {
                link = document.createElement('link');
                link.setAttribute('rel', 'alternate');
                link.setAttribute('hreflang', hreflang);
                document.head.appendChild(link);
            }
            link.setAttribute('href', href);
        };

        const baseUrl = canonical || 'https://crystaltidessmp.net/';
        setHreflang('es', `${baseUrl}?lang=es`);
        setHreflang('en', `${baseUrl}?lang=en`);
        setHreflang('x-default', baseUrl);

        // Open Graph Tags
        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) ogTitle.setAttribute('content', title);

        if (description) {
            const ogDesc = document.querySelector('meta[property="og:description"]');
            if (ogDesc) ogDesc.setAttribute('content', description);
        }

        if (ogImage) {
            const metaOgImage = document.querySelector('meta[property="og:image"]');
            if (metaOgImage) metaOgImage.setAttribute('content', ogImage);
        }
    }, [title, description, keywords, canonical, ogImage, i18n.language]);
}
