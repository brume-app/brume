import type { Model, Project, RelationKind } from '@brume/shared';
import type { GenerationIssue } from './types';

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
 *
 * @returns Every issue found, or an empty array if the project is valid.
 */
export function validate(project: Project): GenerationIssue[] {
  return [
    ...duplicateIds(project),
    ...checkRelations(project).issues,
    ...duplicateEnumValues(project),
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
