module.exports = {
  setupFilesAfterEnv: ['<rootDir>/frontend/integration/setup.js'],
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: ['<rootDir>/../frontend/.next/', '<rootDir>/../frontend/node_modules/'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/../frontend/$1',
    '^react$': '<rootDir>/node_modules/react',
    '^react-dom$': '<rootDir>/node_modules/react-dom',
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
  transformIgnorePatterns: [
    'node_modules/(?!(ansi-regex|strip-ansi|chalk|react|react-dom)/)',
  ],
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'],
  testEnvironmentOptions: {
    customExportConditions: [''],
  },
  rootDir: '..',
  moduleDirectories: ['node_modules', '<rootDir>/../frontend/node_modules'],
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
}
