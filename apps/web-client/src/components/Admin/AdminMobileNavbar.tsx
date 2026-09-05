import { PieChart, Briefcase, Settings, Menu, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { m as motion } from "framer-motion";

interface AdminMobileNavbarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
}

export default function AdminMobileNavbar({ activeTab, setActiveTab, sidebarOpen, setSidebarOpen }: AdminMobileNavbarProps) {
    const { t } = useTranslation();

    const navItems = [
        { id: 'overview', icon: <PieChart size={20} />, label: t('admin.tabs.general', 'Inicio') },
        { id: 'staff_hub', icon: <Briefcase size={20} />, label: t('admin.tabs.staff_hub', 'StaffHub') },
        { id: 'settings', icon: <Settings size={20} />, label: t('admin.tabs.settings', 'Config') },
    ];

    return (
        <nav aria-label={t('admin.nav.mobile', 'Navegación móvil del panel de administración')} className="admin-mobile-navbar">
            {navItems.map((item) => (
                <button
                    type="button"
                    key={item.id}
                    aria-label={item.label}
                    aria-current={activeTab === item.id ? "page" : undefined}
                    className={`mobile-nav-item ${activeTab === item.id ? 'active' : ''}`}
                    onClick={() => {
                        setActiveTab(item.id);
                        setSidebarOpen(false); // Close sidebar if open when switching main tabs
                    }}
                >
                    <span className="icon" aria-hidden="true">{item.icon}</span>
                    <span className="label">{item.label}</span>
                    {activeTab === item.id && (
                        <motion.div 
                            className="active-indicator" 
                            layoutId="activeTabMobile"
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                    )}
                </button>
            ))}

            {/* Menu Toggle */}
            <button
                type="button"
                aria-label={sidebarOpen ? t('admin.sidebar_close', 'Cerrar menú lateral') : t('admin.sidebar_open', 'Abrir menú lateral')}
                aria-expanded={sidebarOpen}
                aria-controls="admin-sidebar"
                className={`mobile-nav-item ${sidebarOpen ? 'active' : ''}`}
                onClick={() => setSidebarOpen(!sidebarOpen)}
            >
                <span className="icon" aria-hidden="true">{sidebarOpen ? <X size={20} /> : <Menu size={20} />}</span>
                <span className="label">{sidebarOpen ? t('admin.close', 'Cerrar') : t('admin.menu', 'Menú')}</span>
            </button>
        </nav>
    );
}
