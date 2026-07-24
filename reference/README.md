# Reference Study

This directory documents the **study of external references** and, crucially, records how each idea
was **reinterpreted into an original design** for Age of Legends. It exists to keep a clear
separation between:

- **engineering inspiration** — proven patterns for how a game like this is *built*;
- **gameplay inspiration** — proven patterns for how a game like this *feels to play*;
- **the original implementation** — what Age of Legends actually does.

## Ground Rules

- References inform **structure and principles only**. No protected content — characters, art, UI,
  text, names, story, audio, assets or identity — is reproduced.
- Every concept recorded here is accompanied by an **original adaptation** describing the Age of
  Legends interpretation.
- These notes are working documents for the team's own reasoning; the authoritative design lives in
  [../docs/gdd/](../docs/gdd/) and [../docs/architecture/](../docs/architecture/).

## Layout

| Path                                   | Purpose                                              |
| -------------------------------------- | ---------------------------------------------------- |
| [architecture/](architecture/)         | Engineering patterns studied and adapted             |
| [gameplay/](gameplay/)                 | Gameplay/retention patterns studied and adapted      |
| [decisions/](decisions/)               | The adaptation log linking a pattern to our design   |

## Method

For each problem, the team answers two questions and then designs a third, original answer:

1. **Engineering** — what is the most robust way to build this?
2. **Gameplay** — what makes this most satisfying to play?
3. **Our design** — an original solution that keeps the robustness of (1) and the play quality of
   (2), implemented specifically for Age of Legends.
