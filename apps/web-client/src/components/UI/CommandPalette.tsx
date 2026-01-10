import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import { Search, Home, User, Users, Map, Settings, Shield, HelpCircle } from 'lucide-react';
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
                { id: 'home', label: t('nav.home', 'Inicio'), icon: <Home />, action: () => navigate('/') },
                { id: 'account', label: t('nav.account', 'Mi Cuenta'), icon: <User />, action: () => navigate('/account') },
                { id: 'staff', label: t('nav.staff', 'Staff'), icon: <Users />, action: () => navigate('/#staff') },
                { id: 'map', label: t('nav.map', 'Mapa'), icon: <Map />, action: () => navigate('/map') },
                { id: 'forum', label: 'Foro', icon: <HelpCircle />, action: () => navigate('/forum') },
                { id: 'support', label: 'Soporte', icon: <HelpCircle />, action: () => navigate('/support') },
            ] 
        },
        {
            section: 'Social',
            items: [
                { id: 'discord', label: 'Discord', icon: <svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.125-.094.249-.192.37-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.37.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>, action: () => window.open('https://discord.com/invite/TDmwYNnvyT', '_blank') },
            ]
        }
    ];

    // Admin Section
    const SUPER_ADMIN_ROLES = ['admin', 'neroferno', 'killu', 'killuwu', 'developer'];
    
    if (SUPER_ADMIN_ROLES.includes(user?.user_metadata?.role)) {
        actions.unshift({
            section: 'Administración',
            items: [
                { id: 'admin', label: 'Admin Panel', icon: <Shield />, action: () => navigate('/admin') },
                { id: 'config', label: 'Configuración del Sitio', icon: <Settings />, action: () => navigate('/admin?tab=settings') },
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
                            <Search style={{ color: '#666', fontSize: '1.2rem' }} />
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
