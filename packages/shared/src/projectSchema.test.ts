import { describe, expect, it } from 'vitest';
import { blogProject } from './fixtures/blogProject';
import { shopProject } from './fixtures/shopProject';
import { fieldSchema, fieldTypeSchema, projectSchema } from './projectSchema';

const baseField = {
  id: 'field-1',
  name: 'title',
  required: true,
  unique: false,
};

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
});
