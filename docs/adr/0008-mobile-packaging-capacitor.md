# ADR-0008: Mobile packaging via Capacitor (Google Play & App Store)

- **Status:** Accepted
- **Date:** 2026-07-24
- **Deciders:** Technical Direction, Client Engineering, Product
- **Related:** [ADR-0002](0002-technology-stack.md), [ADR-0006](0006-rendering-pixijs.md), [../architecture/Mobile.md](../architecture/Mobile.md)

## Context

A commercial goal of Age of Legends is distribution on mobile app stores — primarily **Google
Play** — where the game can be monetized. The client is a web application (React + PixiJS +
TypeScript). We need a native store presence (installable app, store billing, push notifications,
native lifecycle) without maintaining a separate native codebase or a second engine.

## Decision

Package the existing web client as a native app using **Capacitor**. Capacitor wraps the built web
client in a native shell (Android and iOS), provides a plugin bridge to native capabilities
(in-app purchases, push notifications, secure storage, app lifecycle) and lets us ship the same
codebase to web and to the stores.

- The web client remains the single source of the UI and rendering.
- Native concerns are accessed through Capacitor plugins behind a thin platform abstraction in the
  client, so web builds compile unchanged.
- Android is the primary store target first; iOS follows the same packaging.

## Options Considered

1. **Capacitor wrapper (chosen)** — one codebase for web + stores; mature native bridge; minimal
   duplication; proven for web-first games.
2. **A separate native (or cross-platform native) client** — best native feel, but a second
   codebase and a second implementation of the client — rejected on cost and consistency.
3. **Web-only (PWA), no store presence** — simplest, but forgoes store distribution and store
   billing that the business model depends on — rejected.

## Consequences

- **Positive:** store distribution and native billing/push with essentially one client codebase;
  fast iteration; web and mobile stay in lockstep.
- **Trade-offs:** a WebView-based app has a performance ceiling below fully native; mitigated by the
  efficient PixiJS/WebGL renderer, the bounded 2D scope and performance budgets. Native plugin
  surface must be abstracted so web builds are unaffected.
- **Follow-ups:** add the Capacitor shell and Android project under the client; define the platform
  abstraction for IAP and push; see [ADR-0009](0009-live-service-platform.md) and
  [../architecture/Mobile.md](../architecture/Mobile.md). Store submission and signing are handled
  in the release process.
