# ADR-005: Vitest instead of Jest

- **Status:** Accepted
- **Date:** 2026-10-13
- **Deciders:** @Enzo-MAILLEFER, @VictorJacquinotFega, @AnasFaFK, @LederWarrior

## Context and problem

We need a test runner for TypeScript packages and the Vite-based builder. The initial action plan suggested Jest.

## Options considered

1. **Vitest**
2. **Jest**

## Decision

Use Vitest. This reverses the action plan.

## Reason

Native TypeScript and ESM support, shares Vite's configuration, and is fast.

## Consequences accepted

A younger ecosystem than Jest, with a few less common plugins missing.
