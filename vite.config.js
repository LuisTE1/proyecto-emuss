import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Publicado en GitHub Pages como proyecto (luiste1.github.io/proyecto-emuss/),
  // no en la raíz del dominio, así que los assets necesitan este prefijo.
  base: '/proyecto-emuss/',
  plugins: [react()],
})
