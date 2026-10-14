import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['apps/*/src/**/*.test.ts', 'packages/*/src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary'],
      include: ['apps/*/src/**/*.ts', 'packages/*/src/**/*.ts'],
      exclude: ['**/*.test.ts'],
    },
  },
});
