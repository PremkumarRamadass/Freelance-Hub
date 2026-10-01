export interface ChatActionLink {
  label: string;
  route: string;
  icon: string;
}

export interface ChatMessageItem {
  id: string;
  senderRole: 'user' | 'assistant' | 'system';
  message: string;
  channel?: string;
  suggestedPrompts?: string[];
  actionLinks?: ChatActionLink[];
  createdAt: string | Date;
}

export interface AskQuestionPayload {
  message: string;
  channel?: string;
}

export interface ChatChannel {
  id: string;
  name: string;
  icon: string;
  description: string;
  badge?: string;
  status: 'online' | 'busy' | 'away';
}
