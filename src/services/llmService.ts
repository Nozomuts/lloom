import axios from "axios";
import { LLMResponse, OpenRouterModel } from "../types";

// OpenRouterのAPIキーを環境変数から取得
const getOpenRouterApiKey = (): string => {
  return process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || "";
};

// OpenRouterのAPIエンドポイント
const API_ENDPOINT = "https://openrouter.ai/api/v1";

// 利用可能なモデルを取得する関数
export const fetchAvailableModels = async (): Promise<OpenRouterModel[]> => {
  try {
    const apiKey = getOpenRouterApiKey();

    // 開発環境またはAPIキーが設定されていない場合はモックデータを返す
    if (process.env.NODE_ENV === "development" || !apiKey) {
      console.log("Using mock models data");
      return mockModels;
    }

    const response = await axios.get(`${API_ENDPOINT}/models`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer":
          typeof window !== "undefined" ? window.location.href : "",
        "X-Title": "lloom",
      },
    });

    return response.data.data;
  } catch (error) {
    console.error("Error fetching models:", error);

    // エラー発生時もモックデータを返す（開発用）
    if (process.env.NODE_ENV === "development") {
      return mockModels;
    }

    throw error;
  }
};

// OpenRouter APIリクエストを送信する関数
export const fetchOpenRouterLLMResponse = async (
  content: string,
  modelId: string
): Promise<LLMResponse> => {
  try {
    const apiKey = getOpenRouterApiKey();

    // 開発環境またはAPIキーが設定されていない場合はモックデータを返す
    if (process.env.NODE_ENV === "development" || !apiKey) {
      console.log(`Using mock data for model: ${modelId}`);
      return await mockOpenRouterLLMResponse(content, modelId);
    }

    const response = await axios.post(
      `${API_ENDPOINT}/chat/completions`,
      {
        model: modelId,
        messages: [{ role: "user", content }],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer":
            typeof window !== "undefined" ? window.location.href : "",
          "X-Title": "lloom",
        },
      }
    );

    return {
      content: response.data.choices[0].message.content,
      model: response.data.model,
      provider: "openrouter",
    };
  } catch (error) {
    console.error(`Error calling OpenRouter API:`, error);

    // エラー発生時もモックデータを返す（開発用）
    if (process.env.NODE_ENV === "development") {
      return await mockOpenRouterLLMResponse(content, modelId);
    }

    throw error;
  }
};

// OpenRouterモック応答を生成する関数
const mockOpenRouterLLMResponse = async (
  content: string,
  modelId: string
): Promise<LLMResponse> => {
  // リアルな応答を模倣するために遅延を追加
  await new Promise((resolve) =>
    setTimeout(resolve, 1000 + Math.random() * 2000)
  );

  // modelIdからモデル名を取得
  const model = mockModels.find((m) => m.id === modelId)?.name || modelId;

  return {
    content: `これは ${model} からの応答です：\n\n${content} についてお答えします。これはモックデータです。`,
    model,
    provider: "openrouter",
  };
};

// モックモデルデータ
const mockModels: OpenRouterModel[] = [
  {
    id: "anthropic/claude-3-opus",
    name: "Claude 3 Opus",
    description: "Anthropic社の最新モデル。正確性と高度な推論に優れています。",
    context_length: 200000,
  },
  {
    id: "anthropic/claude-3-sonnet",
    name: "Claude 3 Sonnet",
    description: "バランスの取れた高性能モデル。多くのタスクに適しています。",
    context_length: 180000,
  },
  {
    id: "google/gemini-1.5-pro",
    name: "Gemini 1.5 Pro",
    description:
      "Googleの最新マルチモーダルモデル。様々な種類のデータを処理できます。",
    context_length: 1000000,
  },
  {
    id: "openai/gpt-4o",
    name: "GPT-4o",
    description: "OpenAIの最新モデル。広範なタスクに対応しています。",
    context_length: 128000,
  },
  {
    id: "meta-llama/llama-3-70b-instruct",
    name: "Llama 3 70B",
    description:
      "Metaの大規模オープンモデル。様々なタスクに高い性能を発揮します。",
    context_length: 8192,
  },
  {
    id: "mistralai/mistral-large",
    name: "Mistral Large",
    description: "Mistralの最新モデル。高性能で高速な推論が可能です。",
    context_length: 32768,
  },
];
