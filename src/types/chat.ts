export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: Array<{
    doc_name: string;
    page_number: number;
  }>;
}

export interface Conversation {
  id: string;
  title: string | null;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}
