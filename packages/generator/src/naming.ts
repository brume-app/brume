import type { RelationKind } from '@brume/shared';
import pluralize from 'pluralize';

/**
 * Name of the primary key the generator adds to every model.
 */
export const PRIMARY_KEY_NAME = 'id';

/**
 * Name of a relation field that holds one record of a model: `User` gives
 * `user`.
 *
 * @remarks
 * Acronyms stay readable: `URL` gives `url`, `APIKey` gives `apiKey` and
 * `HTTPRequest` gives `httpRequest`. A name with no lowercase letter is fully
 * lowercased (`API_KEY` gives `api_key`).
 */
export function relationFieldName(modelName: string): string {
  return camelCase(modelName);
}

/**
 * Name of a relation field that holds a list of records of a model:
 * `Category` gives `categories`.
 *
 * @remarks
 * Same casing as {@link relationFieldName}, pluralized with `pluralize`:
 * irregular plurals are right (`Person` gives `people`) and uncountable nouns
 * keep their form (`Sheep` gives `sheep`).
 */
export function listFieldName(modelName: string): string {
  return pluralize(camelCase(modelName));
}

/**
 * Name of the foreign key behind a relation field: `user` gives `userId`.
 */
export function foreignKeyName(relationField: string): string {
  return `${relationField}Id`;
}

/**
 * Name of the enum generated for an `enum` field: model `Product` and field
 * `status` give `ProductStatus`.
 */
export function enumName(modelName: string, fieldName: string): string {
  return upperFirst(modelName) + upperFirst(fieldName);
}

/**
 * Names of the fields a relation adds: a relation field on each side, and a
 * foreign key on the `to` side for `one-to-many` and `one-to-one`.
 */
export interface RelationNames {
  /** Relation field added to the `from` model. */
  from: string;
  /** Relation field added to the `to` model. */
  to: string;
  /** Foreign key added to the `to` model, if the relation kind has one. */
  foreignKey?: string;
}

/**
 * Names the fields a relation adds, for example from `User` to `Post`:
 *
 * - `one-to-many`: `posts` on `User`, `user` and `userId` on `Post`
 * - `one-to-one`: `post` on `User`, `user` and `userId` on `Post`
 * - `many-to-many`: `posts` on `User`, `users` on `Post`, no foreign key
 */
export function relationNames(
  kind: RelationKind,
  fromModel: string,
  toModel: string,
): RelationNames {
  const toField = relationFieldName(fromModel);
  switch (kind) {
    case 'one-to-many':
      return {
        from: listFieldName(toModel),
        to: toField,
        foreignKey: foreignKeyName(toField),
      };
    case 'one-to-one':
      return {
        from: relationFieldName(toModel),
        to: toField,
        foreignKey: foreignKeyName(toField),
      };
    case 'many-to-many':
      return { from: listFieldName(toModel), to: listFieldName(fromModel) };
    default:
      throw new Error(`Unknown relation kind ${kind satisfies never}`);
  }
}

function camelCase(name: string): string {
  if (name === name.toUpperCase()) return name.toLowerCase();

  const capitals = /^[A-Z]*/.exec(name)?.[0].length ?? 0;
  if (capitals <= 1) return name.charAt(0).toLowerCase() + name.slice(1);

  // In `HTTPRequest`, the last leading capital starts the next word.
  const lowered = /[a-z]/.test(name.charAt(capitals)) ? capitals - 1 : capitals;
  return name.slice(0, lowered).toLowerCase() + name.slice(lowered);
}

function upperFirst(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1);
}
