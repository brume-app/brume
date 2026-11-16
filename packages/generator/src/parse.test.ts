import type { Project } from '@brume/shared';
import { blogProject, shopProject } from '@brume/shared/fixtures';
import { describe, expect, it } from 'vitest';
import { parse, type ParsedModel } from './parse';

/**
 * Describes the relations of each model as short strings, with model names
 * instead of model objects: `user: User (userId)` is a relation field to
 * `User` backed by the foreign key `userId`, `posts: Post[]` a list.
 */
function relationsByModel(project: Project) {
  const summarize = (model: ParsedModel) => ({
    foreignKeys: model.foreignKeys.map(
      (key) =>
        `${key.name} -> ${key.target.name}${key.unique ? ' unique' : ''}`,
    ),
    relationFields: model.relationFields.map(
      (field) =>
        `${field.name}: ${field.target.name}${field.isList ? '[]' : ''}` +
        (field.foreignKey ? ` (${field.foreignKey.name})` : ''),
    ),
  });
  return Object.fromEntries(
    parse(project).models.map((model) => [model.name, summarize(model)]),
  );
}

describe('parse', () => {
  it('keeps the project name and the models in order, without the layout', () => {
    const result = parse(blogProject);

    expect(result.name).toBe('Blog');
    expect(result.models.map((model) => model.name)).toEqual([
      'User',
      'Post',
      'Comment',
    ]);
    expect(result).not.toHaveProperty('layout');
  });

  it('adds the primary key and keeps the user fields as they are', () => {
    const { models } = parse(blogProject);

    expect(models.map((model) => model.primaryKey.name)).toEqual([
      'id',
      'id',
      'id',
    ]);
    expect(models.map((model) => model.fields)).toEqual(
      blogProject.models.map((model) => model.fields),
    );
  });

  it('adds the foreign key on the "many" side of one-to-many relations', () => {
    expect(relationsByModel(blogProject)).toEqual({
      User: {
        foreignKeys: [],
        relationFields: ['posts: Post[]', 'comments: Comment[]'],
      },
      Post: {
        foreignKeys: ['userId -> User'],
        relationFields: ['user: User (userId)', 'comments: Comment[]'],
      },
      Comment: {
        foreignKeys: ['postId -> Post', 'userId -> User'],
        relationFields: ['post: Post (postId)', 'user: User (userId)'],
      },
    });
  });

  it('adds a unique foreign key for one-to-one and none for many-to-many', () => {
    expect(relationsByModel(shopProject)).toEqual({
      User: { foreignKeys: [], relationFields: ['profile: Profile'] },
      Profile: {
        foreignKeys: ['userId -> User unique'],
        relationFields: ['user: User (userId)'],
      },
      Product: { foreignKeys: [], relationFields: ['categories: Category[]'] },
      Category: { foreignKeys: [], relationFields: ['products: Product[]'] },
    });
  });

  it('makes every relation optional until relations can be required', () => {
    const models = [blogProject, shopProject].flatMap(
      (project) => parse(project).models,
    );
    const relationItems = models.flatMap((model) => [
      ...model.foreignKeys,
      ...model.relationFields,
    ]);

    expect(relationItems.some((item) => item.required)).toBe(false);
  });

  it('points the relations and their fields to the models themselves', () => {
    const { models, relations } = parse(blogProject);
    const [user, post] = models;
    const [userPosts] = relations;

    expect(userPosts.kind).toBe('one-to-many');
    expect(userPosts.from).toBe(user);
    expect(userPosts.to).toBe(post);
    expect(userPosts.fromField).toBe(user.relationFields[0]);
    expect(userPosts.toField).toBe(post.relationFields[0]);
    expect(post.relationFields[0].target).toBe(user);
    expect(post.relationFields[0].foreignKey).toBe(post.foreignKeys[0]);
  });

  it('names the generated enum of each enum field', () => {
    const enums = parse(shopProject).models.flatMap((model) =>
      model.fields.flatMap((field) =>
        field.type === 'enum'
          ? [`${model.name}.${field.name}: ${field.enumName}`]
          : [],
      ),
    );

    expect(enums).toEqual([
      'User.role: UserRole',
      'Product.status: ProductStatus',
    ]);
  });

  it('leaves the project unchanged', () => {
    const project = structuredClone(shopProject);

    parse(project);

    expect(project).toEqual(shopProject);
  });

  it('throws when a relation points to an unknown model', () => {
    const project: Project = {
      ...blogProject,
      relations: [
        { id: 'ghost-posts', from: 'ghost', to: 'post', kind: 'one-to-many' },
      ],
    };

    expect(() => parse(project)).toThrow('unknown model ghost');
  });
});
