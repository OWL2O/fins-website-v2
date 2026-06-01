import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { apiDevServer } from './vite-api-plugin.js'

export default defineConfig(({ mode }) => {
  // Load .env / .env.local (all vars, no prefix filter) and expose them to the
  // in-process API handlers via process.env during dev.
  const env = loadEnv(mode, process.cwd(), '')
  Object.assign(process.env, env)

  return {
    plugins: [
      react(),
      apiDevServer(),   // serves /api/* locally — see vite-api-plugin.js
    ],
    server: {
      port: 5173,
      open: true,
    },
    preview: {
      port: 4173,
    },
    build: {
      target: 'es2020',
      cssMinify: true,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            gsap: ['gsap', 'gsap/ScrollTrigger', 'gsap/ScrollToPlugin'],
            motion: ['framer-motion'],
          },
        },
      },
    },
  }
})
