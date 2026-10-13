import { useState, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import type { UserSession, Profile } from '../../mockLauncherState';
import {
  getActiveProfile,
  resolveProfileGameDir,
  getSettings,
  launchGame,
  syncOfficialMods,
} from '../../mockLauncherState';

const buildGameLaunchOptions = (
  username: string,
  uuid: string | undefined,
  accessToken: string | undefined,
  profile: Profile,
  resolvedGameDir: string,
  settings: ReturnType<typeof getSettings>,
) => ({
  username,
  uuid: uuid ?? '00000000-0000-0000-0000-000000000000',
  accessToken: accessToken ?? 'placeholder_token',
  mcVersion: profile.mcVersion,
  loaderType: profile.loaderType,
  loaderVersion: profile.loaderVersion,
  minRam: profile.minRam ?? settings.minRam,
  maxRam: profile.maxRam ?? settings.maxRam,
  useOptimization: profile.useOptimization,
  javaArgs: profile.javaArgs,
  javaPath: profile.javaPath ?? settings.javaPath ?? undefined,
  gameDir: resolvedGameDir,
});

export const useGameLaunch = (currentSession: UserSession | null) => {
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchStatus, setLaunchStatus] = useState<string | null>(null);
  const [launchProgress, setLaunchProgress] = useState(0);
  const [launchError, setLaunchError] = useState<string | null>(null);

  const handlePlay = useCallback(async () => {
    if (!currentSession || isLaunching) return;
    setIsLaunching(true);
    setLaunchError(null);
    setLaunchStatus('Resolviendo directorios...');
    setLaunchProgress(0.02);

    try {
      const homeDir: string | null = await invoke('get_home_dir');
      if (!homeDir) throw new Error('No se pudo obtener el directorio personal.');

      const profile = getActiveProfile();
      const resolvedGameDir = resolveProfileGameDir(profile, homeDir);
      const settings = getSettings();

      if (profile.loaderType !== 'vanilla' && profile.loaderType !== '') {
        setLaunchStatus('Sincronizando mods...');
        setLaunchProgress(0.05);
        await syncOfficialMods(resolvedGameDir, (status, progress) => {
          setLaunchStatus(status);
          setLaunchProgress(progress * 0.4);
        });
      }

      setLaunchStatus('Iniciando Minecraft...');
      setLaunchProgress(0.5);

      const launchOpts = buildGameLaunchOptions(
        currentSession.username,
        currentSession.uuid,
        currentSession.accessToken,
        profile,
        resolvedGameDir,
        settings,
      );

      await launchGame(launchOpts, (status, progress) => {
        setLaunchStatus(status);
        setLaunchProgress(0.5 + progress * 0.5);
      });

      setLaunchStatus('¡En juego!');
      setLaunchProgress(1);

      setTimeout(() => {
        setLaunchStatus(null);
        setIsLaunching(false);
      }, 5000);
    } catch (err: unknown) {
      setLaunchError(err instanceof Error ? err.message : String(err));
      setLaunchStatus(null);
      setIsLaunching(false);
    }
  }, [currentSession, isLaunching]);

  const isInGame = isLaunching && launchProgress >= 1;

  return {
    isLaunching,
    isInGame,
    launchStatus,
    launchProgress,
    launchError,
    handlePlay,
  };
};
