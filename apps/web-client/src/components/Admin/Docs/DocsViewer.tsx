import React from 'react';
import MarkdownRenderer from '../../UI/MarkdownRenderer';

interface DocsViewerProps {
    content: string;
}

const DocsViewer: React.FC<DocsViewerProps> = ({ content }) => {
    return (
        <div className="markdown-body" style={{ color: '#ddd', lineHeight: 1.6 }}>
            <MarkdownRenderer content={content} />
        </div>
    );
};

export default DocsViewer;
