import { supabase } from "./supabaseClient";

const API_URL = import.meta.env.VITE_API_URL || '/api';
const MS_CLIENT_ID = "3974b918-cd84-4d60-8955-2ad65234d16b";

export interface MicrosoftDeviceCode {
  user_code: string;
  device_code: string;
  verification_uri: string;
  interval: number;
  expires_in: number;
  isLive?: boolean;
}

export interface MinecraftProfile {
  id: string;
  name: string;
  skins?: Array<{ id: string; state: string; url: string; variant: string }>;
  capes?: Array<{ id: string; state: string; url: string; alias: string }>;
}

export const getRedirectUri = (): string => {
  return `${window.location.origin}/ms-callback.html`;
};

export const openMicrosoftOAuthPopup = (): Window | null => {
  const redirectUri = encodeURIComponent(getRedirectUri());
  const scope = encodeURIComponent("XboxLive.SignIn XboxLive.offline_access");
  const authUrl = `https://login.microsoftonline.com/consumers/oauth2/v2.0/authorize?client_id=${MS_CLIENT_ID}&response_type=code&redirect_uri=${redirectUri}&scope=${scope}&prompt=select_account`;

  const width = 520;
  const height = 650;
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2;

  return window.open(
    authUrl,
    "MicrosoftLoginPopup",
    `width=${width},height=${height},top=${top},left=${left},status=no,resizable=yes,scrollbars=yes`
  );
};

export const exchangeMicrosoftAuthCode = async (code: string): Promise<MinecraftProfile> => {
  const session = (await supabase.auth.getSession()).data.session;
  const res = await fetch(`${API_URL}/minecraft/link/ms-callback`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session?.access_token}`,
    },
    body: JSON.stringify({ code, redirectUri: getRedirectUri() }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Error al completar la autenticación con Microsoft");
  }
  const data = await res.json();
  if (!data.success || !data.profile) {
    throw new Error(data.error || "Error al completar la autenticación con Microsoft");
  }

  return data.profile;
};

export const formatUuidWithHyphens = (rawUuid: string): string => {
  if (rawUuid.length !== 32) return rawUuid;
  return `${rawUuid.slice(0, 8)}-${rawUuid.slice(8, 12)}-${rawUuid.slice(12, 16)}-${rawUuid.slice(16, 20)}-${rawUuid.slice(20)}`;
};
