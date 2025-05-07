// jest-dom はDOMノード用のカスタムjestマッチャーを追加します
import '@testing-library/jest-dom';

// グローバルなモックの設定
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    pathname: '/',
    query: {},
  }),
}));

// スタブでuuidsをモック
jest.mock('uuid', () => ({
  v4: () => 'test-uuid',
}));

// テストでの警告を抑制
global.console = {
  ...console,
  // テスト中に発生する特定の警告を非表示にする
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
  log: jest.fn(),
};