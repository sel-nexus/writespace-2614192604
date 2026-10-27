import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

/** Configure Vitest to transform React and run tests in a DOM environment. */
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.js'],
    include: ['src/**/*.{test,spec}.{js,jsx}'],
    css: true,
  },
});
