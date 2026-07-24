import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: Number.parseInt(process.env.CLIENT_PORT ?? '5173', 10),
  },
  build: {
    target: 'es2022',
    sourcemap: true,
  },
});
