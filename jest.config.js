const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // 指向 Next.js 應用的路徑
  dir: './'
})

// Jest 自定義配置
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1'
  },
  testMatch: ['**/tests/**/*.test.ts'],
  transform: {
    '^.+\\.(t|j)sx?$': ['@swc/jest']
  }
}

// createJestConfig 會自動處理一些配置，包括：
// - 自動處理 node_modules 的轉換
// - 處理環境變量
// - 處理 Next.js 的配置
module.exports = createJestConfig(customJestConfig) 