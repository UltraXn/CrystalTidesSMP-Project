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
 */
const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
    if (!content) return null;

    // Regular expression to find Markdown-like patterns
    // 1. Images: !\[(.*?)\]\((.*?)\)
    // 2. Links: \[(.*?)\]\((.*?)\)
    // 3. Bold: \*\*(.*?)\*\*
    // 4. Italic: \*(.*?)\*
    
    const parts = content.split(/(!\[.*?\]\(.*?\)|\[.*?\]\(.*?\)|(?:\*\*[^*]+\*\*)|(?:\*[^*]+\*))/g);

    return (
        <>
            {parts.map((part, index) => {
                // Images
                if (part.startsWith('![')) {
                    const match = part.match(/!\[(.*?)\]\((.*?)\)/);
                    if (match) {
                        return (
                            <img 
                                key={index} 
                                src={match[2]} 
                                alt={match[1]} 
                                style={{ maxWidth: '100%', borderRadius: '8px', margin: '0.5rem 0', display: 'block' }} 
                            />
                        );
                    }
                }
                
                // Links
                if (part.startsWith('[')) {
                    const match = part.match(/\[(.*?)\]\((.*?)\)/);
                    if (match) {
                        let url = match[2];
                        // 🛡️ Security: Block javascript: protocol to prevent XSS
                        if (url.trim().toLowerCase().startsWith('javascript:')) {
                            console.warn('Blocked potentially malicious URL:', url);
                            url = '#'; 
                        }

                        return (
                            <a 
                                key={index} 
                                href={url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                style={{ color: 'var(--accent)', textDecoration: 'underline' }}
                            >
                                {match[1]}
                            </a>
                        );
                    }
                }

                // Bold
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={index}>{part.slice(2, -2)}</strong>;
                }

                // Italic
                if (part.startsWith('*') && part.endsWith('*')) {
                    return <em key={index}>{part.slice(1, -1)}</em>;
                }

                // Normal Text with preserved line breaks
                return (
                    <span key={index} style={{ whiteSpace: 'pre-wrap' }}>
                        {part}
                    </span>
                );
            })}
        </>
    );
};

export default MarkdownRenderer;
