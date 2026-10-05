import { useState, useEffect } from 'react';
import {
  Profile,
  createProfile,
  updateProfile,
  fetchVanillaVersions,
  fetchFabricLoaderVersions,
  fetchNeoForgeVersions,
  fetchForgeVersions,
} from '../mockLauncherState';
import type { LoaderType } from './ProfileVersionSection';

function getInitialProfileValues(profile?: Profile | null) {
  if (!profile) {
    return {
      name: 'Nuevo Perfil',
      iconPath: '🌊',
      mcVersion: '1.21.1',
      loaderType: 'neoforge' as LoaderType,
      loaderVersion: '21.1.65',
      isolateSaves: false,
      gameDir: '',
      useCustomRam: false,
      minRam: 2048,
      maxRam: 4096,
      useOptimization: true,
      javaArgs: '',
      javaPath: '',
    };
  }
  return {
    name: profile.name,
    iconPath: profile.iconPath || '🌊',
    mcVersion: profile.mcVersion,
    loaderType: profile.loaderType as LoaderType,
    loaderVersion: profile.loaderVersion || '',
    isolateSaves: profile.isolateSaves,
    gameDir: profile.gameDir || '',
    useCustomRam: profile.minRam !== undefined || profile.maxRam !== undefined,
    minRam: profile.minRam || 2048,
    maxRam: profile.maxRam || 4096,
    useOptimization: profile.useOptimization,
    javaArgs: profile.javaArgs || '',
    javaPath: profile.javaPath || '',
  };
}

async function fetchLoadersForType(loaderType: LoaderType, mcVersion: string): Promise<string[]> {
  switch (loaderType) {
    case 'fabric':
      return fetchFabricLoaderVersions();
    case 'neoforge':
      return fetchNeoForgeVersions(mcVersion);
    case 'forge':
      return fetchForgeVersions(mcVersion);
    default:
      return [];
  }
}

function useLoaderVersions(loaderType: LoaderType, mcVersion: string, profile?: Profile | null) {
  const [vanillaVersions, setVanillaVersions] = useState<string[]>([]);
  const [loaderVersions, setLoaderVersions] = useState<string[]>([]);
  const [isLoadingVersions, setIsLoadingVersions] = useState(false);
  const [loaderVersion, setLoaderVersion] = useState(profile?.loaderVersion ?? '21.1.65');

  useEffect(() => {
    let ignore = false;
    const loadMcVersions = async () => {
      try {
        const list = await fetchVanillaVersions();
        if (!ignore) setVanillaVersions(list);
      } catch (err) {
        console.error('Error loading MC versions:', err);
      }
    };
    loadMcVersions();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;
    const loadLoaders = async () => {
      if (loaderType === 'vanilla' || loaderType === '') {
        if (!ignore) {
          setLoaderVersions([]);
          setLoaderVersion('');
        }
        return;
      }
      if (!ignore) setIsLoadingVersions(true);
      try {
        const list = await fetchLoadersForType(loaderType, mcVersion);
        if (!ignore) {
          setLoaderVersions(list);
          if (list.length > 0) {
            if (!profile || profile.loaderType !== loaderType) {
              setLoaderVersion(list[0]);
            }
          } else {
            setLoaderVersion('');
          }
        }
      } catch (err) {
        console.error('Error loading loader versions:', err);
      } finally {
        setIsLoadingVersions(false);
      }
    };
    loadLoaders();
    return () => {
      ignore = true;
    };
  }, [loaderType, mcVersion, profile]);

  return {
    vanillaVersions,
    loaderVersions,
    isLoadingVersions,
    loaderVersion,
    setLoaderVersion,
  };
}

export function useProfileEditor(
  profile: Profile | null | undefined,
  onClose: () => void,
  onSave: () => void,
) {
  const isEdit = Boolean(profile);
  const init = getInitialProfileValues(profile);

  const [name, setName] = useState(init.name);
  const [iconPath, setIconPath] = useState(init.iconPath);
  const [mcVersion, setMcVersion] = useState(init.mcVersion);
  const [loaderType, setLoaderType] = useState<LoaderType>(init.loaderType);
  const [isolateSaves, setIsolateSaves] = useState(init.isolateSaves);
  const [gameDir, setGameDir] = useState(init.gameDir);
  const [useCustomRam, setUseCustomRam] = useState(init.useCustomRam);
  const [minRam, setMinRam] = useState(init.minRam);
  const [maxRam, setMaxRam] = useState(init.maxRam);
  const [useOptimization, setUseOptimization] = useState(init.useOptimization);
  const [javaArgs, setJavaArgs] = useState(init.javaArgs);
  const [javaPath, setJavaPath] = useState(init.javaPath);

  const { vanillaVersions, loaderVersions, isLoadingVersions, loaderVersion, setLoaderVersion } =
    useLoaderVersions(loaderType, mcVersion, profile);

  const handleSave = () => {
    const cleanName = name.trim();
    if (!cleanName) {
      alert('Por favor ingresa un nombre para el perfil.');
      return;
    }

    const payload = {
      name: cleanName,
      iconPath,
      mcVersion,
      loaderType,
      loaderVersion,
      isolateSaves,
      gameDir: gameDir.trim() || undefined,
      useOptimization,
      javaArgs: javaArgs.trim() || undefined,
      javaPath: javaPath.trim() || undefined,
      minRam: useCustomRam ? minRam : undefined,
      maxRam: useCustomRam ? maxRam : undefined,
    };

    try {
      if (isEdit && profile) {
        updateProfile(profile.id, payload);
      } else {
        createProfile(payload);
      }
      onSave();
      onClose();
    } catch (err: unknown) {
      alert((err as Error).message || 'Error al guardar el perfil');
    }
  };

  return {
    isEdit,
    name,
    setName,
    iconPath,
    setIconPath,
    mcVersion,
    setMcVersion,
    loaderType,
    setLoaderType,
    loaderVersion,
    setLoaderVersion,
    isolateSaves,
    setIsolateSaves,
    gameDir,
    setGameDir,
    vanillaVersions,
    loaderVersions,
    isLoadingVersions,
    useCustomRam,
    setUseCustomRam,
    minRam,
    setMinRam,
    maxRam,
    setMaxRam,
    useOptimization,
    setUseOptimization,
    javaArgs,
    setJavaArgs,
    javaPath,
    setJavaPath,
    handleSave,
  };
}
