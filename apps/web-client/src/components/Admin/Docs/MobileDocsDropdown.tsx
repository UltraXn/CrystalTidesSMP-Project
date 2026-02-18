import React from 'react';
import { ChevronDown, Book } from 'lucide-react';
import { ICON_MAP, AdminDoc } from './docsConstants';

interface MobileDocsDropdownProps {
    docs: AdminDoc[];
    activeTab: string;
    activeTitle: string;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    onTabChange: (id: string) => void;
}

const MobileDocsDropdown: React.FC<MobileDocsDropdownProps> = ({ 
    docs, 
    activeTab, 
    activeTitle, 
    isOpen, 
    setIsOpen, 
    onTabChange 
}) => {
    const ActiveIcon = ICON_MAP[activeTab] || Book;

    return (
        <div className="mobile-dropdown-container">
            <button 
                className="mobile-dropdown-btn"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <ActiveIcon color="var(--accent)" /> {activeTitle}
                </span>
                <ChevronDown style={{ 
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', 
                    transition: 'transform 0.2s' 
                }} />
            </button>
            
            {isOpen && (
                <div className="mobile-dropdown-list">
                    {docs.map(doc => {
                        const Icon = ICON_MAP[doc.id] || Book;
                        return (
                            <div 
                                key={doc.id}
                                className={`mobile-dropdown-item ${activeTab === doc.id ? 'active' : ''}`}
                                onClick={() => {
                                    onTabChange(doc.id);
                                    setIsOpen(false);
                                }}
                            >
                                <Icon /> {doc.title}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MobileDocsDropdown;
