# Code Review & Development Process

## Development Flow

Every non-trivial feature follows this sequence. No step is skipped.

1. **Idea / objective** — a clear problem statement and goal.
2. **Design** — create or update the relevant design doc (GDD/architecture). Significant decisions
   become ADRs.
3. **Design review** — evaluate against the [pillars](../vision/002_GamePillars.md) and the
   governance questions below.
4. **Technical plan** — architecture and task breakdown.
5. **Implementation** — code with tests and docs.
6. **QA** — automated tests plus manual validation where relevant.
7. **Documentation** — update docs, `CHANGELOG.md` and, if applicable, ADRs.
8. **Code review** — peer review against this checklist.
9. **Merge** — after CI is green and review is approved.

## Governance Questions (design review)

Before implementation, confirm the feature:

- aligns with the game vision and pillars;
- has an acceptable impact on the economy;
- improves (or does not harm) the player experience;
- fits the architecture and module boundaries;
- has an acceptable impact on multiplayer and scalability;
- respects ethical monetization;
- does not compromise future maintenance.

## Code Review Checklist

**Correctness**
- Does it do what the design specifies? Are edge cases handled?
- For gameplay logic: is it deterministic and covered by tests?

**Architecture**
- Are module boundaries respected (no upward imports)?
- Is coupling low and cohesion high? Any duplication introduced?

**Quality**
- Names, readability and comments explain intent.
- No dead code, no unnecessary dependencies.
- Errors handled and validated at boundaries.

**Tests**
- Adequate unit/integration coverage; a regression test for bug fixes.
- Tests are deterministic and meaningful (not just coverage padding).

**Docs**
- Relevant docs and `CHANGELOG.md` updated; ADR added if a decision was made.

**Performance & Security**
- No obvious hot-path regressions; inputs validated; authority respected.

## Review Etiquette

- Review promptly and kindly; critique the code, not the author.
- Prefer suggestions with rationale; approve when it is better than before and meets the bar.
