export type NavSection =
  | "home"
  | "profiles"
  | "locker"
  | "notifications"
  | "chat"
  | "versions"
  | "gallery"
  | "servers"
  | "mods"
  | "store"
  | "rewards"
  | "stats"
  | "settings";

export type WallpaperMode = "day" | "night";

export type ConnectionStatus = "online" | "offline" | "reconnecting";

export interface FriendEntry {
  name: string;
  avatar: string;
  status: string;
  statusType: "online" | "launcher" | "menu" | "idle" | "offline";
  activityServer?: string;
  hasUnreadMessage?: boolean;
}

export interface ChatMessage {
  sender: "me" | "them";
  text: string;
  time: string;
}
