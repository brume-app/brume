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

  it.each([
    [
      'a name over the limit',
      { name: 'a'.repeat(projectLimits.projectNameLength + 1) },
    ],
    [
      'an id over the limit',
      {
        models: [
          { id: 'a'.repeat(projectLimits.idLength + 1), name: 'A', fields: [] },
        ],
      },
    ],
    [
      'too many models',
      {
        models: times(projectLimits.models + 1, (index) => ({
          id: `model-${index}`,
          name: `Model${index}`,
          fields: [],
        })),
      },
    ],
    [
      'too many fields in a model',
      {
        models: [
          {
            id: 'model',
            name: 'Model',
            fields: times(projectLimits.fieldsPerModel + 1, (index) => ({
              ...baseField,
              id: `field-${index}`,
              name: `field${index}`,
              type: 'string',
            })),
          },
        ],
      },
    ],
    [
      'too many relations',
      {
        relations: times(projectLimits.relations + 1, (index) => ({
          id: `relation-${index}`,
          from: 'user',
          to: 'post',
          kind: 'one-to-many',
        })),
      },
    ],
    [
      'too many layout entries',
      {
        layout: Object.fromEntries(
          times(projectLimits.models + 1, (index) => [
            `model-${index}`,
            { x: 0, y: 0 },
          ]),
        ),
      },
    ],
  ])('rejects %s', (_case, changes) => {
    expect(
      projectSchema.safeParse({ ...blogProject, ...changes }).success,
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
    [
      'a name over the limit',
      {
        ...baseField,
        name: 'a'.repeat(projectLimits.identifierLength + 1),
        type: 'string',
      },
    ],
    [
      'a string default over the limit',
      {
        ...baseField,
        type: 'string',
        defaultValue: 'a'.repeat(projectLimits.defaultValueLength + 1),
      },
    ],
    [
      'too many enum values',
      {
        ...baseField,
        type: 'enum',
        enumValues: times(
          projectLimits.enumValues + 1,
          (index) => `VALUE_${index}`,
        ),
      },
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
      'a name at the limit',
      {
        ...baseField,
        name: 'a'.repeat(projectLimits.identifierLength),
        type: 'string',
      },
    ],
    [
      'a json default',
      { ...baseField, type: 'json', defaultValue: { theme: 'dark' } },
    ],
  ])('accepts %s', (_case, field) => {
    expect(fieldSchema.safeParse(field).success).toBe(true);
  });
});
