export interface UserDefinition {
    id: string;
    email: string;
    username?: string;
    role?: string;
    medals?: number[];
    created_at: string;
    user_metadata?: { role?: string };
}

export interface MedalDefinition {
    id: number;
    name: string;
    color: string;
    icon: string;
    description: string;
}
