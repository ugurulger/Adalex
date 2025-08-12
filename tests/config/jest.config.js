module.exports = {
  setupFilesAfterEnv: ['<rootDir>/frontend/integration/setup-simple.js'],
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: ['<rootDir>/../frontend/.next/', '<rootDir>/../frontend/node_modules/'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/../frontend/$1',
  },
  collectCoverageFrom: [
    '../frontend/**/*.{js,jsx,ts,tsx}',
    '!../frontend/**/*.d.ts',
    '!../frontend/node_modules/**',
    '!../frontend/.next/**',
  ],
  testMatch: [
    '<rootDir>/frontend/integration/**/*.test.{js,jsx,ts,tsx}',
  ],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'],
  testEnvironmentOptions: {
    customExportConditions: [''],
  },
  rootDir: '..',
}
