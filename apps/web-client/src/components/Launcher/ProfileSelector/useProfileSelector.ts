import { useState, useEffect, useRef } from 'react';
import type { Profile } from '../mockLauncherState';
import {
  getProfiles,
  getActiveProfile,
  setSelectedProfileId,
  cloneProfile,
  deleteProfile,
} from '../mockLauncherState';

export function useProfileSelector(onProfileChanged?: () => void) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadData = () => {
    const list = getProfiles();
    const active = getActiveProfile();
    setProfiles(list);
    setActiveProfile(active);
  };

  useEffect(() => {
    loadData();

    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSelect = (profileId: string) => {
    setSelectedProfileId(profileId);
    loadData();
    setIsOpen(false);
    onProfileChanged?.();
  };

  const handleClone = (e: React.MouseEvent, profileId: string) => {
    e.stopPropagation();
    try {
      cloneProfile(profileId);
      loadData();
      onProfileChanged?.();
    } catch (err: unknown) {
      alert(`Error al clonar el perfil: ${(err as Error).message || err}`);
    }
  };

  const handleDelete = (e: React.MouseEvent, profileId: string) => {
    e.stopPropagation();
    if (confirm('¿Estás seguro de que deseas eliminar este perfil?')) {
      try {
        deleteProfile(profileId);
        loadData();
        onProfileChanged?.();
      } catch (err: unknown) {
        alert((err as Error).message || 'Error al eliminar el perfil');
      }
    }
  };

  return {
    profiles,
    activeProfile,
    isOpen,
    setIsOpen,
    dropdownRef,
    handleSelect,
    handleClone,
    handleDelete,
  };
}
