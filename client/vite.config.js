import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current directory
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [
      react()
    ],
    css: {
      postcss: {
        plugins: [
          tailwindcss,
          autoprefixer
        ]
      }
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
    build: {
      outDir: 'dist',
      sourcemap: mode !== 'production',
      // Reduce chunk size
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            ui: ['@headlessui/react', 'lucide-react', 'framer-motion'],
            charts: ['chart.js', 'react-chartjs-2', 'recharts'],
            forms: ['formik', 'yup'],
          }
        }
      },
      // Ensure CSS is minified
      cssMinify: true,
      // Ensure environment variables are replaced
      define: {
        'process.env.NODE_ENV': JSON.stringify(mode),
      },
      // Use relative paths for Vercel deployment
      base: '/',
    },
  }
});
