import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  use2FAStatus,
  useSetup2FA,
  useEnable2FA,
  useDisable2FA,
} from '../../../hooks/useAccountData';

export interface UseTwoFactorAuthOptions {
  mockEnabled?: boolean;
  mockLoading?: boolean;
  mockSetupData?: { secret: string; qrCode: string } | null;
  onSetup?: () => Promise<{
    success: boolean;
    data?: { secret: string; qrCode: string };
    error?: string;
  }>;
  onEnable?: (token: string, secret: string) => Promise<{ success: boolean; error?: string }>;
  onDisable?: () => Promise<{ success: boolean; error?: string }>;
}

export function useTwoFactorAuth({
  mockEnabled,
  mockLoading,
  mockSetupData,
  onSetup,
  onEnable,
  onDisable,
}: UseTwoFactorAuthOptions = {}) {
  const { t } = useTranslation();

  const { data: statusData, isLoading: loadingStatus } = use2FAStatus();
  const { mutate: setup2FAMutation, isPending: isSettingUp } = useSetup2FA();
  const { mutate: enable2FAMutation, isPending: isVerifying } = useEnable2FA();
  const { mutate: disable2FAMutation, isPending: isDisabling } = useDisable2FA();

  const [setupData, setSetupData] = useState<{ secret: string; qrCode: string } | null>(
    mockSetupData ?? null,
  );
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isActuallyEnabled = statusData?.enabled ?? false;
  const enabled = mockEnabled ?? isActuallyEnabled;
  const loading = mockLoading ?? (loadingStatus || isSettingUp || isDisabling);
  const confirming = isVerifying;

  const handleSetup = async () => {
    setError('');
    if (onSetup) {
      try {
        const res = await onSetup();
        if (res.success && res.data) setSetupData(res.data);
        else setError(res.error || 'Failed');
      } catch {
        setError('Error');
      }
      return;
    }

    setup2FAMutation(undefined, {
      onSuccess: (data) => setSetupData(data),
      onError: (err: Error) => setError(err.message),
    });
  };

  const handleEnable = async () => {
    if (!setupData) return;
    setError('');

    if (onEnable) {
      try {
        const res = await onEnable(token, setupData.secret);
        if (res.success) {
          setSetupData(null);
          setSuccess(t('account.security.2fa_enabled', '2FA Enabled Successfully!'));
        } else setError(res.error || 'Invalid code');
      } catch {
        setError('Error');
      }
      return;
    }

    enable2FAMutation(
      { token, secret: setupData.secret },
      {
        onSuccess: () => {
          setSetupData(null);
          setToken('');
          setSuccess(t('account.security.2fa_enabled', '2FA Enabled Successfully!'));
        },
        onError: (err: Error) => setError(err.message),
      },
    );
  };

  const handleDisable = async () => {
    if (
      !confirm(t('account.security.2fa_disable_confirm', 'Are you sure you want to disable 2FA?'))
    )
      return;
    setError('');

    if (onDisable) {
      try {
        const res = await onDisable();
        if (res.success) {
          setSuccess(t('account.security.2fa_disabled', '2FA Disabled'));
        } else setError(res.error || 'Failed');
      } catch {
        setError('Error');
      }
      return;
    }

    disable2FAMutation(undefined, {
      onSuccess: () => {
        setSuccess(t('account.security.2fa_disabled', '2FA Disabled'));
      },
      onError: (err: Error) => setError(err.message),
    });
  };

  return {
    enabled,
    loading,
    confirming,
    setupData,
    token,
    setToken,
    error,
    success,
    setSuccess,
    handleSetup,
    handleEnable,
    handleDisable,
  };
}
