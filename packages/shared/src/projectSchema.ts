import { z } from 'zod';

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

/**
 * A single field defined inside a model.
 *
 * @remarks
 * `defaultValue` is stored as the text the user typed in the canvas. The
 * generator checks that it matches the field type. `enumValues` is only
 * meaningful when `type` is `enum`. Its consistency is checked by the
 * generator before generation.
 */
export const fieldSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: fieldTypeSchema,
  required: z.boolean(),
  unique: z.boolean(),
  defaultValue: z.string().optional(),
  enumValues: z.array(z.string()).optional(),
});

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
export const modelSchema = z.object({
  id: z.string(),
  name: z.string(),
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
export const relationSchema = z.object({
  id: z.string(),
  from: z.string(),
  to: z.string(),
  kind: relationKindSchema,
});

/**
 * A relation between two models.
 */
export type Relation = z.infer<typeof relationSchema>;

/**
 * Position of a block on the canvas.
 */
export const positionSchema = z.object({
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
 */
export const projectSchema = z.object({
  version: z.literal(1),
  name: z.string(),
  models: z.array(modelSchema),
  relations: z.array(relationSchema),
  layout: z.record(z.string(), positionSchema),
});

/**
 * A Brume project, shared by the canvas, the API and the generator.
 */
export type Project = z.infer<typeof projectSchema>;
