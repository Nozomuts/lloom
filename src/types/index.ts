export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  content: string;
  role: ChatRole;
  timestamp: number;
  model?: string;
};

// カスタムサイズの設定
export type SpaceSize = {
  width: string;
  height: string;
};

// アプリケーション全体の設定
export type AppSettings = {
  spaceSize: SpaceSize;
  globalSystemPrompt?: string; // 追加
};

export type ChatSpace = {
  id: string;
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  selectedModel: string;
  systemPrompt?: string; // 追加
};

export type LLMProvider = "openrouter";

export type LLMResponse = {
  content: string;
  model: string;
  provider: LLMProvider;
};

export type LLMError = {
  message: string;
  provider: LLMProvider;
};

export type ModelPricing = {
  prompt: number;
  completion: number;
};

export type OpenRouterModel = {
  id: string;
  name: string;
  description: string;
  context_length: number;
  pricing: ModelPricing;
};
