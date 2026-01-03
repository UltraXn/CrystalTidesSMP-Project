import { FaServer, FaLink, FaCog, FaBars, FaTimes } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

interface AccountMobileNavbarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
}

export default function AccountMobileNavbar({ activeTab, setActiveTab, sidebarOpen, setSidebarOpen }: AccountMobileNavbarProps) {
    const { t } = useTranslation();

    const navItems = [
        { id: 'overview', icon: <FaServer />, label: t('account.nav.overview', 'Inicio') },
        { id: 'connections', icon: <FaLink />, label: t('account.nav.connections', 'Conexiones') },
        { id: 'settings', icon: <FaCog />, label: t('account.nav.settings', 'Ajustes') },
    ];

    return (
        <div className="admin-mobile-navbar account-mobile-navbar">
            {navItems.map((item) => (
                <button
                    key={item.id}
                    className={`mobile-nav-item ${activeTab === item.id ? 'active' : ''}`}
                    onClick={() => {
                        setActiveTab(item.id);
                        setSidebarOpen(false);
                    }}
                >
                    <span className="icon">{item.icon}</span>
                    <span className="label">{item.label}</span>
                    {activeTab === item.id && (
                        <motion.div 
                            className="active-indicator" 
                            layoutId="activeTabAccountMobile"
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                    )}
                </button>
            ))}

            {/* Menu Toggle */}
            <button
                className={`mobile-nav-item ${sidebarOpen ? 'active' : ''}`}
                onClick={() => setSidebarOpen(!sidebarOpen)}
            >
                <span className="icon">{sidebarOpen ? <FaTimes /> : <FaBars />}</span>
                <span className="label text-menu-btn">{sidebarOpen ? t('admin.close', 'Cerrar') : t('navbar.menu', 'Menú')}</span>
            </button>
        </div>
    );
}
