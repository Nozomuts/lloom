import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import { ChatSpace, LLMResponse, OpenRouterModel } from "../types";
import {
  fetchAvailableModels,
  fetchOpenRouterLLMResponse,
} from "../services/llmService";

type ChatStore = {
  chatSpaces: ChatSpace[];
  availableModels: OpenRouterModel[];
  loading: boolean;
  addChatSpace: () => void;
  removeChatSpace: (id: string) => void;
  clearChatSpace: (id: string) => void;
  sendMessage: (content: string) => Promise<void>;
  sendMessageToSpace: (id: string, content: string) => Promise<void>;
  setLoading: (id: string, loading: boolean) => void;
  setError: (id: string, error: string | null) => void;
  addResponse: (id: string, response: LLMResponse) => void;
  changeModel: (id: string, modelId: string) => void;
  loadAvailableModels: () => Promise<void>;
};

// モックモデルのID (別の場所から定義をインポートするのが良いですが、簡略化のため)
const DEFAULT_MODEL_ID = "anthropic/claude-3-opus";

export const useChatStore = create<ChatStore>((set, get) => ({
  chatSpaces: [],
  availableModels: [],
  loading: false,

  loadAvailableModels: async () => {
    try {
      set({ loading: true });
      const models = await fetchAvailableModels();
      set({ availableModels: models, loading: false });
    } catch (error) {
      console.error("Failed to load models:", error);
      set({ loading: false });
    }
  },

  addChatSpace: () => {
    const { availableModels } = get();
    const defaultModel =
      availableModels.length > 0 ? availableModels[0].id : DEFAULT_MODEL_ID;

    const newSpace: ChatSpace = {
      id: uuidv4(),
      messages: [],
      loading: false,
      error: null,
      selectedModel: defaultModel,
    };

    set((state) => ({
      chatSpaces: [...state.chatSpaces, newSpace],
    }));
  },

  removeChatSpace: (id: string) => {
    set((state) => ({
      chatSpaces: state.chatSpaces.filter((space) => space.id !== id),
    }));
  },

  clearChatSpace: (id: string) => {
    set((state) => ({
      chatSpaces: state.chatSpaces.map((space) =>
        space.id === id ? { ...space, messages: [], error: null } : space
      ),
    }));
  },

  sendMessage: async (content: string) => {
    const { chatSpaces } = get();

    // 各スペースに個別にメッセージを送信
    const promises = chatSpaces.map((space) =>
      get().sendMessageToSpace(space.id, content)
    );

    await Promise.all(promises);
  },

  sendMessageToSpace: async (id: string, content: string) => {
    const { setLoading, setError, addResponse } = get();
    const space = get().chatSpaces.find((s) => s.id === id);

    if (!space) return;

    // ユーザーメッセージを追加
    set((state) => ({
      chatSpaces: state.chatSpaces.map((space) =>
        space.id === id
          ? {
              ...space,
              messages: [
                ...space.messages,
                {
                  id: uuidv4(),
                  content,
                  role: "user",
                  timestamp: Date.now(),
                },
              ],
              error: null,
            }
          : space
      ),
    }));

    // ローディング状態を設定
    setLoading(id, true);

    try {
      const modelId = space.selectedModel;

      // OpenRouterのAPIを呼び出す
      const response = await fetchOpenRouterLLMResponse(content, modelId);
      addResponse(id, response);
    } catch (error) {
      setError(
        id,
        error instanceof Error ? error.message : "Failed to fetch response"
      );
    } finally {
      setLoading(id, false);
    }
  },

  setLoading: (id: string, loading: boolean) => {
    set((state) => ({
      chatSpaces: state.chatSpaces.map((space) =>
        space.id === id ? { ...space, loading } : space
      ),
    }));
  },

  setError: (id: string, error: string | null) => {
    set((state) => ({
      chatSpaces: state.chatSpaces.map((space) =>
        space.id === id ? { ...space, error } : space
      ),
    }));
  },

  addResponse: (id: string, response: LLMResponse) => {
    set((state) => ({
      chatSpaces: state.chatSpaces.map((space) =>
        space.id === id
          ? {
              ...space,
              messages: [
                ...space.messages,
                {
                  id: uuidv4(),
                  content: response.content,
                  role: "assistant",
                  model: response.model,
                  timestamp: Date.now(),
                },
              ],
            }
          : space
      ),
    }));
  },

  changeModel: (id: string, modelId: string) => {
    set((state) => ({
      chatSpaces: state.chatSpaces.map((space) =>
        space.id === id ? { ...space, selectedModel: modelId } : space
      ),
    }));
  },
}));
