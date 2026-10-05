import { useState, useRef, useEffect } from 'react';
import type { User, UserIdentity } from '@supabase/supabase-js';
import { supabase } from '../services/supabaseClient';
import type { ToastType } from '../components/UI/Toast';
import {
  useGenerateLinkCode,
  useVerifyLinkCode,
  useUnlinkAccount,
  useLinkMicrosoftAccount,
  useLinkStatus,
} from './useAccountData';

export function useAccountConnections(user: User | null) {
  const mcUUID = user?.user_metadata?.minecraft_uuid;
  const [linkCode, setLinkCode] = useState<string | null>(null);
  const { data: linkStatus } = useLinkStatus(user?.id, !!linkCode && !mcUUID);

  const { mutate: generateCode, isPending: linkLoading } = useGenerateLinkCode();
  const { mutate: verifyCode, isPending: isVerifyingMutation } = useVerifyLinkCode();
  const { mutate: unlinkAccount, isPending: isUnlinking } = useUnlinkAccount();
  const { mutate: linkMicrosoft } = useLinkMicrosoftAccount();

  const [isUnlinkModalOpen, setIsUnlinkModalOpen] = useState(false);
  const identityToUnlinkRef = useRef<UserIdentity | null>(null);
  const unlinkTargetRef = useRef<'provider' | 'minecraft' | 'discord' | null>(null);

  const [manualCode, setManualCode] = useState('');
  const [discordManualCode, setDiscordManualCode] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [toast, setToast] = useState<{ visible: boolean; message: string; type: ToastType }>({
    visible: false,
    message: '',
    type: 'info',
  });

  const showToast = (message: string, type: ToastType = 'info') => {
    setToast({ visible: true, message, type });
  };

  const handleLinkMicrosoft = ({ uuid, nick }: { uuid: string; nick: string }) => {
    linkMicrosoft(
      { uuid, nick },
      {
        onSuccess: () => {
          supabase.auth.refreshSession();
          setShowSuccessModal(true);
        },
        onError: (err: Error) =>
          showToast(err.message || 'Error al vincular cuenta de Microsoft', 'error'),
      },
    );
  };

  // Popup OAuth redirect handler
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code && window.opener && window.opener !== window) {
      window.opener.postMessage({ type: 'MS_AUTH_CODE', code }, window.location.origin);
      window.close();
    }
  }, []);

  // Sync session on link success
  useEffect(() => {
    if (linkStatus?.linked) {
      supabase.auth.refreshSession().then(() => setShowSuccessModal(true));
    }
  }, [linkStatus?.linked]);

  const handleGenerateCode = () => {
    if (!user) return;
    generateCode(user.id, {
      onSuccess: (code) => setLinkCode(code),
      onError: (err: Error) => showToast(err.message || 'Error al generar código', 'error'),
    });
  };

  const handleVerifyManualCode = () => {
    if (!user || !manualCode.trim()) return;
    verifyCode(
      { userId: user.id, code: manualCode.trim().toUpperCase() },
      {
        onSuccess: () => {
          supabase.auth.refreshSession();
          setShowSuccessModal(true);
        },
        onError: (err: Error) => showToast(err.message, 'error'),
      },
    );
  };

  const handleVerifyDiscordCode = () => {
    if (!user || !discordManualCode.trim()) return;
    verifyCode(
      { userId: user.id, code: discordManualCode.trim().toUpperCase() },
      {
        onSuccess: () => {
          supabase.auth.refreshSession();
          setShowSuccessModal(true);
        },
        onError: (err: Error) => showToast(err.message, 'error'),
      },
    );
  };

  const handleUnlinkProvider = (identity: UserIdentity) => {
    identityToUnlinkRef.current = identity;
    unlinkTargetRef.current = 'provider';
    setIsUnlinkModalOpen(true);
  };

  const handleUnlinkMinecraft = () => {
    unlinkTargetRef.current = 'minecraft';
    setIsUnlinkModalOpen(true);
  };

  const handleUnlinkDiscord = () => {
    unlinkTargetRef.current = 'discord';
    setIsUnlinkModalOpen(true);
  };

  const confirmUnlink = () => {
    const target = unlinkTargetRef.current;
    if (!target) return;
    unlinkAccount(
      { target, identity: identityToUnlinkRef.current || undefined },
      {
        onSuccess: () => {
          showToast('Cambios guardados correctamente', 'success');
          setIsUnlinkModalOpen(false);
          identityToUnlinkRef.current = null;
          unlinkTargetRef.current = null;
        },
        onError: (err: Error) => {
          showToast(err.message || 'Error al desvincular', 'error');
          setIsUnlinkModalOpen(false);
        },
      },
    );
  };

  return {
    linkCode: linkStatus?.linked ? null : linkCode,
    linkLoading,
    handleGenerateCode,
    manualCode,
    setManualCode,
    handleVerifyManualCode,
    isVerifyingMutation,
    discordManualCode,
    setDiscordManualCode,
    handleVerifyDiscordCode,
    handleLinkMicrosoft,
    handleUnlinkProvider,
    handleUnlinkMinecraft,
    handleUnlinkDiscord,
    isUnlinkModalOpen,
    setIsUnlinkModalOpen,
    confirmUnlink,
    isUnlinking,
    showSuccessModal,
    setShowSuccessModal,
    toast,
    setToast,
    showToast,
  };
}
