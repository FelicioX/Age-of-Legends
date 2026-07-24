# Mobile

Age of Legends targets **Google Play** (and later the App Store) by packaging its web client as a
native app with **Capacitor**, without a second codebase. See
[ADR-0008](../adr/0008-mobile-packaging-capacitor.md).

## Approach

- The web client (React + PixiJS) is the single UI/rendering codebase.
- Capacitor produces the native Android (and iOS) project and hosts the built web client in a native
  WebView with a plugin bridge.
- Native capabilities are used through a **thin platform abstraction** in the client so that web
  builds compile and run unchanged:
  - **In-app purchases** — store billing behind a platform interface (see
    [LiveServices.md](LiveServices.md)).
  - **Push notifications** — retention and event notifications.
  - **Secure storage** — tokens and session material.
  - **App lifecycle** — pause/resume handling for the render and prediction loops.

## Project Layout (planned)

```
client/
├── src/                # shared web + mobile client code
├── platform/           # platform abstraction (web vs native implementations)
└── mobile/             # Capacitor config and generated native projects (android/, ios/)
```

The native projects are generated and kept out of the web build path; the platform abstraction
selects native implementations only when running inside the Capacitor shell.

## Performance

- A WebView app has a lower ceiling than fully native; the efficient WebGL renderer, the bounded
  2D scope, interest management and fixed-step simulation keep the game within budget.
- Performance budgets (frame time, memory) are validated on representative devices before release.

## Store & Release

- Android is the first store target; signing, versioning and submission are part of the release
  process ([../roadmap/Releases.md](../roadmap/Releases.md)).
- Store billing entitlements are validated **server-side**; the client never grants power (see
  [LiveServices.md](LiveServices.md), [../gdd/Monetization.md](../gdd/Monetization.md)).

## Input & Responsiveness

The client is input-agnostic (touch/mouse/keyboard) and responsive from phone to desktop, so the
same UI serves web and mobile (see [Client.md](Client.md)).
