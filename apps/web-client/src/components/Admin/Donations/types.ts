export interface Donation {
    id: number;
    amount: number;
    currency: string;
    from_name: string;
    message: string;
    is_public: boolean;
    buyer_email?: string;
    created_at: string;
}
