import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    target: 'es2020',
    outDir: 'dist',
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      input: 'index.html',
      output: { manualChunks: { three: ['three'], gsap: ['gsap', 'gsap/ScrollTrigger'] } },
    },
  },
});
