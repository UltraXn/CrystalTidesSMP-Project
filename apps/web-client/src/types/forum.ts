import { isAdminRole, isStaffRole } from '../utils/roleUtils';

export interface ForumAuthorData {
  username: string;
  full_name: string;
  avatar_url: string;
  role: string;
  status_message: string;
  avatar_preference?: string;
  community_pref?: string;
  minecraft_uuid?: string;
  minecraft_nick?: string;
  social_discord?: string;
  discord_tag?: string;
  social_avatar_url?: string;
}

export interface PollOption {
  id: string;
  label: string;
  percent: number;
  votes: number;
}

export interface Poll {
  id: string;
  discord_link?: string;
  question: string;
  options: PollOption[];
  totalVotes: number;
  closesIn: string;
}

export interface Thread {
  id: string | number;
  title: string;
  content: string;
  author: string;
  author_id: string;
  author_avatar: string | null;
  author_role: string;
  date: string;
  longDate: string;
  image: string | null;
  tag: string;
  category_id: number;
  views: number;
  poll: Poll | null;
  pinned: boolean;
  locked: boolean;
  title_en?: string;
  content_en?: string;
  author_data_fresh?: ForumAuthorData;
}

export interface Comment {
  id: string | number;
  user: string;
  user_id: string | null;
  avatar: string | null;
  role: string;
  date: string;
  content: string;
  author_data_fresh?: ForumAuthorData;
}

export interface PendingImageRepl {
  blob: Blob;
  preview: string;
}

export const RANK_IMAGES: Record<string, string> = {
  admin: '/ranks/admin.png',
  developer: '/ranks/developer.png',
  moderator: '/ranks/moderator.png',
  helper: '/ranks/helper.png',
  staff: '/ranks/staff.png',
  donador: '/ranks/rank-donador.png',
  fundador: '/ranks/rank-fundador.png',
  killu: '/ranks/rank-killu.png',
  neroferno: '/ranks/rank-neroferno.png',
  user: '/ranks/user.png',
};

export const categoryNames: Record<number, string> = {
  1: 'Anuncios',
  2: 'Discusión General',
  3: 'Soporte',
  4: 'Off-Topic',
};

export const getCategorySlug = (categoryId?: number): string => {
  switch (categoryId) {
    case 1:
      return 'announcements';
    case 2:
      return 'general';
    case 3:
      return 'support';
    default:
      return 'off-topic';
  }
};

export const checkIsAdmin = (roleOrProfile?: { role?: string | null } | string | null): boolean => {
  if (!roleOrProfile) return false;
  const role = typeof roleOrProfile === 'string' ? roleOrProfile : roleOrProfile.role;
  return isAdminRole(role);
};

export const checkIsStaff = (roleOrProfile?: { role?: string | null } | string | null): boolean => {
  if (!roleOrProfile) return false;
  const role = typeof roleOrProfile === 'string' ? roleOrProfile : roleOrProfile.role;
  return isStaffRole(role);
};

export const compressImage = async (file: File): Promise<Blob> => {
  const bitmap = await createImageBitmap(file);
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const MAX_SIZE = 1920;
    let width = bitmap.width;
    let height = bitmap.height;

    if (width > MAX_SIZE || height > MAX_SIZE) {
      if (width > height) {
        height = Math.round((height * MAX_SIZE) / width);
        width = MAX_SIZE;
      } else {
        width = Math.round((width * MAX_SIZE) / height);
        height = MAX_SIZE;
      }
    }

    canvas.width = width;
    canvas.height = height;

    if (!ctx) {
      throw new Error('Could not get canvas context');
    }

    ctx.drawImage(bitmap, 0, 0, width, height);
    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Canvas toBlob failed'));
        },
        'image/webp',
        0.8,
      );
    });
  } finally {
    bitmap.close();
  }
};
