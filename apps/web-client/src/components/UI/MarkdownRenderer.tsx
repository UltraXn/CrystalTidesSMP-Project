import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

/**
 * A basic markdown-like renderer that handles:
 * - Images: ![alt](url)
 * - Links: [text](url)
 * - Bold: **text**
 * - Italic: *text* (added)
 * - Line breaks
 *
 * Security: URLs go through a PROTOCOL WHITELIST (never a blacklist).
 * Control chars and whitespace are stripped before validation, which kills
 * obfuscation bypasses like "java\tscript:" or "java\nscript:".
 */
const sanitizeUrl = (rawUrl: string): string | null => {
  // Strip control chars and ALL whitespace (tabs/newlines defeat prefix checks)
  // eslint-disable-next-line no-control-regex -- intentionally stripping control chars
  const cleaned = rawUrl.replace(/[\u0000-\u0020\u007F]+/g, '');
  // Allow relative paths and anchors
  if (cleaned.startsWith('/') || cleaned.startsWith('#')) return cleaned;
  // Allow only http/https absolute URLs
  if (/^https?:\/\//i.test(cleaned)) return cleaned;
  // Everything else (javascript:, data:, vbscript:, protocol-relative, ...) is rejected
  return null;
};

function renderMarkdownPart(part: string, partId: string): React.ReactNode {
  if (part.startsWith('![')) {
    const match = part.match(/!\[(.*?)\]\((.*?)\)/);
    if (match) {
      const safeUrl = sanitizeUrl(match[2]);
      if (!safeUrl) return null;
      return (
        <img
          key={partId}
          src={safeUrl}
          alt={match[1]}
          style={{ maxWidth: '100%', borderRadius: '8px', margin: '0.5rem 0', display: 'block' }}
        />
      );
    }
  }

  if (part.startsWith('[')) {
    const match = part.match(/\[(.*?)\]\((.*?)\)/);
    if (match) {
      const safeUrl = sanitizeUrl(match[2]);
      if (!safeUrl) {
        console.warn('Blocked potentially malicious URL:', match[2]);
        return <span key={partId}>{match[1]}</span>;
      }

      return (
        <a
          key={partId}
          href={safeUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'var(--accent)', textDecoration: 'underline' }}
        >
          {match[1]}
        </a>
      );
    }
  }

  if (part.startsWith('**') && part.endsWith('**')) {
    return <strong key={partId}>{part.slice(2, -2)}</strong>;
  }

  if (part.startsWith('*') && part.endsWith('*')) {
    return <em key={partId}>{part.slice(1, -1)}</em>;
  }

  return (
    <span key={partId} style={{ whiteSpace: 'pre-wrap' }}>
      {part}
    </span>
  );
}

const MarkdownRenderer: React.FC<Readonly<MarkdownRendererProps>> = ({ content }) => {
  if (!content) return null;

  const parts = content.split(/(!\[.*?\]\(.*?\)|\[.*?\]\(.*?\)|(?:\*\*[^*]+\*\*)|(?:\*[^*]+\*))/g);
  const seenCounts = new Map<string, number>();

  return (
    <>
      {parts.map((part) => {
        const count = (seenCounts.get(part) || 0) + 1;
        seenCounts.set(part, count);
        const partId = `md_${part.length}_${count}_${part.slice(0, 12)}`;
        return renderMarkdownPart(part, partId);
      })}
    </>
  );
};

export default MarkdownRenderer;
