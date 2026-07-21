import { invoke } from "@tauri-apps/api/core";

export interface ServerStatus {
  online: boolean;
  playersOnline: number | null;
  playersMax: number | null;
}

export const fetchServerStatus = async (
  host: string,
  port = 25565
): Promise<ServerStatus | null> => {
  try {
    const hostPart = port === 25565 ? host : `${host}:${port}`;
    const url = `https://api.mcstatus.io/v2/status/java/${hostPart}`;

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
