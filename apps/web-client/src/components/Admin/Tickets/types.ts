export interface Ticket {
    id: number;
    user_id: string;
    subject: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'open' | 'pending' | 'resolved' | 'closed';
    created_at: string;
    profiles?: {
        username: string;
        avatar_url: string;
    };
}

export interface Message {
    id: number;
    user_id: string;
    message: string;
    is_staff: boolean;
    created_at: string;
}

export interface AlertData {
    message: string;
    type: 'error' | 'success' | 'warning';
}

export interface ConfirmData {
    message: string;
    onConfirm: () => void;
}
