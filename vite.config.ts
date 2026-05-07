import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import sitemap from 'vite-plugin-sitemap';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  const routes = ['/about', '/visit', '/contact', '/donate', '/activities', '/publications', '/bookings'];
  for (let i = 0; i < 6; i++) routes.push(`/swami/${i}`);
  return {
    appType: 'spa',
    plugins: [react(), tailwindcss(), sitemap({hostname: 'https://srisiddheshwaripeetham.com', dynamicRoutes: routes})],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
