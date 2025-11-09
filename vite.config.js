import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import svgr from 'vite-plugin-svgr'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
        svgr({
            include: '**/*.svg',
        }),
    ],
    define: {
        // Fallback environment variables for development
        'import.meta.env.VITE_FASTAPI_BASE_URL': JSON.stringify(
            process.env.VITE_FASTAPI_BASE_URL || 'http://127.0.0.1:8000'
        ),
        'import.meta.env.VITE_APP_NAME': JSON.stringify(
            process.env.VITE_APP_NAME || '4x4builder'
        ),
    },
    server: {
        // Configure dev server for better API integration
        proxy: {
            // Optional: Proxy API calls to avoid CORS issues in development
            '/api': {
                target: 'http://127.0.0.1:8000',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, ''),
            },
        },
    },
})
