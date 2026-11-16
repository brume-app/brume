import type { Field, Project, Relation, RelationKind } from '@brume/shared';
import { enumName, PRIMARY_KEY_NAME, relationNames } from './naming';

/**
 * The internal representation the generator works on.
 *
 * @remarks
 * Built by {@link parse} from a valid project. Unlike the project document,
 * it holds everything the output steps need: the primary key, the foreign keys
 * and the relation fields of each model, with relations pointing to the models
 * themselves. It does not depend on Prisma, so every output step can use it.
 */
export interface ProjectModel {
  /** Name of the project. */
  name: string;
  /** Models, in project order. */
  models: ParsedModel[];
  /** Relations, in project order. */
  relations: ParsedRelation[];
}

/**
 * A model with everything the generator adds to it.
 */
export interface ParsedModel {
  /** Model name, as written by the user. */
  name: string;
  /** The primary key the generator adds. */
  primaryKey: PrimaryKey;
  /** Fields defined by the user, in project order. */
  fields: ParsedField[];
  /** Foreign keys deduced from the relations, in relation order. */
  foreignKeys: ForeignKey[];
  /** Relation fields deduced from the relations, in relation order. */
  relationFields: RelationField[];
}

/**
 * The primary key of a model.
 */
export interface PrimaryKey {
  /** Field name of the key. */
  name: string;
}

/**
 * A field defined by the user. An `enum` field also gets the name of the enum
 * generated for it.
 */
export type ParsedField =
  | Exclude<Field, { type: 'enum' }>
  | (Extract<Field, { type: 'enum' }> & { enumName: string });

/**
 * A field that stores the primary key of a record of another model.
 */
export interface ForeignKey {
  /** Field name of the key, for example `userId`. */
  name: string;
  /** Model whose primary key is stored. */
  target: ParsedModel;
  /** Whether two records can point to the same target (one-to-one). */
  unique: boolean;
  /** Whether a record must point to a target. Always `false` until #119. */
  required: boolean;
}

/**
 * A field that gives access to the records of another model through a
 * relation.
 */
export interface RelationField {
  /** Field name, for example `user` or `posts`. */
  name: string;
  /** Model the field points to. */
  target: ParsedModel;
  /** Whether the field holds a list of records. */
  isList: boolean;
  /** Whether the field must hold a record. Always `false` until #119. */
  required: boolean;
  /** The foreign key behind the field, on the side that stores it. */
  foreignKey?: ForeignKey;
}

/**
 * A relation between two models, with the relation field it adds to each side.
 */
export interface ParsedRelation {
  /** Cardinality of the relation. */
  kind: RelationKind;
  /** Model on the `from` side, the "one" side of a one-to-many relation. */
  from: ParsedModel;
  /** Model on the `to` side. */
  to: ParsedModel;
  /** Relation field added to `from`, pointing to `to`. */
  fromField: RelationField;
  /** Relation field added to `to`, pointing to `from`. */
  toField: RelationField;
}

/**
 * Turns a valid project into the generator internal model.
 *
 * @remarks
 * Expects a project already checked by `validate`. Models and fields keep
 * their order and names, `layout` is dropped, and the generator additions
 * follow these naming rules (see `naming.ts`):
 *
 * - Every model gets the primary key `id`.
 * - A relation field holding one record is named after its model in camel
 *   case, keeping acronyms readable: `User` gives `user`, `URL` gives `url`.
 * - A relation field holding a list is the plural of that name, with
 *   `pluralize`: `Category` gives `categories`.
 * - A foreign key is named after its relation field, plus `Id`: `userId`.
 * - An `enum` field gets the enum name `<Model><Field>`: `ProductStatus`.
 *
 * Each relation kind adds these fields, for a relation from `User` to `Post`:
 *
 * - `one-to-many`: `User.posts` (list), `Post.user` and the foreign key
 *   `Post.userId`.
 * - `one-to-one`: `User.post`, `Post.user` and the unique foreign key
 *   `Post.userId`.
 * - `many-to-many`: `User.posts` and `Post.users` (lists), no foreign key: the
 *   join is left to the output step.
 *
 * @throws Error when a relation points to an unknown model, which `validate`
 * reports first.
 */
export function parse(project: Project): ProjectModel {
  const modelsById = new Map<string, ParsedModel>();
  const models = project.models.map((model) => {
    const parsed: ParsedModel = {
      name: model.name,
      primaryKey: { name: PRIMARY_KEY_NAME },
      fields: model.fields.map((field) => parseField(model.name, field)),
      foreignKeys: [],
      relationFields: [],
    };
    modelsById.set(model.id, parsed);
    return parsed;
  });

  const findModel = (relation: Relation, modelId: string) => {
    const model = modelsById.get(modelId);
    if (!model) {
      throw new Error(
        `Relation ${relation.id} points to unknown model ${modelId}: run validate before parse`,
      );
    }
    return model;
  };
  const relations = project.relations.map((relation) =>
    parseRelation(
      relation.kind,
      findModel(relation, relation.from),
      findModel(relation, relation.to),
    ),
  );

  return { name: project.name, models, relations };
}

function parseField(modelName: string, field: Field): ParsedField {
  return field.type === 'enum'
    ? { ...field, enumName: enumName(modelName, field.name) }
    : { ...field };
}

function parseRelation(
  kind: RelationKind,
  from: ParsedModel,
  to: ParsedModel,
): ParsedRelation {
  const [fromField, toField] = relationFields(kind, from, to);
  from.relationFields.push(fromField);
  to.relationFields.push(toField);
  if (toField.foreignKey) to.foreignKeys.push(toField.foreignKey);
  return { kind, from, to, fromField, toField };
}

/** Fields added to the `from` and `to` sides, foreign key on the `to` side. */
function relationFields(
  kind: RelationKind,
  from: ParsedModel,
  to: ParsedModel,
): [RelationField, RelationField] {
  const names = relationNames(kind, from.name, to.name);
  const fromField: RelationField = {
    name: names.from,
    target: to,
    isList: kind !== 'one-to-one',
    required: false,
  };
  const toField: RelationField = {
    name: names.to,
    target: from,
    isList: kind === 'many-to-many',
    required: false,
  };
  if (names.foreignKey) {
    toField.foreignKey = {
      name: names.foreignKey,
      target: from,
      unique: kind === 'one-to-one',
      required: false,
    };
  }
  return [fromField, toField];
}
