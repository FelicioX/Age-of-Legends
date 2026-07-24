import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  './shared/vitest.config.ts',
  './engine/vitest.config.ts',
  './game/vitest.config.ts',
  './server/vitest.config.ts',
]);
