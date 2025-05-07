import { useState, useCallback, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  ChatSpace,
  ChatMessage,
  OpenRouterModel,
  LLMResponse,
  LLMError,
} from "../types";
import {
  fetchAvailableModels,
  fetchOpenRouterLLMResponse,
} from "@/services/llmService";

const fetchModels = async (): Promise<OpenRouterModel[]> => {
  const models = await fetchAvailableModels();
  const freeModels = models.filter(({ pricing }) => {
    for (const key in pricing) {
      if (key in pricing === false) {
        return false;
      }
      if (Number(pricing[key as keyof typeof pricing]) !== 0) {
        return false;
      }
    }
    return true;
  });

  return freeModels;
};

const sendPromptToModels = async (
  content: string,
  requests: Array<{ modelId: string; systemPrompt?: string }> // 変更: systemPrompt を追加
): Promise<(LLMResponse | LLMError)[]> => {
  return Promise.all(
    requests.map(async (request) => { // 変更: request オブジェクトを使用
      try {
        const response = await fetchOpenRouterLLMResponse(
          content,
          request.modelId,
          request.systemPrompt // 追加: systemPrompt を渡す
        );
        return response;
      } catch (error) {
        return {
          message:
            error instanceof Error
              ? error.message
              : "不明なエラーが発生しました",
        } as LLMError;
      }
    })
  );
};

// useChatStoreのフック（型を明示的に宣言）
export const useChatStore = () => {
  // チャットスペースの状態
  const [chatSpaces, setChatSpaces] = useState<ChatSpace[]>([]);
  // 利用可能なモデルのリスト
  const [availableModels, setAvailableModels] = useState<OpenRouterModel[]>([]);
  // ローディング状態
  const [loading, setLoading] = useState<boolean>(true);

  // 利用可能なモデルをロードする
  const loadAvailableModels = useCallback(async () => {
    try {
      setLoading(true);
      const models = await fetchModels();
      setAvailableModels(models);
    } catch (error) {
      console.error("モデルのロードに失敗:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // チャットスペースを追加する
  const addChatSpace = useCallback(() => {
    // 利用可能なモデルがあるかチェック
    if (availableModels.length === 0) {
      return;
    }

    const newSpace: ChatSpace = {
      id: uuidv4(),
      messages: [],
      loading: false,
      error: null,
      selectedModel: availableModels[0].id,
      systemPrompt: "", // 追加: systemPrompt を初期化
    };

    setChatSpaces((prev) => [...prev, newSpace]);
  }, [availableModels]);

  // チャットスペースを削除する
  const removeChatSpace = useCallback((id: string) => {
    setChatSpaces((prev) => prev.filter((space) => space.id !== id));
  }, []);

  // チャットスペースをクリアする
  const clearChatSpace = useCallback((id: string) => {
    setChatSpaces((prev) =>
      prev.map((space) => {
        if (space.id === id) {
          return {
            ...space,
            messages: [],
            error: null,
          };
        }
        return space;
      })
    );
  }, []);

  // モデルを変更する
  const changeModel = useCallback((id: string, modelId: string) => {
    setChatSpaces((prev) =>
      prev.map((space) => {
        if (space.id === id) {
          return {
            ...space,
            selectedModel: modelId,
          };
        }
        return space;
      })
    );
  }, []);

  // システムプロンプトを変更する
  const changeSystemPrompt = useCallback((id: string, systemPrompt: string) => {
    setChatSpaces((prev) =>
      prev.map((space) => {
        if (space.id === id) {
          return {
            ...space,
            systemPrompt,
          };
        }
        return space;
      })
    );
  }, []);

  // メッセージを送信する
  const sendMessage = useCallback(
    async (content: string) => {
      // 空のプロンプトを送信しない
      if (!content.trim()) return;

      // 現在のタイムスタンプ
      const timestamp = Date.now();

      // ユーザーメッセージを作成
      const userMessage: ChatMessage = {
        id: uuidv4(),
        content,
        role: "user",
        timestamp,
      };

      // 送信するモデルIDs（アクティブなチャットスペースのモデル）
      const modelRequests = chatSpaces.map((space) => ({
        spaceId: space.id,
        modelId: space.selectedModel,
        systemPrompt: space.systemPrompt, // 追加
      }));

      // 各チャットスペースにユーザーメッセージを追加し、ローディング状態にする
      setChatSpaces((prev) =>
        prev.map((space) => ({
          ...space,
          messages: [...space.messages, userMessage],
          loading: true,
          error: null,
        }))
      );

      try {
        // すべてのモデルにプロンプトを送信
        const responses = await sendPromptToModels(
          content,
          modelRequests.map((req) => ({ modelId: req.modelId, systemPrompt: req.systemPrompt })) // 変更: systemPrompt を渡す
        );

        // レスポンスに基づいてそれぞれのチャットスペースを更新
        setChatSpaces((prev) =>
          prev.map((space, index) => {
            const response = responses[index];
            if (!response) {
              return {
                ...space,
                loading: false,
                error: "応答が受信できませんでした。",
              };
            }

            if ("message" in response) {
              // エラーの場合
              const error = response as LLMError;
              return {
                ...space,
                loading: false,
                error: error.message,
              };
            } else {
              // 成功の場合
              const success = response as LLMResponse;
              const assistantMessage: ChatMessage = {
                id: uuidv4(),
                content: success.content,
                role: "assistant",
                timestamp: Date.now(),
                model: success.model,
              };

              return {
                ...space,
                messages: [...space.messages, assistantMessage],
                loading: false,
                error: null,
              };
            }
          })
        );
      } catch (error) {
        // 全体的なエラー処理
        console.error("メッセージの送信に失敗:", error);
        setChatSpaces((prev) =>
          prev.map((space) => ({
            ...space,
            loading: false,
            error: "応答の処理中にエラーが発生しました。",
          }))
        );
      }
    },
    [chatSpaces]
  );

  // 特定のチャットスペースにメッセージを送信する
  const sendMessageToSpace = useCallback(
    async (spaceId: string, content: string) => {
      if (!content.trim()) return;

      const timestamp = Date.now();
      const userMessage: ChatMessage = {
        id: uuidv4(),
        content,
        role: "user",
        timestamp,
      };

      const targetSpace = chatSpaces.find((space) => space.id === spaceId);
      if (!targetSpace) return;

      setChatSpaces((prev) =>
        prev.map((space) =>
          space.id === spaceId
            ? {
                ...space,
                messages: [...space.messages, userMessage],
                loading: true,
                error: null,
              }
            : space
        )
      );

      try {
        const response = await fetchOpenRouterLLMResponse(
          content,
          targetSpace.selectedModel,
          targetSpace.systemPrompt // 追加: systemPrompt を渡す
        );

        setChatSpaces((prev) =>
          prev.map((space) => {
            if (space.id === spaceId) {
              if ("message" in response) {
                const error = response as LLMError;
                return {
                  ...space,
                  loading: false,
                  error: error.message,
                };
              } else {
                const success = response as LLMResponse;
                const assistantMessage: ChatMessage = {
                  id: uuidv4(),
                  content: success.content,
                  role: "assistant",
                  timestamp: Date.now(),
                  model: success.model,
                };
                return {
                  ...space,
                  messages: [...space.messages, assistantMessage],
                  loading: false,
                  error: null,
                };
              }
            }
            return space;
          })
        );
      } catch (error) {
        console.error("メッセージの送信に失敗:", error);
        setChatSpaces((prev) =>
          prev.map((space) =>
            space.id === spaceId
              ? {
                  ...space,
                  loading: false,
                  error: "応答の処理中にエラーが発生しました。",
                }
              : space
          )
        );
      }
    },
    [chatSpaces]
  );

  // チャット履歴を特定のスペースからコピーする
  const copySpaceHistory = useCallback(
    async (id: string) => {
      const space = chatSpaces.find((space) => space.id === id);
      if (!space || space.messages.length === 0) return;

      // マークダウン形式でメッセージを整形
      const formattedMessages = space.messages
        .map((msg) => {
          const roleLabel =
            msg.role === "user"
              ? "**User**"
              : `**Assistant${msg.model ? ` (${msg.model})` : ""}**`;
          const timestamp = new Date(msg.timestamp).toLocaleString();
          return `${roleLabel} - ${timestamp}\n\n${msg.content}\n\n---\n`;
        })
        .join("\n");

      try {
        await navigator.clipboard.writeText(formattedMessages);
        return true;
      } catch (err) {
        console.error("クリップボードへのコピーに失敗:", err);
        return false;
      }
    },
    [chatSpaces]
  );

  // すべてのチャット履歴をエクスポートする
  const exportAllHistory = useCallback(() => {
    const spacesWithMessages = chatSpaces.filter(
      (space) => space.messages.length > 0
    );
    if (spacesWithMessages.length === 0) return null;

    // すべてのチャットスペースのメッセージをマークダウン形式で整形
    const formattedHistory = spacesWithMessages
      .map((space, index) => {
        const model = availableModels.find((m) => m.id === space.selectedModel);
        const title = model
          ? `# チャット ${index + 1} - ${model.name}\n\n`
          : `# チャット ${index + 1}\n\n`;

        const messages = space.messages
          .map((msg) => {
            const roleLabel =
              msg.role === "user"
                ? "**User**"
                : `**Assistant${msg.model ? ` (${msg.model})` : ""}**`;
            const timestamp = new Date(msg.timestamp).toLocaleString();
            return `${roleLabel} - ${timestamp}\n\n${msg.content}\n\n---\n`;
          })
          .join("\n");

        return `${title}${messages}\n\n`;
      })
      .join("\n");

    return formattedHistory;
  }, [chatSpaces, availableModels]);

  // チャットスペースが空の場合、初期モデルのロード後に1つ追加
  useEffect(() => {
    loadAvailableModels();
  }, [loadAvailableModels]);

  // フック外部から使用可能な関数や状態をエクスポート
  return {
    chatSpaces,
    availableModels,
    loading,
    addChatSpace,
    removeChatSpace,
    clearChatSpace,
    sendMessage,
    sendMessageToSpace, // 追加
    changeModel,
    loadAvailableModels,
    copySpaceHistory,
    exportAllHistory,
    changeSystemPrompt, // 追加
  };
};
