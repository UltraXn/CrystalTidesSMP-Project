import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";

export interface MicrosoftDeviceCode {
  user_code: string;
  device_code: string;
  verification_uri: string;
  interval: number;
  expires_in: number;
}

export interface MicrosoftAuthResult {
  username: string;
  uuid: string;
  accessToken: string;
  refreshToken?: string;
}

const CLIENT_ID = "000000004C12AE6F";
const SCOPE = "XboxLive.SignIn XboxLive.offline_access";

// Helper for POST requests through Rust proxy
const proxyPost = async (url: string, headers: Record<string, string>, body: string): Promise<any> => {
  const responseText: string = await invoke("http_post", { url, headers, body });
  try {
    return JSON.parse(responseText);
  } catch {
    return responseText;
  }
};

// Helper for GET requests through Rust proxy
const proxyGet = async (url: string, headers: Record<string, string>): Promise<any> => {
  const responseText: string = await invoke("http_get", { url, headers });
  try {
    return JSON.parse(responseText);
  } catch {
    return responseText;
  }
};

// Helper for PUT requests through Rust proxy
const proxyPut = async (url: string, headers: Record<string, string>, body: string): Promise<any> => {
  const responseText: string = await invoke("http_put", { url, headers, body });
  try {
    return JSON.parse(responseText);
  } catch {
    return responseText;
  }
};

// Helper for DELETE requests through Rust proxy
const proxyDelete = async (url: string, headers: Record<string, string>): Promise<any> => {
  const responseText: string = await invoke("http_delete", { url, headers });
  try {
    return JSON.parse(responseText);
  } catch {
    return responseText;
  }
};

export const requestDeviceCode = async (): Promise<MicrosoftDeviceCode> => {
  const body = `client_id=${CLIENT_ID}&scope=${encodeURIComponent(SCOPE)}`;
  const res = await proxyPost(
    "https://login.microsoftonline.com/consumers/oauth2/v2.0/devicecode",
    { "Content-Type": "application/x-www-form-urlencoded" },
    body
  );
  if (res.error) throw new Error(res.error_description || res.error);
  return res;
};

export const pollMicrosoftToken = async (
  deviceCode: string,
  interval: number,
  expiresIn: number,
  onStatus?: (msg: string) => void
): Promise<MicrosoftAuthResult> => {
  const body = `client_id=${CLIENT_ID}&grant_type=urn:ietf:params:oauth:grant-type:device_code&device_code=${deviceCode}`;
  const deadline = Date.now() + expiresIn * 1000;
  const pollIntervalMs = interval * 1000;

  while (Date.now() < deadline) {
    onStatus?.("Esperando autorización en Microsoft...");
    await new Promise((r) => setTimeout(r, pollIntervalMs));

    const res = await proxyPost(
      "https://login.microsoftonline.com/consumers/oauth2/v2.0/token",
      { "Content-Type": "application/x-www-form-urlencoded" },
      body
    );

    if (res.access_token) {
      onStatus?.("Autenticando con Xbox Live...");
      return completeMinecraftAuth(res.access_token, res.refresh_token, onStatus);
    }

    if (res.error) {
      if (res.error === "authorization_pending") continue;
      if (res.error === "slow_down") {
        await new Promise((r) => setTimeout(r, 5000));
        continue;
      }
      if (res.error === "expired_token") {
        throw new Error("El código de verificación expiró. Inténtalo de nuevo.");
      }
      throw new Error(res.error_description || res.error);
    }
  }

  throw new Error("Tiempo de espera agotado para la autenticación.");
};

export const refreshMicrosoftSession = async (
  refreshToken: string,
  onStatus?: (msg: string) => void
): Promise<MicrosoftAuthResult> => {
  onStatus?.("Renovando token de Microsoft...");
  const body = `client_id=${CLIENT_ID}&scope=${encodeURIComponent(SCOPE)}&grant_type=refresh_token&refresh_token=${refreshToken}`;
  
  const res = await proxyPost(
    "https://login.microsoftonline.com/consumers/oauth2/v2.0/token",
    { "Content-Type": "application/x-www-form-urlencoded" },
    body
  );

  if (res.error) {
    throw new Error(`Error al renovar token: ${res.error_description || res.error}`);
  }

  onStatus?.("Autenticando con Xbox Live...");
  return completeMinecraftAuth(res.access_token, res.refresh_token || refreshToken, onStatus);
};

const debugLog = (msg: string, isError = false) => {
  if (isError) {
    console.error(msg);
    invoke("log_frontend", { msg: `[Error] ${msg}` }).catch(() => {});
  }
};

const completeMinecraftAuth = async (
  msAccessToken: string,
  refreshToken: string,
  onStatus?: (msg: string) => void
): Promise<MicrosoftAuthResult> => {
  debugLog("[MS Auth] completeMinecraftAuth step 1: Xbox Live Authenticate...");
  // 1. Xbox Live Authenticate
  const xblRes = await proxyPost(
    "https://user.auth.xboxlive.com/user/authenticate",
    {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    JSON.stringify({
      Properties: {
        AuthMethod: "RPS",
        SiteName: "user.auth.xboxlive.com",
        RpsTicket: `d=${msAccessToken}`,
      },
      RelyingParty: "http://auth.xboxlive.com",
      TokenType: "JWT",
    })
  );
  debugLog("[MS Auth] Step 1 response: " + JSON.stringify(xblRes));

  if (!xblRes.Token) {
    debugLog("[MS Auth] Step 1 failed, missing Token", true);
    throw new Error(`Error de Xbox Live: ${JSON.stringify(xblRes)}`);
  }

  const xblToken = xblRes.Token;
  const uhs = xblRes.DisplayClaims?.xui?.[0]?.uhs;
  if (!uhs) {
    debugLog("[MS Auth] Step 1 failed, missing uhs claim", true);
    throw new Error("No se pudo obtener el claim de usuario de Xbox.");
  }

  // 2. XSTS Authorize
  onStatus?.("Obteniendo token de Minecraft...");
  debugLog("[MS Auth] completeMinecraftAuth step 2: XSTS Authorize...");
  const xstsRes = await proxyPost(
    "https://xsts.auth.xboxlive.com/xsts/authorize",
    {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    JSON.stringify({
      Properties: {
        SandboxId: "RETAIL",
        UserTokens: [xblToken],
      },
      RelyingParty: "rp://api.minecraftservices.com/",
      TokenType: "JWT",
    })
  );
  debugLog("[MS Auth] Step 2 response: " + JSON.stringify(xstsRes));

  if (xstsRes.XErr) {
    const errCode = xstsRes.XErr.toString();
    debugLog("[MS Auth] Step 2 failed with XErr: " + errCode, true);
    if (errCode === "2148916233") throw new Error("Esta cuenta no tiene comprado Minecraft Java Edition.");
    if (errCode === "2148916238") {
      throw new Error(
        "La cuenta Xbox necesita configuración adicional (perfil Xbox / edad). " +
        "Entra en xbox.com, crea un gamertag e inténtalo de nuevo."
      );
    }
    throw new Error(`Error de Xbox (XSTS): ${JSON.stringify(xstsRes)}`);
  }

  const xstsToken = xstsRes.Token;

  // 3. Login with Xbox
  debugLog("[MS Auth] completeMinecraftAuth step 3: Login with Xbox...");
  const mcRes = await proxyPost(
    "https://api.minecraftservices.com/authentication/login_with_xbox",
    {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    JSON.stringify({
      identityToken: `XBL3.0 x=${uhs};${xstsToken}`,
    })
  );
  debugLog("[MS Auth] Step 3 response: " + JSON.stringify(mcRes));

  if (!mcRes.access_token) {
    debugLog("[MS Auth] Step 3 failed, missing Minecraft access token", true);
    throw new Error(`Error de inicio de sesión de Minecraft: ${JSON.stringify(mcRes)}`);
  }

  const mcAccessToken = mcRes.access_token;

  // 4. Get Minecraft Profile
  onStatus?.("Obteniendo perfil del jugador...");
  debugLog("[MS Auth] completeMinecraftAuth step 4: Get Minecraft Profile...");
  const profileRes = await proxyGet(
    "https://api.minecraftservices.com/minecraft/profile",
    { Authorization: `Bearer ${mcAccessToken}` }
  );
  debugLog("[MS Auth] Step 4 response: " + JSON.stringify(profileRes));

  if (profileRes.error) {
    debugLog("[MS Auth] Step 4 failed, error: " + profileRes.error, true);
    if (profileRes.error === "NOT_FOUND") {
      throw new Error(
        "Esta cuenta Microsoft no tiene comprado Minecraft Java Edition. " +
        "Necesitas tener el juego en tu cuenta."
      );
    }
    throw new Error(`Error al obtener perfil: ${profileRes.errorMessage || JSON.stringify(profileRes)}`);
  }

  const rawUuid = profileRes.id;
  const formattedUuid = `${rawUuid.substring(0, 8)}-${rawUuid.substring(8, 12)}-${rawUuid.substring(12, 16)}-${rawUuid.substring(16, 20)}-${rawUuid.substring(20, 32)}`;

  return {
    username: profileRes.name,
    uuid: formattedUuid,
    accessToken: mcAccessToken,
    refreshToken,
  };
};

export const loginMicrosoftRedirect = async (
  onStatus?: (msg: string) => void
): Promise<MicrosoftAuthResult> => {
  debugLog("[MS Auth] Starting loginMicrosoftRedirect...");
  onStatus?.("Iniciando servidor de redirección local...");
  
  // 1. Start loopback server in Rust and get the assigned port
  const port = await invoke<number>("start_ms_oauth_server");
  debugLog("[MS Auth] Port received from Rust backend: " + port);

  const redirectUri = `http://localhost:${port}`;
  const authUrl = `https://login.microsoftonline.com/consumers/oauth2/v2.0/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(SCOPE)}&prompt=select_account`;
  
  onStatus?.("Abriendo ventana de inicio de sesión de Microsoft...");

  // 2. Wrap the event listening and window lifecycle in a promise
  const code = await new Promise<string>((resolve, reject) => {
    let unlistenSuccess: (() => void) | null = null;
    let unlistenFailed: (() => void) | null = null;
    let loginWindow: WebviewWindow | null = null;
    let isCleanedUp = false;

    const cleanUp = async () => {
      debugLog("[MS Auth] Running cleanUp...");
      if (isCleanedUp) return;
      isCleanedUp = true;
      if (unlistenSuccess) {
        debugLog("[MS Auth] Unsubscribing success listener");
        unlistenSuccess();
      }
      if (unlistenFailed) {
        debugLog("[MS Auth] Unsubscribing failed listener");
        unlistenFailed();
      }
      if (loginWindow) {
        try {
          debugLog("[MS Auth] Destroying login window...");
          await loginWindow.destroy();
        } catch (e) {
          debugLog("[MS Auth] Failed to destroy login window: " + e, true);
        }
      }
    };

    const setup = async () => {
      try {
        debugLog("[MS Auth] Registering event listeners...");
        // A. Listen for the code event from Rust
        unlistenSuccess = await listen<string>("oauth-code-received", async (event) => {
          debugLog("[MS Auth] Received 'oauth-code-received' event, payload: " + event.payload);
          await cleanUp();
          resolve(event.payload);
        });

        // B. Listen for the failure event from Rust (e.g. timeout)
        unlistenFailed = await listen<string>("oauth-code-failed", async (event) => {
          debugLog("[MS Auth] Received 'oauth-code-failed' event, payload: " + event.payload, true);
          await cleanUp();
          reject(new Error(event.payload));
        });

        debugLog("[MS Auth] Opening WebviewWindow pointing to: " + authUrl);
        // C. Open child WebviewWindow in Tauri
        loginWindow = new WebviewWindow("microsoft-login-window", {
          url: authUrl,
          title: "Iniciar sesión con Microsoft",
          width: 500,
          height: 650,
          resizable: false,
          maximizable: false,
          alwaysOnTop: true,
        });

        // D. Listen for window closure by the user
        await loginWindow.onCloseRequested(async () => {
          debugLog("[MS Auth] Window close requested by user");
          // Wait a tiny bit to check if cleanUp was already called by the success/fail events
          await new Promise((r) => setTimeout(r, 100));
          if (!isCleanedUp) {
            debugLog("[MS Auth] Window was closed before code was received. Cancelling flow...");
            await cleanUp();
            reject(new Error("El inicio de sesión fue cancelado por el usuario al cerrar la ventana."));
          }
        });
      } catch (windowErr) {
        debugLog("[MS Auth] Exception inside promise setup: " + windowErr, true);
        await cleanUp();
        reject(new Error(`No se pudo abrir la ventana de login: ${windowErr}`));
      }
    };

    setup();
  });

  debugLog("[MS Auth] Code received successfully: " + code);
  onStatus?.("Obteniendo tokens de Microsoft...");
  const tokenBody = `client_id=${CLIENT_ID}&grant_type=authorization_code&code=${code}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(SCOPE)}`;
  
  debugLog("[MS Auth] Fetching Microsoft tokens from OAuth endpoint...");
  const res = await proxyPost(
    "https://login.microsoftonline.com/consumers/oauth2/v2.0/token",
    { "Content-Type": "application/x-www-form-urlencoded" },
    tokenBody
  );
  debugLog("[MS Auth] Token endpoint response received: " + JSON.stringify(res));

  if (res.error) {
    debugLog("[MS Auth] Token endpoint returned error: " + (res.error_description || res.error), true);
    throw new Error(res.error_description || res.error);
  }

  onStatus?.("Autenticando con Xbox Live...");
  debugLog("[MS Auth] Completing Minecraft authentication steps...");
  const result = await completeMinecraftAuth(res.access_token, res.refresh_token, onStatus);
  debugLog("[MS Auth] Authentication completed successfully! Result: " + JSON.stringify(result));
  return result;
};

export interface MinecraftCape {
  id: string;
  state: "ACTIVE" | "INACTIVE";
  url: string;
  alias: string;
}

export interface MinecraftProfileResponse {
  id: string;
  name: string;
  skins: Array<{
    id: string;
    state: "ACTIVE" | "INACTIVE";
    url: string;
    variant: "CLASSIC" | "SLIM";
  }>;
  capes: MinecraftCape[];
}

export const fetchMinecraftProfile = async (accessToken: string): Promise<MinecraftProfileResponse> => {
  const profile = await proxyGet("https://api.minecraftservices.com/minecraft/profile", {
    Authorization: `Bearer ${accessToken}`,
  });
  console.log("[MS Auth] fetchMinecraftProfile response keys:", Object.keys(profile || {}), "JSON:", JSON.stringify(profile));
  
  let parsed = profile;
  if (typeof profile === "string") {
    try {
      parsed = JSON.parse(profile);
    } catch (e) {
      throw new Error(`La respuesta del perfil de Minecraft no es un JSON válido: ${profile}`);
    }
  }

  if (parsed && (parsed.error || parsed.errorMessage)) {
    throw new Error(parsed.errorMessage || parsed.error);
  }

  if (parsed && parsed.capes) {
    parsed.capes = parsed.capes.map((cape: any) => ({
      ...cape,
      url: cape.url ? cape.url.replace("http://", "https://") : "",
    }));
  }
  return parsed;
};

export const setActiveCape = async (accessToken: string, capeId: string): Promise<void> => {
  const res = await proxyPut(
    "https://api.minecraftservices.com/minecraft/profile/capes/active",
    {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    JSON.stringify({ capeId })
  );
  if (res && res.error) {
    throw new Error(res.errorMessage || res.error);
  }
};

export const hideCape = async (accessToken: string): Promise<void> => {
  const res = await proxyDelete("https://api.minecraftservices.com/minecraft/profile/capes/active", {
    Authorization: `Bearer ${accessToken}`,
  });
  if (res && res.error) {
    throw new Error(res.errorMessage || res.error);
  }
};
