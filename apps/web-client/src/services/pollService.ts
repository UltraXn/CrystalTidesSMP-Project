const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface PollOption {
    id: string | number;
    label: string;
    label_en?: string;
    votes?: number;
    percent: number;
}

export interface Poll {
    id?: number;
    title?: string;
    question: string;
    question_en?: string;
    options: PollOption[];
    totalVotes?: number;
    closesIn?: string;
}

export const fetchActivePoll = async (): Promise<Poll | null> => {
    const res = await fetch(`${API_URL}/polls/active`);
    if (!res.ok) throw new Error('Failed to fetch active poll');
    const data = await res.json();
    return data.success ? data.data : data;
};

export const voteInPoll = async (pollId: number, optionId: string | number) => {
    const res = await fetch(`${API_URL}/polls/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pollId, optionId })
    });
    if (!res.ok) throw new Error('Failed to vote');
    return res.json();
};
