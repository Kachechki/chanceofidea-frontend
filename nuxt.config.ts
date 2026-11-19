import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
	compatibilityDate: '2025-07-15',
	devtools: { enabled: true },
	modules: ['@pinia/nuxt', 'shadcn-nuxt', '@nuxtjs/i18n'],
	css: ['~/main.css'],
	vite: {
		plugins: [tailwindcss()],
	},
	shadcn: {
		componentDir: 'app/widgets/ui',
	},
	i18n: {
		locales: [
			{ code: 'en', language: 'en-US', name: 'English', file: 'en.json' },
			{ code: 'uk', language: 'uk-UA', name: 'Українська', file: 'uk.json' },
		],
		defaultLocale: 'en',
		langDir: 'locales',
		strategy: 'no_prefix',
	},
	runtimeConfig: {
		backendUrl: process.env.NUXT_BACKEND_URL || 'http://localhost:4000',
		public: {
			githubClientId:
				process.env.NUXT_PUBLIC_GITHUB_CLIENT_ID || 'Iv23liABRK4YkqMNZDM8',
			apiBase: process.env.NUXT_PUBLIC_API_BASE,
			githubAppSlug:
				process.env.NUXT_PUBLIC_GITHUB_APP_SLUG || 'chanceofidea-dev-auth',
		},
	},
	future: {
		compatibilityVersion: 4,
	},
})
