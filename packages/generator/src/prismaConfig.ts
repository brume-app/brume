/**
 * Content of the `prisma.config.ts` of a generated backend.
 *
 * @remarks
 * Prisma 7 reads the database URL from this file, not from the schema, and
 * cannot run migrations without it. Like `apps/api`, it loads the `.env` file
 * when there is one, so `DATABASE_URL` can come from that file or from the
 * environment.
 */
export const PRISMA_CONFIG = `import { existsSync } from 'node:fs';
import { defineConfig } from 'prisma/config';

const envFile = new URL('.env', import.meta.url);
if (existsSync(envFile)) process.loadEnvFile(envFile);

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  datasource: { url: process.env.DATABASE_URL },
});
`;
