import { z } from 'zod';

/**
 * A name usable as an identifier in the generated code.
 *
 * @remarks
 * Starts with a letter, then only letters, digits and underscores, so the
 * generator can use it as is in Prisma and TypeScript.
 */
export const identifierSchema = z.string().regex(/^[A-Za-z][A-Za-z0-9_]*$/);

/**
 * Data types a model field can hold.
 */
export const fieldTypeSchema = z.enum([
  'string',
  'number',
  'boolean',
  'date',
  'json',
  'enum',
]);

/**
 * A data type a model field can hold.
 */
export type FieldType = z.infer<typeof fieldTypeSchema>;

const fieldBase = {
  id: z.string().min(1),
  name: identifierSchema,
  required: z.boolean(),
  unique: z.boolean(),
};

/**
 * A single field defined inside a model.
 *
 * @remarks
 * The shape depends on `type`: `defaultValue` must match the field type, and
 * only `enum` fields have `enumValues`. A `date` default is either `now` (the
 * creation date) or an ISO 8601 date-time. Unknown properties are rejected.
 */
export const fieldSchema = z.discriminatedUnion('type', [
  z.strictObject({
    ...fieldBase,
    type: z.literal('string'),
    defaultValue: z.string().optional(),
  }),
  z.strictObject({
    ...fieldBase,
    type: z.literal('number'),
    defaultValue: z.number().optional(),
  }),
  z.strictObject({
    ...fieldBase,
    type: z.literal('boolean'),
    defaultValue: z.boolean().optional(),
  }),
  z.strictObject({
    ...fieldBase,
    type: z.literal('date'),
    defaultValue: z.union([z.literal('now'), z.iso.datetime()]).optional(),
  }),
  z.strictObject({
    ...fieldBase,
    type: z.literal('json'),
    defaultValue: z.json().optional(),
  }),
  z
    .strictObject({
      ...fieldBase,
      type: z.literal('enum'),
      enumValues: z.array(identifierSchema).min(1),
      defaultValue: z.string().optional(),
    })
    .refine(
      (field) =>
        field.defaultValue === undefined ||
        field.enumValues.includes(field.defaultValue),
      {
        message: 'defaultValue must be one of enumValues',
        path: ['defaultValue'],
      },
    ),
]);

/**
 * A single field defined inside a model.
 */
export type Field = z.infer<typeof fieldSchema>;

/**
 * A data model drawn as a block on the canvas.
 *
 * @remarks
 * `fields` only lists the fields the user defined. The generator adds the
 * primary key `id` and the foreign keys deduced from `relations`.
 */
export const modelSchema = z.strictObject({
  id: z.string().min(1),
  name: identifierSchema,
  fields: z.array(fieldSchema),
});

/**
 * A data model drawn as a block on the canvas.
 */
export type Model = z.infer<typeof modelSchema>;

/**
 * Cardinalities a relation between two models can have.
 */
export const relationKindSchema = z.enum([
  'one-to-one',
  'one-to-many',
  'many-to-many',
]);

/**
 * A cardinality a relation between two models can have.
 */
export type RelationKind = z.infer<typeof relationKindSchema>;

/**
 * A relation between two models.
 *
 * @remarks
 * `from` and `to` are model ids. For `one-to-many`, `from` is the "one" side:
 * a relation from `User` to `Post` means a user has many posts.
 */
export const relationSchema = z.strictObject({
  id: z.string().min(1),
  from: z.string().min(1),
  to: z.string().min(1),
  kind: relationKindSchema,
});

/**
 * A relation between two models.
 */
export type Relation = z.infer<typeof relationSchema>;

/**
 * Position of a block on the canvas.
 */
export const positionSchema = z.strictObject({
  x: z.number(),
  y: z.number(),
});

/**
 * Position of a block on the canvas.
 */
export type Position = z.infer<typeof positionSchema>;

/**
 * A Brume project, shared by the canvas, the API and the generator.
 *
 * @remarks
 * This document is the single source of truth: the canvas builds its nodes
 * from `models` and `layout`, the API saves it as is and the generator ignores
 * `layout`. `layout` maps a model id to the position of its block. `version`
 * is raised on every breaking change so saved projects can be migrated.
 * Checks across models and relations (duplicate names, unknown relation
 * targets) are done by the generator before generation.
 */
export const projectSchema = z.strictObject({
  version: z.literal(1),
  name: z.string().min(1),
  models: z.array(modelSchema),
  relations: z.array(relationSchema),
  layout: z.record(z.string(), positionSchema),
});

/**
 * A Brume project, shared by the canvas, the API and the generator.
 */
export type Project = z.infer<typeof projectSchema>;
