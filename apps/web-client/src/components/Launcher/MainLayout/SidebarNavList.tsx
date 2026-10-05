import React from 'react';
import { Layers } from 'lucide-react';
import { NAV_ITEMS } from './navItems';

export interface SidebarNavListProps {
  activePage: string;
  showVersionSwitcher: boolean;
  onNavigatePage: (page: string) => void;
  onToggleVersionSwitcher: () => void;
}

function getNavBg(isActive: boolean, isHovered: boolean): string {
  if (isActive) return 'rgba(255, 255, 255, 0.08)';
  if (isHovered) return 'rgba(255, 255, 255, 0.03)';
  return 'transparent';
}

function getNavColor(isActive: boolean, isHovered: boolean): string {
  if (isActive) return '#FFFFFF';
  if (isHovered) return '#E2E8F0';
  return 'rgba(255, 255, 255, 0.4)';
}

export const SidebarNavList: React.FC<Readonly<SidebarNavListProps>> = ({
  activePage,
  showVersionSwitcher,
  onNavigatePage,
  onToggleVersionSwitcher,
}) => {
  const [hoveredItem, setHoveredItem] = React.useState<string | null>(null);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 5,
        width: '100%',
        alignItems: 'center',
        padding: '0 8px',
        boxSizing: 'border-box',
      }}
    >
      {NAV_ITEMS.map((item) => {
        const isActive = !showVersionSwitcher && activePage === item.id;
        const isHovered = hoveredItem === item.id;
        return (
          <button
            type="button"
            key={item.id}
            onClick={() => onNavigatePage(item.id)}
            onMouseEnter={() => setHoveredItem(item.id)}
            onMouseLeave={() => setHoveredItem(null)}
            title={item.label}
            style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              padding: '8px 0 6px',
              borderRadius: 10,
              border: '1px solid transparent',
              backgroundColor: getNavBg(isActive, isHovered),
              borderColor: isActive ? 'rgba(45, 212, 191, 0.3)' : 'transparent',
              color: getNavColor(isActive, isHovered),
              cursor: 'pointer',
              transition: 'background-color 160ms ease, border-color 160ms ease, color 160ms ease',
              position: 'relative',
              boxShadow: isActive ? '0 2px 8px rgba(0, 0, 0, 0.25)' : 'none',
              fontFamily: 'var(--font-family)',
            }}
          >
            <span
              style={{
                display: 'flex',
                color: isActive ? '#2DD4BF' : 'inherit',
                transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                transition: 'transform 160ms ease',
              }}
            >
              {item.icon}
            </span>
            <span
              style={{
                fontSize: 9.5,
                fontWeight: isActive ? 700 : 500,
                letterSpacing: '0.02em',
                color: isActive ? '#FFFFFF' : 'inherit',
              }}
            >
              {item.label}
            </span>

            {/* Active indicator bar */}
            {isActive && (
              <div
                style={{
                  position: 'absolute',
                  left: -8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 3,
                  height: 20,
                  borderRadius: '0 3px 3px 0',
                  backgroundColor: '#2DD4BF',
                }}
              />
            )}
          </button>
        );
      })}

      {/* Quick Version Switcher Button */}
      <button
        type="button"
        onClick={onToggleVersionSwitcher}
        title="Selector de Versiones"
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3,
          padding: '8px 0 6px',
          borderRadius: 10,
          border: showVersionSwitcher
            ? '1px solid rgba(45, 212, 191, 0.4)'
            : '1px solid transparent',
          backgroundColor: showVersionSwitcher ? 'rgba(45, 212, 191, 0.15)' : 'transparent',
          color: showVersionSwitcher ? '#2DD4BF' : 'rgba(255, 255, 255, 0.4)',
          cursor: 'pointer',
          transition: 'background-color 160ms ease, border-color 160ms ease, color 160ms ease',
        }}
      >
        <Layers size={18} color={showVersionSwitcher ? '#2DD4BF' : 'currentColor'} />
        <span style={{ fontSize: 9, fontWeight: 700 }}>Versiones</span>
      </button>
    </div>
  );
};
