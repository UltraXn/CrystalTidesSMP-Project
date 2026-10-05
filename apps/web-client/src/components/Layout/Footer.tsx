import { ArrowUp } from 'lucide-react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { m as motion } from 'framer-motion';

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
};

export default function Footer() {
  const { t } = useTranslation();
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollBtn(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <footer className="relative w-full overflow-hidden border-t border-white/5 bg-[#050505] pb-16 pt-32">
      <div className="max-w-350 relative z-10 mx-auto mb-24 grid grid-cols-1 gap-20 px-6 lg:grid-cols-2">
        <div className="flex flex-col items-start gap-8 text-left">
          <Link
            to="/"
            onClick={scrollToTop}
            aria-label="CrystalTides SMP"
            className="group flex items-center gap-3 no-underline md:gap-4"
          >
            <div className="logo-animate-idle relative">
              <motion.img
                src="/images/ui/logo.webp"
                alt="CrystalTides Logo"
                className="relative z-10 size-12 object-contain md:size-14"
                whileHover={{ scale: 1.15, rotate: 8 }}
                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
              />
              <div className="bg-(--accent)/30 absolute inset-0 z-0 animate-pulse rounded-full blur-xl" />
            </div>
            <span className="relative flex items-center text-2xl font-black uppercase tracking-tight md:text-3xl">
              <span className="brand-text-shimmer">CrystalTides</span>
              <span className="ml-2 text-sm text-gray-400 opacity-60 md:text-base">SMP</span>
            </span>
          </Link>
          <p className="max-w-md text-lg/relaxed font-medium text-gray-400">{t('footer.slogan')}</p>
        </div>

        <div className="grid grid-cols-1 gap-16 text-left sm:grid-cols-2">
          <div className="flex flex-col gap-8">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white opacity-60">
              {t('footer.server')}
            </h2>
            <ul className="flex list-none flex-col gap-5">
              <li>
                <Link
                  to="/rules"
                  className="group relative inline-block text-gray-400 transition-colors hover:translate-x-1 hover:text-white"
                >
                  <span className="relative z-10">{t('footer.rules')}</span>
                  <div className="bg-(--accent)/30 pointer-events-none absolute -inset-x-2 -inset-y-1 rounded-full opacity-0 blur-lg transition-opacity group-hover:opacity-100"></div>
                </Link>
              </li>
              <li>
                <Link
                  to="/map"
                  className="group relative inline-block text-gray-400 transition-colors hover:translate-x-1 hover:text-white"
                >
                  <span className="relative z-10">{t('footer.online_map')}</span>
                  <div className="bg-(--accent)/30 pointer-events-none absolute -inset-x-2 -inset-y-1 rounded-full opacity-0 blur-lg transition-opacity group-hover:opacity-100"></div>
                </Link>
              </li>
              <li>
                <Link
                  to="/support"
                  className="group relative inline-block text-gray-400 transition-colors hover:translate-x-1 hover:text-white"
                >
                  <span className="relative z-10">{t('footer.support', 'Soporte')}</span>
                  <div className="bg-(--accent)/20 pointer-events-none absolute -inset-x-4 -inset-y-2 rounded-full opacity-0 blur-xl transition-opacity group-hover:opacity-100"></div>
                </Link>
              </li>
              <li>
                <Link
                  to="/suggestions"
                  className="group relative inline-block text-gray-400 transition-colors hover:translate-x-1 hover:text-white"
                >
                  <span className="relative z-10">{t('footer.suggestions')}</span>
                  <div className="bg-(--accent)/20 pointer-events-none absolute -inset-x-4 -inset-y-2 rounded-full opacity-0 blur-xl transition-opacity group-hover:opacity-100"></div>
                </Link>
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-8">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white opacity-60">
              {t('footer.community')}
            </h2>
            <ul className="flex list-none flex-col gap-5">
              <li>
                <Link
                  to="/news"
                  className="group relative inline-block text-gray-400 transition-colors hover:translate-x-1 hover:text-white"
                >
                  <span className="relative z-10">{t('footer.news')}</span>
                  <div className="bg-(--accent)/20 pointer-events-none absolute -inset-x-4 -inset-y-2 rounded-full opacity-0 blur-xl transition-opacity group-hover:opacity-100"></div>
                </Link>
              </li>
              <li>
                <Link
                  to="/contests"
                  className="group relative inline-block text-gray-400 transition-colors hover:translate-x-1 hover:text-white"
                >
                  <span className="relative z-10">{t('footer.events')}</span>
                  <div className="bg-(--accent)/20 pointer-events-none absolute -inset-x-4 -inset-y-2 rounded-full opacity-0 blur-xl transition-opacity group-hover:opacity-100"></div>
                </Link>
              </li>
              <li>
                <Link
                  to="/stories"
                  className="group relative inline-block text-gray-400 transition-colors hover:translate-x-1 hover:text-white"
                >
                  <span className="relative z-10">{t('footer.stories')}</span>
                  <div className="bg-(--accent)/20 pointer-events-none absolute -inset-x-4 -inset-y-2 rounded-full opacity-0 blur-xl transition-opacity group-hover:opacity-100"></div>
                </Link>
              </li>
              <li>
                <Link
                  to="/forum"
                  className="group relative inline-block text-gray-400 transition-colors hover:translate-x-1 hover:text-white"
                >
                  <span className="relative z-10">{t('footer.forum')}</span>
                  <div className="bg-(--accent)/20 pointer-events-none absolute -inset-x-4 -inset-y-2 rounded-full opacity-0 blur-xl transition-opacity group-hover:opacity-100"></div>
                </Link>
              </li>
              <li>
                <Link
                  to="/donors"
                  className="text-(--accent) group/kofi flex items-center justify-start gap-3 font-black transition-colors hover:scale-105"
                >
                  <img
                    src="https://storage.ko-fi.com/cdn/cup-border.png"
                    alt="Ko-Fi"
                    width={25}
                    height={20}
                    loading="lazy"
                    decoding="async"
                    className="h-5 w-auto object-contain transition-transform group-hover/kofi:rotate-12"
                  />
                  <span className="text-sm uppercase tracking-widest">{t('footer.donate')}</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <button
        type="button"
        className={`fixed bottom-8 right-8 z-40 hidden size-14 cursor-pointer items-center justify-center rounded-2xl bg-white text-xl text-black shadow-2xl transition-colors hover:-translate-y-2 hover:scale-110 active:scale-95 lg:flex ${showScrollBtn ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-10 opacity-0'}`}
        onClick={scrollToTop}
        aria-label={t('footer.aria_scroll_top', 'Volver arriba')}
      >
        <ArrowUp />
      </button>

      <div className="max-w-350 mx-auto flex flex-col items-center gap-8 border-t border-white/5 px-6 pt-16">
        <div className="flex justify-center gap-8 text-[10px] font-black uppercase tracking-[0.2em]">
          <Link to="/policies/privacy" className="text-gray-400 transition-colors hover:text-white">
            {t('footer.privacy', 'Privacidad')}
          </Link>
          <Link to="/policies/tos" className="text-gray-400 transition-colors hover:text-white">
            {t('footer.tos', 'Términos')}
          </Link>
        </div>
        <div className="text-center">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-gray-400">
            &copy; {new Date().getFullYear()} CrystalTides SMP. {t('footer.rights')}
          </p>
          <p className="mx-auto max-w-3xl text-[9px] font-bold uppercase leading-loose tracking-[0.2em] text-gray-400">
            NOT AN OFFICIAL MINECRAFT PRODUCT. NOT APPROVED BY OR ASSOCIATED WITH MOJANG OR
            MICROSOFT.
          </p>
        </div>
      </div>

      {/* Background Decorations */}
      <div className="size-125 bg-(--accent)/5 pointer-events-none absolute left-1/4 top-0 rounded-full blur-[120px]"></div>
      <div className="size-100 pointer-events-none absolute bottom-0 right-1/4 rounded-full bg-sky-500/5 blur-[100px]"></div>
    </footer>
  );
}
