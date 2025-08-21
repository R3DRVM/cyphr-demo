// config/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      protocolImports: true,
    }),
  ],
  server: {
    port: 3000,
    host: true,
  },
  build: {
    outDir: './docs',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      buffer: 'buffer',
      process: 'process/browser',
    },
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    include: [
      'buffer',
      'process',
      '@solana/web3.js',
      '@solana/spl-token',
      '@solana/spl-token-swap',
      '@solana/wallet-adapter-base',
      '@solana/wallet-adapter-react',
      '@solana/wallet-adapter-react-ui',
      '@solana/wallet-adapter-phantom',
    ],
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
  define: {
    'process.env': {},
  },
});