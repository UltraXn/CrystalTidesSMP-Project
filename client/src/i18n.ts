import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import global_es from './locales/es/global.json';
import global_en from './locales/en/global.json';

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            es: { translation: global_es },
            en: { translation: global_en }
        },
        lng: "es", // Idioma por defecto forzado (opcional, si quieres detectar usa fallbackLng)
        fallbackLng: "es",
        interpolation: {
            escapeValue: false
        },
        react: {
            useSuspense: false
        }
    });

export default i18n;
