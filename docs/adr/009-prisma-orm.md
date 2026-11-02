# ADR-009: Prisma to access PostgreSQL

- **Status:** Accepted
- **Date:** 2026-11-02
- **Deciders:** @Enzo-MAILLEFER

## Context and problem

`apps/api` saves and loads projects in PostgreSQL, with canvas documents stored as JSONB (ADR-003). It needs typed queries and versioned migrations. Brume also generates backends whose database layer is a Prisma schema, so the team has to know that tool well.

## Options considered

1. **Prisma**: declarative schema, generated typed client and SQL migrations.
2. **Drizzle**: schema written in TypeScript, close to SQL, but its 1.0 release is not stable yet.
3. **Kysely**: typed query builder, without a declarative schema or generated migrations.
4. **TypeORM**: decorator-based entities, with weaker typing and irregular maintenance.

## Decision

Use Prisma, with the `pg` driver adapter.

## Reason

Using the same tool in our API and in the generated backends means one tool to learn, and real use of its schema and migrations improves what the generator outputs. Prisma 7 runs without the Rust engine and is ESM, which fits the NestJS 12 setup (ADR-008).

## Consequences accepted

JSONB columns are typed as `JsonValue`, so documents are validated with the Zod schemas from `packages/shared` (ADR-007). The client must be regenerated after each schema change. `prisma` and `@prisma/client` are pinned to the same version.
