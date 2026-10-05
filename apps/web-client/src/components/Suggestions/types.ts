export interface PollOption {
  id: number;
  label: string;
  votes: number;
  percent: number;
}

export interface Poll {
  id: number;
  title: string;
  question: string;
  options: PollOption[];
  totalVotes: number;
  closesIn: string;
}

export interface SuggestionItem {
  id: string | number;
  nickname: string;
  type: string;
  message: string;
  created_at: string;
  upvotes: number;
  downvotes: number;
}

export interface SuggestionApiResponse {
  id?: string | number;
  error?: string;
  kc_awarded?: number;
}

export type VoteDirection = 'up' | 'down';
export type FormStatus = 'idle' | 'sending' | 'success' | 'error';
export type SuggestionTypeFilter = 'all' | 'General' | 'Bug' | 'Mod' | 'Complaint' | 'Poll';
