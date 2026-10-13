import { useState } from 'react';
import { useAuth } from '../mockLauncherState';

export function useCrystalLink() {
  const { crystalSession, loginCrystal, logoutCrystal } = useAuth();
  const [crystalEmail, setCrystalEmail] = useState('');
  const [crystalPassword, setCrystalPassword] = useState('');
  const [isLinking, setIsLinking] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);

  const handleLinkCrystal = async (e?: React.SyntheticEvent) => {
    if (e) e.preventDefault();
    const cleanEmail = crystalEmail.trim();
    const cleanPassword = crystalPassword.trim();
    if (!cleanEmail || !cleanPassword) {
      setLinkError('Por favor ingresa tu correo electrónico y tu contraseña de la web.');
      return;
    }
    setIsLinking(true);
    setLinkError(null);
    try {
      await loginCrystal(cleanEmail, cleanPassword);
      setCrystalEmail('');
      setCrystalPassword('');
    } catch (err: unknown) {
      console.error('Crystal login error:', err);
      const msg = err instanceof Error ? err.message : String(err);
      setLinkError(msg || 'Credenciales incorrectas o error al conectar.');
    } finally {
      setIsLinking(false);
    }
  };

  return {
    crystalSession,
    logoutCrystal,
    crystalEmail,
    setCrystalEmail,
    crystalPassword,
    setCrystalPassword,
    isLinking,
    linkError,
    handleLinkCrystal,
  };
}
