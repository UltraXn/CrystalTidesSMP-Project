import { invoke } from "@tauri-apps/api/core";

export interface ServerStatus {
  online: boolean;
  playersOnline: number | null;
  playersMax: number | null;
}

const isSafeHost = (host: string): boolean => {
  if (!host || typeof host !== 'string') return false;
  const trimmed = host.trim().toLowerCase();
  if (
    trimmed === 'localhost' ||
    trimmed === '127.0.0.1' ||
    trimmed === '0.0.0.0' ||
    trimmed === '169.254.169.254' ||
    trimmed.startsWith('10.') ||
    trimmed.startsWith('192.168.') ||
    trimmed.startsWith('172.16.')
  ) {
    return false;
  }
  return /^[a-zA-Z0-9.-]+$/.test(trimmed);
};

export const fetchServerStatus = async (
  host: string,
  port = 25565
): Promise<ServerStatus | null> => {
  if (!isSafeHost(host)) {
    console.warn('Unsafe host supplied to fetchServerStatus:', host);
    return null;
  }

  try {
    const hostPart = port === 25565 ? host.trim() : `${host.trim()}:${port}`;
    const url = `https://api.mcstatus.io/v2/status/java/${encodeURIComponent(hostPart)}`;

    const responseText: string = await invoke("http_get", {
      url,
      headers: {},
    });

    const body = JSON.parse(responseText);
    const online = body.online === true;

    let playersOnline: number | null = null;
    let playersMax: number | null = null;
    if (body.players && typeof body.players === "object") {
      if (typeof body.players.online === "number") playersOnline = body.players.online;
      if (typeof body.players.max === "number") playersMax = body.players.max;
    }

    return { online, playersOnline, playersMax };
  } catch (err) {
    console.warn("Could not fetch server status:", err);
    return null;
  }
};
