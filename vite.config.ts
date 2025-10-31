import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { readFileSync } from "fs"
import svgr from "vite-plugin-svgr"

// Read package.json to get version
const packageJson = JSON.parse(readFileSync('./package.json', 'utf-8'));

// https://vite.dev/config/
export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [react(), tailwindcss(), svgr()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(packageJson.version),
    'import.meta.env.VITE_RUNTIME_VERSION': JSON.stringify(process.env.VITE_RUNTIME_VERSION || "1.0.0"),
  },
  preview: {
    allowedHosts: true
  },
  server: {
    allowedHosts: true
  }
})