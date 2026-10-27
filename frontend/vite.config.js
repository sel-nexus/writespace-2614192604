import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

/** Configure Vite and the browser-side component test runner. */
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.js'],
    css: true,
  },
});
