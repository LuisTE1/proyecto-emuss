import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // Solo en el build de producción: GitHub Pages publica esto como proyecto
  // (luiste1.github.io/proyecto-emuss/), no en la raíz del dominio, así que
  // los assets necesitan este prefijo. En dev (`npm run dev`) se sirve
  // normal desde "/", que es lo que localhost necesita.
  base: command === 'build' ? '/proyecto-emuss/' : '/',
  plugins: [react()],
}))
