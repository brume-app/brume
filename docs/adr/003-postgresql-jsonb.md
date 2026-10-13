# ADR-003: PostgreSQL with JSONB instead of MongoDB

- **Status:** Accepted
- **Date:** 2026-10-13
- **Deciders:** @Enzo-MAILLEFER, @VictorJacquinotFega, @AnasFaFK, @LederWarrior

## Context and problem

We store users, projects and flexible canvas documents. The initial action plan suggested MongoDB.

## Options considered

1. **PostgreSQL with JSONB columns**
2. **MongoDB**

## Decision

Use PostgreSQL, storing canvas documents as JSONB. This reverses the action plan.

## Reason

One database handles relational data and flexible documents, with transactions and mature tooling, and one fewer service to operate.

## Consequences accepted

Document queries are less ergonomic than in MongoDB, and JSONB schemas must be validated in application code.
