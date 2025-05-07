import axios from "axios";
import { LLMResponse, OpenRouterModel } from "../types";

const getOpenRouterApiKey = (): string => {
  return process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || "";
};

const API_ENDPOINT = "https://openrouter.ai/api/v1";

export const fetchAvailableModels = async (): Promise<OpenRouterModel[]> => {
  try {
    const apiKey = getOpenRouterApiKey();
    if (!apiKey) {
      console.log("No API key provided, returning mock data.");
      return [];
    }

    const response = await axios.get(`${API_ENDPOINT}/models`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching models:", error);
    throw error;
  }
};

export const fetchOpenRouterLLMResponse = async (
  content: string,
  modelId: string,
  systemPrompt?: string // 追加
): Promise<LLMResponse> => {
  try {
    const apiKey = getOpenRouterApiKey();

    if (!apiKey) {
      console.log("No API key provided, returning mock data.");
      return {
        content: "",
        model: modelId,
        provider: "openrouter",
      };
    }

    const messages: Array<{ role: string; content: string }> = [];
    if (systemPrompt && systemPrompt.trim() !== "") {
      messages.push({ role: "system", content: systemPrompt });
    }
    messages.push({ role: "user", content });

    const response = await axios.post(
      `${API_ENDPOINT}/chat/completions`,
      {
        model: modelId,
        messages, // 変更
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
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
    throw error;
  }
};
