# ADR-0001: Record architecture decisions

- **Status:** Accepted
- **Date:** 2026-07-24
- **Deciders:** Technical Direction
- **Related:** [DECISIONS.md](../../DECISIONS.md)

## Context

A long-lived project needs a durable, reviewable record of why significant technical and design
decisions were made. Rationale that lives only in chat, tickets or memory is quickly lost, leading
to re-litigated debates and accidental reversals.

## Decision

The project records architecturally significant decisions as Architecture Decision Records (ADRs)
stored in `docs/adr`, indexed in the root `DECISIONS.md`. ADRs use the
[template](0000-template.md), are numbered sequentially, and are immutable once accepted; a
decision changes by adding a new ADR that supersedes the old one.

## Options Considered

1. **ADRs in the repository** — versioned with the code, reviewed via pull request, easy to link.
2. **External wiki** — searchable but drifts from the code and is not reviewed with changes.
3. **No formal record** — lowest overhead, highest long-term cost.

## Consequences

- **Positive:** durable, reviewable, linkable history; decisions travel with the code.
- **Trade-offs:** a small authoring cost per significant decision.
- **Follow-ups:** significant decisions in every milestone produce an ADR.
