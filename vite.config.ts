import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Land of Stories',
        short_name: 'LoS',
        description: 'Immersive O2O Heritage Tourism',
        theme_color: '#1A1108',
        background_color: '#1A1108',
        display: 'standalone',
        icons: [
          {
            src: 'https://cdn-icons-png.flaticon.com/512/3212/3212608.png', // Placeholder globe icon
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
});
