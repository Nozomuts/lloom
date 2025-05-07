import { createJestConfig } from 'next/jest';

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    // エイリアスをマップ
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};

// Next.jsのJest設定を作成
const config = createJestConfig({
  // Next.jsアプリのパスを指定
  dir: './',
})(customJestConfig);

export default config;