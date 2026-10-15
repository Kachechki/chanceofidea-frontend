import type { UserEntity } from '~/types/user'

export const useAuth = () => {
	const config = useRuntimeConfig()
	const user = useState<UserEntity | null>('auth-user', () => null)

	const login = () => {
		const state = crypto.randomUUID()
		sessionStorage.setItem('oauth_state', state)

		const params = new URLSearchParams({
			client_id: config.public.githubClientId as string,
			redirect_uri: `${window.location.origin}/auth/callback`,
			scope: 'read:user',
			state,
		})
		window.location.href = `https://github.com/login/oauth/authorize?${params}`
	}

	const fetchMe = async () => {
		try {
			user.value = await $fetch<UserEntity>('/api/user/me')
		} catch {
			user.value = null
		}
	}

	const logout = async () => {
		await $fetch('/api/auth/logout', { method: 'POST' })
		user.value = null
		await navigateTo('/')
	}

	return { user, login, fetchMe, logout }
}
