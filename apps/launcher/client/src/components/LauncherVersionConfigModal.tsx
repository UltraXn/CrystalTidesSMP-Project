import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { MorphIcon } from 'morphicons/react';
import {
  FlaskConical,
  Package,
  Sparkles,
  Globe,
  Palette,
  Settings,
  Cloud,
  Check,
  X,
  Plus,
  Trash2,
  FolderOpen,
  ListFilter,
  RefreshCw,
  Search,
  ChevronDown,
} from 'lucide';
import {
  listInstalledMods,
  setModEnabled,
  deleteInstalledMod,
  InstalledMod,
} from '../services/modManagerService';
import { getSettings, saveSettings } from '../services/settingsService';
import { AdvancedSettingsTab } from './AdvancedSettingsTab';

export type ConfigTab = 'loader' | 'mods' | 'shaders' | 'worlds' | 'resources' | 'advanced';

export interface DisplayModItem {
  id: string;
  filename: string;
  name: string;
  author: string;
  version: string;
  fileSize: string;
  iconBg: string;
  iconSvg?: React.ReactNode;
  iconUrl?: string;
  enabled: boolean;
  official: boolean;
}

const DEFAULT_SAMPLE_MODS: DisplayModItem[] = [
  {
    id: 'litematica',
    filename: 'litematica-fabric-1.21.7-0.26.3.jar',
    name: 'Litematica',
    author: 'masa',
    version: 'v0.26.3',
    fileSize: '1.82MB',
    iconBg: 'linear-gradient(135deg, #3B82F6 0%, #EC4899 100%)',
    enabled: true,
    official: true,
  },
  {
    id: 'modmenu',
    filename: 'modmenu-17.0.0.jar',
    name: 'Mod Menu',
    author: 'Terraformers',
    version: 'v17.0.0',
    fileSize: '1.12MB',
    iconBg: '#2563EB',
    enabled: true,
    official: true,
  },
  {
    id: 'inventoryprofiles',
    filename: 'inventoryprofilesnext-2.3.1.jar',
    name: 'Inventory Profiles Next',
    author: 'blackd',
    version: 'v2.3.1',
    fileSize: '1.48MB',
    iconBg: '#14B8A6',
    enabled: false,
    official: false,
  },
  {
    id: 'chatpatches',
    filename: 'chatpatches-8.0.jar',
    name: 'Chat Patches',
    author: 'OBro1961',
    version: 'v8.0-alpha.8',
    fileSize: '1.93MB',
    iconBg: '#64748B',
    enabled: false,
    official: false,
  },
  {
    id: 'ferritecore',
    filename: 'ferritecore-8.2.0-fabric.jar',
    name: 'FerriteCore',
    author: 'malte0811',
    version: 'v8.2.0',
    fileSize: '2.16MB',
    iconBg: '#D97706',
    enabled: true,
    official: true,
  },
  {
    id: 'sodium',
    filename: 'sodium-fabric-0.6.9.jar',
    name: 'Sodium',
    author: 'CaffeineMC',
    version: 'v0.6.9',
    fileSize: '2.40MB',
    iconBg: '#10B981',
    enabled: true,
    official: true,
  },
  {
    id: 'iris',
    filename: 'iris-fabric-1.8.4.jar',
    name: 'Iris Shaders',
    author: 'Iris Team',
    version: 'v1.8.4',
    fileSize: '4.20MB',
    iconBg: '#8B5CF6',
    enabled: true,
    official: true,
  },
  {
    id: 'crystaltides-boost',
    filename: 'crystaltides-boost-1.0.0.jar',
    name: 'CrystalTides Boost',
    author: 'CrystalTides',
    version: 'v1.0.0',
    fileSize: '68KB',
    iconBg: 'linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)',
    enabled: true,
    official: true,
  },
  {
    id: 'fsr-reloaded',
    filename: 'fsr-reloaded-1.2.0-fabric.jar',
    name: 'FSR Reloaded (Temporal Upscaling)',
    author: 'cdefpigger',
    version: 'v1.2.0',
    fileSize: '840KB',
    iconBg: 'linear-gradient(135deg, #EF4444 0%, #F59E0B 100%)',
    enabled: false,
    official: true,
  },
];

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

const extractModName = (filename: string): { name: string; version: string } => {
  const clean = filename.replace(/\.jar(\.disabled)?$/, '');
  const parts = clean.split(/[-_v](?=\d)/);
  if (parts.length > 1) {
    return { name: parts[0].replace(/[-_]/g, ' '), version: parts.slice(1).join('.') };
  }
  return { name: clean.replace(/[-_]/g, ' '), version: '1.0.0' };
};

interface LauncherVersionConfigModalProps {
  isOpen: boolean;
  versionId: string;
  initialTab?: ConfigTab;
  onClose: () => void;
}

export const LauncherVersionConfigModal: React.FC<LauncherVersionConfigModalProps> = ({
  isOpen,
  versionId,
  initialTab = 'advanced',
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<ConfigTab>(initialTab);
  const [selectedSubversion] = useState(
    versionId && versionId !== 'hypixel' && versionId !== 'vanilla' ? versionId : '1.21.7',
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [mods, setMods] = useState<DisplayModItem[]>(DEFAULT_SAMPLE_MODS);
  const [gameDirectory, setGameDirectory] = useState<string>('');

  // Advanced settings state
  const [resEnabled, setResEnabled] = useState(true);
  const [resWidth, setResWidth] = useState(1920);
  const [resHeight, setResHeight] = useState(1080);
  const [fullscreen, setFullscreen] = useState(false);
  const [borderless, setBorderless] = useState(true);
  const [lockAspect, setLockAspect] = useState(true);
  const [matchNative, setMatchNative] = useState(false);

  // RAM Allocation state
  const [ramEnabled, setRamEnabled] = useState(true);
  const [allocatedRam, setAllocatedRam] = useState(6);
  const [maxSystemRam, setMaxSystemRam] = useState(32);

  // JVM Args
  const [jvmEnabled, setJvmEnabled] = useState(false);
  const [jvmArgs, setJvmArgs] = useState(
    '-XX:+UseG1GC -XX:+ParallelRefProcEnabled -XX:MaxGCPauseMillis=200 -XX:+UnlockExperimentalVMOptions -XX:+DisableExplicitGC',
  );

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        const homeDir = await invoke<string | null>('get_home_dir');
        const gDir = homeDir ? `${homeDir.replace(/\\/g, '/')}/.crystaltides` : '';
        if (isMounted) setGameDirectory(gDir);

        // Load Settings
        const settings = getSettings();
        if (isMounted) {
          setResWidth(settings.width || 1920);
          setResHeight(settings.height || 1080);
          setFullscreen(settings.fullscreen || false);
          setAllocatedRam(Math.round((settings.maxRam || 6144) / 1024));
        }

        // Hardware detection for RAM
        try {
          const hw = await invoke<{ physical_cores: number; logical_cores: number }>(
            'detect_hardware_profile',
          );
          if (hw && isMounted) {
            setMaxSystemRam(32);
          }
        } catch {
          // Default
        }

        // Load Installed Mods
        if (gDir) {
          const rawMods = await listInstalledMods(gDir);
          if (isMounted && rawMods.length > 0) {
            const mapped: DisplayModItem[] = rawMods.map((m: InstalledMod, idx: number) => {
              const { name, version } = extractModName(m.filename);
              const palette = [
                'linear-gradient(135deg, #3B82F6 0%, #EC4899 100%)',
                '#2563EB',
                '#14B8A6',
                '#64748B',
                '#D97706',
                '#10B981',
                '#8B5CF6',
              ];
              return {
                id: m.filename,
                filename: m.filename,
                name: m.title ?? name,
                author: 'Mod Author',
                version: `v${version}`,
                fileSize: formatBytes(m.sizeBytes),
                iconBg: palette[idx % palette.length],
                enabled: m.enabled,
                official: m.official,
              };
            });
            setMods(mapped);
          }
        }
      } catch (err) {
        console.warn('Failed to load real mods/config:', err);
      }
    };

    if (isOpen) {
      init();
    }

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleMod = async (mod: DisplayModItem) => {
    const newEnabled = !mod.enabled;
    setMods((prev) => prev.map((m) => (m.id === mod.id ? { ...m, enabled: newEnabled } : m)));

    if (gameDirectory) {
      try {
        await setModEnabled(gameDirectory, mod.filename, newEnabled);
      } catch (err) {
        console.error('Failed to toggle mod:', err);
      }
    }
  };

  const handleDeleteMod = async (mod: DisplayModItem) => {
    setMods((prev) => prev.filter((m) => m.id !== mod.id));
    if (gameDirectory) {
      try {
        await deleteInstalledMod(gameDirectory, mod.filename);
      } catch (err) {
        console.error('Failed to delete mod:', err);
      }
    }
  };

  const handleOpenFolder = async () => {
    if (!gameDirectory) return;
    try {
      await invoke('open_folder', { path: gameDirectory });
    } catch (err) {
      console.error('Failed to open folder:', err);
    }
  };

  const handleSaveAdvancedSettings = (
    newRam?: number,
    newW?: number,
    newH?: number,
    newFs?: boolean,
  ) => {
    saveSettings({
      maxRam: (newRam ?? allocatedRam) * 1024,
      width: newW ?? resWidth,
      height: newH ?? resHeight,
      fullscreen: newFs ?? fullscreen,
    });
  };

  const filteredMods = mods.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.author.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.82)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999,
        userSelect: 'none',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          width: 980,
          height: 610,
          backgroundColor: '#07040A',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 20,
          boxShadow: '0 28px 80px rgba(0, 0, 0, 0.95), 0 0 40px rgba(168, 85, 247, 0.08)',
          display: 'flex',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Top Close 'X' Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute',
            top: 20,
            right: 22,
            background: 'none',
            border: 'none',
            color: 'rgba(255, 255, 255, 0.4)',
            cursor: 'pointer',
            display: 'flex',
            padding: 4,
            zIndex: 20,
            transition: 'color 150ms ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#FFFFFF';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.4)';
          }}
        >
          <MorphIcon icon={X} size={18} color="currentColor" strokeWidth={2.2} />
        </button>

        {/* ── LEFT SIDEBAR: VERSION & CATEGORIES ── */}
        <div
          style={{
            width: 180,
            backgroundColor: '#050207',
            borderRight: '1px solid rgba(255, 255, 255, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '24px 16px 20px 16px',
            boxSizing: 'border-box',
          }}
        >
          {/* Top: Version Selector & Tabs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Version Dropdown Box */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span
                style={{
                  fontSize: 9.5,
                  fontWeight: 800,
                  color: 'rgba(255, 255, 255, 0.35)',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                VERSION
              </span>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: 'rgba(255, 255, 255, 0.035)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 8,
                  padding: '7px 12px',
                  fontSize: 12,
                  fontWeight: 800,
                  color: '#FFFFFF',
                  cursor: 'pointer',
                }}
              >
                <span>{selectedSubversion}</span>
                <MorphIcon
                  icon={ChevronDown}
                  size={13}
                  color="rgba(255, 255, 255, 0.6)"
                  strokeWidth={2.5}
                />
              </div>
            </div>

            {/* Nav Tabs list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                {
                  id: 'loader',
                  label: 'Loader',
                  icon: FlaskConical,
                },
                {
                  id: 'mods',
                  label: 'Mods',
                  icon: Package,
                },
                {
                  id: 'shaders',
                  label: 'Shaders',
                  icon: Sparkles,
                },
                {
                  id: 'worlds',
                  label: 'Worlds',
                  icon: Globe,
                },
                {
                  id: 'resources',
                  label: 'Resources',
                  icon: Palette,
                },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as ConfigTab)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '8px 12px',
                      borderRadius: 8,
                      backgroundColor: isActive ? 'rgba(147, 51, 234, 0.14)' : 'transparent',
                      border: isActive
                        ? '1px solid rgba(192, 132, 252, 0.4)'
                        : '1px solid transparent',
                      color: isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)',
                      fontSize: 12.5,
                      fontWeight: isActive ? 800 : 600,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 150ms ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.color = '#FFFFFF';
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)';
                    }}
                  >
                    <MorphIcon
                      icon={tab.icon}
                      size={15}
                      color={isActive ? '#C084FC' : 'currentColor'}
                      strokeWidth={2}
                    />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom: Advanced Tab */}
          <div style={{ paddingTop: 14, borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <button
              type="button"
              onClick={() => setActiveTab('advanced')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 12px',
                borderRadius: 8,
                backgroundColor:
                  activeTab === 'advanced' ? 'rgba(239, 68, 68, 0.12)' : 'transparent',
                border:
                  activeTab === 'advanced'
                    ? '1px solid rgba(239, 68, 68, 0.35)'
                    : '1px solid transparent',
                color: activeTab === 'advanced' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)',
                fontSize: 12.5,
                fontWeight: 800,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 150ms ease',
              }}
            >
              <MorphIcon
                icon={Settings}
                size={15}
                color={activeTab === 'advanced' ? '#EF4444' : 'currentColor'}
                strokeWidth={2}
              />
              <span>Advanced</span>
            </button>
          </div>
        </div>

        {/* ── RIGHT MAIN WORKSPACE ── */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            padding: '24px 28px',
            boxSizing: 'border-box',
            overflow: 'hidden',
            gap: 16,
          }}
        >
          {/* Top Search & Filter & Folder Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingRight: 40 }}>
            {/* Search input */}
            <div style={{ position: 'relative', flex: 1 }}>
              <div
                style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <MorphIcon
                  icon={Search}
                  size={14}
                  color="rgba(255, 255, 255, 0.4)"
                  strokeWidth={2.2}
                />
              </div>
              <input
                type="text"
                placeholder={activeTab === 'mods' ? 'Find a mod...' : 'Search settings...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: 'rgba(255, 255, 255, 0.035)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 10,
                  padding: '9px 12px 9px 36px',
                  color: '#FFFFFF',
                  fontSize: 12,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Green Scan Icon (Shown in Mods View) */}
            {activeTab === 'mods' && (
              <button
                type="button"
                title="Scan & Sync Mods"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  backgroundColor: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: '#10B981',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MorphIcon icon={RefreshCw} size={15} color="#10B981" strokeWidth={2} />
              </button>
            )}

            {/* Filter Button */}
            <button
              type="button"
              title="Filters"
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: 'rgba(255, 255, 255, 0.035)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: 'rgba(255, 255, 255, 0.6)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MorphIcon icon={ListFilter} size={15} color="currentColor" strokeWidth={2} />
            </button>

            {/* Folder Button */}
            <button
              type="button"
              onClick={handleOpenFolder}
              title="Open Game Folder"
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: 'rgba(255, 255, 255, 0.035)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: 'rgba(255, 255, 255, 0.6)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MorphIcon icon={FolderOpen} size={15} color="currentColor" strokeWidth={2} />
            </button>
          </div>

          {/* Subtitle counter for Mods tab */}
          {activeTab === 'mods' && (
            <div
              style={{
                fontSize: 11,
                color: 'rgba(255, 255, 255, 0.5)',
                fontWeight: 600,
                marginTop: -6,
              }}
            >
              {mods.length} mods loaded
            </div>
          )}

          {/* Content Area */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              paddingRight: 4,
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}
          >
            {activeTab === 'advanced' && (
              <AdvancedSettingsTab
                resEnabled={resEnabled}
                setResEnabled={setResEnabled}
                resWidth={resWidth}
                setResWidth={setResWidth}
                resHeight={resHeight}
                setResHeight={setResHeight}
                fullscreen={fullscreen}
                setFullscreen={setFullscreen}
                borderless={borderless}
                setBorderless={setBorderless}
                lockAspect={lockAspect}
                setLockAspect={setLockAspect}
                matchNative={matchNative}
                setMatchNative={setMatchNative}
                ramEnabled={ramEnabled}
                setRamEnabled={setRamEnabled}
                allocatedRam={allocatedRam}
                setAllocatedRam={setAllocatedRam}
                maxSystemRam={maxSystemRam}
                jvmEnabled={jvmEnabled}
                setJvmEnabled={setJvmEnabled}
                jvmArgs={jvmArgs}
                setJvmArgs={setJvmArgs}
                onSaveAdvancedSettings={handleSaveAdvancedSettings}
              />
            )}
            {activeTab === 'mods' && (
              /* ── MODS TAB (Exact Noctra Style) ── */
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* 3rd Party Mods Box */}
                <div
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    border: '1px dashed rgba(255, 255, 255, 0.14)',
                    borderRadius: 14,
                    padding: '14px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 140ms ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        border: '1px dashed rgba(255, 255, 255, 0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'rgba(255, 255, 255, 0.7)',
                      }}
                    >
                      <MorphIcon
                        icon={Plus}
                        size={15}
                        color="rgba(255, 255, 255, 0.7)"
                        strokeWidth={2.5}
                      />
                    </div>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 800, color: '#FFFFFF' }}>
                        3rd Party Mods
                      </div>
                      <div style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.4)' }}>
                        Drag &amp; drop files here, or browse to add mods.
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      fontSize: 10.5,
                      color: 'rgba(255, 255, 255, 0.4)',
                      textAlign: 'right',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <div>
                      <div>All mods synced to Crystal Cloud</div>
                      <div style={{ color: 'rgba(255, 255, 255, 0.25)' }}>
                        Last synced: 18mins ago
                      </div>
                    </div>
                    <MorphIcon
                      icon={Cloud}
                      size={16}
                      color="rgba(255, 255, 255, 0.5)"
                      strokeWidth={2}
                    />
                  </div>
                </div>

                {/* Mods List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
                  {filteredMods.map((mod) => (
                    <div
                      key={mod.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        backgroundColor: 'rgba(255, 255, 255, 0.015)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        borderRadius: 12,
                        padding: '10px 16px',
                        transition: 'all 140ms ease',
                      }}
                    >
                      {/* Left: Mod Icon + Name + Author */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: 8,
                            background: mod.iconBg,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 16,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                            color: '#FFFFFF',
                            fontWeight: 800,
                          }}
                        >
                          {mod.name.charAt(0)}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: 13.5, fontWeight: 800, color: '#FFFFFF' }}>
                            {mod.name}
                          </span>
                          <span style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.4)' }}>
                            By {mod.author}
                          </span>
                        </div>
                      </div>

                      {/* Right: Version + Size + Enabled + Actions */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                        <span
                          style={{
                            fontSize: 11.5,
                            color: 'rgba(255, 255, 255, 0.45)',
                            fontWeight: 500,
                          }}
                        >
                          {mod.version} &nbsp;•&nbsp; {mod.fileSize}
                        </span>

                        {/* Enabled Checkbox */}
                        <button
                          type="button"
                          onClick={() => handleToggleMod(mod)}
                          style={{
                            background: 'none',
                            border: 'none',
                            padding: 0,
                            font: 'inherit',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            cursor: 'pointer',
                            fontSize: 11.5,
                            fontWeight: 800,
                            color: mod.enabled ? '#FFFFFF' : 'rgba(255, 255, 255, 0.4)',
                          }}
                        >
                          <span>Enabled</span>
                          <div
                            style={{
                              width: 16,
                              height: 16,
                              borderRadius: 4,
                              backgroundColor: mod.enabled
                                ? '#10B981'
                                : 'rgba(255, 255, 255, 0.05)',
                              border: mod.enabled
                                ? '1.5px solid #10B981'
                                : '1.5px solid rgba(255, 255, 255, 0.2)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {mod.enabled && (
                              <MorphIcon icon={Check} size={11} color="#FFFFFF" strokeWidth={3} />
                            )}
                          </div>
                        </button>

                        {/* Settings Button */}
                        <button
                          type="button"
                          title="Mod Settings"
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'rgba(168, 85, 247, 0.7)',
                            cursor: 'pointer',
                            padding: 4,
                            display: 'flex',
                          }}
                        >
                          <MorphIcon
                            icon={Settings}
                            size={15}
                            color="rgba(168, 85, 247, 0.85)"
                            strokeWidth={2}
                          />
                        </button>

                        {/* Trash Button */}
                        <button
                          type="button"
                          onClick={() => handleDeleteMod(mod)}
                          title="Delete Mod"
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'rgba(239, 68, 68, 0.7)',
                            cursor: 'pointer',
                            padding: 4,
                            display: 'flex',
                          }}
                        >
                          <MorphIcon
                            icon={Trash2}
                            size={15}
                            color="rgba(239, 68, 68, 0.85)"
                            strokeWidth={2}
                          />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {activeTab !== 'advanced' && activeTab !== 'mods' && (
              /* ── OTHER TABS (Loader, Shaders, Worlds, Resources) ── */
              <div
                style={{
                  textAlign: 'center',
                  padding: '60px 0',
                  color: 'rgba(255, 255, 255, 0.4)',
                  fontSize: 13,
                }}
              >
                Configuración de {activeTab} sincronizada con Crystal Cloud.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
