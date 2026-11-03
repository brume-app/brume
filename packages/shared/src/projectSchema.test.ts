import { describe, expect, it } from 'vitest';
import { blogProject, shopProject } from './fixtures/index.js';
import {
  fieldSchema,
  fieldTypeSchema,
  projectLimits,
  projectSchema,
} from './projectSchema.js';

const baseField = {
  id: 'field-1',
  name: 'title',
  required: true,
  unique: false,
};

const times = <T>(count: number, item: (index: number) => T) =>
  Array.from({ length: count }, (_, index) => item(index));

describe('projectSchema', () => {
  it.each([
    ['blog', blogProject],
    ['shop', shopProject],
  ])('accepts the %s sample project', (_name, project) => {
    expect(projectSchema.safeParse(project).success).toBe(true);
  });

  it('rejects an unsupported version', () => {
    expect(
      projectSchema.safeParse({ ...blogProject, version: 2 }).success,
    ).toBe(false);
  });

  it('rejects unknown properties', () => {
    expect(
      projectSchema.safeParse({ ...blogProject, nmae: 'Blog' }).success,
    ).toBe(false);
  });

  const sizeCases: [string, number, (size: number) => object][] = [
    [
      'name length',
      projectLimits.projectNameLength,
      (size) => ({ name: 'a'.repeat(size) }),
    ],
    [
      'id length',
      projectLimits.idLength,
      (size) => ({
        models: [{ id: 'a'.repeat(size), name: 'A', fields: [] }],
      }),
    ],
    [
      'model count',
      projectLimits.models,
      (size) => ({
        models: times(size, (index) => ({
          id: `model-${index}`,
          name: `Model${index}`,
          fields: [],
        })),
      }),
    ],
    [
      'field count',
      projectLimits.fieldsPerModel,
      (size) => ({
        models: [
          {
            id: 'model',
            name: 'Model',
            fields: times(size, (index) => ({
              ...baseField,
              id: `field-${index}`,
              name: `field${index}`,
              type: 'string',
            })),
          },
        ],
      }),
    ],
    [
      'relation count',
      projectLimits.relations,
      (size) => ({
        relations: times(size, (index) => ({
          id: `relation-${index}`,
          from: 'user',
          to: 'post',
          kind: 'one-to-many',
        })),
      }),
    ],
    [
      'layout size',
      projectLimits.models,
      (size) => ({
        layout: Object.fromEntries(
          times(size, (index) => [`model-${index}`, { x: 0, y: 0 }]),
        ),
      }),
    ],
  ];

  it.each(sizeCases)('accepts a %s at the limit', (_case, limit, changes) => {
    expect(
      projectSchema.safeParse({ ...blogProject, ...changes(limit) }).success,
    ).toBe(true);
  });

  it.each(sizeCases)('rejects a %s over the limit', (_case, limit, changes) => {
    expect(
      projectSchema.safeParse({ ...blogProject, ...changes(limit + 1) })
        .success,
    ).toBe(false);
  });
});

describe('fieldSchema', () => {
  it('has one variant per field type', () => {
    const variantTypes = fieldSchema.options.map(
      (variant) => variant.shape.type.value,
    );

    expect(variantTypes).toEqual(fieldTypeSchema.options);
  });

  it.each([
    [
      'a number default given as text',
      { ...baseField, type: 'number', defaultValue: '0' },
    ],
    [
      'a default outside the enum values',
      {
        ...baseField,
        type: 'enum',
        enumValues: ['DRAFT'],
        defaultValue: 'ARCHIVED',
      },
    ],
    ['an enum without values', { ...baseField, type: 'enum', enumValues: [] }],
    [
      'enum values on a non-enum field',
      { ...baseField, type: 'string', enumValues: ['DRAFT'] },
    ],
    [
      'a date default that is not ISO 8601',
      { ...baseField, type: 'date', defaultValue: 'tomorrow' },
    ],
    [
      'a name that is not an identifier',
      { ...baseField, name: 'my field', type: 'string' },
    ],
    ['an unknown type', { ...baseField, type: 'text' }],
    ['an unknown property', { ...baseField, type: 'string', hint: 'Title' }],
  ])('rejects %s', (_case, field) => {
    expect(fieldSchema.safeParse(field).success).toBe(false);
  });

  it.each([
    [
      'a date defaulting to now',
      { ...baseField, type: 'date', defaultValue: 'now' },
    ],
    [
      'a date defaulting to an ISO date-time',
      { ...baseField, type: 'date', defaultValue: '2026-01-01T00:00:00Z' },
    ],
    [
      'a json default',
      { ...baseField, type: 'json', defaultValue: { theme: 'dark' } },
    ],
  ])('accepts %s', (_case, field) => {
    expect(fieldSchema.safeParse(field).success).toBe(true);
  });

  const sizeCases: [string, number, (size: number) => object][] = [
    [
      'name length',
      projectLimits.identifierLength,
      (size) => ({ ...baseField, name: 'a'.repeat(size), type: 'string' }),
    ],
    [
      'string default length',
      projectLimits.defaultValueLength,
      (size) => ({
        ...baseField,
        type: 'string',
        defaultValue: 'a'.repeat(size),
      }),
    ],
    [
      'enum value count',
      projectLimits.enumValues,
      (size) => ({
        ...baseField,
        type: 'enum',
        enumValues: times(size, (index) => `VALUE_${index}`),
      }),
    ],
  ];

  it.each(sizeCases)('accepts a %s at the limit', (_case, limit, field) => {
    expect(fieldSchema.safeParse(field(limit)).success).toBe(true);
  });

  it.each(sizeCases)('rejects a %s over the limit', (_case, limit, field) => {
    expect(fieldSchema.safeParse(field(limit + 1)).success).toBe(false);
  });
});
