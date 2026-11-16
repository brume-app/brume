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

const enumField = (id: string, name: string, enumValues: string[]): Field => ({
  id,
  name,
  type: 'enum',
  required: false,
  unique: false,
  enumValues,
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

  it('returns every issue at once', () => {
    const project = variant(blogProject, (copy) => {
      copy.models.push(model('user-2', 'user'));
      copy.relations[0].to = 'ghost';
      copy.models[1].fields.push(stringField('post-title-2', 'title'));
    });

    expect(validate(project)).toEqual([
      {
        path: ['relations', 0, 'to'],
        message:
          'This relation points to a model that does not exist (id "ghost")',
      },
      {
        path: ['models', 3, 'name'],
        message:
          'This model is named "user", like the model User (names are compared ignoring case)',
      },
      {
        path: ['models', 1, 'fields', 4, 'name'],
        message:
          'Post would have two fields named "title": this field and another field',
      },
    ]);
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

describe('validate model and enum names', () => {
  it('reports two models with the same name ignoring case', () => {
    const project = variant(blogProject, (copy) => {
      copy.models.push(model('user-2', 'user'));
    });

    expect(validate(project)).toEqual([
      {
        path: ['models', 3, 'name'],
        message:
          'This model is named "user", like the model User (names are compared ignoring case)',
      },
    ]);
  });

  it('reports a generated enum named like a model', () => {
    const project = variant(shopProject, (copy) => {
      copy.models.push(model('user-role-model', 'UserRole'));
    });

    expect(validate(project)).toEqual([
      {
        path: ['models', 0, 'fields', 1, 'name'],
        message:
          'The enum generated for User.role would be named "UserRole", like the model UserRole',
      },
    ]);
  });

  it('reports two generated enums with the same name', () => {
    const project = variant(blogProject, (copy) => {
      copy.models[0].fields.push(
        enumField('user-role-type', 'roleType', ['A']),
      );
      copy.models.push(
        model('user-role', 'UserRole', [
          enumField('user-role-kind', 'type', ['B']),
        ]),
      );
    });

    expect(validate(project)).toEqual([
      {
        path: ['models', 3, 'fields', 0, 'name'],
        message:
          'The enum generated for UserRole.type would be named "UserRoleType", like the enum generated for User.roleType',
      },
    ]);
  });

  it.each(['String', 'PrismaClient', 'delete'])(
    'reports a model named %s, which Prisma reserves',
    (name) => {
      const project = variant(blogProject, (copy) => {
        copy.models[2].name = name;
      });

      expect(validate(project)).toEqual([
        {
          path: ['models', 2, 'name'],
          message: `This model is named "${name}", a name Prisma reserves`,
        },
      ]);
    },
  );

  it('reports a generated enum with a name Prisma reserves', () => {
    const project = variant(blogProject, (copy) => {
      copy.models.push(
        model('date', 'Date', [enumField('date-time', 'time', ['A'])]),
      );
    });

    expect(validate(project)).toEqual([
      {
        path: ['models', 3, 'fields', 0, 'name'],
        message:
          'The enum generated for Date.time would be named "DateTime", a name Prisma reserves',
      },
    ]);
  });

  it('reports a generated enum name longer than PostgreSQL allows', () => {
    const modelName = `L${'o'.repeat(40)}`;
    const fieldName = `k${'i'.repeat(29)}`;
    const project = variant(blogProject, (copy) => {
      copy.models.push(
        model('long', modelName, [enumField('long-kind', fieldName, ['A'])]),
      );
    });
    const generated = `${modelName}K${'i'.repeat(29)}`;

    expect(validate(project)).toEqual([
      {
        path: ['models', 3, 'fields', 0, 'name'],
        message: `The enum generated for ${modelName}.${fieldName} would be named "${generated}", 71 characters long, over the 63 PostgreSQL allows`,
      },
    ]);
  });
});

describe('validate field names', () => {
  it.each([
    [
      'another field',
      1,
      'title',
      'Post would have two fields named "title": this field and another field',
    ],
    [
      'the primary key',
      0,
      'id',
      'User would have two fields named "id": this field and the primary key the generator adds',
    ],
    [
      'a foreign key',
      1,
      'userId',
      'Post would have two fields named "userId": this field and the foreign key of the relation User → Post',
    ],
    [
      'a relation field',
      0,
      'posts',
      'User would have two fields named "posts": this field and the relation field of the relation User → Post',
    ],
  ])('reports a field named like %s', (_other, modelIndex, name, message) => {
    const project = variant(blogProject, (copy) => {
      copy.models[modelIndex].fields.push(stringField('new-field', name));
    });
    const fieldIndex = blogProject.models[modelIndex].fields.length;

    expect(validate(project)).toEqual([
      { path: ['models', modelIndex, 'fields', fieldIndex, 'name'], message },
    ]);
  });

  it('reports two relations that add a field with the same name', () => {
    const project = variant(blogProject, (copy) => {
      copy.models.push(model('person', 'Person'), model('people', 'People'));
      copy.relations.push(
        relation('user-persons', 'user', 'person'),
        relation('user-people', 'user', 'people', 'one-to-one'),
      );
    });

    expect(validate(project)).toEqual([
      {
        path: ['relations', 4],
        message:
          'User would have two fields named "people": the relation field of this relation and the relation field of the relation User → Person',
      },
    ]);
  });

  it('reports a generated foreign key longer than PostgreSQL allows', () => {
    const modelName = `L${'o'.repeat(61)}`;
    const project = variant(blogProject, (copy) => {
      copy.models.push(model('long', modelName));
      copy.relations.push(relation('long-posts', 'long', 'post'));
    });
    const foreignKey = `l${'o'.repeat(61)}Id`;

    expect(validate(project)).toEqual([
      {
        path: ['relations', 3],
        message: `The foreign key "${foreignKey}" this relation adds to Post is 64 characters long, over the 63 PostgreSQL allows`,
      },
    ]);
  });
});
