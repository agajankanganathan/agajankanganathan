import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Business logic and sample data are shared with the phone app (sero/app/src/core).
const core = fileURLToPath(new URL('../app/src/core', import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@core': core } },
  server: { fs: { allow: ['..'] } },
});
