import { useState, useEffect, useCallback } from 'react';
import type { ServerStatus } from '../../mockLauncherState';
import { fetchServerStatus } from '../../mockLauncherState';
import { LAUNCHER_HOME_CONSTANTS } from '../constants';

export const useServerStatus = () => {
  const [serverStatus, setServerStatus] = useState<ServerStatus | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [ipCopied, setIpCopied] = useState(false);

  useEffect(() => {
    let ignore = false;
    const loadStatus = async () => {
      setIsLoadingStatus(true);
      try {
        const status = await fetchServerStatus(LAUNCHER_HOME_CONSTANTS.SERVER_IP);
        if (!ignore) setServerStatus(status);
      } finally {
        if (!ignore) setIsLoadingStatus(false);
      }
    };

    loadStatus();
    return () => {
      ignore = true;
    };
  }, []);

  const handleCopyIp = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(LAUNCHER_HOME_CONSTANTS.SERVER_IP);
      setIpCopied(true);
      setTimeout(() => setIpCopied(false), 1600);
    } catch {
      // Clipboard unavailable
    }
  }, []);

  return {
    serverStatus,
    isLoadingStatus,
    ipCopied,
    handleCopyIp,
  };
};
