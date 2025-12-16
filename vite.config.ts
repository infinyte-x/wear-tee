import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { TanStackRouterVite } from '@tanstack/router-vite-plugin'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    TanStackRouterVite(),
    react(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 800, // Increased to accommodate merged chunks
    rollupOptions: {
      output: {
        manualChunks(id) {
          // React core + React-dependent libraries bundled together
          // to prevent loading order issues (forwardRef, Component, etc.)
          if (
            id.includes('node_modules/react-dom') ||
            id.includes('node_modules/react/') ||
            id.includes('@tanstack') ||
            id.includes('@radix-ui')
          ) {
            return 'vendor-react-core';
          }
          // Recharts
          if (id.includes('recharts') || id.includes('d3-')) {
            return 'vendor-recharts';
          }
          // Motion/Framer
          if (id.includes('motion') || id.includes('framer')) {
            return 'vendor-motion';
          }
          // Supabase
          if (id.includes('@supabase')) {
            return 'vendor-supabase';
          }
          // Form libraries
          if (id.includes('react-hook-form') || id.includes('zod') || id.includes('@hookform')) {
            return 'vendor-forms';
          }
          // lucide icons (can be large)
          if (id.includes('lucide-react')) {
            return 'vendor-icons';
          }
          // Admin pages - split into own chunk
          if (id.includes('/pages/admin/')) {
            return 'pages-admin';
          }
          // Storefront pages
          if (id.includes('/pages/') && !id.includes('/pages/admin/')) {
            return 'pages-storefront';
          }
          // Components
          if (id.includes('/components/admin/')) {
            return 'components-admin';
          }
          if (id.includes('/components/') && !id.includes('/components/admin/')) {
            return 'components-shared';
          }
        },
      },
    },
  },
}));

