import { supabase } from "./supabaseClient";

export interface Friend {
  id: string;
  username: string;
  avatar: string;
  status: "online" | "launcher" | "menu" | "idle" | "offline";
  activityServer?: string;
  lastSeen?: string;
  isFavorite?: boolean;
  hasUnreadMessage?: boolean;
}

export interface FriendRequest {
  id: string;
  username: string;
  avatar: string;
  type: "incoming" | "outgoing";
  sentAt: string;
}

const STORAGE_FRIENDS_KEY = "crystaltides_launcher_friends_v2";
const STORAGE_REQUESTS_KEY = "crystaltides_launcher_friend_requests_v2";

const INITIAL_FIGMA_FRIENDS: Friend[] = [
  { id: "f1", username: "172px", avatar: "https://mc-heads.net/avatar/172px/64", status: "online", activityServer: "In-game: Hypixel 🏆" },
  { id: "f2", username: "daaaavidds", avatar: "https://mc-heads.net/avatar/daaaavidds/64", status: "online", activityServer: "In-game: Singleplayer" },
  { id: "f3", username: "masaya46", avatar: "https://mc-heads.net/avatar/masaya46/64", status: "online", activityServer: "In-game: Private Server" },
  { id: "f4", username: "3wafyy", avatar: "https://mc-heads.net/avatar/3wafyy/64", status: "launcher", activityServer: "In Launcher" },
  { id: "f5", username: "cuvsa", avatar: "https://mc-heads.net/avatar/cuvsa/64", status: "online", activityServer: "In-game: Donut SMP 🍩" },
  { id: "f6", username: "zakhbear", avatar: "https://mc-heads.net/avatar/zakhbear/64", status: "menu", activityServer: "In Menus" },
  { id: "f7", username: "kingofHalo04", avatar: "https://mc-heads.net/avatar/kingofHalo04/64", status: "idle", activityServer: "Idle" },
  { id: "f8", username: "meegreyone", avatar: "https://mc-heads.net/avatar/meegreyone/64", status: "idle", activityServer: "Idle" },
  { id: "f9", username: "XerxerBro", avatar: "https://mc-heads.net/avatar/XerxerBro/64", status: "offline", lastSeen: "Offline for 3 days" },
  { id: "f10", username: "2fishbowl", avatar: "https://mc-heads.net/avatar/2fishbowl/64", status: "offline", lastSeen: "Offline for 21 hours" },
  { id: "f11", username: "Aethelgard", avatar: "https://mc-heads.net/avatar/Aethelgard/64", status: "offline", lastSeen: "Offline for 5 days" },
  { id: "f12", username: "ShadowK", avatar: "https://mc-heads.net/avatar/ShadowK/64", status: "offline", lastSeen: "Offline for 1 week" },
];

export const getFriends = (): Friend[] => {
  const data = localStorage.getItem(STORAGE_FRIENDS_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_FRIENDS_KEY, JSON.stringify(INITIAL_FIGMA_FRIENDS));
    return INITIAL_FIGMA_FRIENDS;
  }
  try {
    const parsed: Friend[] = JSON.parse(data);
    if (parsed.length === 0) {
      localStorage.setItem(STORAGE_FRIENDS_KEY, JSON.stringify(INITIAL_FIGMA_FRIENDS));
      return INITIAL_FIGMA_FRIENDS;
    }
    return parsed;
  } catch {
    return INITIAL_FIGMA_FRIENDS;
  }
};

export const getFriendRequests = (): FriendRequest[] => {
  const data = localStorage.getItem(STORAGE_REQUESTS_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_REQUESTS_KEY, JSON.stringify([]));
    return [];
  }
  try {
    const parsed: FriendRequest[] = JSON.parse(data);
    const filtered = parsed.filter(
      (r) => !["req1", "req2"].includes(r.id)
    );
    return filtered;
  } catch {
    return [];
  }
};

export const sendFriendRequest = async (
  username: string
): Promise<{ success: boolean; message: string }> => {
  const cleanName = username.trim();
  if (!cleanName) {
    return { success: false, message: "Por favor ingresa un nombre de usuario válido." };
  }

  const friends = getFriends();
  if (friends.some((f) => f.username.toLowerCase() === cleanName.toLowerCase())) {
    return { success: false, message: `${cleanName} ya está en tu lista de amigos.` };
  }

  const requests = getFriendRequests();
  if (requests.some((r) => r.username.toLowerCase() === cleanName.toLowerCase())) {
    return { success: false, message: `Ya existe una solicitud pendiente con ${cleanName}.` };
  }

  // Opcional: verificar si existe perfil en Supabase
  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, username, avatar_url")
      .ilike("username", cleanName)
      .maybeSingle();

    const avatar = profile?.avatar_url || `https://mc-heads.net/avatar/${cleanName}/64`;

    const newReq: FriendRequest = {
      id: `req-${Date.now()}`,
      username: cleanName,
      avatar,
      type: "outgoing",
      sentAt: "Just now",
    };

    const updated = [newReq, ...requests];
    localStorage.setItem(STORAGE_REQUESTS_KEY, JSON.stringify(updated));
    return { success: true, message: `Solicitud de amistad enviada a ${cleanName}!` };
  } catch {
    const newReq: FriendRequest = {
      id: `req-${Date.now()}`,
      username: cleanName,
      avatar: `https://mc-heads.net/avatar/${cleanName}/64`,
      type: "outgoing",
      sentAt: "Just now",
    };

    const updated = [newReq, ...requests];
    localStorage.setItem(STORAGE_REQUESTS_KEY, JSON.stringify(updated));
    return { success: true, message: `Solicitud enviada a ${cleanName}!` };
  }
};

export const acceptFriendRequest = (requestId: string): Friend | null => {
  const requests = getFriendRequests();
  const req = requests.find((r) => r.id === requestId);
  if (!req) return null;

  const newFriend: Friend = {
    id: `friend-${Date.now()}`,
    username: req.username,
    avatar: req.avatar,
    status: "online",
    activityServer: "CrystalTides SMP",
    isFavorite: false,
  };

  const updatedFriends = [newFriend, ...getFriends()];
  const updatedRequests = requests.filter((r) => r.id !== requestId);

  localStorage.setItem(STORAGE_FRIENDS_KEY, JSON.stringify(updatedFriends));
  localStorage.setItem(STORAGE_REQUESTS_KEY, JSON.stringify(updatedRequests));

  return newFriend;
};

export const rejectFriendRequest = (requestId: string): void => {
  const requests = getFriendRequests();
  const updatedRequests = requests.filter((r) => r.id !== requestId);
  localStorage.setItem(STORAGE_REQUESTS_KEY, JSON.stringify(updatedRequests));
};

export const removeFriend = (friendId: string): void => {
  const friends = getFriends();
  const updated = friends.filter((f) => f.id !== friendId && f.username !== friendId);
  localStorage.setItem(STORAGE_FRIENDS_KEY, JSON.stringify(updated));
};

export const toggleFavoriteFriend = (friendId: string): void => {
  const friends = getFriends();
  const updated = friends.map((f) =>
    f.id === friendId || f.username === friendId
      ? { ...f, isFavorite: !f.isFavorite }
      : f
  );
  localStorage.setItem(STORAGE_FRIENDS_KEY, JSON.stringify(updated));
};
