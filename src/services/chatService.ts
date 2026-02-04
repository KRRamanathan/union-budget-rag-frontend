import { apiClient } from '@/lib/api';

export interface ChatSession {
  id: string;
  user_id: string;
  title: string | null;
  created_at: string;
  messages?: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{
    doc_name: string;
    page_number: number;
  }>;
  created_at: string;
}

export interface CreateChatResponse {
  chat_id: string;
}

export interface SendMessageRequest {
  message: string;
}

export interface SendMessageResponse {
  answer: string;
  sources: Array<{
    doc_name: string;
    page_number: number;
  }>;
  message_id: string;
}

export interface ListChatsResponse {
  chats: ChatSession[];
}

export interface GetChatResponse extends ChatSession {
  messages: ChatMessage[];
}

export const chatService = {
  async createChat(): Promise<CreateChatResponse> {
    return apiClient.post<CreateChatResponse>('/chats', {});
  },

  async listChats(): Promise<ListChatsResponse> {
    return apiClient.get<ListChatsResponse>('/chats');
  },

  async getChat(chatId: string): Promise<GetChatResponse> {
    return apiClient.get<GetChatResponse>(`/chats/${chatId}`);
  },

  async deleteChat(chatId: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/chats/${chatId}`);
  },

  async sendMessage(
    chatId: string,
    message: string
  ): Promise<SendMessageResponse> {
    return apiClient.post<SendMessageResponse>(`/chats/${chatId}/message`, {
      message,
    });
  },
};
