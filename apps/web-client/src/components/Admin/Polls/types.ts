export interface PollOption {
    id?: number;
    label: string;
    label_en?: string;
    votes?: number;
    percent?: number;
}

export interface Poll {
    id: number;
    title: string;
    title_en?: string;
    question: string;
    question_en?: string;
    options: PollOption[];
    closesIn?: string;
    totalVotes?: number;
    created_at?: string;
    is_active?: boolean;
    closes_at?: string;
}
