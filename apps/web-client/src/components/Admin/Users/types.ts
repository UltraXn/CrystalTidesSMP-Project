export interface UserDefinition {
    id: string;
    email: string;
    username?: string;
    role?: string;
    medals?: number[];
    achievements?: (string | number)[];
    created_at: string;
    user_metadata?: { role?: string };
}

export interface MedalDefinition {
    id: number;
    name: string;
    color: string;
    icon: string;
    description: string;
    image_url?: string;
}

export interface AchievementDefinition {
    id: string | number;
    name: string;
    description: string;
    criteria: string;
    icon: string;
    image_url?: string;
    color?: string;
}
