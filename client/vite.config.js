import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  build: {
    outDir: 'dist',
    sourcemap: true,
    base: '/',
    rollupOptions: {
      onwarn(warning, warn) {
        // Ignore "use client" directive warnings
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE' && warning.message.includes('use client')) {
          return;
        }
        // Use default for everything else
        warn(warning);
      },
      output: {
        sourcemapExcludeSources: true
      }
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false
      },
    },
  },
});
