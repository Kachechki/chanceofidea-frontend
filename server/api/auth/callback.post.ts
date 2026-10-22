export default defineEventHandler(async (event) => {
	const { code } = await readBody<{ code: string }>(event)
	const { backendUrl } = useRuntimeConfig(event)

	const res = await $fetch.raw(`${backendUrl}/auth/oauth_callback`, {
		query: { code },
		ignoreResponseError: true,
	})

	// the backend sets the refresh token as a cookie on its own response
	const setCookies = res.headers.getSetCookie?.() ?? [
		res.headers.get('set-cookie') ?? '',
	]
	const refreshCookie = setCookies.find((c) => c.startsWith('refresh='))
	const refresh = refreshCookie?.split(';')[0]?.slice('refresh='.length)

	if (!res.ok || !refresh) {
		throw createError({ statusCode: 401, statusMessage: 'GitHub login failed' })
	}

	setRefreshCookie(event, refresh)
	return { ok: true }
})
