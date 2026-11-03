import { z } from 'zod';

/**
 * Maximum lengths and counts a project accepts.
 *
 * @remarks
 * They bound the size of a saved document. `identifierLength` is the longest
 * name PostgreSQL keeps without truncating it. `json` defaults have no limit
 * of their own: the API caps the size of the whole request body.
 */
export const projectLimits = {
  idLength: 64,
  identifierLength: 63,
  projectNameLength: 100,
  defaultValueLength: 1000,
  models: 200,
  fieldsPerModel: 200,
  enumValues: 100,
  relations: 500,
} as const;

/**
 * A name usable as an identifier in the generated code.
 *
 * @remarks
 * Starts with a letter, then only letters, digits and underscores, so the
 * generator can use it as is in Prisma and TypeScript.
 */
export const identifierSchema = z
  .string()
  .max(projectLimits.identifierLength)
  .regex(/^[A-Za-z][A-Za-z0-9_]*$/);

const idSchema = z.string().min(1).max(projectLimits.idLength);

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
  id: idSchema,
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
    defaultValue: z.string().max(projectLimits.defaultValueLength).optional(),
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
      enumValues: z
        .array(identifierSchema)
        .min(1)
        .max(projectLimits.enumValues),
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
  id: idSchema,
  name: identifierSchema,
  fields: z.array(fieldSchema).max(projectLimits.fieldsPerModel),
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
  id: idSchema,
  from: idSchema,
  to: idSchema,
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
  name: z.string().min(1).max(projectLimits.projectNameLength),
  models: z.array(modelSchema).max(projectLimits.models),
  relations: z.array(relationSchema).max(projectLimits.relations),
  layout: z
    .record(idSchema, positionSchema)
    .refine((layout) => Object.keys(layout).length <= projectLimits.models, {
      message: `layout must have at most ${projectLimits.models} entries`,
    }),
});

/**
 * A Brume project, shared by the canvas, the API and the generator.
 */
export type Project = z.infer<typeof projectSchema>;
