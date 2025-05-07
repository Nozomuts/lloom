import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import ChatSpace from "../../components/ChatSpace";
import { ChatSpace as ChatSpaceType, ChatMessage } from "../../types";

describe("ChatSpace Component", () => {
  // モックの関数を作成
  const onRemoveMock = jest.fn();
  const onClearMock = jest.fn();
  const onModelChangeMock = jest.fn();
  const onSizeChangeMock = jest.fn(); // 追加
  const onCopyHistoryMock = jest.fn(); // 追加

  // テスト用のメッセージ配列
  const testMessages: ChatMessage[] = [
    {
      id: "1",
      content: "Hello, how are you?",
      role: "user",
      timestamp: 1620000000000,
    },
    {
      id: "2",
      content: "I am fine, thank you!",
      role: "assistant",
      model: "gpt-4",
      timestamp: 1620000060000,
    },
  ];

  // テスト用のモデル配列
  const testModels = [
    {
      id: "model1",
      name: "Model 1",
      description: "Test Model 1",
      context_length: 4000,
      pricing: {
        prompt: 0.01,
        completion: 0.01,
      },
    },
    {
      id: "model2",
      name: "Model 2",
      description: "Test Model 2",
      context_length: 8000,
      pricing: {
        prompt: 0.02,
        completion: 0.02,
      },
    },
  ];

  // テスト用のChatSpaceオブジェクト
  const testChatSpace: ChatSpaceType = {
    id: "test-space",
    messages: testMessages,
    loading: false,
    error: null,
    selectedModel: "model1",
    size: "medium", // 追加
  };

  // 各テスト前にモック関数をリセット
  beforeEach(() => {
    onRemoveMock.mockClear();
    onClearMock.mockClear();
    onModelChangeMock.mockClear();
    onSizeChangeMock.mockClear(); // 追加
    onCopyHistoryMock.mockClear(); // 追加
  });

  it("renders messages correctly", () => {
    render(
      <ChatSpace
        space={testChatSpace}
        onRemove={onRemoveMock}
        onClear={onClearMock}
        onModelChange={onModelChangeMock}
        onSizeChange={onSizeChangeMock} // 追加
        onCopyHistory={onCopyHistoryMock} // 追加
        availableModels={testModels}
      />
    );

    // ユーザーのメッセージが表示されることを確認
    expect(screen.getByText("Hello, how are you?")).toBeInTheDocument();
    // アシスタントの応答が表示されることを確認
    expect(screen.getByText("I am fine, thank you!")).toBeInTheDocument();
    // モデル名が表示されることを確認
    expect(screen.getByText("gpt-4")).toBeInTheDocument();
  });

  it("calls onRemove when delete button is clicked", () => {
    render(
      <ChatSpace
        space={testChatSpace}
        onRemove={onRemoveMock}
        onClear={onClearMock}
        onModelChange={onModelChangeMock}
        onSizeChange={onSizeChangeMock} // 追加
        onCopyHistory={onCopyHistoryMock} // 追加
        availableModels={testModels}
      />
    );

    // 削除ボタンを探してクリック
    const deleteButton = screen.getByTitle("チャットスペースを削除");
    fireEvent.click(deleteButton);

    // onRemove関数がChatSpaceのIDで呼び出されたことを確認
    expect(onRemoveMock).toHaveBeenCalledWith("test-space");
  });

  it("calls onClear when clear button is clicked", () => {
    render(
      <ChatSpace
        space={testChatSpace}
        onRemove={onRemoveMock}
        onClear={onClearMock}
        onModelChange={onModelChangeMock}
        onSizeChange={onSizeChangeMock} // 追加
        onCopyHistory={onCopyHistoryMock} // 追加
        availableModels={testModels}
      />
    );

    // クリアボタンを探してクリック
    const clearButton = screen.getByTitle("会話をクリア");
    fireEvent.click(clearButton);

    // onClear関数がChatSpaceのIDで呼び出されたことを確認
    expect(onClearMock).toHaveBeenCalledWith("test-space");
  });

  it("shows loading indicator when space is loading", () => {
    const loadingChatSpace = {
      ...testChatSpace,
      loading: true,
    };

    render(
      <ChatSpace
        space={loadingChatSpace}
        onRemove={onRemoveMock}
        onClear={onClearMock}
        onModelChange={onModelChangeMock}
        onSizeChange={onSizeChangeMock} // 追加
        onCopyHistory={onCopyHistoryMock} // 追加
        availableModels={testModels}
      />
    );

    // ローディングインジケーターが表示されることを確認（CircularProgress）
    const loadingIndicator = document.querySelector(
      ".MuiCircularProgress-root"
    );
    expect(loadingIndicator).toBeInTheDocument();
  });

  it("shows error message when there is an error", () => {
    const errorChatSpace = {
      ...testChatSpace,
      error: "Something went wrong",
    };

    render(
      <ChatSpace
        space={errorChatSpace}
        onRemove={onRemoveMock}
        onClear={onClearMock}
        onModelChange={onModelChangeMock}
        onSizeChange={onSizeChangeMock} // 追加
        onCopyHistory={onCopyHistoryMock} // 追加
        availableModels={testModels}
      />
    );

    // エラーメッセージが表示されることを確認
    expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
  });

  // 新しいテスト: サイズ変更メニューをテスト
  it("opens size menu when options button is clicked", () => {
    render(
      <ChatSpace
        space={testChatSpace}
        onRemove={onRemoveMock}
        onClear={onClearMock}
        onModelChange={onModelChangeMock}
        onSizeChange={onSizeChangeMock}
        onCopyHistory={onCopyHistoryMock}
        availableModels={testModels}
      />
    );

    // オプションボタンを探してクリック
    const optionsButton = screen.getByLabelText("オプション");
    fireEvent.click(optionsButton);

    // メニューが表示されることを確認
    expect(screen.getByText("小サイズ")).toBeInTheDocument();
    expect(screen.getByText("中サイズ")).toBeInTheDocument();
    expect(screen.getByText("大サイズ")).toBeInTheDocument();
    expect(screen.getByText("履歴をコピー")).toBeInTheDocument();
  });
});
