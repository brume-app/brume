# ADR-006: Self-hosted VPS with docker-compose

- **Status:** Accepted
- **Date:** 2026-10-13
- **Deciders:** @Enzo-MAILLEFER, @VictorJacquinotFega, @AnasFaFK, @LederWarrior

## Context and problem

We need staging and production hosting that is cheap, controllable and simple for a small team.

## Options considered

1. **Self-hosted VPS (Hetzner) with docker-compose**
2. **Managed PaaS**
3. **Kubernetes**

## Decision

Deploy to a VPS with docker-compose.

## Reason

Low cost, full control, and operational simplicity that matches the team size.

## Consequences accepted

We handle server maintenance, backups and security updates ourselves.
