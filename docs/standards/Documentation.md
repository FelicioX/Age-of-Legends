# Documentation Standards

Documentation is a first-class deliverable and is kept in lockstep with the code.

## Voice & Style

- Professional, third-person technical English.
- Objective and precise; describe intent, rules and rationale.
- No first-person authorship, no tool attributions, no generated-code markers.

## What Must Be Documented

- **Design** — every gameplay system has a GDD document defining its rules and intent.
- **Architecture** — significant technical structures are documented under `docs/architecture`.
- **Decisions** — architecturally significant decisions are recorded as ADRs and indexed in
  `DECISIONS.md`.
- **Public APIs** — exported functions/types carry concise TSDoc.
- **Changes** — user-facing and notable internal changes are recorded in `CHANGELOG.md`.

## Keeping Docs Current

- A change that alters behavior updates the relevant doc in the same pull request.
- Design docs are the source of truth for gameplay; code implements them, not the reverse. When
  they diverge, reconcile deliberately and update the doc.

## Structure

- One concern per document; link related documents rather than duplicating content.
- Prefer tables and short sections over long prose.
- Use relative links so navigation works in the repository.

## Living Documents

Documents marked "Living document" evolve continuously. Immutable records (ADRs) are never edited
after acceptance; they are superseded by new ADRs.

## Diagrams

- Prefer text-based diagrams (ASCII or Mermaid) that live in version control and diff cleanly.
- Keep diagrams close to the text they illustrate.
