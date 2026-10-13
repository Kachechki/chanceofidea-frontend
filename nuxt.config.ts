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
  },
  runtimeConfig: {
    public: {
      githubClientId: process.env.NUXT_PUBLIC_GITHUB_CLIENT_ID,
      githubRedirectUri: process.env.NUXT_PUBLIC_GITHUB_REDIRECT_URI,
      apiBase: process.env.NUXT_PUBLIC_API_BASE
    }
  },
  future: {
    compatibilityVersion: 4
  }
})
