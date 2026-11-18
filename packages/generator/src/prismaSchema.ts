import type { FieldType } from '@brume/shared';
import type {
  ParsedField,
  ParsedModel,
  ProjectModel,
  RelationField,
} from './parse';

/**
 * Prisma type of each field type, except `enum` fields, which use the enum
 * generated for them.
 */
const PRISMA_TYPES = {
  string: 'String',
  number: 'Float',
  boolean: 'Boolean',
  date: 'DateTime',
  json: 'Json',
} satisfies Record<Exclude<FieldType, 'enum'>, string>;

/**
 * Writes the Prisma schema of a project: the PostgreSQL datasource, the
 * `prisma-client` generator, one model per project model, then one enum per
 * `enum` field.
 *
 * @remarks
 * Each model starts with the primary key `id`, a UUID v7, followed by the
 * user's fields in project order, then its relation fields in relation order.
 * A relation field that stores a key is followed by that foreign key:
 *
 * - `one-to-many` from `User` to `Post`: `posts Post[]` on `User`; `user User?`
 *   and `userId String?` on `Post`, with `@@index([userId])`, since PostgreSQL
 *   does not index foreign keys by itself.
 * - `one-to-one`: the same, with `@unique` on the foreign key instead of an
 *   index, and `post Post?` on `User`.
 * - `many-to-many`: a list on each side; Prisma creates the join table.
 *
 * Relations are optional until they can be required (#119). The output is laid
 * out exactly like `prisma format`, and the same project always gives the same
 * schema.
 */
export function prismaSchema(project: ProjectModel): string {
  const enums = project.models.flatMap((model) =>
    model.fields.flatMap((field) =>
      field.type === 'enum'
        ? [block(`enum ${field.enumName}`, field.enumValues)]
        : [],
    ),
  );
  const blocks = [
    block(
      'generator client',
      alignColumns([
        ['provider', '=', '"prisma-client"'],
        ['output', '=', '"../src/generated/prisma"'],
      ]),
    ),
    block('datasource db', alignColumns([['provider', '=', '"postgresql"']])),
    ...project.models.map(modelBlock),
    ...enums,
  ];
  return `${blocks.join('\n\n')}\n`;
}

function modelBlock(model: ParsedModel): string {
  const rows = [
    [model.primaryKey.name, 'String', '@id @default(uuid(7)) @db.Uuid'],
    ...model.fields.map((field) => [
      field.name,
      prismaType(field) + optional(field),
      attributes(field),
    ]),
    ...model.relationFields.flatMap(relationRows),
  ];
  const indexes = model.foreignKeys
    .filter((key) => !key.unique)
    .map((key) => `@@index([${key.name}])`);
  return block(`model ${model.name}`, [
    ...alignColumns(rows),
    ...(indexes.length > 0 ? ['', ...indexes] : []),
  ]);
}

/** The row of a relation field, followed by the row of its foreign key. */
function relationRows(field: RelationField): string[][] {
  const type = field.target.name + (field.isList ? '[]' : optional(field));
  const key = field.foreignKey;
  if (!key) return [[field.name, type, '']];
  return [
    [
      field.name,
      type,
      `@relation(fields: [${key.name}], references: [${key.target.primaryKey.name}])`,
    ],
    [
      key.name,
      `String${optional(key)}`,
      [key.unique ? '@unique' : '', '@db.Uuid'].filter(Boolean).join(' '),
    ],
  ];
}

function optional(item: { required: boolean }): string {
  return item.required ? '' : '?';
}

function prismaType(field: ParsedField): string {
  return field.type === 'enum' ? field.enumName : PRISMA_TYPES[field.type];
}

function attributes(field: ParsedField): string {
  const value = defaultValue(field);
  return [
    field.unique ? '@unique' : '',
    value === undefined ? '' : `@default(${value})`,
  ]
    .filter(Boolean)
    .join(' ');
}

/** The default as Prisma writes it, or `undefined` when there is none. */
function defaultValue(field: ParsedField): string | undefined {
  if (field.defaultValue === undefined) return undefined;
  switch (field.type) {
    case 'string':
      return JSON.stringify(field.defaultValue);
    case 'number':
      return plainNumber(field.defaultValue);
    case 'boolean':
      return String(field.defaultValue);
    case 'date':
      return field.defaultValue === 'now'
        ? 'now()'
        : JSON.stringify(field.defaultValue);
    case 'json':
      return JSON.stringify(JSON.stringify(field.defaultValue));
    case 'enum':
      return field.defaultValue;
    default:
      throw new Error(`Unknown field type ${field satisfies never}`);
  }
}

/**
 * Writes a number without exponent notation, which Prisma rejects: `1e-7`
 * gives `0.0000001` and `1e+21` gives `1000000000000000000000`.
 */
function plainNumber(value: number): string {
  const [mantissa, exponent] = String(value).split('e');
  if (exponent === undefined) return mantissa;

  const sign = mantissa.startsWith('-') ? '-' : '';
  const [whole, fraction = ''] = mantissa.replace('-', '').split('.');
  const digits = whole + fraction;
  // JavaScript only uses an exponent below 1e-6 or from 1e21, so the decimal
  // point always falls before or after all the digits.
  const point = whole.length + Number(exponent);
  return point <= 0
    ? `${sign}0.${'0'.repeat(-point)}${digits}`
    : sign + digits + '0'.repeat(point - digits.length);
}

/** Pads every column but the last to its widest cell, like `prisma format`. */
function alignColumns(rows: string[][]): string[] {
  const widths = rows[0].map((_, column) =>
    Math.max(...rows.map((row) => row[column].length)),
  );
  return rows.map((row) =>
    row
      .map((cell, column) => cell.padEnd(widths[column]))
      .join(' ')
      .trimEnd(),
  );
}

function block(header: string, lines: string[]): string {
  const indented = lines.map((line) => (line ? `  ${line}` : ''));
  return [`${header} {`, ...indented, '}'].join('\n');
}
