import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import InputBar from '../../components/InputBar';

// モック関数
const mockOnSubmit = jest.fn();

describe('InputBar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders input field correctly', () => {
    render(<InputBar onSubmit={mockOnSubmit} />);
    
    // 入力フィールドが表示されていることを確認
    const inputField = screen.getByPlaceholderText('メッセージを入力...');
    expect(inputField).toBeInTheDocument();
  });

  test('updates input value on change', () => {
    render(<InputBar onSubmit={mockOnSubmit} />);
    
    // 入力フィールドへの入力をシミュレート
    const inputField = screen.getByPlaceholderText('メッセージを入力...') as HTMLInputElement;
    fireEvent.change(inputField, { target: { value: 'Hello, world!' } });
    
    // 入力値が更新されていることを確認
    expect(inputField.value).toBe('Hello, world!');
  });

  test('calls onSubmit when send button is clicked', () => {
    render(<InputBar onSubmit={mockOnSubmit} />);
    
    // 入力フィールドに値を入力
    const inputField = screen.getByPlaceholderText('メッセージを入力...') as HTMLInputElement;
    fireEvent.change(inputField, { target: { value: 'Hello, world!' } });
    
    // 送信ボタンをクリック
    const sendButton = screen.getByTestId('SendIcon').closest('button');
    if (sendButton) {
      fireEvent.click(sendButton);
    }
    
    // onSubmitが呼ばれることを確認
    expect(mockOnSubmit).toHaveBeenCalledWith('Hello, world!');
    
    // 送信後に入力フィールドがクリアされることを確認
    expect(inputField.value).toBe('');
  });

  test('calls onSubmit when Enter is pressed', () => {
    render(<InputBar onSubmit={mockOnSubmit} />);
    
    // 入力フィールドに値を入力
    const inputField = screen.getByPlaceholderText('メッセージを入力...') as HTMLInputElement;
    fireEvent.change(inputField, { target: { value: 'Hello, world!' } });
    
    // Enterキーをプレス
    fireEvent.keyDown(inputField, { key: 'Enter', code: 'Enter' });
    
    // onSubmitが呼ばれることを確認
    expect(mockOnSubmit).toHaveBeenCalledWith('Hello, world!');
    
    // 送信後に入力フィールドがクリアされることを確認
    expect(inputField.value).toBe('');
  });

  test('does not call onSubmit on Enter+Shift', () => {
    render(<InputBar onSubmit={mockOnSubmit} />);
    
    // 入力フィールドに値を入力
    const inputField = screen.getByPlaceholderText('メッセージを入力...') as HTMLInputElement;
    fireEvent.change(inputField, { target: { value: 'Hello, world!' } });
    
    // Shift+Enterキーをプレス
    fireEvent.keyDown(inputField, { key: 'Enter', code: 'Enter', shiftKey: true });
    
    // onSubmitが呼ばれないことを確認
    expect(mockOnSubmit).not.toHaveBeenCalled();
    
    // 入力フィールドの値が保持されていることを確認
    expect(inputField.value).toBe('Hello, world!');
  });

  test('disables input and send button when disabled prop is true', () => {
    render(<InputBar onSubmit={mockOnSubmit} disabled={true} />);
    
    // 入力フィールドが無効化されていることを確認
    const inputField = screen.getByPlaceholderText('メッセージを入力...') as HTMLInputElement;
    expect(inputField).toBeDisabled();
    
    // 送信ボタンが無効化されていることを確認
    const sendButton = screen.getByTestId('SendIcon').closest('button');
    expect(sendButton).toBeDisabled();
  });

  test('does not submit empty messages', () => {
    render(<InputBar onSubmit={mockOnSubmit} />);
    
    // 空の入力で送信ボタンをクリック
    const sendButton = screen.getByTestId('SendIcon').closest('button');
    if (sendButton) {
      fireEvent.click(sendButton);
    }
    
    // onSubmitが呼ばれないことを確認
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
});