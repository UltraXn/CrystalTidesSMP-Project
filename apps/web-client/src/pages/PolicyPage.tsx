import { CSSProperties, ReactElement } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import ReactMarkdown, { Components } from 'react-markdown';
import { Shield, FileText, Clock, Headset, ArrowLeft } from 'lucide-react';
import Section from '../components/Layout/Section';
import Loader from '../components/UI/Loader';
import { getPolicy, Policy } from '../services/policyService';
import '../styles/pages/policy_page.css';

// -----------------------------------------------------------------------------
// DESIGN TOKENS & STYLE CONSTANTS
// -----------------------------------------------------------------------------

const TRANSITION_SMOOTH = 'color 0.2s, background-color 0.2s, border-color 0.2s, opacity 0.2s';
const BORDER_SUBTLE = '1px solid rgba(255,255,255,0.05)';
const BORDER_FROST = '1px solid rgba(255,255,255,0.1)';
const COLOR_ACCENT = 'var(--accent)';

const STYLES = {
  pageBackground: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundImage: `radial-gradient(circle at 15% 50%, rgba(var(--accent-rgb), 0.08) 0%, transparent 25%), radial-gradient(circle at 85% 30%, rgba(88, 28, 135, 0.1) 0%, transparent 25%)`,
    pointerEvents: 'none',
    zIndex: 0,
  } as CSSProperties,
  floatingBackBtn: {
    position: 'fixed',
    top: '2rem',
    left: '2rem',
    zIndex: 100,
    background: 'rgba(10, 10, 15, 0.6)',
    backdropFilter: 'blur(10px)',
    border: BORDER_FROST,
    color: '#fff',
    padding: '0.8rem 1.2rem',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    textDecoration: 'none',
    fontWeight: '600',
    transition: TRANSITION_SMOOTH,
    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
  } as CSSProperties,
  container: {
    position: 'relative',
    zIndex: 1,
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '1rem',
  } as CSSProperties,
  contentContainer: {
    position: 'relative',
    background: 'rgba(10, 10, 15, 0.6)',
    backdropFilter: 'blur(20px)',
    padding: '4rem',
    borderRadius: '24px',
    border: BORDER_SUBTLE,
    boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
    lineHeight: '1.8',
    fontSize: '1.15rem',
    color: '#e0e0e0',
  } as CSSProperties,
  contentDivider: {
    position: 'absolute',
    top: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '60%',
    height: '1px',
    background: 'linear-gradient(90deg, transparent, rgba(var(--accent-rgb), 0.5), transparent)',
  } as CSSProperties,
};

// -----------------------------------------------------------------------------
// MARKDOWN RENDERER CONFIGURATION
// -----------------------------------------------------------------------------

const POLICY_MARKDOWN_COMPONENTS: Components = {
  h1: ({ children, ...props }) => (
    <h1
      style={{
        color: '#fff',
        fontSize: '2.5rem',
        marginBottom: '1.5rem',
        marginTop: '3rem',
      }}
      {...props}
    >
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => (
    <h2
      style={{
        color: '#fff',
        fontSize: '1.8rem',
        marginTop: '3rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
      }}
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3
      style={{
        color: COLOR_ACCENT,
        fontSize: '1.4rem',
        marginTop: '2rem',
        marginBottom: '1.5rem',
      }}
      {...props}
    >
      {children}
    </h3>
  ),
  p: ({ children, ...props }) => (
    <p
      style={{
        marginBottom: '1.5rem',
        color: '#ccc',
        lineHeight: '1.8',
      }}
      {...props}
    >
      {children}
    </p>
  ),
  ul: ({ children, ...props }) => (
    <ul style={{ marginBottom: '2rem', paddingLeft: '1.5rem' }} {...props}>
      {children}
    </ul>
  ),
  li: ({ children, ...props }) => (
    <li style={{ marginBottom: '0.8rem', paddingLeft: '0.5rem' }} {...props}>
      {children}
    </li>
  ),
  strong: ({ children, ...props }) => (
    <strong style={{ color: '#fff', fontWeight: 700 }} {...props}>
      {children}
    </strong>
  ),
  a: ({ children, ...props }) => (
    <a
      target="_blank"
      rel="noopener noreferrer"
      style={{
        color: COLOR_ACCENT,
        textDecoration: 'none',
        borderBottom: '1px solid rgba(var(--accent-rgb), 0.3)',
        transition: TRANSITION_SMOOTH,
      }}
      {...props}
    >
      {children}
    </a>
  ),
  blockquote: ({ children, ...props }) => (
    <blockquote
      style={{
        borderLeft: `4px solid ${COLOR_ACCENT}`,
        paddingLeft: '1.5rem',
        color: '#aaa',
        fontStyle: 'italic',
        background: 'rgba(255,255,255,0.02)',
        padding: '1.5rem',
        borderRadius: '0 12px 12px 0',
        margin: '2rem 0',
      }}
      {...props}
    >
      {children}
    </blockquote>
  ),
};

// -----------------------------------------------------------------------------
// SUB-COMPONENTS
// -----------------------------------------------------------------------------

function PolicyLoadingState(): ReactElement {
  return (
    <Section>
      <div
        style={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Loader />
      </div>
    </Section>
  );
}

function PolicyNotFoundState(): ReactElement {
  const { t } = useTranslation();

  return (
    <Section>
      <div style={{ minHeight: '60vh', textAlign: 'center', padding: '5rem' }}>
        <Shield
          size={64}
          color="var(--accent-dim)"
          style={{ opacity: 0.3, marginBottom: '2rem' }}
        />
        <h2>{t('policies.not_found', 'Política no encontrada')}</h2>
        <p style={{ color: 'var(--muted)' }}>
          Lo sentimos, la página que buscas no existe o ha sido movida.
        </p>
        <Link
          to="/"
          className="btn-primary"
          style={{
            marginTop: '2rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <ArrowLeft size={18} /> {t('common.back_home', 'Volver al Inicio')}
        </Link>
      </div>
    </Section>
  );
}

const SUPPORTED_LANGUAGES = ['es', 'en'] as const;
type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

interface LanguageTabsProps {
  currentLanguage: string;
  onLanguageChange: (lang: SupportedLanguage) => void;
}

function LanguageTabs({ currentLanguage, onLanguageChange }: LanguageTabsProps): ReactElement {
  return (
    <div
      style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '1.5rem',
        justifyContent: 'center',
      }}
    >
      {SUPPORTED_LANGUAGES.map((lang) => {
        const isActive = currentLanguage === lang;
        return (
          <button
            key={lang}
            aria-label="Action"
            type="button"
            onClick={() => onLanguageChange(lang)}
            style={{
              background: isActive ? COLOR_ACCENT : 'rgba(255,255,255,0.1)',
              color: isActive ? '#000' : '#fff',
              border: 'none',
              padding: '0.4rem 0.8rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '0.8rem',
              transition: TRANSITION_SMOOTH,
              opacity: isActive ? 1 : 0.6,
            }}
          >
            {lang.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}

interface PolicyHeaderProps {
  slug: string;
  title: string;
  updatedAt: string;
  currentLanguage: string;
  onLanguageChange: (lang: SupportedLanguage) => void;
}

function PolicyHeader({
  slug,
  title,
  updatedAt,
  currentLanguage,
  onLanguageChange,
}: PolicyHeaderProps): ReactElement {
  const { t } = useTranslation();
  const Icon = slug === 'privacy' ? Shield : FileText;

  return (
    <header
      style={{
        textAlign: 'center',
        padding: '4rem 1rem',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%)',
        borderRadius: '32px',
        marginBottom: '2rem',
        border: '1px solid rgba(255,255,255,0.02)',
      }}
    >
      <div
        style={{
          width: '80px',
          height: '80px',
          background:
            'linear-gradient(135deg, rgba(var(--accent-rgb), 0.2), rgba(88, 28, 135, 0.2))',
          borderRadius: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: COLOR_ACCENT,
          margin: '0 auto 1.5rem',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          backdropFilter: 'blur(10px)',
          border: BORDER_FROST,
        }}
      >
        <Icon size={32} />
      </div>

      <h1
        style={{
          fontSize: '3.5rem',
          fontWeight: 300,
          letterSpacing: '-1px',
          marginBottom: '1rem',
          textShadow: '0 4px 20px rgba(0,0,0,0.5)',
          background: 'linear-gradient(to right, #fff, #aaa)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          paddingBottom: '0.2em',
        }}
      >
        {title}
      </h1>

      <LanguageTabs currentLanguage={currentLanguage} onLanguageChange={onLanguageChange} />

      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.75rem',
          background: 'rgba(0,0,0,0.3)',
          padding: '0.5rem 1rem',
          borderRadius: '50px',
          border: BORDER_SUBTLE,
          color: '#aaa',
          fontSize: '0.9rem',
        }}
      >
        <Clock size={12} color={COLOR_ACCENT} />
        <span style={{ fontWeight: 500, letterSpacing: '0.5px' }}>
          {t('policies.last_update', 'Última actualización')}:{' '}
          <span style={{ color: '#fff' }}>{new Date(updatedAt).toLocaleDateString()}</span>
        </span>
      </div>
    </header>
  );
}

interface PolicyClausesProps {
  content: string;
}

function PolicyClauses({ content }: PolicyClausesProps): ReactElement {
  return (
    <div className="policy-content" style={STYLES.contentContainer}>
      <div style={STYLES.contentDivider} />
      <ReactMarkdown components={POLICY_MARKDOWN_COMPONENTS}>{content}</ReactMarkdown>
    </div>
  );
}

function PolicySupportFooter(): ReactElement {
  const { t } = useTranslation();

  return (
    <div
      style={{
        marginTop: '4rem',
        textAlign: 'center',
        color: '#666',
        fontSize: '0.85rem',
        paddingBottom: '2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.8rem',
          background: 'rgba(255,255,255,0.02)',
          padding: '1.5rem 3rem',
          borderRadius: '20px',
          border: BORDER_SUBTLE,
        }}
      >
        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1rem' }}>
          {t('policies.contact_support_msg', '¿Tienes dudas sobre nuestras políticas?')}
        </span>
        <Link
          to="/support"
          className="hover-lift"
          style={{
            background: `linear-gradient(135deg, ${COLOR_ACCENT}, #2563eb)`,
            color: '#fff',
            padding: '0.8rem 1.5rem',
            borderRadius: '12px',
            textDecoration: 'none',
            fontWeight: '700',
            fontSize: '0.95rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 4px 15px rgba(var(--accent-rgb), 0.3)',
          }}
        >
          <Headset size={18} /> {t('policies.contact_support_btn', 'Contactar Soporte')}
        </Link>
      </div>
      <p style={{ margin: '1rem 0 0', opacity: 0.5 }}>
        © {new Date().getFullYear()} CrystalTides SMP.
      </p>
    </div>
  );
}

// -----------------------------------------------------------------------------
// PURE RESOLVER HELPERS
// -----------------------------------------------------------------------------

function resolveLocalizedTitle(policy: Policy, language: string): string {
  if (language === 'en' && policy.title_en) {
    return policy.title_en;
  }
  return policy.title;
}

function resolveLocalizedContent(policy: Policy, language: string): string {
  if (language === 'en' && policy.content_en) {
    return policy.content_en;
  }
  return policy.content;
}

// -----------------------------------------------------------------------------
// MAIN COMPONENT
// -----------------------------------------------------------------------------

export default function PolicyPage(): ReactElement {
  const { slug } = useParams<{ slug: string }>();
  const { t, i18n } = useTranslation();

  const {
    data: policy = null,
    isLoading: loading,
    isError: error,
  } = useQuery<Policy | null>({
    queryKey: ['policy', slug],
    queryFn: async () => {
      if (!slug) return null;
      return await getPolicy(slug);
    },
    enabled: Boolean(slug),
    staleTime: 60_000,
  });

  if (loading) {
    return <PolicyLoadingState />;
  }

  if (error || !policy) {
    return <PolicyNotFoundState />;
  }

  const displayTitle = resolveLocalizedTitle(policy, i18n.language);
  const displayContent = resolveLocalizedContent(policy, i18n.language);

  return (
    <Section className="policy-page">
      <Link to="/" className="hover-lift" style={STYLES.floatingBackBtn}>
        <ArrowLeft size={18} /> {t('common.back', 'Volver')}
      </Link>

      <div style={STYLES.pageBackground} />

      <div className="policy-container custom-scrollbar" style={STYLES.container}>
        <PolicyHeader
          slug={policy.slug}
          title={displayTitle}
          updatedAt={policy.updated_at}
          currentLanguage={i18n.language}
          onLanguageChange={(lang) => i18n.changeLanguage(lang)}
        />

        <PolicyClauses content={displayContent} />

        <PolicySupportFooter />
      </div>
    </Section>
  );
}
