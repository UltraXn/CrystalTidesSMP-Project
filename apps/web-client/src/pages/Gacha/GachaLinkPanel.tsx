import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface GachaLinkPanelProps {
    linkingCode: string | null;
    generateLinkCode: () => void;
}

const GachaLinkPanel: React.FC<GachaLinkPanelProps> = ({ linkingCode, generateLinkCode }) => {
    const { t } = useTranslation();

    return (
        <div className="link-bridge-panel">
            <AlertTriangle size={48} color="#f59e0b" />
            <div className="link-content">
                <h3>{t('gacha.account_not_linked')}</h3>
                <p>Para jugar en el Crystal Slot y sincronizar tus recompensas, debes conectar tu cuenta de Minecraft o Discord.</p>
            </div>
            
            {!linkingCode ? (
                <button className="btn-link-minecraft" onClick={generateLinkCode}>
                    Generar Código de Vinculación
                </button>
            ) : (
                <div className="link-code-box">
                    <span>Tu código universal:</span>
                    <div className="link-code-display">{linkingCode}</div>
                    <p className="code-hint">Úsalo en Minecraft con `/link` o en Discord.</p>
                </div>
            )}
        </div>
    );
};

export default GachaLinkPanel;
