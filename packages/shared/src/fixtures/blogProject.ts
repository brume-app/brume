import type { Project } from '../projectSchema';

/**
 * Reference blog project: users write posts and comment on them.
 *
 * @remarks
 * Covers one-to-many relations, the string, boolean and date types and every
 * base constraint (required, unique, default value).
 */
export const blogProject: Project = {
  version: 1,
  name: 'Blog',
  models: [
    {
      id: 'user',
      name: 'User',
      fields: [
        {
          id: 'user-email',
          name: 'email',
          type: 'string',
          required: true,
          unique: true,
        },
        {
          id: 'user-name',
          name: 'name',
          type: 'string',
          required: true,
          unique: false,
        },
      ],
    },
    {
      id: 'post',
      name: 'Post',
      fields: [
        {
          id: 'post-title',
          name: 'title',
          type: 'string',
          required: true,
          unique: false,
        },
        {
          id: 'post-content',
          name: 'content',
          type: 'string',
          required: false,
          unique: false,
        },
        {
          id: 'post-published',
          name: 'published',
          type: 'boolean',
          required: true,
          unique: false,
          defaultValue: false,
        },
        {
          id: 'post-published-at',
          name: 'publishedAt',
          type: 'date',
          required: false,
          unique: false,
        },
      ],
    },
    {
      id: 'comment',
      name: 'Comment',
      fields: [
        {
          id: 'comment-body',
          name: 'body',
          type: 'string',
          required: true,
          unique: false,
        },
      ],
    },
  ],
  relations: [
    { id: 'user-posts', from: 'user', to: 'post', kind: 'one-to-many' },
    { id: 'post-comments', from: 'post', to: 'comment', kind: 'one-to-many' },
    { id: 'user-comments', from: 'user', to: 'comment', kind: 'one-to-many' },
  ],
  layout: {
    user: { x: 0, y: 0 },
    post: { x: 300, y: 0 },
    comment: { x: 600, y: 0 },
  },
};
