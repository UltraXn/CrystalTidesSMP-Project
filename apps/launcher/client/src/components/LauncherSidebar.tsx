import React from 'react';
import { MorphIcon } from 'morphicons/react';
import {
  House,
  User,
  Bell,
  MessageSquare,
  Layers,
  Globe,
  Crop,
  ShoppingCart,
  Settings,
  UserCog,
} from 'lucide';
import { NavSection } from './types';

interface LauncherSidebarProps {
  activeNav: NavSection;
  onSelectNav: (nav: NavSection) => void;
}

interface SidebarNavButtonProps {
  id: NavSection;
  activeNav: NavSection;
  onSelectNav: (nav: NavSection) => void;
  title: string;
  icon: any;
  dotColor?: string;
  dotBoxShadow?: string;
  dotTop?: boolean;
}

const SidebarNavButton: React.FC<SidebarNavButtonProps> = ({
  id,
  activeNav,
  onSelectNav,
  title,
  icon,
  dotColor,
  dotBoxShadow,
  dotTop,
}) => {
  const isActive = activeNav === id;
  return (
    <button
      type="button"
      onClick={() => onSelectNav?.(id)}
      title={title}
      style={{
        width: 36,
        height: 36,
        borderRadius: 11,
        border: isActive ? '1px solid #121620' : '1px solid transparent',
        backgroundColor: isActive ? '#0D1017' : 'transparent',
        color: isActive ? '#2DD4BF' : '#94A3B8',
        boxShadow: isActive ? '0 2px 8px rgba(0, 0, 0, 0.4)' : 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        transition: 'all 150ms ease',
        padding: 0,
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
          e.currentTarget.style.borderColor = '#1A1F2B';
          e.currentTarget.style.color = '#FAFCFF';
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.borderColor = 'transparent';
          e.currentTarget.style.color = '#94A3B8';
        }
      }}
    >
      <MorphIcon
        icon={icon}
        size={18}
        color={isActive ? '#2DD4BF' : 'currentColor'}
        strokeWidth={2.2}
      />
      {dotColor && (
        <span
          style={{
            position: 'absolute',
            bottom: dotTop ? undefined : 7,
            top: dotTop ? 7 : undefined,
            right: 7,
            width: 5.5,
            height: 5.5,
            borderRadius: '50%',
            backgroundColor: dotColor,
            boxShadow: dotBoxShadow ?? `0 0 6px ${dotColor}`,
          }}
        />
      )}
    </button>
  );
};

export const LauncherSidebar: React.FC<LauncherSidebarProps> = ({ activeNav, onSelectNav }) => {
  return (
    <nav
      style={{
        width: 132,
        minWidth: 132,
        backgroundColor: '#07080A',
        borderRight: '1px solid #1A1F2B',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '36px 0 34px 0',
        boxSizing: 'border-box',
        zIndex: 10,
        height: '100%',
        userSelect: 'none',
      }}
    >
      {/* Top Logo Mascot */}
      <div
        style={{
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 28,
          width: '100%',
        }}
      >
        <img
          src="/logo.png"
          alt="Crystal Tides"
          style={{
            width: 42,
            height: 42,
            objectFit: 'contain',
            imageRendering: 'auto',
          }}
        />
      </div>

      {/* Divider 1 */}
      <div
        style={{
          width: 22,
          height: 1,
          backgroundColor: '#1A1F2B',
          marginBottom: 20,
        }}
      />

      {/* Cluster 1: Home, Account, Notifications */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          width: '100%',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <SidebarNavButton
          id="home"
          activeNav={activeNav}
          onSelectNav={onSelectNav}
          title="Home"
          icon={House}
        />
        <SidebarNavButton
          id="locker"
          activeNav={activeNav}
          onSelectNav={onSelectNav}
          title="Locker"
          icon={User}
          dotColor="#F2B82E"
          dotBoxShadow="0 0 6px rgba(242, 184, 46, 0.8)"
        />
        <SidebarNavButton
          id="notifications"
          activeNav={activeNav}
          onSelectNav={onSelectNav}
          title="Notifications"
          icon={Bell}
        />
      </div>

      {/* Divider 2 */}
      <div
        style={{
          width: 20,
          height: 1,
          backgroundColor: '#1A1F2B',
          margin: '20px 0 16px 0',
        }}
      />

      {/* Cluster 2: Chat, Versions, Servers, Mods */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          width: '100%',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <SidebarNavButton
          id="chat"
          activeNav={activeNav}
          onSelectNav={onSelectNav}
          title="Messages"
          icon={MessageSquare}
        />
        <SidebarNavButton
          id="versions"
          activeNav={activeNav}
          onSelectNav={onSelectNav}
          title="Versions"
          icon={Layers}
        />
        <SidebarNavButton
          id="servers"
          activeNav={activeNav}
          onSelectNav={onSelectNav}
          title="Servers"
          icon={Globe}
        />
        <SidebarNavButton
          id="gallery"
          activeNav={activeNav}
          onSelectNav={onSelectNav}
          title="Gallery"
          icon={Crop}
          dotColor="#EF4444"
          dotBoxShadow="0 0 6px rgba(239, 68, 68, 0.8)"
        />
      </div>

      {/* Empty breathing gap */}
      <div style={{ flex: 1, minHeight: 40 }} />

      {/* Cluster 3: Store & Settings */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
          alignItems: 'center',
          width: '100%',
        }}
      >
        <SidebarNavButton
          id="store"
          activeNav={activeNav}
          onSelectNav={onSelectNav}
          title="Store"
          icon={ShoppingCart}
          dotColor="#EF4444"
          dotBoxShadow="0 0 6px rgba(239, 68, 68, 0.8)"
          dotTop
        />
        <SidebarNavButton
          id="profiles"
          activeNav={activeNav}
          onSelectNav={onSelectNav}
          title="Cuentas & Sesión"
          icon={UserCog}
        />
        <SidebarNavButton
          id="settings"
          activeNav={activeNav}
          onSelectNav={onSelectNav}
          title="Settings"
          icon={Settings}
        />
      </div>
    </nav>
  );
};
