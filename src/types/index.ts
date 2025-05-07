export type ChatMessage = {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  model?: string;
  timestamp: number;
};

export type ChatSpace = {
  id: string;
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  selectedModel: string; // 選択されたモデル
};

export type LLMProvider = 'openrouter';

export type LLMResponse = {
  content: string;
  model: string;
  provider: LLMProvider;
};

export type LLMError = {
  message: string;
  provider: LLMProvider;
};

export type OpenRouterModel = {
  id: string;
  name: string;
  description: string;
  context_length: number;
  pricing: {
    prompt: number;
    completion: number;
  };
};