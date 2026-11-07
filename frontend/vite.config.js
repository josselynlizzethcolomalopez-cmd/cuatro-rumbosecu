import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// IMPORTANTE: GitHub Pages sirve el sitio en https://usuario.github.io/NOMBRE-DEL-REPO/
// Por eso "base" debe ser el nombre de tu repositorio, con barras al inicio y al final.
// Cámbialo aquí (o define VITE_BASE en el workflow de despliegue).
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE || '/mi-emprendimiento/',
})
