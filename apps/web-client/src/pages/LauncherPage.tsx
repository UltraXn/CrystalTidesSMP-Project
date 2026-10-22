import { useState, useCallback, type ReactNode } from 'react';
import { useSEO } from '../hooks/useSEO';
import { useTranslation } from 'react-i18next';
import {
  Download,
  Zap,
  RefreshCw,
  Feather,
  ShieldCheck,
  KeyRound,
  Monitor,
  Laptop,
  Terminal,
  Plus,
  Minus,
  type LucideIcon,
} from 'lucide-react';

const LAUNCHER_VERSION = '0.1.2';
const RELEASES_URL = 'https://github.com/UltraXn/crystaltides-launcher-lite/releases/latest';

const CONSTANTS = {
  DISCORD_URL: 'https://discord.com/invite/TDmwYNnvyT',
  CANONICAL_URL: 'https://crystaltidessmp.net/launcher',
  WINDOWS_DOWNLOAD_URL: `${RELEASES_URL}/download/CrystalTides-Setup.exe`,
  CHECKSUMS_URL: `${RELEASES_URL}/download/SHA256SUMS.txt`,
  SEO_KEYWORDS:
    'CrystalTides Launcher, Launcher Lite, Minecraft Launcher, Modded SMP 1.21.1, CrystalTides SMP',
} as const;

// lg:px-20 keeps content clear of the fixed SocialSidebar on the left edge.
const SECTION_CLASS = 'mx-auto w-full max-w-340 px-4 sm:px-6 lg:px-20';
const CARD_CLASS = 'rounded-2xl border border-white/10 bg-white/3';
const PRIMARY_BUTTON_CLASS =
  'inline-flex items-center justify-center gap-2.5 rounded-xl bg-(--accent) px-6 py-3.5 text-base font-bold text-black transition-colors hover:brightness-110';
const SECONDARY_BUTTON_CLASS =
  'inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 text-base font-semibold text-white transition-colors hover:bg-white/10';

type PlatformId = 'windows' | 'macos' | 'linux';

const PLATFORM_ICONS: Record<PlatformId, LucideIcon> = {
  windows: Monitor,
  macos: Laptop,
  linux: Terminal,
};

const PLATFORM_NAMES: Record<PlatformId, string> = {
  windows: 'Windows',
  macos: 'macOS',
  linux: 'Linux',
};

const REQUIREMENT_ROWS: Record<PlatformId, readonly (readonly [string, string])[]> = {
  windows: [
    ['label_system', 'windows_system'],
    ['label_ram', 'windows_ram'],
    ['label_storage', 'storage_value'],
  ],
  macos: [
    ['label_system', 'macos_system'],
    ['label_processor', 'macos_processor'],
    ['label_storage', 'storage_value'],
  ],
  linux: [
    ['label_distros', 'linux_distros'],
    ['label_format', 'linux_format'],
    ['label_libraries', 'linux_libraries'],
  ],
};

const PLATFORMS: readonly PlatformId[] = ['windows', 'macos', 'linux'];
const FAQ_IDS = ['security', 'java', 'mods', 'updates', 'memory'] as const;

function SectionHeader({
  eyebrow,
  title,
  subtitle,
}: Readonly<{ eyebrow: string; title: string; subtitle?: string }>) {
  return (
    <div className="max-w-2xl space-y-3">
      <p className="text-(--accent) text-xs font-bold uppercase tracking-[0.08em]">{eyebrow}</p>
      <h2 className="text-balance text-3xl font-bold tracking-tight text-white sm:text-[40px]/[1.15]">
        {title}
      </h2>
      {subtitle && <p className="text-base/relaxed text-gray-400 sm:text-lg/relaxed">{subtitle}</p>}
    </div>
  );
}

function ProductShot({
  src,
  alt,
  eager = false,
}: Readonly<{ src: string; alt: string; eager?: boolean }>) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/15 shadow-2xl shadow-black/60">
      <img
        src={src}
        alt={alt}
        width={1600}
        height={1000}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        className="block h-auto w-full"
      />
    </div>
  );
}

function HeroSection() {
  const { t } = useTranslation();
  return (
    <header
      className={`${SECTION_CLASS} grid items-center gap-12 pb-20 pt-32 lg:grid-cols-[minmax(0,1fr)_minmax(0,600px)] lg:gap-16`}
    >
      <div className="space-y-6">
        <span className="bg-(--accent)/15 text-(--accent) inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold">
          <span className="bg-(--accent) size-1.5 rounded-full" />
          {t('launcher_page.hero.eyebrow', { version: LAUNCHER_VERSION })}
        </span>
        <h1 className="text-balance text-4xl/tight font-bold tracking-tight text-white sm:text-5xl/tight lg:text-6xl/[1.08]">
          {t('launcher_page.hero.title')}
        </h1>
        <p className="max-w-xl text-lg/relaxed text-gray-400">{t('launcher_page.hero.subtitle')}</p>
        <div className="flex flex-wrap gap-3">
          <a href={CONSTANTS.WINDOWS_DOWNLOAD_URL} className={PRIMARY_BUTTON_CLASS}>
            <Download className="size-4.5" aria-hidden="true" />
            {t('launcher_page.hero.cta_primary')}
          </a>
          <a href="#downloads" className={SECONDARY_BUTTON_CLASS}>
            {t('launcher_page.hero.cta_secondary')}
          </a>
        </div>
        <p className="text-sm text-gray-400">{t('launcher_page.hero.meta')}</p>
      </div>
      <ProductShot
        src="/images/launcher/launcher-lite-main.webp"
        alt={t('launcher_page.hero.shot_alt')}
        eager
      />
    </header>
  );
}

function TrustStrip() {
  const { t } = useTranslation();
  const items: readonly [LucideIcon, string][] = [
    [ShieldCheck, t('launcher_page.trust.checksums')],
    [KeyRound, t('launcher_page.trust.microsoft')],
    [RefreshCw, t('launcher_page.trust.updates')],
  ];
  return (
    <div className={SECTION_CLASS}>
      <ul className="border-white/8 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 border-y py-5">
        {items.map(([Icon, label]) => (
          <li key={label} className="flex items-center gap-2.5 text-sm font-medium text-gray-400">
            <Icon className="size-4.5" aria-hidden="true" />
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
}

function BenefitsSection() {
  const { t } = useTranslation();
  const benefits: readonly [LucideIcon, string][] = [
    [Zap, 'fast'],
    [RefreshCw, 'sync'],
    [Feather, 'light'],
  ];
  return (
    <section className={`${SECTION_CLASS} space-y-12 py-24`}>
      <SectionHeader
        eyebrow={t('launcher_page.benefits.eyebrow')}
        title={t('launcher_page.benefits.title')}
      />
      <div className="grid gap-6 md:grid-cols-3">
        {benefits.map(([Icon, key]) => (
          <article key={key} className={`${CARD_CLASS} space-y-3.5 p-7`}>
            <span className="bg-(--accent)/15 text-(--accent) inline-flex rounded-lg p-2.5">
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <h3 className="text-xl font-semibold text-white">
              {t(`launcher_page.benefits.${key}_title`)}
            </h3>
            <p className="text-[15px]/relaxed text-gray-400">
              {t(`launcher_page.benefits.${key}_body`)}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

function GallerySection() {
  const { t } = useTranslation();
  const shots = ['instances', 'settings'] as const;
  return (
    <section className={`${SECTION_CLASS} space-y-12 pb-24`}>
      <SectionHeader
        eyebrow={t('launcher_page.gallery.eyebrow')}
        title={t('launcher_page.gallery.title')}
      />
      <div className="grid gap-6 md:grid-cols-2">
        {shots.map((key) => (
          <figure key={key} className="space-y-4">
            <ProductShot
              src={`/images/launcher/launcher-lite-${key}.webp`}
              alt={t(`launcher_page.gallery.${key}_alt`)}
            />
            <figcaption className="space-y-1.5">
              <h3 className="text-lg font-semibold text-white">
                {t(`launcher_page.gallery.${key}_title`)}
              </h3>
              <p className="text-[15px]/relaxed text-gray-400">
                {t(`launcher_page.gallery.${key}_desc`)}
              </p>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

function ComingSoonBadge({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <span className="bg-white/8 shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold text-gray-300">
      {children}
    </span>
  );
}

function RequirementsCard({ platform }: Readonly<{ platform: PlatformId }>) {
  const { t } = useTranslation();
  const Icon = PLATFORM_ICONS[platform];
  return (
    <div className={`${CARD_CLASS} px-6 pb-2 pt-5`}>
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5">
        <h4 className="flex items-center gap-2.5 text-[17px] font-semibold text-white">
          <Icon className="size-4.5" aria-hidden="true" />
          {PLATFORM_NAMES[platform]}
        </h4>
        {platform !== 'windows' && (
          <ComingSoonBadge>{t('launcher_page.requirements.coming_soon')}</ComingSoonBadge>
        )}
      </div>
      <dl>
        {REQUIREMENT_ROWS[platform].map(([labelKey, valueKey]) => (
          <div key={labelKey} className="border-white/8 space-y-1 border-t py-3">
            <dt className="text-xs font-medium uppercase tracking-[0.04em] text-gray-400">
              {t(`launcher_page.requirements.${labelKey}`)}
            </dt>
            <dd className="text-[15px]/snug text-white">
              {t(`launcher_page.requirements.${valueKey}`)}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function PerformanceSection() {
  const { t } = useTranslation();
  const stats = ['startup', 'ram', 'data'] as const;
  return (
    <section className="bg-white/2">
      <div className={`${SECTION_CLASS} space-y-12 py-24`}>
        <SectionHeader
          eyebrow={t('launcher_page.performance.eyebrow')}
          title={t('launcher_page.performance.title')}
          subtitle={t('launcher_page.performance.subtitle')}
        />
        <dl className="grid gap-6 md:grid-cols-3">
          {stats.map((key) => (
            <div key={key} className="rounded-2xl border border-white/10 px-7 py-6">
              <dd className="text-(--accent) text-4xl font-bold tracking-tight sm:text-[44px]">
                {t(`launcher_page.performance.${key}_value`)}
              </dd>
              <dt className="pt-1.5 text-[15px] text-gray-400">
                {t(`launcher_page.performance.${key}_label`)}
              </dt>
            </div>
          ))}
        </dl>
        <div className="space-y-6">
          <h3 className="text-[22px] font-semibold text-white">
            {t('launcher_page.requirements.title')}
          </h3>
          <div className="grid gap-6 xl:grid-cols-3">
            {PLATFORMS.map((platform) => (
              <RequirementsCard key={platform} platform={platform} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function DownloadCard({ platform }: Readonly<{ platform: PlatformId }>) {
  const { t } = useTranslation();
  const Icon = PLATFORM_ICONS[platform];
  const available = platform === 'windows';
  const cardBorder = available ? 'border-(--accent) border-[1.5px]' : 'border-white/10';
  return (
    <div className={`bg-white/3 flex flex-col gap-4 rounded-2xl border p-6 ${cardBorder}`}>
      <div className="flex flex-wrap items-center gap-3">
        <span
          className={`inline-flex shrink-0 rounded-lg p-2.5 ${available ? 'bg-(--accent)/15 text-(--accent)' : 'bg-white/6 text-white'}`}
        >
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-[19px] font-semibold text-white">{PLATFORM_NAMES[platform]}</h3>
          <p className="text-sm text-gray-400">{t(`launcher_page.download.${platform}_format`)}</p>
        </div>
        {available ? (
          <span className="bg-(--accent)/15 text-(--accent) shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold">
            {t('launcher_page.download.recommended')}
          </span>
        ) : (
          <ComingSoonBadge>{t('launcher_page.download.coming_soon')}</ComingSoonBadge>
        )}
      </div>
      <p className="flex-1 text-[15px]/relaxed text-gray-400">
        {t(`launcher_page.download.${platform}_desc`)}
      </p>
      {available ? (
        <a href={CONSTANTS.WINDOWS_DOWNLOAD_URL} className={`${PRIMARY_BUTTON_CLASS} w-full`}>
          <Download className="size-4" aria-hidden="true" />
          {t(`launcher_page.download.${platform}_cta`)}
        </a>
      ) : (
        <button
          type="button"
          disabled
          className="bg-white/3 inline-flex w-full cursor-not-allowed items-center justify-center rounded-xl border border-white/10 py-3 text-[15px] font-semibold text-gray-400"
        >
          {t(`launcher_page.download.${platform}_cta`)}
        </button>
      )}
      {available && (
        <a
          href={CONSTANTS.CHECKSUMS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-gray-400 underline-offset-4 hover:text-white hover:underline"
        >
          {t('launcher_page.download.verify')}
        </a>
      )}
    </div>
  );
}

function DownloadSection() {
  const { t } = useTranslation();
  return (
    <section id="downloads" className={`${SECTION_CLASS} scroll-mt-28 space-y-12 py-24`}>
      <SectionHeader
        eyebrow={t('launcher_page.download.eyebrow')}
        title={t('launcher_page.download.title')}
        subtitle={t('launcher_page.download.subtitle')}
      />
      <div className="grid gap-6 xl:grid-cols-3">
        {PLATFORMS.map((platform) => (
          <DownloadCard key={platform} platform={platform} />
        ))}
      </div>
      <p className="flex flex-wrap gap-2 text-sm text-gray-400">
        {t('launcher_page.download.version_note', { version: LAUNCHER_VERSION })}
        <a
          href={RELEASES_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-(--accent) font-medium hover:underline"
        >
          {t('launcher_page.download.release_notes')}
        </a>
      </p>
    </section>
  );
}

function FaqSection() {
  const { t } = useTranslation();
  const [openId, setOpenId] = useState<string | null>(FAQ_IDS[0]);
  const toggle = useCallback((id: string) => {
    setOpenId((current) => (current === id ? null : id));
  }, []);

  return (
    <section className="bg-white/2">
      <div
        className={`${SECTION_CLASS} grid gap-12 py-24 lg:grid-cols-[minmax(0,340px)_1fr] lg:gap-20`}
      >
        <SectionHeader
          eyebrow={t('launcher_page.faq.eyebrow')}
          title={t('launcher_page.faq.title')}
          subtitle={t('launcher_page.faq.subtitle')}
        />
        <div className="space-y-3">
          {FAQ_IDS.map((id) => {
            const isOpen = openId === id;
            const Icon = isOpen ? Minus : Plus;
            return (
              <div
                key={id}
                className={`bg-white/3 rounded-2xl border ${isOpen ? 'border-white/15' : 'border-white/8'}`}
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`launcher-faq-${id}`}
                  onClick={() => toggle(id)}
                  className="flex w-full cursor-pointer items-center justify-between gap-4 px-6 py-5 text-left"
                >
                  <span className="text-[17px] font-semibold text-white">
                    {t(`launcher_page.faq.${id}_q`)}
                  </span>
                  <Icon
                    className={`size-4.5 shrink-0 ${isOpen ? 'text-(--accent)' : 'text-gray-400'}`}
                    aria-hidden="true"
                  />
                </button>
                {isOpen && (
                  <p
                    id={`launcher-faq-${id}`}
                    className="px-6 pb-5 text-[15px]/relaxed text-gray-400"
                  >
                    {t(`launcher_page.faq.${id}_a`)}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  const { t } = useTranslation();
  return (
    <section className={`${SECTION_CLASS} py-24`}>
      <div className="border-(--accent)/35 bg-(--accent)/15 flex flex-col items-center gap-5 rounded-3xl border px-6 py-16 text-center sm:px-12">
        <h2 className="text-4xl font-bold tracking-tight text-white sm:text-[44px]">
          {t('launcher_page.cta.title')}
        </h2>
        <p className="max-w-xl text-lg/relaxed text-gray-300">{t('launcher_page.cta.subtitle')}</p>
        <div className="flex flex-wrap justify-center gap-3 pt-1">
          <a href={CONSTANTS.WINDOWS_DOWNLOAD_URL} className={PRIMARY_BUTTON_CLASS}>
            <Download className="size-4.5" aria-hidden="true" />
            {t('launcher_page.cta.primary')}
          </a>
          <a
            href={CONSTANTS.DISCORD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={SECONDARY_BUTTON_CLASS}
          >
            {t('launcher_page.cta.discord')}
          </a>
        </div>
      </div>
    </section>
  );
}

export default function LauncherPage() {
  const { t } = useTranslation();

  useSEO({
    title: t('launcher_page.seo_title'),
    description: t('launcher_page.seo_desc'),
    keywords: CONSTANTS.SEO_KEYWORDS,
    canonical: CONSTANTS.CANONICAL_URL,
  });

  return (
    <div className="selection:bg-(--accent)/30 min-h-screen overflow-x-hidden text-white">
      <HeroSection />
      <TrustStrip />
      <BenefitsSection />
      <GallerySection />
      <PerformanceSection />
      <DownloadSection />
      <FaqSection />
      <FinalCta />
    </div>
  );
}
