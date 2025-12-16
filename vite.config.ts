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
          // All React-dependent vendor libraries bundled together
          // to prevent loading order issues (forwardRef, Component, etc.)
          // This includes: React, TanStack, Radix UI, Lucide, Motion, react-hook-form, recharts
          if (
            id.includes('node_modules/react-dom') ||
            id.includes('node_modules/react/') ||
            id.includes('@tanstack') ||
            id.includes('@radix-ui') ||
            id.includes('lucide-react') ||
            id.includes('motion') ||
            id.includes('framer') ||
            id.includes('react-hook-form') ||
            id.includes('@hookform') ||
            id.includes('recharts')
          ) {
            return 'vendor-react-ecosystem';
          }
          // D3 (used by recharts but doesn't depend on React)
          if (id.includes('d3-')) {
            return 'vendor-d3';
          }
          // Supabase (doesn't depend on React)
          if (id.includes('@supabase')) {
            return 'vendor-supabase';
          }
          // Zod (pure validation, no React dependency)
          if (id.includes('zod')) {
            return 'vendor-zod';
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

