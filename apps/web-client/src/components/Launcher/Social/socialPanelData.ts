export interface FriendItem {
  id: string;
  name: string;
  avatar: string;
  status: 'in-game' | 'in-launcher' | 'in-menus' | 'idle' | 'offline';
  activity?: string;
  isFavorite?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'me' | 'them';
  text: string;
  time: string;
}

export const DEFAULT_FRIENDS: FriendItem[] = [
  {
    id: '1',
    name: '172px',
    avatar: 'https://mc-heads.net/avatar/172px/64',
    status: 'in-game',
    activity: 'CrystalTides SMP 👑',
    isFavorite: true,
  },
  {
    id: '2',
    name: 'daaaavidds',
    avatar: 'https://mc-heads.net/avatar/daaaavidds/64',
    status: 'in-game',
    activity: 'CrystalTides Survival',
    isFavorite: true,
  },
  {
    id: '3',
    name: 'masaya46',
    avatar: 'https://mc-heads.net/avatar/masaya46/64',
    status: 'in-game',
    activity: 'Dungeon Abyss',
  },
  {
    id: '4',
    name: '3wafyy',
    avatar: 'https://mc-heads.net/avatar/3wafyy/64',
    status: 'in-launcher',
    activity: 'En el Launcher',
  },
  {
    id: '5',
    name: 'cuvsa',
    avatar: 'https://mc-heads.net/avatar/cuvsa/64',
    status: 'in-game',
    activity: 'CrystalTides SMP 💎',
  },
  {
    id: '6',
    name: 'zakhbear',
    avatar: 'https://mc-heads.net/avatar/zakhbear/64',
    status: 'in-menus',
    activity: 'En Menús',
  },
  {
    id: '7',
    name: 'KingofHalo04',
    avatar: 'https://mc-heads.net/avatar/KingofHalo04/64',
    status: 'idle',
    activity: 'Ausente',
  },
  {
    id: '8',
    name: 'XerxerBro',
    avatar: 'https://mc-heads.net/avatar/XerxerBro/64',
    status: 'offline',
    activity: 'Desconectado hace 3d',
  },
];

export const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    sender: 'them',
    text: 'bro ya estás listo para raidear la dungeon en CrystalTides?',
    time: '18:45',
  },
  {
    id: 'msg-2',
    sender: 'me',
    text: 'dame 5 mins, estoy actualizando los mods en el nuevo launcher',
    time: '18:48',
  },
  {
    id: 'msg-3',
    sender: 'them',
    text: 'dale te espero en el lobby central 🚀',
    time: '18:49',
  },
];

export const getStatusColor = (status: FriendItem['status']): string => {
  if (status === 'in-game') return '#2dd4bf';
  if (status === 'in-launcher') return '#a855f7';
  return '#fbbf24';
};

export const getStatusTextColor = (status: FriendItem['status']): string => {
  return status === 'in-game' ? '#2dd4bf' : 'rgba(255, 255, 255, 0.5)';
};
