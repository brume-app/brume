import type { Field, Project } from '@brume/shared';
import { describe, expect, it } from 'vitest';
import { parse } from './parse';
import { prismaSchema } from './prismaSchema';

/** The schema of a project with one model `Item` holding `fields`. */
function schemaWith(fields: Field[]): string {
  const project: Project = {
    version: 1,
    name: 'Test',
    models: [{ id: 'item', name: 'Item', fields }],
    relations: [],
    layout: {},
  };
  return prismaSchema(parse(project));
}

/** The schema line of a field named `value`, with its spaces collapsed. */
function valueLine(field: Partial<Field>): string {
  const schema = schemaWith([
    { id: 'value', name: 'value', required: true, unique: false, ...field },
  ] as Field[]);
  const line = schema
    .split('\n')
    .find((text) => text.trim().startsWith('value '));
  return (line ?? '').trim().replace(/\s+/g, ' ');
}

describe('prismaSchema', () => {
  it('starts each model with a UUID v7 primary key', () => {
    expect(schemaWith([])).toContain(
      'model Item {\n  id String @id @default(uuid(7)) @db.Uuid\n}',
    );
  });

  it.each([
    ['string', 'String'],
    ['number', 'Float'],
    ['boolean', 'Boolean'],
    ['date', 'DateTime'],
    ['json', 'Json'],
  ] as const)('maps a %s field to %s', (type, prismaType) => {
    expect(valueLine({ type })).toBe(`value ${prismaType}`);
  });

  it('maps an enum field to its generated enum', () => {
    const schema = schemaWith([
      {
        id: 'status',
        name: 'status',
        type: 'enum',
        required: true,
        unique: false,
        enumValues: ['DRAFT', 'PUBLISHED'],
      },
    ]);

    expect(schema).toMatch(/status +ItemStatus\n/);
    expect(schema).toContain('enum ItemStatus {\n  DRAFT\n  PUBLISHED\n}\n');
  });

  it('makes a field that is not required optional', () => {
    expect(valueLine({ type: 'string', required: false })).toBe(
      'value String?',
    );
  });

  it('adds @unique to a unique field', () => {
    expect(valueLine({ type: 'string', unique: true })).toBe(
      'value String @unique',
    );
  });

  it.each([
    ['a string', { type: 'string', defaultValue: 'hello' }, '"hello"'],
    [
      'a string with quotes, a backslash and a line break, escaped',
      { type: 'string', defaultValue: 'say "hi" \\ back\nline' },
      '"say \\"hi\\" \\\\ back\\nline"',
    ],
    ['a number', { type: 'number', defaultValue: 19.99 }, '19.99'],
    ['a negative number', { type: 'number', defaultValue: -1.5 }, '-1.5'],
    ['a tiny number', { type: 'number', defaultValue: 1.5e-7 }, '0.00000015'],
    [
      'a huge number',
      { type: 'number', defaultValue: 1.25e22 },
      '12500000000000000000000',
    ],
    ['a boolean', { type: 'boolean', defaultValue: false }, 'false'],
    ['the creation date', { type: 'date', defaultValue: 'now' }, 'now()'],
    [
      'a date-time',
      { type: 'date', defaultValue: '2026-01-01T00:00:00Z' },
      '"2026-01-01T00:00:00Z"',
    ],
    [
      'a JSON value',
      { type: 'json', defaultValue: { theme: 'dark' } },
      '"{\\"theme\\":\\"dark\\"}"',
    ],
    [
      'an enum value',
      { type: 'enum', enumValues: ['DRAFT', 'DONE'], defaultValue: 'DONE' },
      'DONE',
    ],
  ] as [string, Partial<Field>, string][])(
    'writes %s as a default',
    (_case, field, written) => {
      expect(valueLine(field)).toMatch(
        new RegExp(` @default\\(${escapeRegExp(written)}\\)$`),
      );
    },
  );

  it('writes @unique before @default', () => {
    expect(valueLine({ type: 'string', unique: true, defaultValue: 'x' })).toBe(
      'value String @unique @default("x")',
    );
  });
});

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
