/// <reference types="vite/client" />

declare module "morphicons/react" {
  import React from "react";
  export interface MorphIconProps {
    icon: unknown;
    size?: number | string;
    color?: string;
    strokeWidth?: number;
    style?: React.CSSProperties;
    className?: string;
  }
  export const MorphIcon: React.FC<MorphIconProps>;
}

declare module "lucide" {
  export * from "lucide-react";
}

declare module "@tauri-apps/plugin-updater" {
  export type DownloadEvent =
    | { event: "Started"; data: { contentLength?: number } }
    | { event: "Progress"; data: { chunkLength: number } }
    | { event: "Finished"; data?: Record<string, unknown> };

  export interface Update {
    version: string;
    currentVersion: string;
    body?: string;
    date?: string;
    downloadAndInstall: (onProgress?: (event: DownloadEvent) => void) => Promise<void>;
  }
  export function check(): Promise<Update | null>;
}

declare module "@tauri-apps/plugin-process" {
  export function relaunch(): Promise<void>;
  export function exit(code?: number): Promise<void>;
}

