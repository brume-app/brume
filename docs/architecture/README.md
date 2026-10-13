# Architecture

This folder holds the architecture and data diagrams of Brume. Diagrams are updated in the same pull request as the change they describe.

## Repository layout

| Path                 | Role                             |
| -------------------- | -------------------------------- |
| `apps/builder`       | Web canvas editor (React, Vite)  |
| `apps/api`           | Backend API (PostgreSQL)         |
| `packages/generator` | Code generator                   |
| `packages/shared`    | Shared types and exchange format |

## Decisions

Structural decisions and their reasons are recorded in [`docs/adr`](../adr).
