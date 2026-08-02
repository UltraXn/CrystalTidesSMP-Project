import { check, Update, DownloadEvent } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";

export interface UpdateInfo {
  available: boolean;
  version?: string;
  notes?: string;
  updateObj?: Update;
}

export const checkForAppUpdates = async (): Promise<UpdateInfo> => {
  try {
    const update = await check();
    if (update) {
      return {
        available: true,
        version: update.version,
        notes: update.body ?? undefined,
        updateObj: update,
      };
    }
    return { available: false };
  } catch (err) {
    console.warn("Auto-updater check skipped or unavailable in dev mode:", err);
    return { available: false };
  }
};

export const downloadAndApplyUpdate = async (
  update: Update,
  onProgress?: (downloaded: number, total: number | undefined) => void
): Promise<void> => {
  let downloadedBytes = 0;
  await update.downloadAndInstall((event: DownloadEvent) => {
    switch (event.event) {
      case "Started":
        if (event.data.contentLength) {
          onProgress?.(0, event.data.contentLength);
        }
        break;
      case "Progress":
        downloadedBytes += event.data.chunkLength;
        onProgress?.(downloadedBytes, undefined);
        break;
      case "Finished":
        onProgress?.(100, 100);
        break;
    }
  });

  await relaunch();
};
