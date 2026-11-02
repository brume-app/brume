# ADR-008: NestJS for the backend

- **Status:** Accepted
- **Date:** 2026-10-28
- **Deciders:** @Enzo-MAILLEFER

## Context and problem

`apps/api` will save and load projects, and will later handle authentication and collaboration. Several people will work on it, so it needs a shared structure that stays readable as it grows. The initial action plan suggested Express; the stack benchmark made at the start of the project chose NestJS, but no ADR recorded it.

## Options considered

1. **Express**: minimal and widely known, with no imposed structure.
2. **Fastify**: faster than Express, with schema-based validation, but no imposed structure either.
3. **Hono**: lightweight, with typed RPC clients, but no imposed structure, and its RPC types slow down type checking as the API grows.
4. **NestJS**: modules, dependency injection, controllers and services.

## Decision

Use NestJS. This reverses the action plan. It does not decide the framework of the backends that Brume generates, which is a separate decision.

## Reason

Modules and dependency injection give every feature the same layout, which keeps the API maintainable in a team. Nest 12 is ESM and validates request bodies against Standard Schema, so the Zod schemas from `packages/shared` (ADR-007) validate requests without an extra library, and `@nestjs/swagger` builds the OpenAPI document from the same schemas. `@nestjs/testing` works with Vitest (ADR-005).

## Consequences accepted

More boilerplate and a steeper learning curve than Express or Hono. Decorators require `experimentalDecorators` and `emitDecoratorMetadata` in the TypeScript configuration, and the runtime is heavier than lighter frameworks.
