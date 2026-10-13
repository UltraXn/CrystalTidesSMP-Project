import React, { useState } from 'react';
import { CrystalButton } from './CrystalButton';
import { CrystalPageHeader } from './CrystalPageHeader';
import { getSettings, saveSettings, type LauncherSettings } from './mockLauncherState';
import { CrystalWebAccountCard } from './Settings/CrystalWebAccountCard';
import { JavaRamCard } from './Settings/JavaRamCard';
import { GameDisplayCard } from './Settings/GameDisplayCard';
import { ServerConnectionCard } from './Settings/ServerConnectionCard';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<LauncherSettings>(() => getSettings());
  const [formConfig, setFormConfig] = useState({
    tempMaxRam: settings.maxRam / 1024,
    javaPath: settings.javaPath ?? '',
    width: settings.width || 1280,
    height: settings.height || 720,
    fullscreen: settings.fullscreen || false,
    autoConnect: settings.autoConnect ?? true,
    serverHost: settings.serverHost || 'mc.crystaltidesSMP.net',
    serverPort: settings.serverPort || 25565,
    mcVersion: settings.mcVersion || '1.21.1',
    loaderType: settings.loaderType || 'neoforge',
    useOptimization: settings.useOptimization ?? true,
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    const updated = saveSettings({
      ...settings,
      maxRam: formConfig.tempMaxRam * 1024,
      minRam: Math.min(2048, (formConfig.tempMaxRam * 1024) / 2),
      javaPath: formConfig.javaPath || undefined,
      width: formConfig.width,
      height: formConfig.height,
      fullscreen: formConfig.fullscreen,
      autoConnect: formConfig.autoConnect,
      serverHost: formConfig.serverHost,
      serverPort: formConfig.serverPort,
      mcVersion: formConfig.mcVersion,
      loaderType: formConfig.loaderType,
      useOptimization: formConfig.useOptimization,
    });
    setSettings(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    localStorage.removeItem('crystaltides_settings');
    const defaults = getSettings();
    setSettings(defaults);
    setFormConfig({
      tempMaxRam: defaults.maxRam / 1024,
      javaPath: '',
      width: 1280,
      height: 720,
      fullscreen: false,
      autoConnect: true,
      serverHost: 'mc.crystaltidesSMP.net',
      serverPort: 25565,
      mcVersion: defaults.mcVersion || '1.21.1',
      loaderType: defaults.loaderType || 'neoforge',
      useOptimization: defaults.useOptimization ?? true,
    });
  };

  return (
    <div
      style={{
        padding: 32,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        boxSizing: 'border-box',
      }}
    >
      <CrystalPageHeader eyebrow="Configuración" title="Ajustes del Launcher" />

      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          marginTop: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}
      >
        <CrystalWebAccountCard settings={settings} setSettings={setSettings} />

        <JavaRamCard
          tempMaxRam={formConfig.tempMaxRam}
          setTempMaxRam={(val) => setFormConfig((prev) => ({ ...prev, tempMaxRam: val }))}
          useOptimization={formConfig.useOptimization}
          setUseOptimization={(val) => setFormConfig((prev) => ({ ...prev, useOptimization: val }))}
          javaPath={formConfig.javaPath}
          setJavaPath={(val) => setFormConfig((prev) => ({ ...prev, javaPath: val }))}
        />

        <GameDisplayCard
          width={formConfig.width}
          setWidth={(val) => setFormConfig((prev) => ({ ...prev, width: val }))}
          height={formConfig.height}
          setHeight={(val) => setFormConfig((prev) => ({ ...prev, height: val }))}
          fullscreen={formConfig.fullscreen}
          setFullscreen={(val) => setFormConfig((prev) => ({ ...prev, fullscreen: val }))}
          mcVersion={formConfig.mcVersion}
          setMcVersion={(val) => setFormConfig((prev) => ({ ...prev, mcVersion: val }))}
          loaderType={formConfig.loaderType}
          setLoaderType={(val) => setFormConfig((prev) => ({ ...prev, loaderType: val }))}
        />

        <ServerConnectionCard
          autoConnect={formConfig.autoConnect}
          setAutoConnect={(val) => setFormConfig((prev) => ({ ...prev, autoConnect: val }))}
          serverHost={formConfig.serverHost}
          setServerHost={(val) => setFormConfig((prev) => ({ ...prev, serverHost: val }))}
          serverPort={formConfig.serverPort}
          setServerPort={(val) => setFormConfig((prev) => ({ ...prev, serverPort: val }))}
        />

        <div style={{ display: 'flex', gap: 12, paddingBottom: 24 }}>
          <CrystalButton
            text="Restaurar Valores"
            variant="ghost"
            size="md"
            onPressed={handleReset}
            style={{ flex: 1 }}
          />
          <CrystalButton
            text={saved ? '✅ Guardado' : 'Guardar Configuración'}
            variant="primary"
            size="md"
            onPressed={handleSave}
            style={{ flex: 1 }}
          />
        </div>
      </div>
    </div>
  );
};
