import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      'apps/builder',
      {
        test: {
          name: 'unit',
          include: ['apps/api/src/**/*.test.ts', 'packages/*/src/**/*.test.ts'],
        },
      },
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary'],
      include: ['apps/*/src/**/*.{ts,tsx}', 'packages/*/src/**/*.{ts,tsx}'],
      exclude: ['**/*.test.{ts,tsx}', 'apps/builder/src/test/**'],
    },
  },
});
