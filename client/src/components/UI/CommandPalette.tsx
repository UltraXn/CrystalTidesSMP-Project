import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import { FaSearch, FaHome, FaUser, FaUsers, FaMap, FaDiscord, FaShoppingCart, FaCog, FaShieldAlt, FaQuestionCircle, FaBoxOpen } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';

export default function CommandPalette() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { user } = useAuth();

    // Toggle with Cmd+K or Ctrl+K
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen((prev) => !prev);
            }
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Define Actions
    interface ActionItem {
        id: string;
        label: string;
        icon: React.ReactNode;
        action: () => void;
    }

    interface ActionSection {
        section: string;
        items: ActionItem[];
    }

    const actions: ActionSection[] = [
        { 
            section: 'Navegación', 
            items: [
                { id: 'home', label: t('nav.home', 'Inicio'), icon: <FaHome />, action: () => navigate('/') },
                { id: 'account', label: t('nav.account', 'Mi Cuenta'), icon: <FaUser />, action: () => navigate('/account') },
                { id: 'staff', label: t('nav.staff', 'Staff'), icon: <FaUsers />, action: () => navigate('/staff') },
                { id: 'map', label: t('nav.map', 'Mapa'), icon: <FaMap />, action: () => navigate('/map') },
                { id: 'gacha', label: 'KilluCoin Gacha', icon: <FaBoxOpen />, action: () => navigate('/gacha') },
                { id: 'forum', label: 'Foro', icon: <FaQuestionCircle />, action: () => navigate('/forum') },
                { id: 'support', label: 'Soporte', icon: <FaQuestionCircle />, action: () => navigate('/support') },
            ] 
        },
        {
            section: 'Social & Tienda',
            items: [
                { id: 'discord', label: 'Discord', icon: <FaDiscord />, action: () => window.open('https://discord.gg/crystaltides', '_blank') },
                { id: 'store', label: 'Tienda', icon: <FaShoppingCart />, action: () => window.open('https://store.crystaltides.net', '_blank') },
            ]
        }
    ];

    // Admin Section
    if (user?.user_metadata?.role === 'admin' || user?.user_metadata?.role === 'owner' || user?.user_metadata?.role === 'neroferno' || user?.user_metadata?.role === 'killu') {
        actions.unshift({
            section: 'Administración',
            items: [
                { id: 'admin', label: 'Admin Panel', icon: <FaShieldAlt />, action: () => navigate('/admin') },
                { id: 'config', label: 'Configuración del Sitio', icon: <FaCog />, action: () => navigate('/admin?tab=settings') },
            ]
        });
    }

    // Filter Items
    const flattenItems = actions.flatMap(section => section.items);
    const filteredItems = flattenItems.filter(item => 
        item.label.toLowerCase().includes(query.toLowerCase())
    );

    // Keyboard Navigation for List
    useEffect(() => {
        const handleNav = (e: KeyboardEvent) => {
            if (!isOpen) return;
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % filteredItems.length);
            }
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + filteredItems.length) % filteredItems.length);
            }
            if (e.key === 'Enter') {
                e.preventDefault();
                if (filteredItems[selectedIndex]) {
                    filteredItems[selectedIndex].action();
                    setIsOpen(false);
                    setQuery('');
                }
            }
        };

        window.addEventListener('keydown', handleNav);
        return () => window.removeEventListener('keydown', handleNav);
    }, [isOpen, filteredItems, selectedIndex]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(5px)',
                    zIndex: 10000,
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    paddingTop: '15vh'
                }} onClick={() => setIsOpen(false)}>
                    <Motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.1 }}
                        style={{
                            width: '90%',
                            maxWidth: '600px',
                            background: '#1a1a1a',
                            borderRadius: '12px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Search Input */}
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            padding: '1.5rem', 
                            borderBottom: '1px solid rgba(255,255,255,0.05)',
                            gap: '1rem' 
                        }}>
                            <FaSearch style={{ color: '#666', fontSize: '1.2rem' }} />
                            <input 
                                autoFocus
                                value={query}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                    setQuery(e.target.value);
                                    setSelectedIndex(0);
                                }}
                                placeholder="Busca un comando o página..."
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#fff',
                                    fontSize: '1.2rem',
                                    outline: 'none',
                                    width: '100%'
                                }}
                            />
                            <div style={{ 
                                padding: '4px 8px', 
                                background: 'rgba(255,255,255,0.1)', 
                                borderRadius: '4px', 
                                color: '#666', 
                                fontSize: '0.7rem', 
                                fontWeight: 'bold' 
                            }}>
                                ESC
                            </div>
                        </div>

                        {/* Actions List */}
                        <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '0.5rem' }}>
                            {filteredItems.length === 0 ? (
                                <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                                    No se encontraron resultados
                                </div>
                            ) : (
                                filteredItems.map((item: ActionItem, index: number) => (
                                    <div
                                        key={item.id}
                                        onMouseEnter={() => setSelectedIndex(index)}
                                        onClick={() => {
                                            item.action();
                                            setIsOpen(false);
                                        }}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '1rem',
                                            padding: '1rem',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            background: index === selectedIndex ? 'var(--accent)' : 'transparent',
                                            color: index === selectedIndex ? '#000' : '#ccc',
                                            transition: 'background 0.1s'
                                        }}
                                    >
                                        <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
                                        <span style={{ fontSize: '1rem' }}>{item.label}</span>
                                        {index === selectedIndex && (
                                            <span style={{ marginLeft: 'auto', fontSize: '0.8rem', opacity: 0.7 }}>
                                                ↵ Enter
                                            </span>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        <div style={{ 
                            padding: '0.8rem 1.5rem', 
                            background: 'rgba(0,0,0,0.2)', 
                            borderTop: '1px solid rgba(255,255,255,0.05)',
                            color: '#444', 
                            fontSize: '0.8rem',
                            display: 'flex',
                            justifyContent: 'space-between'
                        }}>
                             <span>CrystalTides <span style={{ color: 'var(--accent)' }}>CMD</span></span>
                             <span>Usa las flechas para navegar</span>
                        </div>
                    </Motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
