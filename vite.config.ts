import path from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  // Base public path
  base: './',

  // Path aliases (must match tsconfig.json paths)
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@design': path.resolve(__dirname, './src/design-system'),
      '@game': path.resolve(__dirname, './src/game'),
    },
  },

  // Build options
  build: {
    // Output directory
    outDir: 'dist',
    // Assets directory
    assetsDir: 'assets',
    // Source maps for production
    sourcemap: false,
    // Minification - esbuild for speed
    minify: 'esbuild',
    // Target browsers
    target: 'es2022',
    // Phaser is a large library (~1.2MB) - suppress warning for vendor chunk
    chunkSizeWarningLimit: 1300,
    rollupOptions: {
      output: {
        // Split Phaser into its own vendor chunk for better caching
        manualChunks: {
          phaser: ['phaser'],
        },
      },
    },
  },

  // Dev server options
  server: {
    // Port for dev server
    port: 3000,
    // Open browser on start
    open: true,
  },

  // Preview server options (for testing production build)
  preview: {
    port: 4173,
  },
})
