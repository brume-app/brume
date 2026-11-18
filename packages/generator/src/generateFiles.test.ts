import type { Project } from '@brume/shared';
import { blogProject, shopProject } from '@brume/shared/fixtures';
import { execFile } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
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
 * Runs the Prisma CLI of the same version as `apps/api` on a schema, in a
 * temporary folder. Rejects with Prisma's output when the command fails.
 */
async function runPrisma(schema: string, ...args: string[]): Promise<void> {
  const folder = await mkdtemp(join(tmpdir(), 'brume-prisma-'));
  try {
    const schemaFile = join(folder, 'schema.prisma');
    await writeFile(schemaFile, schema);
    await promisify(execFile)(
      process.execPath,
      [prismaCli, ...args, '--schema', schemaFile],
      { cwd: folder, env: { ...process.env, CHECKPOINT_DISABLE: '1' } },
    );
  } finally {
    await rm(folder, { recursive: true, force: true });
  }
}

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
      expect(runPrisma(invalid, 'validate')).rejects.toThrow(),
      expect(runPrisma(unaligned, 'format', '--check')).rejects.toThrow(),
    ]);
  }, 60_000);

  it.each([
    ['blog', blogProject],
    ['shop', shopProject],
    ['every-field', everyFieldProject],
  ])(
    'writes a valid, formatted Prisma schema for the %s project',
    async (_name, project) => {
      const schema = filesOf(project).get('prisma/schema.prisma') ?? '';

      await Promise.all([
        runPrisma(schema, 'validate'),
        runPrisma(schema, 'format', '--check'),
      ]);
    },
    60_000,
  );
});
