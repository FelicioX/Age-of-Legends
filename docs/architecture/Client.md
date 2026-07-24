# Client

The `client` package is the player-facing application for web and mobile. It composes React (UI),
PixiJS (world rendering) and the engine's predictive simulation and netcode.

## Responsibilities

- Render the kingdom and world via PixiJS from simulation component state.
- Present HUD, menus and flows via React.
- Run client-side prediction for the local player and interpolate remote entities.
- Send intents to the server and reconcile against authoritative snapshots.
- Handle input across touch, mouse and keyboard.

## Structure

- **src/** — application bootstrap, scene management, input, netcode wiring.
- **ui/** — React components for HUD, menus, dialogs and flows.
- **render/** — PixiJS renderer implementing the engine's rendering abstraction.
- **assets/** — client-side asset references (originals produced in the assets pipeline).
- **localization/** — string tables and locale handling.
- **tests/** — component and integration tests.

## Rendering & Simulation Split

The client never puts game rules in rendering code. The predictive simulation (engine + game)
advances state; the renderer reads component state each frame and draws it. This keeps the client
consistent with the server and testable.

## Responsiveness & Feel

- Prediction hides input latency for the local player.
- Interpolation smooths remote entity motion between snapshots.
- The render loop is decoupled from the fixed simulation step and interpolates for display.

## Accessibility & Platforms

- Input-agnostic controls; responsive layout for phone to desktop.
- Colorblind-safe cues, scalable text and clear visual hierarchy (see the design principles).

## Related

[Engine.md](Engine.md) · [Networking.md](Networking.md) · [../gdd/Gameplay.md](../gdd/Gameplay.md)
