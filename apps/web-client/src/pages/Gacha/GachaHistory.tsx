import React from 'react';
import { X, Clock, Star, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { GachaHistoryEntry } from './types';

interface GachaHistoryProps {
    isOpen: boolean;
    onClose: () => void;
    onOpen: () => void;
    history: GachaHistoryEntry[];
    loading: boolean;
    RARITY_ICONS: Record<string, React.ElementType>;
    RARITY_COLORS: Record<string, string>;
    tierColor: string;
}

const formatTime = (dateStr?: string) => {
    if (!dateStr) return 'Ahora mismo';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'Ahora mismo';
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Ahora mismo';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours} h`;
    return `Hace ${diffDays} d`;
};

export const GachaHistory: React.FC<GachaHistoryProps> = ({
    isOpen,
    onClose,
    onOpen,
    history,
    loading,
    RARITY_ICONS,
    RARITY_COLORS,
    tierColor
}) => {
    const { t } = useTranslation();

    return (
        <div 
            className={`gacha-history-overlay ${isOpen ? 'active' : ''}`} 
            onClick={onClose}
            style={{ '--tier-accent-color': tierColor } as React.CSSProperties}
        >
            <div 
                role="dialog"
                aria-modal="true"
                aria-label={t('gacha.history_title', 'Historial de Premios')}
                className="gacha-history-drawer" 
                onClick={e => e.stopPropagation()}
            >
                <button type="button" 
                    className="history-handle-btn" 
                    aria-label={isOpen ? t('common.close', 'Cerrar historial') : t('gacha.open_history', 'Abrir historial')}
                    aria-expanded={isOpen}
                    onClick={(e) => {
                        e.stopPropagation();
                        if (isOpen) {
                            onClose();
                        } else {
                            onOpen();
                        }
                    }}
                    style={{ '--tier-accent-color': tierColor } as React.CSSProperties}
                >
                    <Clock size={18} aria-hidden="true" />
                    <span>Historial</span>
                </button>
                <div className="history-header">
                    <div className="header-title">
                        <Clock size={20} aria-hidden="true" style={{ color: tierColor }} />
                        <h2>{t('gacha.history_title', 'Historial de Premios')}</h2>
                    </div>
                    <button aria-label={t('common.close', 'Cerrar historial')} type="button" className="close-btn" onClick={onClose}>
                        <X size={24} aria-hidden="true" />
                    </button>
                </div>

                <div className="history-content">
                    {loading ? (
                        <div role="status" aria-live="polite" className="history-loader">
                            <div className="spinner" style={{ borderTopColor: tierColor }}></div>
                            <p>Cargando historial...</p>
                        </div>
                    ) : history.length === 0 ? (
                        <div role="status" aria-live="polite" className="history-empty">
                            <Trash2 size={48} opacity={0.2} aria-hidden="true" />
                            <p>No tienes premios registrados aún.</p>
                            <span>¡Prueba suerte en la máquina!</span>
                        </div>
                    ) : (
                        <div className="history-list custom-scrollbar">
                                {history.map((item) => {
                                    const Icon = RARITY_ICONS[item.rarity] || Star;
                                    const color = RARITY_COLORS[item.rarity] || '#fff';
                                    
                                    const getFailsafeImg = (name: string) => {
                                        const n = name.toLowerCase();
                                        if (n.includes('xp')) return '/images/items/xp_bottle.webp';
                                        if (n.includes('killucoins') || n.includes(' kc')) {
                                            if (n.includes('250.000')) return '/images/killucoins/coin_diamante.webp';
                                            if (n.includes('25.000')) return '/images/killucoins/coin_esmeralda.webp';
                                            if (n.includes('2.500')) return '/images/killucoins/coin_oro.webp';
                                            if (n.includes('250')) return '/images/killucoins/coin_plata.webp';
                                            return '/images/killucoins/coin_cobre.webp';
                                        }
                                        if (n.includes('capa') || n.includes('elytra')) return '/images/items/Elytra_JE2_BE2.png';
                                        if (n.includes('estrella nether')) return '/images/items/Nether_Star.gif';
                                        if (n.includes('mending')) return '/images/items/enchanted_book.gif';
                                        if (n.includes('silencio')) return '/images/items/Silence_Armor_Trim_Smithing_Template_JE1_BE1.png';
                                        if (n.includes('heavy core')) return '/images/items/Heavy_Core_JE1_BE1.png';
                                        if (n.includes('sniffer')) return '/images/items/Sniffer_Egg_(item)_JE1_BE1.png';
                                        if (n.includes('pigstep')) return '/images/items/Music_Disc_Pigstep_JE1_BE1.png';
                                        if (n.includes('wither')) return '/images/items/Wither_Skeleton_Skull_(S)_JE2.png';
                                        if (n.includes('notch')) return '/images/items/Enchanted_Golden_Apple_JE2_BE2.gif';
                                        if (n.includes('escudo')) return '/images/items/Shield_JE2_BE1.webp';
                                        if (n.includes('mejora netherite')) return '/images/items/Netherite_Upgrade_Smithing_Template_JE1_BE1.png';
                                        if (n.includes('zanahoria oro')) return '/images/items/Golden_Carrot_JE4_BE2.png';
                                        if (n.includes('carbón')) return '/images/items/Coal_JE4_BE3.png';
                                        if (n.includes('cobre')) return '/images/items/Raw_Copper_JE3_BE2.png';
                                        return null;
                                    };

                                    // item.image_url comes if we mapped it in the results, 
                                    // but history usually comes from raw DB so we use failsafe
                                    const activeImg = item.image_url || getFailsafeImg(item.reward_name);

                                    return (
                                        <div 
                                            key={item.id} 
                                            className="history-card"
                                            style={{ 
                                                '--rarity-indicator-color': color,
                                            } as React.CSSProperties}
                                        >
                                            <div className="card-rarity-indicator"></div>
                                            <div className="card-icon">
                                                {activeImg ? (
                                                    <img 
                                                        src={activeImg} 
                                                        alt={item.reward_name} 
                                                        style={{ width: '32px', height: '32px', objectFit: 'contain', imageRendering: 'pixelated' }} 
                                                    />
                                                ) : (
                                                    <Icon size={24} style={{ color }} />
                                                )}
                                            </div>
                                        <div className="card-info">
                                            <span className="reward-name">{item.reward_name}</span>
                                            <div className="reward-meta">
                                                <span className="rarity-tag" style={{ color }}>
                                                    {item.rarity?.toUpperCase()}
                                                </span>
                                                <span className="time-tag">
                                                    {formatTime(item.created_at || item.roll_time)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="history-footer">
                    <p>Se muestran los últimos 20 premios</p>
                </div>
            </div>
        </div>
    );
};
