import type { Field, Model, Project, Relation } from '@brume/shared';
import { blogProject, shopProject } from '@brume/shared/fixtures';
import { describe, expect, it } from 'vitest';
import { validate } from './validate';

/** A copy of a sample project, modified by `change`. */
function variant(project: Project, change: (copy: Project) => void): Project {
  const copy = structuredClone(project);
  change(copy);
  return copy;
}

const stringField = (id: string, name: string): Field => ({
  id,
  name,
  type: 'string',
  required: false,
  unique: false,
});

const model = (id: string, name: string, fields: Field[] = []): Model => ({
  id,
  name,
  fields,
});

const relation = (
  id: string,
  from: string,
  to: string,
  kind: Relation['kind'] = 'one-to-many',
): Relation => ({ id, from, to, kind });

describe('validate', () => {
  it.each([
    ['blog', blogProject],
    ['shop', shopProject],
  ])('finds no issue in the %s sample project', (_name, project) => {
    expect(validate(project)).toEqual([]);
  });
});

describe('validate ids', () => {
  it.each([
    [
      'a model',
      (copy: Project) => copy.models.push(model('post', 'Tag')),
      ['models', 3, 'id'],
      'post',
    ],
    [
      'a field',
      (copy: Project) =>
        copy.models[2].fields.push(stringField('post-title', 'note')),
      ['models', 2, 'fields', 1, 'id'],
      'post-title',
    ],
    [
      'a relation',
      (copy: Project) => {
        copy.models.push(model('tag', 'Tag'));
        copy.relations.push(relation('user-posts', 'user', 'tag'));
      },
      ['relations', 3, 'id'],
      'user-posts',
    ],
  ])('reports %s reusing an id', (_item, change, path, id) => {
    expect(validate(variant(blogProject, change))).toEqual([
      { path, message: `Another item already has the id "${id}"` },
    ]);
  });
});

describe('validate relations', () => {
  it.each(['from', 'to'] as const)(
    'reports a relation whose %s is not a model',
    (side) => {
      const project = variant(blogProject, (copy) => {
        copy.relations[0][side] = 'ghost';
      });

      expect(validate(project)).toEqual([
        {
          path: ['relations', 0, side],
          message:
            'This relation points to a model that does not exist (id "ghost")',
        },
      ]);
    },
  );

  it('reports a relation from a model to itself', () => {
    const project = variant(blogProject, (copy) => {
      copy.relations.push(relation('user-users', 'user', 'user'));
    });

    expect(validate(project)).toEqual([
      {
        path: ['relations', 3],
        message: 'A relation from a model to itself is not supported yet',
      },
    ]);
  });

  it('reports a second relation between the same models, in either direction', () => {
    const project = variant(blogProject, (copy) => {
      copy.relations.push(relation('post-users', 'post', 'user'));
    });

    expect(validate(project)).toEqual([
      {
        path: ['relations', 3],
        message:
          'Post and User are already linked by another relation: two relations between the same models are not supported yet',
      },
    ]);
  });
});

describe('validate enum values', () => {
  it('reports an enum with the same value twice', () => {
    const project = variant(shopProject, (copy) => {
      const role = copy.models[0].fields[1];
      if (role.type === 'enum') role.enumValues.push('CUSTOMER');
    });

    expect(validate(project)).toEqual([
      {
        path: ['models', 0, 'fields', 1, 'enumValues', 2],
        message: 'The value CUSTOMER appears twice',
      },
    ]);
  });
});
