import React from 'react';
import { sanitizeUrl } from '../../utils/urlUtils';

interface MarkdownRendererProps {
  content: string;
}

function renderImagePart(part: string, partId: string): React.ReactNode {
  const match = /^!\[([^\]]*)\]\(([^)\s]+)\)$/.exec(part);
  if (!match) return null;
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

function renderLinkPart(part: string, partId: string): React.ReactNode {
  const match = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(part);
  if (!match) return null;
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

function renderMarkdownPart(part: string, partId: string): React.ReactNode {
  if (part.startsWith('![')) return renderImagePart(part, partId);
  if (part.startsWith('[')) return renderLinkPart(part, partId);
  if (part.startsWith('**') && part.endsWith('**'))
    return <strong key={partId}>{part.slice(2, -2)}</strong>;
  if (part.startsWith('*') && part.endsWith('*')) return <em key={partId}>{part.slice(1, -1)}</em>;

  return (
    <span key={partId} style={{ whiteSpace: 'pre-wrap' }}>
      {part}
    </span>
  );
}

function matchLinkOrImage(content: string, i: number): string | null {
  const isImg = content[i] === '!' && content[i + 1] === '[';
  const isLink = content[i] === '[';
  if (!isImg && !isLink) return null;
  const startOffset = isImg ? i + 2 : i + 1;
  const closeBracket = content.indexOf(']', startOffset);
  if (closeBracket === -1 || content[closeBracket + 1] !== '(') return null;
  const closeParen = content.indexOf(')', closeBracket + 2);
  if (closeParen === -1) return null;
  const candidate = content.slice(i, closeParen + 1);
  return candidate.includes('\n') ? null : candidate;
}

function matchBold(content: string, i: number): string | null {
  if (!content.startsWith('**', i)) return null;
  const endBold = content.indexOf('**', i + 2);
  if (endBold === -1) return null;
  const inner = content.slice(i + 2, endBold);
  return inner.includes('\n') ? null : content.slice(i, endBold + 2);
}

function matchItalic(content: string, i: number): string | null {
  if (content[i] !== '*' || content[i + 1] === '*') return null;
  const endItalic = content.indexOf('*', i + 1);
  if (endItalic === -1) return null;
  const inner = content.slice(i + 1, endItalic);
  return inner.includes('\n') ? null : content.slice(i, endItalic + 1);
}

function tokenizeMarkdown(content: string): string[] {
  const parts: string[] = [];
  let i = 0;
  let textStart = 0;

  while (i < content.length) {
    const token = matchLinkOrImage(content, i) ?? matchBold(content, i) ?? matchItalic(content, i);
    if (token) {
      if (textStart < i) parts.push(content.slice(textStart, i));
      parts.push(token);
      i += token.length;
      textStart = i;
    } else {
      i++;
    }
  }

  if (textStart < content.length) {
    parts.push(content.slice(textStart));
  }

  return parts;
}

const MarkdownRenderer: React.FC<Readonly<MarkdownRendererProps>> = ({ content }) => {
  if (!content) return null;

  const parts = tokenizeMarkdown(content);
  const seenCounts = new Map<string, number>();

  return (
    <>
      {parts.map((part) => {
        const count = (seenCounts.get(part) ?? 0) + 1;
        seenCounts.set(part, count);
        const partId = `md_${part.length}_${count}_${part.slice(0, 12)}`;
        return renderMarkdownPart(part, partId);
      })}
    </>
  );
};

export default MarkdownRenderer;
