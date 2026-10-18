import i18n, { type BackendModule } from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import global_es from './locales/es/global.json';

const lazyLocales: BackendModule = {
  type: 'backend',
  init: () => {},
  read: (lng, ns, cb) => {
    const fileName = ns === 'translation' ? 'global' : ns;
    import(`./locales/${lng}/${fileName}.json`)
      .then((m) => cb(null, m.default))
      .catch((err: unknown) => {
        const error = err instanceof Error ? err : new Error(String(err));
        cb(error, undefined);
      });
  },
};

// eslint-disable-next-line import-x/no-named-as-default-member -- i18n default export instance exposes .use()
i18n
  .use(lazyLocales)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      es: { translation: global_es },
    },
    partialBundledLanguages: true,
    lng: 'es', // Idioma por defecto forzado
    fallbackLng: 'es',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
