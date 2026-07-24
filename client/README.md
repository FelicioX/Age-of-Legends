# @aol/client

The player client for Age of Legends: a React UI shell with PixiJS world rendering, driven by the
shared predictive simulation and netcode.

## Running

```bash
pnpm --filter @aol/client dev      # start the Vite dev server
pnpm --filter @aol/client build    # production build
```

## Structure (initial)

- **index.html / src/main.tsx** — application bootstrap.
- **src/App.tsx** — the UI shell (HUD and menus grow here).
- World rendering (PixiJS) is introduced in the networking milestone.

See [../docs/architecture/Client.md](../docs/architecture/Client.md).

## Note on Local Testing Without a Toolchain

A self-contained, no-build playable prototype is available under
[`../playable/`](../playable/) — open its `index.html` directly in a browser to try the core loop
without installing Node.
