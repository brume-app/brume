import { describe, expect, it } from 'vitest';
import {
  enumName,
  foreignKeyName,
  listFieldName,
  relationFieldName,
} from './naming';

describe('relationFieldName and listFieldName', () => {
  it.each([
    ['User', 'user', 'users'],
    ['Category', 'category', 'categories'],
    ['BlogPost', 'blogPost', 'blogPosts'],
    ['Person', 'person', 'people'],
    ['Sheep', 'sheep', 'sheep'],
    ['user', 'user', 'users'],
    ['URL', 'url', 'urls'],
    ['APIKey', 'apiKey', 'apiKeys'],
    ['HTTPRequest', 'httpRequest', 'httpRequests'],
    ['URL2Link', 'url2Link', 'url2Links'],
    ['API_KEY', 'api_key', 'api_keys'],
  ])('names the relation fields to %s %s and %s', (model, one, many) => {
    expect(relationFieldName(model)).toBe(one);
    expect(listFieldName(model)).toBe(many);
  });
});

describe('foreignKeyName', () => {
  it('adds Id to the relation field name', () => {
    expect(foreignKeyName('user')).toBe('userId');
  });
});

describe('enumName', () => {
  it.each([
    ['Product', 'status', 'ProductStatus'],
    ['product', 'status', 'ProductStatus'],
    ['User', 'roleType', 'UserRoleType'],
  ])('names the enum of %s.%s %s', (model, field, name) => {
    expect(enumName(model, field)).toBe(name);
  });
});
