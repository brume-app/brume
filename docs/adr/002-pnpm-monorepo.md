# ADR-002: pnpm workspaces monorepo

- **Status:** Accepted
- **Date:** 2026-10-13
- **Deciders:** @Enzo-MAILLEFER, @VictorJacquinotFega, @AnasFaFK, @LederWarrior

## Context and problem

Builder, API, generator and shared types evolve together and must stay in sync.

## Options considered

1. **pnpm workspaces monorepo**
2. **One repository per package**
3. **npm or yarn workspaces**

## Decision

A single repository using pnpm workspaces (`apps/*`, `packages/*`).

## Reason

Atomic cross-package changes, one CI, one dependency tree, and pnpm is fast and strict about dependencies.

## Consequences accepted

Everyone uses pnpm, and CI must stay fast as the repo grows.
