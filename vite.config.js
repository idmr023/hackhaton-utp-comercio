import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'Ayni - tu barrio se ayuda',
        short_name: 'Ayni',
        description: 'Productos, servicios y ayuda entre vecinos. Modo Minka para emergencias.',
        lang: 'es-PE',
        theme_color: '#1f6f8b',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' },
        ],
      },
      workbox: {
        // La app completa queda en caché para abrir sin internet
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
    allowedHosts: ['.trycloudflare.com'], // tunel HTTPS: npx cloudflared tunnel --url http://localhost:5173
    proxy: {
      // /api/* -> mini servidor Node (Didit). Asi el celular solo habla con Vite.
      '/api': 'http://localhost:3001',
    },
  },
})
