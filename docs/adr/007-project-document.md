# ADR-007: One project document as the single source of truth

- **Status:** Accepted
- **Date:** 2026-10-27
- **Deciders:** @Enzo-MAILLEFER

## Context and problem

The canvas, the API and the generator all handle the same project: its models, fields and relations. The POC sent the raw React Flow nodes and edges to the generator, so the generator depended on the canvas library and every block stored untyped text values.

## Options considered

1. **Typed React Flow nodes and edges**: the canvas sends its nodes and edges, the generator translates them.
2. **A project description built at export**: the canvas keeps its data in React Flow nodes and converts them into models and relations when exporting.
3. **One project document used everywhere**: `{ version, name, models, relations, layout }` in `packages/shared`, from which the canvas builds its React Flow nodes.

## Decision

Option 3. The canvas state, the saved project (JSONB, ADR-003) and the generator input are the same document, described by Zod schemas in `packages/shared` with types inferred from them. The generator ignores `layout`.

## Reason

One shape for saving, real-time collaboration (ADR-001) and generation removes any translation step and any drift between copies. The format does not depend on React Flow, and `version` lets saved projects be migrated when the format changes. The schemas are strict, so an invalid project is rejected where it is created instead of breaking the generation.

## Consequences accepted

The canvas must keep the project document as its state and derive React Flow nodes from it, instead of storing data in node `data`. Text typed in the canvas must be converted to the field type before it is saved (a number default is stored as a number).
