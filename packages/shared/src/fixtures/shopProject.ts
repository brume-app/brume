import type { Project } from '../projectSchema';

/**
 * Reference shop project: customers with a profile browse products sorted
 * into categories.
 *
 * @remarks
 * Covers one-to-one and many-to-many relations, the number, json and enum
 * types, and enum fields with their values.
 */
export const shopProject: Project = {
  version: 1,
  name: 'Shop',
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
          id: 'user-role',
          name: 'role',
          type: 'enum',
          required: true,
          unique: false,
          defaultValue: 'CUSTOMER',
          enumValues: ['CUSTOMER', 'ADMIN'],
        },
      ],
    },
    {
      id: 'profile',
      name: 'Profile',
      fields: [
        {
          id: 'profile-bio',
          name: 'bio',
          type: 'string',
          required: false,
          unique: false,
        },
        {
          id: 'profile-preferences',
          name: 'preferences',
          type: 'json',
          required: false,
          unique: false,
        },
      ],
    },
    {
      id: 'product',
      name: 'Product',
      fields: [
        {
          id: 'product-name',
          name: 'name',
          type: 'string',
          required: true,
          unique: false,
        },
        {
          id: 'product-price',
          name: 'price',
          type: 'number',
          required: true,
          unique: false,
        },
        {
          id: 'product-stock',
          name: 'stock',
          type: 'number',
          required: true,
          unique: false,
          defaultValue: 0,
        },
        {
          id: 'product-status',
          name: 'status',
          type: 'enum',
          required: true,
          unique: false,
          defaultValue: 'DRAFT',
          enumValues: ['DRAFT', 'PUBLISHED', 'ARCHIVED'],
        },
      ],
    },
    {
      id: 'category',
      name: 'Category',
      fields: [
        {
          id: 'category-name',
          name: 'name',
          type: 'string',
          required: true,
          unique: true,
        },
      ],
    },
  ],
  relations: [
    { id: 'user-profile', from: 'user', to: 'profile', kind: 'one-to-one' },
    {
      id: 'product-categories',
      from: 'product',
      to: 'category',
      kind: 'many-to-many',
    },
  ],
  layout: {
    user: { x: 0, y: 0 },
    profile: { x: 0, y: 250 },
    product: { x: 300, y: 0 },
    category: { x: 600, y: 0 },
  },
};
