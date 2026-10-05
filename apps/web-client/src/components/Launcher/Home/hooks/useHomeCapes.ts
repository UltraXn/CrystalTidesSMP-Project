import { useState, useEffect, useCallback } from 'react';
import type { UserSession, MinecraftCape } from '../../mockLauncherState';
import { fetchMinecraftProfile, hideCape, setActiveCape } from '../../mockLauncherState';
import { LAUNCHER_HOME_CONSTANTS } from '../constants';

export const useHomeCapes = (currentSession: UserSession | null) => {
  const [activeCapeUrl, setActiveCapeUrl] = useState<string | undefined>(undefined);
  const [userCapes, setUserCapes] = useState<MinecraftCape[]>([]);
  const [selectedCapeIndex, setSelectedCapeIndex] = useState<number>(-1);
  const [isEquippingCape, setIsEquippingCape] = useState(false);

  useEffect(() => {
    let ignore = false;
    const loadProfileAndCapes = async () => {
      if (
        currentSession?.type === LAUNCHER_HOME_CONSTANTS.SESSION_MICROSOFT &&
        currentSession.accessToken
      ) {
        try {
          const profile = await fetchMinecraftProfile(currentSession.accessToken);
          if (!ignore && profile && profile.capes) {
            const capes = profile.capes || [];
            setUserCapes(capes);

            const activeIndex = capes.findIndex(
              (c) => c.state === LAUNCHER_HOME_CONSTANTS.ACTIVE_STATE,
            );
            if (activeIndex !== -1) {
              setSelectedCapeIndex(activeIndex);
              setActiveCapeUrl(capes[activeIndex].url || undefined);
            } else {
              setSelectedCapeIndex(-1);
              setActiveCapeUrl(undefined);
            }
          }
        } catch (err) {
          console.error('Error loading profile capes:', err);
        }
      } else if (!ignore) {
        setUserCapes([]);
        setSelectedCapeIndex(-1);
        setActiveCapeUrl(undefined);
      }
    };

    loadProfileAndCapes();
    return () => {
      ignore = true;
    };
  }, [currentSession]);

  const handlePrevCape = useCallback(() => {
    if (userCapes.length === 0) return;
    const nextIndex = selectedCapeIndex - 1 < -1 ? userCapes.length - 1 : selectedCapeIndex - 1;
    setSelectedCapeIndex(nextIndex);
    setActiveCapeUrl(nextIndex === -1 ? undefined : userCapes[nextIndex]?.url || undefined);
  }, [selectedCapeIndex, userCapes]);

  const handleNextCape = useCallback(() => {
    if (userCapes.length === 0) return;
    const nextIndex = selectedCapeIndex + 1 >= userCapes.length ? -1 : selectedCapeIndex + 1;
    setSelectedCapeIndex(nextIndex);
    setActiveCapeUrl(nextIndex === -1 ? undefined : userCapes[nextIndex]?.url || undefined);
  }, [selectedCapeIndex, userCapes]);

  const handleToggleCape = useCallback(async () => {
    if (!currentSession?.accessToken) return;
    setIsEquippingCape(true);
    try {
      if (selectedCapeIndex === -1) {
        await hideCape(currentSession.accessToken);
        setUserCapes((prev) =>
          prev.map((c) => ({ ...c, state: LAUNCHER_HOME_CONSTANTS.INACTIVE_STATE })),
        );
        return;
      }
      const targetCape = userCapes[selectedCapeIndex];
      if (targetCape && targetCape.id) {
        await setActiveCape(currentSession.accessToken, targetCape.id);
        setUserCapes((prev) =>
          prev.map((c, idx) => ({
            ...c,
            state:
              idx === selectedCapeIndex
                ? LAUNCHER_HOME_CONSTANTS.ACTIVE_STATE
                : LAUNCHER_HOME_CONSTANTS.INACTIVE_STATE,
          })),
        );
      }
    } catch (err) {
      console.error('Failed to change cape state:', err);
    } finally {
      setIsEquippingCape(false);
    }
  }, [currentSession, selectedCapeIndex, userCapes]);

  return {
    activeCapeUrl,
    userCapes,
    selectedCapeIndex,
    isEquippingCape,
    handlePrevCape,
    handleNextCape,
    handleToggleCape,
  };
};
