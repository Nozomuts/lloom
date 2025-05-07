// ChatMessageの役割（ユーザーかアシスタント）
export type ChatRole = "user" | "assistant";

// チャットメッセージの型
export type ChatMessage = {
  id: string;
  content: string;
  role: ChatRole;
  timestamp: number;
  model?: string; // AIモデル識別子（アシスタントメッセージのみ）
};

// チャットスペースのサイズ定義
export type SpaceSize = "small" | "medium" | "large";

// チャットスペースの型
export type ChatSpace = {
  id: string;
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  selectedModel: string;
  size: SpaceSize; // 表示サイズの設定を追加
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

// OpenRouterモデルの価格情報
export type ModelPricing = {
  prompt: number;
  completion: number;
};

// OpenRouter APIから取得するモデル情報
export type OpenRouterModel = {
  id: string;
  name: string;
  description: string;
  context_length: number;
};