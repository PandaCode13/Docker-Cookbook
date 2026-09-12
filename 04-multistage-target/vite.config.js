import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // nécessaire pour accéder au serveur dev depuis l'extérieur du conteneur
    port: 5173,
  },
});