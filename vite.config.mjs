import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Point the package name at the local source so stories always reflect
      // the current working code — no build step required.
      'react-force-graph-2d': resolve(__dirname, 'src/packages/react-force-graph-2d/index.js'),
    },
    // Force a single React instance across all packages (including react-kapsule).
    // Without this, react-kapsule pulls in its own React and components appear
    // as plain objects instead of functions, crashing the renderer.
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    // force-graph and prop-types are CJS — pre-bundle them for fast first load.
    include: ['force-graph', 'prop-types'],
    // react-kapsule is pure ESM. Pre-bundling it would inline React, creating a
    // second Symbol registry that makes forwardRef components appear as plain
    // objects to Ladle's renderer. Exclude it so it imports React via the
    // dedupe alias above.
    exclude: ['react-kapsule'],
  },
});
