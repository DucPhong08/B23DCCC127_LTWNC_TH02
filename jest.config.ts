import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test/setupTests.ts'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/src/test/fileMock.ts'
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.app.json'
      }
    ]
  },
  collectCoverageFrom: [
    'src/features/**/*.{ts,tsx}',
    '!src/features/**/index.ts',
    '!src/features/**/*.d.ts'
  ],
  coverageThreshold: {
    './src/features/': {
      statements: 70,
      branches: 70,
      functions: 70,
      lines: 70
    }
  }
};

export default config;
