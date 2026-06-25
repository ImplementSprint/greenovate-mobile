module.exports = {
  preset: 'jest-expo',
  testMatch: ['**/tests/unit/**/*.test.ts'],
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/app/App.tsx'],
};
