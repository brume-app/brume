# ADR-004: Vite for the builder

- **Status:** Accepted
- **Date:** 2026-10-13
- **Deciders:** @Enzo-MAILLEFER, @VictorJacquinotFega, @AnasFaFK, @LederWarrior

## Context and problem

The builder is a client-side canvas application and needs a fast dev experience.

## Options considered

1. **Vite**
2. **Next.js**
3. **Rsbuild**

## Decision

Use Vite.

## Reason

The builder is a single-page app with no need for server rendering, and Vite is simple, fast and widely supported.

## Consequences accepted

No built-in server rendering or routing conventions. We add what we need ourselves.
