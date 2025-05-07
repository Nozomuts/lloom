import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import ChatSpace from "../../components/ChatSpace";
import { ChatSpace as ChatSpaceType, OpenRouterModel } from "../../types";

// モックデータ
const mockChatSpace: ChatSpaceType = {
  id: "123",
  messages: [
    {
      id: "1",
      content: "Hello, how can I help you?",
      role: "assistant",
      model: "openai (gpt-4)",
      timestamp: Date.now() - 1000,
    },
    {
      id: "2",
      content: "What is the capital of France?",
      role: "user",
      timestamp: Date.now(),
    },
  ],
  loading: false,
  error: null,
  selectedModel: "anthropic/claude-3-opus",
};

// モックモデルデータ
const mockModels: OpenRouterModel[] = [
  {
    id: "anthropic/claude-3-opus",
    name: "Claude 3 Opus",
    description: "Anthropic社の最新モデル",
    context_length: 100000,
    pricing: {
      prompt: 0.00015,
      completion: 0.00075,
    },
  },
  {
    id: "openai/gpt-4o",
    name: "GPT-4o",
    description: "OpenAIの最新モデル",
    context_length: 128000,
    pricing: {
      prompt: 0.00001,
      completion: 0.00003,
    },
  },
];

// モック関数
const mockOnRemove = jest.fn();
const mockOnClear = jest.fn();
const mockOnModelChange = jest.fn();

describe("ChatSpace", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders chat messages correctly", () => {
    render(
      <ChatSpace
        space={mockChatSpace}
        onRemove={mockOnRemove}
        onClear={mockOnClear}
        onModelChange={mockOnModelChange}
        availableModels={mockModels}
      />
    );

    // ユーザーメッセージが表示されていることを確認
    expect(
      screen.getByText("What is the capital of France?")
    ).toBeInTheDocument();

    // アシスタントメッセージが表示されていることを確認
    expect(screen.getByText("Hello, how can I help you?")).toBeInTheDocument();

    // モデル名が表示されていることを確認
    expect(screen.getByText("openai (gpt-4)")).toBeInTheDocument();
  });

  test("calls onRemove when delete button is clicked", () => {
    render(
      <ChatSpace
        space={mockChatSpace}
        onRemove={mockOnRemove}
        onClear={mockOnClear}
        onModelChange={mockOnModelChange}
        availableModels={mockModels}
      />
    );

    // 削除ボタンをクリック
    const deleteButton = screen.getByTestId("DeleteIcon").closest("button");
    if (deleteButton) {
      fireEvent.click(deleteButton);
    }

    // onRemoveが呼ばれることを確認
    expect(mockOnRemove).toHaveBeenCalledWith("123");
  });

  test("calls onClear when clear button is clicked", () => {
    render(
      <ChatSpace
        space={mockChatSpace}
        onRemove={mockOnRemove}
        onClear={mockOnClear}
        onModelChange={mockOnModelChange}
        availableModels={mockModels}
      />
    );
    // クリアボタンをクリック
    const clearButton = screen.getByTestId("ClearAllIcon").closest("button");
    if (clearButton) {
      fireEvent.click(clearButton);
    }

    // onClearが呼ばれることを確認
    expect(mockOnClear).toHaveBeenCalledWith("123");
  });

  test("displays loading indicator when loading is true", () => {
    const loadingSpace = {
      ...mockChatSpace,
      loading: true,
    };

    render(
      <ChatSpace
        space={loadingSpace}
        onRemove={mockOnRemove}
        onClear={mockOnClear}
        onModelChange={mockOnModelChange}
        availableModels={mockModels}
      />
    );

    // ローディングインジケータが表示されることを確認
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  test("displays error message when there is an error", () => {
    const errorSpace = {
      ...mockChatSpace,
      error: "Failed to fetch response",
    };

    render(
      <ChatSpace
        space={errorSpace}
        onRemove={mockOnRemove}
        onClear={mockOnClear}
        onModelChange={mockOnModelChange}
        availableModels={mockModels}
      />
    );

    // エラーメッセージが表示されることを確認
    expect(
      screen.getByText("Error: Failed to fetch response")
    ).toBeInTheDocument();
  });
});
