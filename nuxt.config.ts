import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
	compatibilityDate: '2025-07-15',
	devtools: { enabled: true },
	modules: ['@pinia/nuxt', 'shadcn-nuxt'],
	css: ['~/main.css'],
	vite: {
		plugins: [tailwindcss()],
	},
	shadcn: {
		componentDir: 'src/widgets/ui',
	},
	runtimeConfig: {
		backendUrl: process.env.NUXT_BACKEND_URL || 'http://localhost:4000', 
		public: {
			githubClientId:
				process.env.NUXT_PUBLIC_GITHUB_CLIENT_ID || 'Iv23liABRK4YkqMNZDM8',
			apiBase: process.env.NUXT_PUBLIC_API_BASE,
		},
	},
	future: {
		compatibilityVersion: 4,
	},
})
