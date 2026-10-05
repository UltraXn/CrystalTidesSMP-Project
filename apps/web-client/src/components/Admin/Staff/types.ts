export interface StaffCardData {
  id: number | string;
  name: string;
  mc_nickname?: string;
  role: string;
  role_en?: string;
  image: string;
  color: string;
  description: string;
  description_en?: string;
  socials?: {
    twitter?: string;
    discord?: string;
    youtube?: string;
    twitch?: string;
  };
  isNew?: boolean;
}
