import type { UserEntity } from '~/types/user'

export const useAuth = () => {
	const config = useRuntimeConfig()
	const user = useState<UserEntity | null>('auth-user', () => null)
	// false until the first session check has finished (distinguishes loading from logged out)
	const ready = useState<boolean>('auth-ready', () => false)

	const login = () => {
		const state = crypto.randomUUID()
		sessionStorage.setItem('oauth_state', state)

		const params = new URLSearchParams({
			client_id: config.public.githubClientId as string,
			redirect_uri: `${window.location.origin}/auth/callback`,
			scope: 'repo read:user',
			state,
		})
		window.location.href = `https://github.com/login/oauth/authorize?${params}`
	}

	const fetchMe = async () => {
		try {
			user.value = await $fetch<UserEntity>('/api/user/me')
		} catch {
			user.value = null
		} finally {
			ready.value = true
		}
	}

	const logout = async () => {
		await $fetch('/api/auth/logout', { method: 'POST' })
		user.value = null
		await navigateTo('/')
	}

	return { user, ready, login, fetchMe, logout }
}
