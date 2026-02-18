import React from 'react';
import { useTranslation } from 'react-i18next';
import { ICON_MAP, AdminDoc } from './docsConstants';
import { Book } from 'lucide-react';

interface DocsSidebarProps {
    docs: AdminDoc[];
    activeTab: string;
    onTabChange: (id: string) => void;
}

const DocsSidebar: React.FC<DocsSidebarProps> = ({ docs, activeTab, onTabChange }) => {
    const { t } = useTranslation();
    
    return (
        <div className="docs-sidebar">
            <h3 style={{ padding: '0 1rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'var(--muted)' }}>
                {t('admin.docs.index')}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1rem 0' }}>
                {docs.map(doc => {
                    const Icon = ICON_MAP[doc.id] || Book;
                    return (
                        <button
                            key={doc.id}
                            onClick={() => onTabChange(doc.id)}
                            className={`sidebar-btn ${activeTab === doc.id ? 'active' : ''}`}
                        >
                            <Icon />
                            {doc.title}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default DocsSidebar;
