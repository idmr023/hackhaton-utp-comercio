import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Celular por tunel HTTPS: npx cloudflared tunnel --url http://localhost:5173 (o :4173 con npm run preview)
const allowedHosts = ['.trycloudflare.com']
// /api/* -> mini servidor Node (Didit). Asi el celular solo habla con Vite.
const proxy = { '/api': 'http://localhost:3001' }

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo-ayni.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'Ayni - tu barrio se ayuda',
        short_name: 'Ayni',
        description: 'Productos, servicios y ayuda entre vecinos. Modo Minka para emergencias.',
        lang: 'es-PE',
        theme_color: '#2F6B4F',
        background_color: '#F7F5EF',
        display: 'standalone',
        start_url: '/',
        // PNG generados con: node scripts/iconos.mjs (a partir de public/icon.svg)
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // La app completa queda en cache para abrir sin internet
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            // Tiles de OpenStreetMap: se guardan los que ya se vieron
            urlPattern: /^https:\/\/[abc]\.tile\.openstreetmap\.org\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'osm-tiles',
              expiration: { maxEntries: 1500, maxAgeSeconds: 60 * 60 * 24 * 14 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      devOptions: { enabled: true }, // service worker tambien en npm run dev
    }),
  ],
  server: {
    host: true, // permite abrir desde el celular por IP de la red Wi-Fi
    port: 5173,
    allowedHosts,
    proxy,
  },
  // npm run preview (version build para la demo): mismo tunel y mismo proxy de Didit
  preview: {
    host: true,
    port: 4173,
    allowedHosts,
    proxy,
  },
})
