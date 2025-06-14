
export interface Message {
  id: string;
  db_id?: string;
  role: 'user' | 'assistant';
  content: string;
  image_url?: string;
  cost?: number;
  model?: string;
  created_at: string;
  subject: string;
  is_understood?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  created_at: string;
  subject: string;
  user_id: string;
}
