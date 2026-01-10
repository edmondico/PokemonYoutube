import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Carga las variables de entorno basadas en el modo actual
  // El tercer parámetro '' carga todas las variables, no solo las que empiezan por VITE_
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    define: {
      // Esto permite que 'process.env.API_KEY' funcione en el navegador
      // tal y como está escrito en tu código actual.
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    },
  };
});