import {
  projectLimits,
  type Model,
  type Project,
  type RelationKind,
} from '@brume/shared';
import { enumName, PRIMARY_KEY_NAME, relationNames } from './naming';
import type { GenerationIssue } from './types';

/**
 * Model and enum names that Prisma rejects.
 *
 * @remarks
 * Measured on Prisma 7.10.1: its scalar type names, `PrismaClient` and the
 * JavaScript keywords. Field names have no reserved words.
 */
export const RESERVED_TYPE_NAMES: ReadonlySet<string> = new Set([
  ...['String', 'Int', 'Float', 'Boolean', 'DateTime', 'Json', 'Bytes'],
  ...['Decimal', 'BigInt', 'PrismaClient'],
  ...['async', 'await', 'break', 'case', 'catch', 'class', 'const'],
  ...['continue', 'debugger', 'default', 'delete', 'do', 'else', 'enum'],
  ...['export', 'extends', 'false', 'finally', 'for', 'function', 'if'],
  ...['implements', 'import', 'in', 'instanceof', 'interface', 'let'],
  ...['new', 'null', 'package', 'private', 'protected', 'public'],
  ...['return', 'super', 'switch', 'this', 'throw', 'true', 'try'],
  ...['typeof', 'var', 'void', 'while', 'with', 'yield'],
]);

type Path = GenerationIssue['path'];

/** A relation whose two ends are distinct models, the only ones `parse` gets. */
interface LinkedRelation {
  index: number;
  kind: RelationKind;
  from: Model;
  to: Model;
}

/**
 * Checks that a project is consistent before generation.
 *
 * @remarks
 * The project must already match `projectSchema`: this only checks what the
 * schema cannot, across items. Each issue points to the item to change, and
 * names the other side when two items collide. The checks are:
 *
 * - Two items (models, fields, relations) with the same `id`.
 * - A relation whose `from` or `to` is not a model id.
 * - A relation from a model to itself, or two relations between the same two
 *   models: not supported yet, the format has no relation name to tell them
 *   apart.
 * - An enum with the same value twice.
 * - Two model or generated enum names that are equal ignoring case (`User` and
 *   `user` both give `prisma.user`), or a generated enum named like a model.
 * - A model or generated enum name that Prisma reserves
 *   ({@link RESERVED_TYPE_NAMES}).
 * - Two fields of a model with the same name, counting the fields `parse`
 *   adds: the primary key `id`, the foreign keys and the relation fields.
 * - A generated foreign key or enum name longer than 63 characters:
 *   PostgreSQL would shorten it, and two shortened names could clash.
 *
 * @returns Every issue found, or an empty array if the project is valid.
 */
export function validate(project: Project): GenerationIssue[] {
  const { issues: relationIssues, linked } = checkRelations(project);
  return [
    ...duplicateIds(project),
    ...relationIssues,
    ...duplicateEnumValues(project),
    ...typeNameIssues(project),
    ...fieldNameIssues(project, linked),
  ];
}

function duplicateIds(project: Project): GenerationIssue[] {
  const items: { id: string; path: Path }[] = [
    ...project.models.flatMap((model, m) => [
      { id: model.id, path: ['models', m, 'id'] },
      ...model.fields.map((field, f) => ({
        id: field.id,
        path: ['models', m, 'fields', f, 'id'],
      })),
    ]),
    ...project.relations.map((relation, r) => ({
      id: relation.id,
      path: ['relations', r, 'id'],
    })),
  ];
  return duplicates(items, (item) => item.id).map(([item]) =>
    issue(item.path, `Another item already has the id "${item.id}"`),
  );
}

function checkRelations(project: Project) {
  const modelsById = new Map(project.models.map((model) => [model.id, model]));
  const issues: GenerationIssue[] = [];
  const linked: LinkedRelation[] = [];

  project.relations.forEach((relation, index) => {
    const from = modelsById.get(relation.from);
    const to = modelsById.get(relation.to);
    for (const side of ['from', 'to'] as const) {
      if (!modelsById.has(relation[side])) {
        issues.push(
          issue(
            ['relations', index, side],
            `This relation points to a model that does not exist (id "${relation[side]}")`,
          ),
        );
      }
    }
    if (!from || !to) return;
    if (from === to) {
      issues.push(
        issue(
          ['relations', index],
          'A relation from a model to itself is not supported yet',
        ),
      );
      return;
    }
    linked.push({ index, kind: relation.kind, from, to });
  });

  const pairs = duplicates(linked, ({ from, to }) =>
    [from.id, to.id].sort().join(' '),
  );
  for (const [relation] of pairs) {
    issues.push(
      issue(
        ['relations', relation.index],
        `${relation.from.name} and ${relation.to.name} are already linked by another relation: two relations between the same models are not supported yet`,
      ),
    );
  }
  const duplicated = new Set(pairs.map(([relation]) => relation));
  return {
    issues,
    linked: linked.filter((relation) => !duplicated.has(relation)),
  };
}

function duplicateEnumValues(project: Project): GenerationIssue[] {
  return project.models.flatMap((model, m) =>
    model.fields.flatMap((field, f) => {
      if (field.type !== 'enum') return [];
      const values = field.enumValues.map((value, v) => ({ value, v }));
      return duplicates(values, ({ value }) => value).map(([{ value, v }]) =>
        issue(
          ['models', m, 'fields', f, 'enumValues', v],
          `The value ${value} appears twice`,
        ),
      );
    }),
  );
}

/** A model name, or the name of the enum generated for an `enum` field. */
interface TypeName {
  name: string;
  path: Path;
  /** `undefined` for a model, `<Model>.<field>` for a generated enum. */
  enumOf?: string;
}

function typeNameIssues(project: Project): GenerationIssue[] {
  const models: TypeName[] = project.models.map((model, m) => ({
    name: model.name,
    path: ['models', m, 'name'],
  }));
  const enums: TypeName[] = project.models.flatMap((model, m) =>
    model.fields.flatMap((field, f) =>
      field.type === 'enum'
        ? [
            {
              name: enumName(model.name, field.name),
              path: ['models', m, 'fields', f, 'name'],
              enumOf: `${model.name}.${field.name}`,
            },
          ]
        : [],
    ),
  );
  const types = [...models, ...enums];
  const subject = (type: TypeName) =>
    type.enumOf
      ? `The enum generated for ${type.enumOf} would be named "${type.name}"`
      : `This model is named "${type.name}"`;

  return [
    ...duplicates(types, (type) => type.name.toLowerCase()).map(
      ([type, first]) => {
        const other = first.enumOf
          ? `the enum generated for ${first.enumOf}`
          : `the model ${first.name}`;
        const ignoringCase =
          type.name === first.name ? '' : ' (names are compared ignoring case)';
        return issue(
          type.path,
          `${subject(type)}, like ${other}${ignoringCase}`,
        );
      },
    ),
    ...types
      .filter((type) => RESERVED_TYPE_NAMES.has(type.name))
      .map((type) =>
        issue(type.path, `${subject(type)}, a name Prisma reserves`),
      ),
    ...enums
      .filter((type) => type.name.length > projectLimits.identifierLength)
      .map((type) =>
        issue(type.path, `${subject(type)}, ${tooLong(type.name)}`),
      ),
  ];
}

/** A field of a model, as `parse` will create it. */
interface FieldName {
  name: string;
  path: Path;
  origin: 'primary key' | 'field' | 'foreign key' | 'relation field';
  relation?: LinkedRelation;
}

function fieldNameIssues(
  project: Project,
  linked: LinkedRelation[],
): GenerationIssue[] {
  const fieldsByModel = new Map<Model, FieldName[]>(
    project.models.map((model, m) => [
      model,
      [{ name: PRIMARY_KEY_NAME, path: ['models', m], origin: 'primary key' }],
    ]),
  );
  const add = (model: Model, field: FieldName) =>
    fieldsByModel.get(model)?.push(field);

  // Generated fields come before the user's fields, so that a collision
  // points to the user's field, the one that can be renamed.
  for (const relation of linked) {
    const { from, to, index, kind } = relation;
    const names = relationNames(kind, from.name, to.name);
    const generated = (name: string, origin: FieldName['origin']) => ({
      name,
      path: ['relations', index],
      origin,
      relation,
    });
    add(from, generated(names.from, 'relation field'));
    add(to, generated(names.to, 'relation field'));
    if (names.foreignKey) add(to, generated(names.foreignKey, 'foreign key'));
  }
  project.models.forEach((model, m) =>
    model.fields.forEach((field, f) =>
      add(model, {
        name: field.name,
        path: ['models', m, 'fields', f, 'name'],
        origin: 'field',
      }),
    ),
  );

  return project.models.flatMap((model) => {
    const fields = fieldsByModel.get(model) ?? [];
    const clashes = duplicates(fields, (field) => field.name).map(
      ([field, first]) =>
        issue(
          field.path,
          `${model.name} would have two fields named "${field.name}": ${describeField(field, 'this')} and ${describeField(first, 'other')}`,
        ),
    );
    const tooLongKeys = fields
      .filter(
        (field) =>
          field.origin === 'foreign key' &&
          field.name.length > projectLimits.identifierLength,
      )
      .map((field) =>
        issue(
          field.path,
          `The foreign key "${field.name}" this relation adds to ${model.name} is ${tooLong(field.name)}`,
        ),
      );
    return [...clashes, ...tooLongKeys];
  });
}

function describeField(field: FieldName, which: 'this' | 'other'): string {
  const relation = field.relation
    ? `the relation ${field.relation.from.name} → ${field.relation.to.name}`
    : '';
  switch (field.origin) {
    case 'primary key':
      return 'the primary key the generator adds';
    case 'field':
      return which === 'this' ? 'this field' : 'another field';
    case 'foreign key':
    case 'relation field':
      return which === 'this'
        ? `the ${field.origin} of this relation`
        : `the ${field.origin} of ${relation}`;
  }
}

function tooLong(name: string): string {
  return `${name.length} characters long, over the ${projectLimits.identifierLength} PostgreSQL allows`;
}

/**
 * Returns each item whose key was already seen, with the first item that had
 * that key.
 */
function duplicates<T>(items: T[], key: (item: T) => string): [T, T][] {
  const firstByKey = new Map<string, T>();
  const pairs: [T, T][] = [];
  for (const item of items) {
    const first = firstByKey.get(key(item));
    if (first === undefined) firstByKey.set(key(item), item);
    else pairs.push([item, first]);
  }
  return pairs;
}

function issue(path: Path, message: string): GenerationIssue {
  return { path, message };
}
