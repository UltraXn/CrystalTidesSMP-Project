import { FaChartPie, FaBriefcase, FaCog, FaBars, FaTimes } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

interface AdminMobileNavbarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
}

export default function AdminMobileNavbar({ activeTab, setActiveTab, sidebarOpen, setSidebarOpen }: AdminMobileNavbarProps) {
    const { t } = useTranslation();

    const navItems = [
        { id: 'overview', icon: <FaChartPie />, label: t('admin.tabs.general', 'Inicio') },
        { id: 'staff_hub', icon: <FaBriefcase />, label: t('admin.tabs.staff_hub', 'StaffHub') },
        { id: 'settings', icon: <FaCog />, label: t('admin.tabs.settings', 'Config') },
    ];

    return (
        <div className="admin-mobile-navbar">
            {navItems.map((item) => (
                <button
                    key={item.id}
                    className={`mobile-nav-item ${activeTab === item.id ? 'active' : ''}`}
                    onClick={() => {
                        setActiveTab(item.id);
                        setSidebarOpen(false); // Close sidebar if open when switching main tabs
                    }}
                >
                    <span className="icon">{item.icon}</span>
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
                className={`mobile-nav-item ${sidebarOpen ? 'active' : ''}`}
                onClick={() => setSidebarOpen(!sidebarOpen)}
            >
                <span className="icon">{sidebarOpen ? <FaTimes /> : <FaBars />}</span>
                <span className="label">{sidebarOpen ? t('admin.close', 'Cerrar') : t('admin.menu', 'Menú')}</span>
            </button>
        </div>
    );
}
