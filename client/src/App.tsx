import { PROTOCOL_VERSION } from '@aol/shared';

/**
 * Application shell. The React layer hosts the HUD and menus; the PixiJS world
 * canvas is mounted by the renderer in later milestones. For now this confirms
 * the client composes the shared package and the toolchain is wired up.
 */
export function App(): JSX.Element {
  return (
    <main className="app-shell">
      <h1>Age of Legends</h1>
      <p>Client shell — protocol v{PROTOCOL_VERSION}</p>
      <p className="hint">World rendering is introduced in the networking milestone.</p>
    </main>
  );
}
