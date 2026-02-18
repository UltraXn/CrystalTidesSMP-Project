import React from 'react';
import { History as HistoryIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { GachaHistoryItem } from './gachaConstants';

interface GachaHistoryProps {
    history: GachaHistoryItem[];
    isOpen: boolean;
    onToggle: () => void;
}

const GachaHistory: React.FC<GachaHistoryProps> = ({ history, isOpen, onToggle }) => {
    const { t } = useTranslation();

    return (
        <div className={`history-drawer ${isOpen ? 'open' : ''}`}>
            <button className="history-toggle" onClick={onToggle}>
                <HistoryIcon size={18} /> {t('gacha.history_btn')}
            </button>
            <div className="history-content">
                {history.length > 0 ? (
                    history.map(item => (
                        <div key={item.id} className="history-item">
                            <div className={`rarity-dot rarity-${item.rarity}`}></div>
                            <div className="h-info">
                                <div className="h-name">{item.reward_name}</div>
                                <div className="h-date">{new Date(item.created_at).toLocaleDateString()}</div>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="no-history">{t('gacha.no_history')}</p>
                )}
            </div>
        </div>
    );
};

export default GachaHistory;
