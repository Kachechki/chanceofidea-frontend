import tailwindcss from '@tailwindcss/vite';

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@pinia/nuxt', 'shadcn-nuxt'],
  css: ["~/main.css"],
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  shadcn: {
    componentDir: "src/widgets/ui",
  }
})