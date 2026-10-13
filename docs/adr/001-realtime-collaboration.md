# ADR-001: Real-time collaboration with Yjs-compatible canvas state

- **Status:** Accepted
- **Date:** 2026-10-13
- **Deciders:** @Enzo-MAILLEFER, @VictorJacquinotFega, @AnasFaFK, @LederWarrior

## Context and problem

Several users must edit the same canvas at the same time without conflicts. We want to ship single-user editing first and add collaboration later without rewriting the canvas state.

## Options considered

1. **Yjs-compatible state from day one**: model the canvas as a CRDT-friendly structure.
2. **Plain JSON state, add collaboration later**: simpler now, likely a rewrite later.
3. **Operational transform backend**: mature for text, heavy for a node graph.

## Decision

Design the canvas state to be Yjs-compatible from the start.

## Reason

A CRDT model avoids a costly migration when collaboration lands, and Yjs has a large ecosystem.

## Consequences accepted

Slightly more upfront modeling effort, and state updates must go through the shared data structures.
