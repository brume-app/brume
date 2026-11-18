import type { Project } from '@brume/shared';
import { blogProject, shopProject } from '@brume/shared/fixtures';
import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { describe, expect, it } from 'vitest';
import { generateFiles } from './generateFiles';
import { parse } from './parse';

/** The generated files of a project, by path. */
function filesOf(project: Project): Map<string, string> {
  return new Map(
    generateFiles(parse(project)).map((file) => [file.path, file.content]),
  );
}

const prismaCli = createRequire(import.meta.url).resolve(
  'prisma/build/index.js',
);

/**
 * Temporary folders for the Prisma CLI, inside the generator's `node_modules`
 * so that the generated `prisma.config.ts` can load `prisma/config`.
 */
const tempRoot = fileURLToPath(
  new URL('../node_modules/.cache/brume-generator-tests', import.meta.url),
);

/**
 * Writes files to a temporary folder and runs the Prisma CLI of the same
 * version as `apps/api` there, so it reads the generated `prisma.config.ts`.
 * Resolves with the command output, rejects when the command fails.
 */
async function runPrisma(
  files: Map<string, string>,
  ...args: string[]
): Promise<string> {
  await mkdir(tempRoot, { recursive: true });
  const folder = await mkdtemp(join(tempRoot, 'prisma-'));
  try {
    for (const [path, content] of files) {
      await mkdir(dirname(join(folder, path)), { recursive: true });
      await writeFile(join(folder, path), content);
    }
    const { stdout } = await promisify(execFile)(
      process.execPath,
      [prismaCli, ...args],
      { cwd: folder, env: { ...process.env, CHECKPOINT_DISABLE: '1' } },
    );
    return stdout;
  } finally {
    await rm(folder, { recursive: true, force: true });
  }
}

/** Files with only a schema, at the path Prisma reads by default. */
const schemaOnly = (schema: string) =>
  new Map([['prisma/schema.prisma', schema]]);

/** A project with every field type, constraint and kind of default. */
const everyFieldProject: Project = {
  version: 1,
  name: 'Every field',
  models: [
    {
      id: 'item',
      name: 'Item',
      fields: [
        {
          id: 'text',
          name: 'text',
          type: 'string',
          required: true,
          unique: true,
          defaultValue: 'say "hi" \\ back\nline',
        },
        {
          id: 'note',
          name: 'note',
          type: 'string',
          required: false,
          unique: false,
        },
        {
          id: 'tiny',
          name: 'tiny',
          type: 'number',
          required: true,
          unique: false,
          defaultValue: 1e-7,
        },
        {
          id: 'huge',
          name: 'huge',
          type: 'number',
          required: false,
          unique: false,
          defaultValue: -1.7976931348623157e308,
        },
        {
          id: 'flag',
          name: 'flag',
          type: 'boolean',
          required: true,
          unique: false,
          defaultValue: true,
        },
        {
          id: 'created-at',
          name: 'createdAt',
          type: 'date',
          required: true,
          unique: false,
          defaultValue: 'now',
        },
        {
          id: 'launch-at',
          name: 'launchAt',
          type: 'date',
          required: false,
          unique: false,
          defaultValue: '2026-01-01T00:00:00.123Z',
        },
        {
          id: 'settings',
          name: 'settings',
          type: 'json',
          required: false,
          unique: true,
          defaultValue: { theme: 'dark', tags: ['a', 'b'], 'q"': null },
        },
        {
          id: 'status',
          name: 'status',
          type: 'enum',
          required: true,
          unique: false,
          enumValues: ['DRAFT', 'PUBLISHED'],
          defaultValue: 'PUBLISHED',
        },
      ],
    },
  ],
  relations: [],
  layout: {},
};

describe('generateFiles', () => {
  it('outputs the Prisma config and schema, sorted by path', () => {
    expect([...filesOf(blogProject).keys()]).toEqual([
      'prisma.config.ts',
      'prisma/schema.prisma',
    ]);
  });

  it('points the Prisma config to the generated schema', () => {
    expect(filesOf(blogProject).get('prisma.config.ts')).toContain(
      "schema: 'prisma/schema.prisma'",
    );
  });

  it.each([
    ['blog', blogProject],
    ['shop', shopProject],
  ])(
    'writes the Prisma schema of the %s sample project',
    async (name, project) => {
      await expect(
        filesOf(project).get('prisma/schema.prisma'),
      ).toMatchFileSnapshot(`__snapshots__/${name}.schema.prisma`);
    },
  );

  it('rejects an invalid or badly laid out schema in the Prisma checks', async () => {
    const datasource = 'datasource db {\n  provider = "postgresql"\n}\n\n';
    const invalid = `${datasource}model Item {\n  id Strin @id\n}\n`;
    const unaligned = `${datasource}model Item {\n  id String @id\n  name String\n}\n`;

    await Promise.all([
      expect(runPrisma(schemaOnly(invalid), 'validate')).rejects.toThrow(),
      expect(
        runPrisma(schemaOnly(unaligned), 'format', '--check'),
      ).rejects.toThrow(),
    ]);
  }, 60_000);

  it.each([
    ['blog', blogProject],
    ['shop', shopProject],
    ['every-field', everyFieldProject],
  ])(
    'writes a valid, formatted Prisma schema for the %s project',
    async (_name, project) => {
      const files = filesOf(project);

      await Promise.all([
        runPrisma(files, 'validate'),
        runPrisma(files, 'format', '--check'),
      ]);
    },
    60_000,
  );

  it.each([
    [
      'blog',
      blogProject,
      [
        'ALTER TABLE "Post" ADD CONSTRAINT "Post_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id")',
        'ALTER TABLE "Comment" ADD CONSTRAINT "Comment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id")',
        'ALTER TABLE "Comment" ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id")',
        'CREATE INDEX "Post_userId_idx" ON "Post"("userId")',
      ],
    ],
    [
      'shop',
      shopProject,
      [
        'CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId")',
        'ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id")',
        'CREATE TABLE "_CategoryToProduct"',
        'ADD CONSTRAINT "_CategoryToProduct_A_fkey" FOREIGN KEY ("A") REFERENCES "Category"("id")',
        'ADD CONSTRAINT "_CategoryToProduct_B_fkey" FOREIGN KEY ("B") REFERENCES "Product"("id")',
      ],
    ],
  ])(
    'creates the foreign keys and join tables of the %s sample project in SQL',
    async (_name, project, statements) => {
      const sql = await runPrisma(
        filesOf(project),
        'migrate',
        'diff',
        '--from-empty',
        '--to-schema',
        'prisma/schema.prisma',
        '--script',
      );

      for (const statement of statements) expect(sql).toContain(statement);
    },
    60_000,
  );
});
